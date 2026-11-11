---
url: /self-hosting/
title: "Self-Hosting sbomify"
seo_title: "Self-Hosting sbomify: Install, Configure and Size Your Deployment"
description: "Run sbomify on your own infrastructure with Docker Compose or Helm. A reference architecture, every setting that matters (email, billing, storage, sign-in), and conservative sizing on AWS and Google Cloud."
keywords: ["self-hosted SBOM management", "sbomify self-hosting", "sbomify docker compose", "sbomify helm chart", "on-premises SBOM platform", "SBOM server sizing"]
tldr: "sbomify is open source and runs anywhere Docker or Kubernetes runs. Put PostgreSQL and Redis or Valkey on their own instances, keep artifacts in S3-compatible storage, sign users in through Keycloak, and start from the conservative sizes below: one 4 vCPU / 8 GB app instance handles 100 users, 1,000 SBOM uploads an hour and a nightly rescan of 20,000 released SBOMs."
faq:
  - question: "Can I self-host sbomify?"
    answer: "Yes. sbomify is open source under the Apache 2.0 licence with the Commons Clause, so you can run it for your own organisation but not sell it as a hosted service. Run it with Docker Compose on a single VM or with the Helm chart on Kubernetes. Support packages for self-hosted installations are available on the Enterprise plan."
  - question: "What does sbomify need to run?"
    answer: "The sbomify container image, PostgreSQL 17 or 18, Redis 8 or Valkey 8, S3-compatible object storage with two buckets, a Keycloak realm for sign-in, and an SMTP relay for email. Vulnerability scanning with OSV needs outbound internet access."
  - question: "How do I turn off billing in a self-hosted sbomify?"
    answer: "Set BILLING=False. The Docker Compose file and the Helm chart already default to it. Billing pages, plan selection and product and component limits are switched off. Workspaces still start on the Community plan, which allows only the owner as a member, so set them to Enterprise in Django admin."
  - question: "How big a server does sbomify need?"
    answer: "For an evaluation, one 2 vCPU / 4 GB VM runs everything. For production, we recommend a 4 vCPU / 8 GB app instance with PostgreSQL (2 vCPU / 8 GB) and Redis or Valkey on separate managed instances. As a conservative estimate, that handles 100 users, 1,000 uploads an hour at peak, and 100,000 stored SBOMs of which 20,000 belong to releases and are rescanned daily. Adding app instances helps, but not linearly, because they all share one database and one queue."
---

