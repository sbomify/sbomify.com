---
layout: post
title: "Announcing sbomify v0.20: Custom Domains & Streamlined Onboarding"
author:
  display_name: Viktor
categories: sbom, announcement, release
---

![sbomify v0.20 Release](/assets/images/release-0-20-cover.png)

We're excited to announce the release of **sbomify v0.20**, a significant update focused on empowering organizations to make their Trust Center truly their own. This release introduces custom domain support, a redesigned onboarding experience, and numerous improvements to workspace management and security.

## Custom Domain Support

The headline feature of v0.20 is **custom domain support for public Trust Center pages**. Workspaces can now use their own domain (via CNAME) to serve their public Trust Center, making it seamlessly integrate with their existing web presence.

With this update, you can:

- Configure a custom domain directly from your workspace branding settings
- Use clean, slug-based URLs when accessing via your custom domain
- Benefit from extended caching with proper invalidation when your content changes

This feature is perfect for organizations that want their Trust Center to live at something like `trust.yourcompany.com` rather than a subdomain of sbomify.

## Redesigned Onboarding Wizard

We've completely reimagined the onboarding experience for new users. The previous multi-step wizard has been simplified into a **single-step SBOM identity setup** that gets you up and running faster.

Key improvements include:

- Automatic redirect for first-time users to set up their SBOM identity
- Plan-aware getting started flow that adapts to your subscription
- Modernized UI with better handling of edge cases

## Workspace Management Enhancements

Managing your workspace just got easier with several quality-of-life improvements:

- **Workspace name editing**: Change your workspace name directly from settings
- **User invitation management**: Manage pending invitations from the settings page
- **Improved session management**: Better caching and workspace switching with proper cache invalidation

## Team Invitation System Improvements

We've overhauled how team invitations work with a new **token-based invitation system**:

- More secure invitation URLs backed by database tokens
- Persistent team settings with toast notifications for invitation status
- Improved handling and styling throughout the invitation flow

## Public Pages Improvements

Your public Trust Center pages now offer an even better experience:

- **Breadcrumb navigation** for easier navigation on component pages
- **Copy-to-clipboard functionality** for quick sharing
- Fixed layout and logo display issues
- Consistent "Trust Center" capitalization across all templates

## Security Hardening

This release includes important security improvements:

- Fixed incomplete URL substring sanitization (addressing CodeQL alerts)
- Added admin permission restrictions for removing team owners
- Improved workspace member removal and session handling
- Added comprehensive tests for edge cases with pending invitations

## Infrastructure Updates

Under the hood, we've made several infrastructure improvements:

- Improved HTTPS/TLS handling with Caddy
- Configurable port exposure in Docker setup
- New `bin/deploy.sh` deployment script
- Updated deployment documentation

## By the Numbers

This release involved significant effort across the codebase:

- **125 files changed**
- **~9,663 lines added**
- **~1,611 lines removed**

## Getting Started

If you're self-hosting sbomify, update to v0.20 to take advantage of these new features. For users on our hosted platform, these improvements are already live.

Check out the [full changelog on GitHub](https://github.com/sbomify/sbomify/releases/tag/v0.20) for complete details.

As always, we welcome your feedback and contributions. Drop us a note or open an issue on GitHub if you have questions or suggestions!
