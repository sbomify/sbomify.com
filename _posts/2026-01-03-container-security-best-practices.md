---
layout: post
title: "Container Security: Best Practices for Securing Docker and Kubernetes"
description: "A comprehensive guide to container security covering image scanning, runtime protection, network policies, and how SBOMs provide component visibility."
category: education
tags: [container, docker, kubernetes, security]
tldr: "Container security requires a layered approach: minimal base images, vulnerability scanning, least-privilege runtime, and network policies. Generating separate SBOMs for the base image and application layers — rather than one monolithic SBOM — gives you targeted visibility for vulnerability triage and compliance audits."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com

---

Container security is the practice of protecting containerized applications and their infrastructure throughout the entire lifecycle — from building container images through deployment and runtime operations. Containers package applications with their dependencies into isolated units, but this isolation does not automatically equal security. Every layer of a container image, from the base operating system to application dependencies, represents a potential attack surface that must be managed.

![Container image layers with separate SBOMs feeding into security controls](/assets/images/d2/container-security-layers.svg)

## What Is Container Security?

Container security encompasses the tools, practices, and policies used to protect containerized workloads. Unlike traditional application security, container security must address concerns at multiple layers: the container image, the container runtime, the orchestration platform (typically Kubernetes), the host operating system, and the network.

Containers have become the standard deployment model for cloud-native applications. According to the [Cloud Native Computing Foundation](https://www.cncf.io/), the majority of organizations now run containerized workloads in production. This widespread adoption makes container security a critical discipline — a compromised container image pulled from a public registry can affect thousands of deployments.

The challenge is compounded by the ephemeral nature of containers. Unlike traditional servers that persist for months or years, containers may exist for seconds or minutes. Security practices must be automated and embedded into the build and deployment pipeline rather than applied manually.

## Container Image Security

The container image is the foundation of container security. An image that ships with known vulnerabilities, outdated packages, or unnecessary components creates risk before the container even starts.

### Base Image Selection

The choice of base image has an outsized impact on security. A full Linux distribution (like Ubuntu or Debian) may include hundreds of packages that your application never uses but that increase the attack surface. Minimal base images reduce this risk.

| Base Image Type                              | Packages                   | Attack Surface | Use Case                        |
| -------------------------------------------- | -------------------------- | -------------- | ------------------------------- |
| **Distroless** (e.g., `gcr.io/distroless`)   | Application runtime only   | Minimal        | Production workloads            |
| **Alpine Linux**                             | ~15 MB base, musl libc     | Small          | General purpose, size-sensitive |
| **Slim variants** (e.g., `python:3.12-slim`) | Stripped-down distribution | Medium         | Language-specific applications  |
| **Full distribution** (e.g., `ubuntu:24.04`) | Full package set           | Large          | Development, debugging          |

For production, prefer distroless or slim images. Fewer packages means fewer potential vulnerabilities and a smaller SBOM — making both security management and compliance simpler.

### Image Scanning

Container image scanning analyzes the contents of an image for known vulnerabilities by matching installed packages and libraries against vulnerability databases like the [NVD](https://nvd.nist.gov/) and [OSV](https://osv.dev/).

Key scanning tools include:

- **[Trivy](https://github.com/aquasecurity/trivy)** — Open source scanner from Aqua that detects vulnerabilities in OS packages, language-specific dependencies, and misconfigurations
- **[Grype](https://github.com/anchore/grype)** — Open source vulnerability scanner from Anchore
- **[Snyk Container](https://snyk.io/product/container-vulnerability-management/)** — Commercial scanner with developer workflow integration

Scanning should happen at multiple points: during the CI/CD build, before images are pushed to a registry, and continuously against images already in production (since new vulnerabilities are disclosed daily).

### Container SBOMs: Separate Layers, Separate SBOMs

A containerized application has two distinct layers with different component profiles: the **base image layer** (OS packages, system libraries) and the **application layer** (your code's dependencies from lock files). Rather than combining everything into a single monolithic SBOM, the best practice is to generate **separate SBOMs for each layer** and organize them hierarchically.

This separation matters for several reasons:

- **Different update cadences.** Base image packages change when you rebuild with a new base image; application dependencies change when you update your lock file. Separate SBOMs let you track each independently.
- **Different vulnerability profiles.** A glibc vulnerability in the base image is a different remediation path than a vulnerability in an npm package. Separate SBOMs make triage clearer.
- **Cleaner compliance.** Compliance reviewers can evaluate OS-level and application-level components independently, with the correct tool and context for each.

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) supports this workflow directly — generate an Application SBOM from your lock file and a Container SBOM from the built image, then organize both under a single product using sbomify's [Product → Project → Component hierarchy]({{ site.url }}/features/sbom-hierarchy/). For step-by-step instructions, see our [Docker SBOM guide]({{ site.url }}/guides/docker/).

## Runtime Security

Image scanning catches known vulnerabilities before deployment, but runtime security protects against exploitation of unknown flaws, misconfigurations, and malicious behavior during execution.

### Principle of Least Privilege

Containers should run with the minimum permissions required:

- **Run as non-root.** The default user in many container images is root. Always specify a non-root user in your Dockerfile (`USER nonroot`) or enforce this via Kubernetes security contexts.
- **Drop capabilities.** Linux capabilities grant fine-grained privileges. Drop all capabilities and add back only those required (`--cap-drop=ALL --cap-add=NET_BIND_SERVICE`).
- **Read-only filesystem.** Mount the container filesystem as read-only where possible (`--read-only`), using tmpfs mounts for directories that require writes.
- **No privilege escalation.** Set `allowPrivilegeEscalation: false` in Kubernetes security contexts to prevent processes from gaining additional privileges.

### Secrets Management

Never bake secrets (API keys, database credentials, certificates) into container images. Images are stored in registries and can be inspected by anyone with access. Instead:

- Use Kubernetes Secrets or a dedicated secrets manager (HashiCorp Vault, AWS Secrets Manager)
- Mount secrets as files or environment variables at runtime
- Rotate secrets regularly and audit access

### Runtime Monitoring

Runtime security tools observe container behavior and detect anomalies:

- **Unexpected processes** — A web server container suddenly running a shell may indicate compromise
- **Unusual network connections** — Outbound connections to unknown IP addresses
- **File system modifications** — Changes to binaries or configuration files in a read-only container
- **Privilege escalation attempts** — Attempts to gain root access

## Kubernetes Security

For organizations running containers at scale, Kubernetes introduces its own security considerations.

### Network Policies

By default, Kubernetes allows all pod-to-pod communication within a cluster. Network policies restrict this to only the connections that are necessary:

- Isolate namespaces so that development and production workloads cannot communicate
- Restrict ingress to only the pods that need to receive traffic
- Restrict egress to only the external services that pods need to reach

### Pod Security Standards

Kubernetes [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) define three levels of restriction:

- **Privileged** — Unrestricted (use only when necessary)
- **Baseline** — Prevents known privilege escalations
- **Restricted** — Hardened configuration following security best practices

Enforce at least the Baseline level for all production workloads. Use the Restricted level where possible.

### Supply Chain Security for Images

Ensure that only trusted, scanned images run in your cluster:

- Use a private container registry with access controls
- Sign images and verify signatures before deployment (using tools like [Sigstore cosign](https://docs.sigstore.dev/cosign/))
- Implement admission controllers that reject unsigned or unscanned images
- Pin images to specific digests rather than mutable tags (`:latest` can change without notice)

## Container Security and SBOMs

SBOMs play a central role in container security by providing the component visibility needed for effective vulnerability management.

### Why Separate Container SBOMs Matter

A typical container image may contain hundreds of packages across multiple layers. Without SBOMs, identifying whether a newly disclosed vulnerability affects your containers requires manual investigation of each image — a process that does not scale.

With separate SBOMs for each container layer, organized in a [hierarchical structure]({{ site.url }}/features/sbom-hierarchy/):

- **[Vulnerability scanning]({{ site.url }}/2026/02/01/sbom-scanning-vulnerability-detection/) becomes targeted.** Match base image SBOMs against OS-level advisories and application SBOMs against language-specific vulnerability databases ([NVD](https://nvd.nist.gov/), [OSV](https://osv.dev/), [CISA KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)).
- **Incident response accelerates.** When a new critical [CVE]({{ site.url }}/2025/12/18/cve-vulnerability-explained/) is disclosed, query your SBOM repository to immediately identify affected images — and know whether the vulnerability is in the base image or your application dependencies.
- **Compliance requirements are met.** The [EU CRA]({{ site.url }}/compliance/eu-cra/) and [EO 14028]({{ site.url }}/compliance/eo-14028/) require component documentation for software products, including containerized applications.
- **Base image risk is visible.** Container SBOMs expose the [dependency]({{ site.url }}/2026/01/29/what-is-a-dependency-in-software/) chain inherited from base images that developers may not be aware of, kept separate from application-level components for clarity.

For detailed instructions on generating separate SBOMs from container images, see our [Docker SBOM guide]({{ site.url }}/guides/docker/). For a broader overview of SBOM tools, see our [resources page]({{ site.url }}/resources/).

## Best Practices

1. **Scan images at every stage.** Integrate scanning into CI/CD (build-time), the container registry (push-time), and production (runtime). New vulnerabilities are disclosed daily — a clean image today may be vulnerable tomorrow.

2. **Use minimal base images.** Choose distroless or slim variants for production. Fewer packages means fewer vulnerabilities and a smaller attack surface.

3. **Generate separate SBOMs per layer.** Generate an application SBOM from your lock file and a container SBOM from the built image. Organize both under a single product in your [SBOM management platform]({{ site.url }}/2026/01/18/sbom-management-best-practices/) for continuous vulnerability monitoring.

4. **Run containers as non-root.** Never run production containers as the root user. Configure security contexts to drop unnecessary capabilities and prevent privilege escalation.

5. **Implement network policies.** Do not rely on default allow-all networking. Define explicit network policies that restrict communication to only what is required.

6. **Sign and verify images.** Use image signing to establish provenance and prevent deployment of tampered images. Verify signatures with admission controllers in Kubernetes.

7. **Keep base images up to date.** Regularly rebuild images with updated base layers to pick up security patches. Automate this with scheduled rebuilds in your CI/CD pipeline.

8. **Manage secrets properly.** Never embed secrets in images. Use dedicated secrets management tools and mount secrets at runtime.

## Frequently Asked Questions

### What is container security?

Container security is the practice of protecting containerized applications and their infrastructure throughout the lifecycle — from building images through deployment and runtime operations. It encompasses image scanning, vulnerability management, runtime protection, network policies, secrets management, and access control for container orchestration platforms like Kubernetes.

### How do you scan container images for vulnerabilities?

Container images are scanned by analyzing their contents (OS packages, language libraries, application dependencies) against vulnerability databases like the NVD and OSV. Tools like Trivy, Grype, and Snyk perform this analysis. Scanning should be integrated into CI/CD pipelines, container registries, and production monitoring to catch vulnerabilities at every stage.

### What is a container SBOM?

A container SBOM is a Software Bill of Materials generated from a built container image, documenting the OS-level packages and system libraries in the base image. Best practice is to generate this separately from your application SBOM (which covers your code's dependencies from lock files) and organize both under a product hierarchy. This separation keeps vulnerability triage and compliance clear. See our [Docker SBOM guide]({{ site.url }}/guides/docker/) for detailed instructions on generating separate SBOMs for each layer.

### How does Kubernetes improve container security?

Kubernetes provides security mechanisms including Pod Security Standards (restricting container privileges), Network Policies (controlling pod-to-pod communication), RBAC (role-based access control), Secrets management, and admission controllers (enforcing policies on what can be deployed). These features must be actively configured — Kubernetes defaults are permissive.

### Why should containers run as non-root?

Running containers as root means that a compromise of the application gives the attacker root privileges inside the container, which in some configurations can lead to host escape. Running as a non-root user limits the blast radius of a compromise. Combined with dropping capabilities and setting `allowPrivilegeEscalation: false`, non-root containers significantly reduce risk.