sbomify is [open source](https://github.com/sbomify/sbomify), and the same code that runs [app.sbomify.com](https://app.sbomify.com) runs on your own infrastructure. This guide takes you from an empty VM or Kubernetes cluster to a production deployment: what to run, how to configure it, and how big it needs to be.

If you would rather not operate it yourself, the [hosted service](/pricing/) runs the same software. Self-hosting makes sense when SBOMs must stay inside your network, when you need to run in a specific region, or when policy requires you to control the whole stack.

The code is licensed under Apache 2.0 with the [Commons Clause](https://commonsclause.com/): run it for your own organisation as you like, but you may not sell sbomify, or hosting or support for it, as a service to others.

## What you are running

A sbomify deployment has four application processes, all from one container image (`ghcr.io/sbomify/sbomify`):

| Process        | What it does                                                                      | Scale        |
| -------------- | --------------------------------------------------------------------------------- | ------------ |
| **Web**        | Serves the UI and the API (gunicorn with uvicorn workers, port 8000)              | Horizontally |
| **Worker**     | Runs background jobs: compliance checks, vulnerability scans, email (Dramatiq)    | Horizontally |
| **Scheduler**  | Queues recurring jobs such as daily rescans                                       | Exactly one  |
| **Migrations** | Applies database migrations before each release, under a PostgreSQL advisory lock | One-off job  |

In front of them sits **Caddy**, which terminates TLS, issues certificates for Trust Center custom domains on demand, and keeps the internal API off the public internet.

They depend on:

- **PostgreSQL 17 or 18**: all metadata, results and settings.
- **Redis 8 or Valkey 8**: cache, job queue and WebSocket fan-out. Both work; we tested on Valkey 8.
- **S3-compatible object storage**: two buckets, one public-read for media such as logos, one private for SBOMs and documents. AWS S3, Google Cloud Storage (S3 interoperability), MinIO, SeaweedFS, Cloudflare R2 and Tigris all work.
- **Keycloak**: sign-in over OpenID Connect. sbomify has no local password login for regular users. Keycloak is user-facing: browsers are redirected to it to sign in, so it needs its own public HTTPS hostname, and the app also calls it to exchange tokens.
- **An SMTP relay**: invitations, access requests and onboarding mail.
- **Outbound HTTPS** from the workers to `api.osv.dev` for vulnerability scanning, to `www.cisa.gov` and `euvdservices.enisa.europa.eu` for the known-exploited and EU vulnerability feeds, and optionally to the GitHub API for attestation checks.

## Reference architecture

<div class="card my-12 p-4 sm:p-8 overflow-hidden">
    {{< d2 "self-hosting-architecture" >}}
</div>

**Run PostgreSQL and Redis or Valkey on their own instances**, ideally as managed services (Amazon RDS and ElastiCache, or Cloud SQL and Memorystore). The app instance is then stateless: you can replace it, resize it or run two of them behind a load balancer without touching your data. You also get backups, point-in-time recovery, patching and failover from the provider instead of from your own scripts, and a noisy background job can never starve the database of CPU or memory.

The bundled PostgreSQL and Redis containers in `docker-compose.yml` are fine for an evaluation or a small team, but they put every component on one disk and one failure domain.

## Before you start

Have these ready:

1. **A domain** for sbomify, for example `sbomify.example.com`, with DNS pointing at the app instance or load balancer.
2. **PostgreSQL 17 or 18** with an empty database and a user that owns it.
3. **Redis 8 or Valkey 8**. Do not put a database number in the URL: sbomify uses databases 0, 1 and 2 itself.
4. **Two S3 buckets**: `sbomify-media` with public read, and `sbomify-sboms` private. Create an access key for each, or one key with access to both.
5. **A Keycloak realm** named `sbomify` with a confidential OpenID Connect client. Users sign in on Keycloak's own pages, so give it a public HTTPS hostname such as `sso.example.com`:
   - Client ID: `sbomify`, client authentication on.
   - Valid redirect URI and valid post logout redirect URI: `https://sbomify.example.com/*`. Web origin: `https://sbomify.example.com`.
   - Copy the client secret from **Clients → sbomify → Credentials**.
   - Configure SMTP on the realm too. Keycloak, not sbomify, sends the sign-up verification mail.
6. **Two secrets**, generated once and stored safely:

```bash
openssl rand -base64 48   # SECRET_KEY
openssl rand -base64 32   # SIGNED_URL_SALT
```

`SIGNED_URL_SALT` signs download links for private SBOMs. Changing it later invalidates every link already shared.

## Option 1: Docker Compose

Compose is the quickest way to production on a single VM. It runs Caddy, two web containers, two workers and the scheduler.

### 1. Download the files

```bash
mkdir sbomify && cd sbomify
curl -fsSLO https://raw.githubusercontent.com/sbomify/sbomify/master/docker-compose.yml
curl -fsSLO https://raw.githubusercontent.com/sbomify/sbomify/master/Caddyfile
```

### 2. Write `override.env`

```bash
# Image: pin a release tag in production, never "latest"
SBOMIFY_IMAGE=ghcr.io/sbomify/sbomify
SBOMIFY_TAG=v26.11.0

# Application
APP_BASE_URL=https://sbomify.example.com
SECRET_KEY=paste-generated-value
SIGNED_URL_SALT=paste-generated-value
BILLING=False

# Caddy: listen publicly (Compose binds to 127.0.0.1 by default)
BIND_IP=0.0.0.0
HTTP_PORT=80
HTTPS_PORT=443
ACME_EMAIL=ops@example.com

# PostgreSQL (in Compose the host variable is DOCKER_DATABASE_HOST)
DOCKER_DATABASE_HOST=sbomify.abc123.eu-west-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=sbomify
DATABASE_USER=sbomify
DATABASE_PASSWORD=change-me
DATABASE_SSLMODE=require

# Redis or Valkey (rediss:// for TLS)
REDIS_URL=rediss://:change-me@master.sbomify.abc123.euw1.cache.amazonaws.com:6379

# Object storage
AWS_ENDPOINT_URL_S3=https://s3.eu-west-1.amazonaws.com
AWS_REGION=eu-west-1
AWS_MEDIA_ACCESS_KEY_ID=...
AWS_MEDIA_SECRET_ACCESS_KEY=...
AWS_MEDIA_STORAGE_BUCKET_NAME=sbomify-media
AWS_MEDIA_STORAGE_BUCKET_URL=https://sbomify-media.s3.eu-west-1.amazonaws.com
AWS_SBOMS_ACCESS_KEY_ID=...
AWS_SBOMS_SECRET_ACCESS_KEY=...
AWS_SBOMS_STORAGE_BUCKET_NAME=sbomify-sboms
AWS_SBOMS_STORAGE_BUCKET_URL=https://sbomify-sboms.s3.eu-west-1.amazonaws.com

# Sign-in
KEYCLOAK_SERVER_URL=https://sso.example.com/
KEYCLOAK_REALM=sbomify
KEYCLOAK_CLIENT_ID=sbomify
KEYCLOAK_CLIENT_SECRET=...

# Email
EMAIL_HOST=email-smtp.eu-west-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
DEFAULT_FROM_EMAIL=sbomify@example.com

# Recommended: raises the GitHub API limit for attestation checks
GITHUB_API_TOKEN=github_pat_...
```

Keep this file out of version control and readable only by the deploy user (`chmod 600 override.env`).

### 3. Use your managed database and Redis

Add a `docker-compose.override.yml` next to the other files. Compose loads it automatically. It stops the bundled PostgreSQL and Redis containers, and passes through settings the base file does not list:

```yaml
x-extra-env: &extra-env
  SENTRY_DSN: ${SENTRY_DSN:-}
  LOG_LEVEL: ${LOG_LEVEL:-INFO}
  DATA_UPLOAD_MAX_MEMORY_SIZE_MB: ${DATA_UPLOAD_MAX_MEMORY_SIZE_MB:-100}

services:
  sbomify-db:
    profiles: ["bundled-data"]
  sbomify-redis:
    profiles: ["bundled-data"]
  sbomify-migrations:
    environment: *extra-env
    depends_on: !reset {}
  sbomify-backend:
    environment: *extra-env
    depends_on: !override
      sbomify-migrations:
        condition: service_completed_successfully
  sbomify-worker:
    environment: *extra-env
    depends_on: !override
      sbomify-migrations:
        condition: service_completed_successfully
  sbomify-scheduler:
    environment: *extra-env
    depends_on: !override
      sbomify-migrations:
        condition: service_completed_successfully
```

`!reset` and `!override` need Docker Compose 2.24.4 or later. Compose only passes a variable from `override.env` into a container when the compose file names it, so any setting not in `docker-compose.yml` goes in the `x-extra-env` block. That includes `DATABASE_URL`, Sentry, upload limits, rate limits, `OIDC_GITHUB_AUDIENCE`, `HTTPS_PROXY`, `USE_KEYCLOAK` and a separate documents bucket.

To evaluate with the bundled database and Redis instead, skip this step and leave the database and Redis settings out of `override.env`. The bundled containers publish ports 5432 and 6379 on every interface, PostgreSQL with the password `sbomify` and Redis with none, so set `DATABASE_PASSWORD` and keep those ports firewalled. Compose does not bundle object storage or Keycloak: even an evaluation needs an S3 bucket pair and a Keycloak realm.

### 4. Verify the image and start

Every release image carries a signed build provenance attestation from GitHub Actions. Verify it before you run it, with cosign 3 (cosign 2 needs `--new-bundle-format`):

```bash
docker pull ghcr.io/sbomify/sbomify:v26.11.0
DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/sbomify/sbomify:v26.11.0)

cosign verify-attestation \
  --type https://slsa.dev/provenance/v1 \
  --certificate-identity-regexp '^https://github.com/sbomify/sbomify/.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  "$DIGEST" > /dev/null && echo "verified"

docker compose --env-file override.env up -d
docker compose ps
```

Or, with the GitHub CLI: `gh attestation verify oci://ghcr.io/sbomify/sbomify:v26.11.0 --owner sbomify`.

The migrations container runs first and exits. Web, workers, scheduler and Caddy start once it succeeds. Caddy requests a certificate for your domain on the first HTTPS request, so ports 80 and 443 must be reachable.

The repository also ships `bin/deploy.sh`, but it is not a drop-in for the steps above. It reads the image and tag from the shell rather than `override.env`, defaults to `sbomifyhub/sbomify:latest`, always starts the bundled database and Redis, and runs `docker system prune -f`. Use the commands above.

### Upgrading

```bash
sed -i 's/^SBOMIFY_TAG=.*/SBOMIFY_TAG=v26.12.0/' override.env
docker compose --env-file override.env pull
docker compose --env-file override.env up -d
```

Migrations run before the new web and worker containers start. Take a database snapshot first. To roll back, restore the snapshot and set the previous tag, since migrations are not reversed automatically.

## Option 2: Kubernetes with Helm

The chart in [`charts/sbomify`](https://github.com/sbomify/sbomify/tree/master/charts/sbomify) needs Kubernetes 1.30 or later. It deploys web, workers, the scheduler, Caddy and the migration job. It does not deploy PostgreSQL, Redis, object storage or Keycloak: bring your own, which fits the reference architecture above.

```bash
git clone --depth 1 --branch v26.11.0 https://github.com/sbomify/sbomify.git

helm install sbomify ./sbomify/charts/sbomify \
  --namespace sbomify --create-namespace \
  --set image.tag=v26.11.0 \
  --set app.baseUrl=https://sbomify.example.com \
  --set database.host=sbomify.abc123.eu-west-1.rds.amazonaws.com \
  --set database.password=change-me \
  --set redis.host=master.sbomify.abc123.euw1.cache.amazonaws.com \
  --set redis.password=change-me \
  --set redis.tls=true \
  --set objectStorage.endpointUrl=https://s3.eu-west-1.amazonaws.com \
  --set objectStorage.region=eu-west-1 \
  --set objectStorage.media.accessKeyId=... \
  --set objectStorage.media.secretAccessKey=... \
  --set objectStorage.sboms.accessKeyId=... \
  --set objectStorage.sboms.secretAccessKey=... \
  --set auth.keycloak.serverUrl=https://sso.example.com/ \
  --set auth.keycloak.clientSecret=... \
  --set secrets.secretKey="$(openssl rand -base64 48)" \
  --set secrets.signedUrlSalt="$(openssl rand -base64 32)" \
  --set caddy.acme.email=ops@example.com

helm test sbomify -n sbomify
```

Without `image.tag`, the chart installs the release in its `appVersion`, which can lag the latest release. Then point DNS for your domain at the `sbomify-caddy` LoadBalancer service. For production, keep the values in a file under version control and put credentials in a Kubernetes Secret (`secrets.existingSecret`) rather than on the command line.

What the chart sets by default:

| Workload  | Replicas | CPU request | Memory request / limit | Notes                                      |
| --------- | -------- | ----------- | ---------------------- | ------------------------------------------ |
| web       | 2        | 200m        | 512Mi / 1Gi            | 2 gunicorn workers per pod (`web.workers`) |
| worker    | 2        | 250m        | 768Mi / 2Gi            | 1 process, 4 threads per pod               |
| scheduler | 1        | 50m         | 256Mi / 512Mi          | Always one replica                         |
| caddy     | 1        | 100m        | 128Mi / 512Mi          | Needs shared storage for more than one     |

Pods run as non-root with a read-only root filesystem. Optional extras: a HorizontalPodAutoscaler for web (2 to 10) and workers (2 to 20), PodDisruptionBudgets (on by default), and a NetworkPolicy that only lets Caddy and the release's own pods reach the web pods. Email, Sentry and other settings the chart does not model go in `app.extraEnv` or `app.extraEnvFrom`.

## First sign-in

1. Open `https://sbomify.example.com` and sign up through Keycloak. sbomify creates your first workspace and makes you its owner.
2. Create a Django admin account for operator tasks:

   ```bash
   docker compose exec sbomify-backend python manage.py createsuperuser
   # Helm: kubectl -n sbomify exec deploy/sbomify-web -- python manage.py createsuperuser
   ```

3. Sign in to `/admin/`, open **Workspaces**, and set each workspace's plan to **Enterprise**. See [billing](#billing) for why.
4. Check that email works by inviting a teammate.

To stop strangers from signing up, turn off **User registration** in the Keycloak realm and add users there yourself, or connect Keycloak to your existing identity provider.

## Configuration

Everything is configured through environment variables. These are the ones most deployments touch.

### Core

| Variable          | Default | Notes                                                                                          |
| ----------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `APP_BASE_URL`    | none    | Public URL, such as `https://sbomify.example.com`. Also decides which host names are accepted. |
| `SECRET_KEY`      | none    | Long random string. Always set it: Compose falls back to a publicly known insecure value.      |
| `SIGNED_URL_SALT` | none    | Signs download links for private artifacts. Always set it: the fallback is publicly known.     |
| `LOG_LEVEL`       | `INFO`  | Application log level. Logs go to stdout.                                                      |
| `DEBUG`           | `False` | Never enable in production.                                                                    |

### Database and Redis

| Variable                                                               | Default                    | Notes                                                                                                                        |
| ---------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                         | none                       | Full connection URL. If set, the host, name, user, password, port and SSL variables are ignored: put `?sslmode=` in the URL. |
| `DOCKER_DATABASE_HOST`                                                 | `sbomify-db`               | Host when `AM_I_IN_DOCKER_CONTAINER=1`, which Compose sets. Otherwise `DATABASE_HOST`.                                       |
| `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_PORT` | Compose: `sbomify`, `5432` | The application itself has no defaults.                                                                                      |
| `DATABASE_SSLMODE`, `DATABASE_SSLROOTCERT`                             | none                       | `require`, `verify-ca` or `verify-full`, plus a CA file for private PKI.                                                     |
| `DATABASE_CONN_MAX_AGE`                                                | `0`                        | Seconds to keep connections open. `0` opens one per request.                                                                 |
| `REDIS_URL`                                                            | `redis://localhost:6379`   | `redis://` or `rediss://` (TLS), with `:password@` if needed. No database number.                                            |
| `REDIS_CA_CERTS`                                                       | none                       | CA file for a privately signed Redis certificate. Mount it into every service, scheduler included.                           |

### Object storage

| Variable                                                        | Notes                                                                |
| --------------------------------------------------------------- | -------------------------------------------------------------------- |
| `AWS_ENDPOINT_URL_S3`, `AWS_REGION`                             | Endpoint and region of your S3-compatible service.                   |
| `AWS_MEDIA_ACCESS_KEY_ID`, `AWS_MEDIA_SECRET_ACCESS_KEY`        | Credentials for the public media bucket.                             |
| `AWS_MEDIA_STORAGE_BUCKET_NAME`, `AWS_MEDIA_STORAGE_BUCKET_URL` | Bucket name, and the public URL browsers load media from.            |
| `AWS_SBOMS_ACCESS_KEY_ID`, `AWS_SBOMS_SECRET_ACCESS_KEY`        | Credentials for the private SBOM bucket.                             |
| `AWS_SBOMS_STORAGE_BUCKET_NAME`, `AWS_SBOMS_STORAGE_BUCKET_URL` | Bucket name and URL.                                                 |
| `AWS_DOCUMENTS_*` (same four)                                   | Optional separate bucket for documents. Defaults to the SBOM bucket. |

### Sign-in

| Variable                 | Default                 | Notes                                                                                                                                                                            |
| ------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KEYCLOAK_SERVER_URL`    | `http://keycloak:8080/` | Base URL of Keycloak, with a trailing slash.                                                                                                                                     |
| `KEYCLOAK_PUBLIC_URL`    | server URL              | Where the browser is sent on sign-out, if browsers cannot reach `KEYCLOAK_SERVER_URL`. Sign-in uses OIDC discovery on the server URL, so that one normally has to be public too. |
| `KEYCLOAK_REALM`         | `sbomify`               |                                                                                                                                                                                  |
| `KEYCLOAK_CLIENT_ID`     | `sbomify`               |                                                                                                                                                                                  |
| `KEYCLOAK_CLIENT_SECRET` | none                    | From the client's Credentials tab.                                                                                                                                               |
| `USE_KEYCLOAK`           | `False`                 | Set `True` so deleting an account in sbomify also removes the user from Keycloak. Needs `KEYCLOAK_ADMIN_USERNAME` and `KEYCLOAK_ADMIN_PASSWORD`.                                 |
| `OIDC_GITHUB_AUDIENCE`   | `sbomify.com`           | Audience for [OIDC trusted publishing](/faq/how-do-i-set-up-oidc-trusted-publishing/) from GitHub Actions. Set it to your own domain.                                            |

### Email

sbomify sends mail over SMTP. There is no other backend, and the default (`localhost:25`) fails if nothing listens there.

| Variable                                 | Default             | Notes                                                                                                |
| ---------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------- |
| `EMAIL_HOST`                             | `localhost`         | Your relay: Amazon SES, SendGrid, Postmark, Mailgun, or an internal relay.                           |
| `EMAIL_PORT`                             | `25`                | Usually `587` with `EMAIL_USE_TLS=True`, or `465` with `EMAIL_USE_SSL=True`.                         |
| `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | none                | SMTP credentials.                                                                                    |
| `EMAIL_USE_TLS`, `EMAIL_USE_SSL`         | `False`             | STARTTLS or implicit TLS. Set one, not both.                                                         |
| `DEFAULT_FROM_EMAIL`                     | `hello@sbomify.com` | **Change this** to an address on your own domain, or your relay will reject or spam-folder the mail. |

Set these on every process, not only web: the workers send most of the mail. The Compose file already shares them across services.

What sends email: workspace and Trust Center invitations, document access requests and decisions, API token expiry notices, and a short onboarding sequence for new users. Invitations, and some document access mail, carry `Reply-To: hello@sbomify.com`, and the in-app support form sends to `hello@sbomify.com`, not to you. Both addresses are hard-coded. Invitations are sent while the request runs, so a broken relay shows up as an error when you invite someone. Onboarding mail goes through the workers and is retried, so it shows up as retries in the worker logs instead.

Send a test message with:

```bash
docker compose exec sbomify-worker python manage.py shell -c \
  "from django.core.mail import send_mail; send_mail('sbomify test', 'It works.', None, ['you@example.com'])"
```

For a test install with no relay, run [Mailpit](https://mailpit.axllent.org/) and point `EMAIL_HOST` at it on port 1025.

### Billing

Self-hosted installs do not use Stripe. Set `BILLING=False`, which `docker-compose.yml` and the Helm chart (`app.billing: false`) already default to. The application default when the variable is missing is `True`, so set it explicitly if you build your own manifests.

With billing off:

- The billing settings tab, plan selection and upgrade prompts are gone.
- Product and component limits are lifted, and every plugin is available.
- No Stripe keys are needed.

New workspaces still start on the **Community** plan, and a few checks read the plan directly: the number of members (Community allows only the owner), Trust Center custom domains, product identifiers, the Dependency-Track integration (a custom Dependency-Track server needs Enterprise), and how often scheduled vulnerability scans run (weekly on Community, daily on paid plans; see [sizing](#what-drives-the-size)). Lift them by setting each workspace's plan to **Enterprise** in Django admin (`/admin/` → Workspaces).

### Trust Center and custom domains

| Variable                  | Notes                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `TRUST_CENTER_DOMAIN`     | Optional apex such as `trust.example.com`. Each workspace then gets `<slug>.trust.example.com`. Point a wildcard DNS record at Caddy. |
| `CLOUDFLARE_DCV_HOSTNAME` | Shown in the custom domain settings when you delegate certificate validation to Cloudflare.                                           |

Customers can also use their own domain for a [Trust Center](/features/trust-center/). Caddy issues the certificate on the first request, after asking sbomify whether the domain belongs to a workspace.

### Limits and integrations

| Variable                              | Default    | Notes                                                                                                                              |
| ------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `DATA_UPLOAD_MAX_MEMORY_SIZE_MB`      | `100`      | Largest request body. Raise it for very large SBOMs, such as Yocto image SPDX files.                                               |
| `SBOM_MAX_UPLOAD_SIZE_MB`             | same       | A lower cap for BOM uploads only.                                                                                                  |
| `API_TOKEN_RATE_LIMIT`                | `1000/min` | Per API token.                                                                                                                     |
| `API_TOKEN_HEAVY_RATE_LIMIT`          | `100/min`  | Per token, for uploads. Raise it if many pipelines share one token.                                                                |
| `API_ANONYMOUS_RATE_LIMIT`            | `120/min`  | Per client IP, for unauthenticated calls such as Trust Center visitors. Visitors behind one NAT share it.                          |
| `GITHUB_API_TOKEN`                    | none       | A fine-grained token with public repository read access. Without it, attestation checks share GitHub's 60 requests an hour per IP. |
| `SENTRY_DSN`                          | none       | Error reporting.                                                                                                                   |
| `DRAMATIQ_THREADS`                    | `4`        | Threads per worker process (Compose). Helm: `worker.threads`.                                                                      |
| `BACKEND_REPLICAS`, `WORKER_REPLICAS` | `2`, `2`   | Number of web and worker containers in Compose.                                                                                    |

The request timeout is 120 seconds and each web container runs two processes; Compose fixes both in the image. On Helm, set `web.timeout` and `web.workers`. Uploads that take longer than two minutes fail.

Vulnerability scanners other than OSV, such as a Dependency-Track server, are added in Django admin rather than through environment variables.

## Sizing

The sizes below are conservative estimates, not benchmark results. They are built from what each unit of work costs (an upload, a nightly rescan, a page view), with each cost set several times higher than anything we measured. [How the estimates are built](#how-the-estimates-are-built) shows the arithmetic, so you can redo it with your own numbers.

### Recommended sizes

| Deployment                   | Users | Products per workspace | Uploads at peak | SBOMs in releases (rescanned daily) | SBOMs stored | App instances                                                    | AWS                                    | Google Cloud                                      |
| ---------------------------- | ----- | ---------------------- | --------------- | ----------------------------------- | ------------ | ---------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------- |
| **Evaluation or small team** | 10    | 25                     | 200 an hour     | 2,000                               | 10,000       | One 2 vCPU / 4 GB VM, with PostgreSQL and Valkey on it           | `t3.medium`                            | `e2-medium`                                       |
| **Production**               | 100   | 100                    | 1,000 an hour   | 20,000                              | 100,000      | One 4 vCPU / 8 GB: 3 web containers (6 web processes), 3 workers | `c7i.xlarge`                           | `c4-highcpu-4`                                    |
| **Large**                    | 300   | 100                    | 2,000 an hour   | 40,000                              | 250,000      | Three 4 vCPU / 8 GB behind a load balancer, or Kubernetes        | `c7i.xlarge` × 3 behind an ALB, or EKS | `c4-highcpu-4` × 3 behind a load balancer, or GKE |

**Don't expect capacity to grow linearly.** Every app instance shares one PostgreSQL, one Redis or Valkey and one job queue, and pages get slower as workspaces grow, however many instances serve them. Our tests showed both effects:

- Going from 4 to 8 cores on one machine raised ingestion by only 20 to 35%, and page throughput by about 70%.
- On 2 cores, four web processes served fewer pages than two.
- Past about 25 concurrent users on 2 cores, throughput stopped rising, and p95 page time went from about 1 second to 9 to 15 seconds.

So the large tier is three production instances, but it claims only twice the production tier's uploads and rescans: the second and third instances count for half each. It also keeps the production limit of 100 products per workspace, the most we tested. More workspaces are fine. For bigger workspaces, or anything beyond the large tier, don't extrapolate from this table. Add one instance at a time and measure results latency, PostgreSQL CPU and page times before you add the next.

The figures assume a typical SBOM of about 200 components with four plugins enabled (NTIA, CISA 2025, BSI TR-03183 and OSV). Count an SBOM with 3,000 components as five typical ones. "Uploads at peak" is the rate you can keep up for an hour with results still arriving within minutes; short bursts above it only queue.

In Compose, set `BACKEND_REPLICAS=3` and `WORKER_REPLICAS=3` for the production tier. Each web container runs two processes.

For the data tier:

| Service         | Production                                                                 | Large                                                                                                          |
| --------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| PostgreSQL      | 2 vCPU / 8 GB, 100 GB storage: RDS `db.m7g.large`, Cloud SQL 2 vCPU / 8 GB | 8 vCPU / 32 GB with a standby, 500 GB storage: RDS `db.m7g.2xlarge` Multi-AZ, Cloud SQL 8 vCPU / 32 GB with HA |
| Redis or Valkey | ElastiCache `cache.t4g.small`, Memorystore 1 GB                            | ElastiCache `cache.m7g.large` with a replica, Memorystore Standard 5 GB                                        |
| Object storage  | S3 or Cloud Storage                                                        | Same, with versioning and lifecycle rules                                                                      |

Start PostgreSQL at about half as many vCPUs as all app instances together. In our tests it used about 0.4 cores for every core the app used, but only on a small database. PostgreSQL is the one part you cannot scale out by adding instances, so it is usually the first limit a large deployment hits. Watch its CPU and slow queries, and size it up before you add app instances.

The published image is built for x86-64 (`linux/amd64`), so the app instances above are Intel or AMD types. Managed PostgreSQL and Redis are not affected, so Graviton database and cache instances are fine. A 4 vCPU / 16 GB general purpose type (`m7i.xlarge`, `n2-standard-4`) works too, and is the better choice if you upload very large SBOMs, such as Yocto images.

`t3.medium` and `e2-medium` are burstable. The evaluation tier averages well under their sustained CPU, but a production deployment would run out of burst credit, so production uses fixed-performance types.

### What drives the size

- **Daily rescans, more than uploads.** On the Enterprise and Business plans, sbomify rescans every SBOM that belongs to a release with OSV each night, starting at 02:00. Once you have tens of thousands of released SBOMs, this is the largest load. Community workspaces are rescanned weekly instead. If you connect Dependency-Track, sbomify fetches its results for each released CycloneDX SBOM every hour. The tiers above leave that out, so test it separately. Uploads made while the rescan runs wait in the same queue, so add workers if CI uploads at night.
- **Workers set ingestion speed.** Uploads return as soon as the file is stored; checks and scans run on the workers. Each worker container is one Python process with four threads. It uses at most about one vCPU, and a thread waiting on `api.osv.dev` holds its slot. If results arrive late, add worker containers before you add web capacity.
- **CPU, not memory.** Rendering pages and running checks is CPU work. Memory stayed under 4.5 GB on a 4 vCPU instance in every test. Each running OSV scan adds 50 to 160 MB, so 8 GB leaves room for three workers.
- **Products per workspace set page speed.** The dashboard and the Trust Center landing page summarise every product in a workspace, so they slow down as a workspace grows. If one workspace will hold hundreds of products, size up the app instance or add a second one.
- **Don't run more web processes than about 1.5 per vCPU.** Extra processes compete for the same cores and make pages slower, not faster.

### Storage

Object storage holds each uploaded SBOM file as-is, plus scan results that are no longer current. Count the size of your SBOM files, and budget as much again for results.

PostgreSQL holds metadata, the current result of every check for every SBOM, and one row per vulnerability finding. It therefore grows with the number of findings more than with the number of components:

| SBOM                                   | PostgreSQL, conservative |
| -------------------------------------- | ------------------------ |
| 200 components, a handful of findings  | 150 KB                   |
| 200 components, about 100 findings     | 1 MB                     |
| 3,000 components, hundreds of findings | 5 MB                     |

Two daily jobs keep this bounded. Results that a newer scan has replaced move to object storage after a day; identical findings from repeat scans are stored once. Runs older than 30 days are deleted, keeping the newest ten per SBOM and check.

As a rule, 100,000 typical SBOMs need about 15 GB in PostgreSQL if they have few findings, and up to 100 GB if most have around a hundred. Leave room for indexes, WAL and backups: start at the storage sizes above and turn on storage autoscaling.

### How the estimates are built

We measured what each unit of work costs on sbomify from `master` (November 2026). The runs were short and used emulated instance sizes on one 8-core Arm64 machine. The cost per unit barely changed between instance sizes, which is why we use costs rather than the throughput figures. We then set each budget well above the highest cost we saw:

| Unit of work                                       | Highest measured                                                                                     | Budget used     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------- |
| Processing a 200-component upload with four checks | 0.73 CPU-seconds                                                                                     | 5 vCPU-seconds  |
| Processing a 3,000-component upload                | 2.6 CPU-seconds                                                                                      | 25 vCPU-seconds |
| Nightly OSV rescan of one SBOM                     | Part of the 0.73 above: 0.3 CPU-seconds in the scanner, plus 1 to 8 seconds waiting on `api.osv.dev` | 2 vCPU-seconds  |
| Serving one page or API call                       | 0.13 CPU-seconds                                                                                     | 1 vCPU-second   |

The margin covers three things the measurements did not. A cloud vCPU is one hyperthread, so it does about half the work of the cores we tested on. A large database makes queries slower than the small one we tested. And repeat runs varied by up to 30%.

Then each instance's CPU is shared out. On a 4 vCPU instance, 2 vCPUs go to workers, 1 to web, and 1 is left for the OS, Caddy, the scheduler and spikes:

- **Uploads:** 2 vCPUs × 3,600 seconds ÷ 5 vCPU-seconds is about 1,440 an hour. The table says 1,000.
- **Rescans:** 20,000 SBOMs × 2 vCPU-seconds ÷ 2 vCPUs is about 5.5 hours, so the nightly run finishes by morning. With 12 worker threads and up to 8 seconds' wait per scan, the queue drains at least as fast.
- **Pages:** 100 users with a quarter of them active, each opening two pages a minute, is under 1 page a second, or under 1 vCPU.
- **Large tier:** three instances, with the second and third counted at half because of the shared data tier: 2,000 uploads an hour and 40,000 rescans. 300 users with a quarter active is 2.5 pages a second, within the 3 web vCPUs across the three instances.

The budgets hold the cost per unit fixed, and that is the weakest assumption. It only holds near what we tested: up to 100 products per workspace and a few thousand SBOMs. The 2x margin for a larger database covers the production tier's 100,000 SBOMs. That is why the tiers stop where they do.

On a single instance, measured throughput was more than 20 times the figures in the table. That margin is for a single instance and does not carry over to several. Before you commit to a size, upload a week's worth of your real SBOMs to a test instance and watch how long results take to appear.

## Best practices

- **Separate the data tier.** PostgreSQL and Redis or Valkey on their own managed instances, never on the app VM in production.
- **Pin and verify images.** Deploy a release tag such as `v26.11.0`, verify it with `cosign`, and upgrade deliberately. `latest` changes under you.
- **Back up PostgreSQL and the SBOM bucket together.** Turn on automated snapshots and point-in-time recovery for the database, and versioning on the SBOM bucket. A database restore without the matching objects, or the other way round, leaves broken references.
- **Take a snapshot before every upgrade.** Migrations run automatically and are not reversed on rollback.
- **Keep secrets out of the image and out of Git.** Use `override.env` with tight permissions, a Kubernetes Secret, or your cloud's secret manager.
- **Keep the internal API internal.** Caddy blocks `/api/v1/internal/` from public addresses by default. In Compose it allows private source addresses, so make sure your load balancer preserves the client IP rather than translating it to a private one. The Helm chart blocks every external caller. If you replace Caddy with your own proxy, block the path there too.
- **Monitor the health endpoint.** `GET /UuPha8mu/` returns 200 when the web process is up and can reach the database. Caddy answers `/health` itself. Point your load balancer and uptime checks at the first, and watch worker logs separately.
- **Turn on error reporting.** Set `SENTRY_DSN`. With it unset, errors only appear in container logs.
- **Watch the queue, not just CPU.** If uploads are fast but results arrive late, add workers before you add web capacity.
- **Allow outbound access to the vulnerability feeds.** Scans call `api.osv.dev`, and the workers fetch the CISA KEV and ENISA EUVD feeds. In a restricted network, allow them through your proxy (`HTTPS_PROXY` is passed to the scanner).
- **Restrict sign-up.** Turn off self-registration in Keycloak unless you want anyone who can reach the URL to create a workspace.
- **Cap container logs.** The Compose file limits each container to 30 MB of logs (`LOG_MAX_SIZE`, `LOG_MAX_FILE`). Ship them to your log platform if you need history.

## Troubleshooting

| Symptom                                       | Check                                                                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Caddy cannot get a certificate                | Ports 80 and 443 open, DNS points at the host, `BIND_IP=0.0.0.0`. Use the staging `ACME_CA` while testing. |
| Sign-in loops or fails                        | Redirect URI and web origin in Keycloak match `APP_BASE_URL` exactly. `KEYCLOAK_SERVER_URL` ends in `/`.   |
| `400 Bad Request` on every page               | The host name is not the one in `APP_BASE_URL`, or you are browsing by IP address.                         |
| Invitations fail, or workers log email errors | `EMAIL_*` settings on every service. Send a test message as shown under [email](#email).                   |
| Cannot invite a second member                 | The workspace is on the Community plan. Set it to Enterprise in Django admin.                              |
| Scans stay pending                            | Workers running (`docker compose logs sbomify-worker`), Redis reachable, outbound HTTPS to `api.osv.dev`.  |
| Large uploads fail                            | Raise `DATA_UPLOAD_MAX_MEMORY_SIZE_MB`, and check any proxy body-size limit in front of Caddy.             |

Still stuck? Ask in the [sbomify Slack](https://join.slack.com/t/sbomify/shared_invite/zt-3na54pa1f-MXrFWhotmZr0YxXc8sABTw) or [open an issue](https://github.com/sbomify/sbomify/issues).

{{< cta-ready title="Need help running sbomify in production?" primary_url="https://app.sbomify.com/enterprise-contact/" primary_text="Talk to us about support" secondary_url="https://github.com/sbomify/sbomify" secondary_text="View on GitHub" >}}
