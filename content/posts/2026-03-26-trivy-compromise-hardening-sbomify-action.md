---
title: "Trivy Compromise: How We Are Hardening sbomify-action"
description: "Aqua Security's Trivy was compromised twice in two weeks. Here is how we audited and hardened sbomify-action in response, and why we are moving to short-lived OIDC tokens."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, supply-chain-security, trivy, github-actions, oidc, sbomify-action]
tldr: "sbomify-action uses Trivy as one of the SBOM generation tools. Based on our audit, we were not affected. However, we have proactively removed Trivy from sbomify-action for the time being. We are also looking to implement short-lived tokens instead of Personal Access Tokens (PAT)."
date: 2026-03-26
slug: trivy-compromise-hardening-sbomify-action
---

The last few weeks have been turbulent in the world of supply chain security. Perhaps the most high-profile compromise has been in Aqua Security's Trivy -- a widely used tool in the SBOM world, and also used in sbomify-action as one of the SBOM generation tools. Trivy has been compromised not once, but twice in the span of two weeks.

The initial attack vector was a `pull_request_target` misconfiguration in Trivy's GitHub Actions workflow, which allowed the attackers to steal privileged access tokens. In recent analysis from [socket.dev](https://socket.dev/blog/trivy-docker-images-compromised), it appears to have gone even further. There is evidence that the entire Aqua Security GitHub organization was compromised by a group calling themselves TeamPCP -- a group that has been active since December 2025 and labeled the Trivy attack as "Phase 09" of a broader campaign. As part of this, the attackers were able to push compromised Docker images containing infostealer malware to Docker Hub, and even after removal, cached copies on `mirror.gcr.io` continued to be pulled by CI/CD pipelines.

This is rather scary. If a _security_ company like Aqua -- with very talented security engineers -- can get fully compromised like this, we can probably assume that a lot of companies are blissfully unaware that they too have been compromised.

Trivy is unlikely to have been an accidental target. It was most likely attacked because Trivy is widely used in CI/CD pipelines, making it a juicy target for a credential-stealing attack. The same group also targeted [Checkmarx KICS](https://www.checkmarx.com/), suggesting a deliberate campaign against security tooling in CI/CD pipelines. The cascading impact became clear with [litellm](https://thehackernews.com/2026/03/teampcp-backdoors-litellm-versions.html). Because litellm used Trivy in its CI pipeline, the compromised Trivy action exfiltrated litellm's PyPI publishing token. The attackers then used that token to publish malicious litellm packages containing a three-stage payload: credential harvesting, encrypted exfiltration, and Kubernetes lateral movement. This is the nightmare scenario of supply chain attacks -- one compromised tool cascading into downstream projects.

## How are we hardening sbomify-action?

We have audited sbomify-action, and we have found no evidence of it being impacted. None of the affected versions (0.69.4, 0.69.5, 0.69.6) were ever used in sbomify-action. However, as the story is still evolving, we have decided to fully remove Trivy from sbomify-action as a precautionary measure. As of [sbomify-action 26.1.0](https://github.com/sbomify/sbomify-action/releases/tag/v26.1.0), Trivy has been dropped entirely. When the dust settles, we might bring it back, but right now we would rather err on the side of caution.

We also audited our own pipelines and applied some additional hardening both in sbomify and sbomify-action.

But what can we learn from the Trivy failure in general? Dan Lorenc of Chainguard shared [his view](https://www.linkedin.com/posts/danlorenc_yesterdays-trivy-supply-chain-attack-wasnt-share-7441213598770593793-DqkT/). He argues that this was not just a Trivy failure but a GitHub platform failure. Version tags in GitHub Actions are mutable -- a single force-push can silently rewrite what a tag points to. In the Trivy case, 75 version tags were rewritten to point at malicious code. This is why pinning to commit hashes rather than tags is so important. It has long been considered best practice, but many users are reluctant to do this due to the added friction. We recommend that users pin to hashed versions when using sbomify-action too.

If you have run Trivy in your CI/CD pipelines recently, we also recommend rotating any secrets and tokens that were accessible during those runs as a precaution.

Another observation is that many CI/CD pipelines rely on Personal Access Tokens (PAT) or other forms of long-lived API tokens. Here, we are in fact guilty of this ourselves, and we need to do better. In the coming weeks, we are going to explore adopting OpenID Connect (OIDC) in sbomify and sbomify-action to reduce this attack vector. This way, even if a token is stolen or leaked like in the case of Trivy, the damage is very limited as the token will expire soon after it has been issued.
