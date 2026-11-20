---
title: "The State of the Commercial Raspberry Pi Ecosystem: We Scanned Every Paid-For OS in Raspberry Pi Imager"
date: 2026-11-26
seo_title: "Commercial Raspberry Pi OS Security: SBOM and CVE Scan"
description: "We downloaded every image in the 'Freemium and paid-for OS' section of Raspberry Pi Imager, generated SBOMs and ran them through OSV. End-of-life Debian, Python 2.7, stale Chromium builds and thousands of fixable CVEs, on devices that sit inside business networks. Here is what we found, and what the CRA will expect."
keywords: "Raspberry Pi security, Raspberry Pi OS end of life, Raspbian buster EOL, digital signage security, Raspberry Pi Imager, SBOM Raspberry Pi, OSV scanner, CRA Raspberry Pi, Cyber Resilience Act IoT, commercial Raspberry Pi products, OTA updates Raspberry Pi"
categories:
  - education
tags: [sbom, cra, raspberry-pi, vulnerability-management, osv, iot, digital-signage]
tldr: "We scanned the 11 commercial operating systems listed under 'Freemium and paid-for OS' in Raspberry Pi Imager. Two still ship an end-of-life Debian 10 base, one runs its management stack on Python 2.7, and one is a 20-month-old Arch Linux snapshot. The Debian 12 based images carry between 2,600 and 5,300 vulnerabilities that already have a fix upstream, before the kernel is even counted. Scanners also under-report end-of-life systems: OSV matched 14 Debian advisories against a Raspbian 10 image, but 452 when the same packages were checked against Debian 11 data. One image still ships the default `pi` / `raspberry` password, and three bake a shared private SSH host key into every device. Most of these are digital signage players sitting on corporate networks, and from December 2027 they fall squarely under the Cyber Resilience Act."
author:
  display_name: Viktor Petersson
  login: vpetersson
  url: https://sbomify.com
---

Hobbyist Raspberry Pi builds get a pass. Nobody expects a weekend retro-gaming setup or a child's weather station to come with a vulnerability management program, and treating them like commercial goods would be unfair.

Commercial offerings present a different situation. The Raspberry Pi Imager includes a section named **Freemium and paid-for OS**, which lists images from firms selling products or services for the Pi. Most are digital signage players, alongside a thin client, a smart-home hub, a 3D printer controller and a commercial Android distribution. These are not hobbyist endeavors. They are deployed in lobbies, conference rooms, retail displays, factory environments, and hospital hallways, typically connected to corporate networks, frequently on a VLAN unreviewed since setup, and rarely tracked in IT asset lists.

Therefore, we treated them as we would any other product: we obtained the image from the vendor, created an SBOM, and checked it for known vulnerabilities.

## Methodology

We intentionally limited this review to the **Freemium and paid-for OS** category only, excluding all other sections of Raspberry Pi Imager. That decision is the whole point. Holding hobbyists and makers (the general-purpose Raspberry Pi OS images, the retro-gaming distributions, the tinkerer projects) to the same security standard as a company selling a product would be unfair. A creator flashing an image for a weekend project makes no commitments to anyone. A vendor charging for a signage player, thin client, or smart-home hub has made such commitments, either implicitly or via contract, and will soon be required to do so by law. Consequently, we evaluated only those items sold as products.

1. We retrieved the Raspberry Pi Imager OS list (`os_list_imagingutility_v4.json`) on 20 November 2026 and selected every entry listed under **Freemium and paid-for OS**.
2. For each vendor, we chose the most recent image compatible with a Raspberry Pi 4 or Pi 5. If a vendor offered multiple images, we scanned only the latest one.
3. We uncompressed the image, attached it as a read-only loop device, and mounted every partition. When the root filesystem was nested inside Ubuntu Core snaps, balenaOS container layers, an LVM volume, or a squashfs payload, we mounted that as well.
4. We noted the OS release, kernel version, package sources, and update mechanism, then generated an SBOM using [Syft](https://github.com/anchore/syft) 1.57.2 and scanned it with [OSV-Scanner](https://github.com/google/osv-scanner) 2.7.1.

Several details are important for interpreting the figures:

- **Counts reflect distinct advisories** following OSV's alias consolidation. A CVE that also carries a DSA, GHSA, or PYSEC ID is counted only once.
- **"Fix available"** indicates OSV lists a patched version for that package within that ecosystem. In short, the issue has been resolved upstream, yet the vendor has not yet released the update.
- **The kernel receives separate treatment.** Because the Linux kernel operates as its own CNA, it issues thousands of CVEs annually, and comparing Raspberry Pi kernels to Debian's `linux` advisories creates significant noise. We include this data but exclude it from the headline figures.
- **Raspbian lacks a dedicated OSV ecosystem.** We aligned Raspbian packages with their corresponding Debian release and employed source package names, which serve as the key for Debian's advisories.
- **This represents the default setup.** Certain products self-update after the initial boot, meaning a deployed device might differ from its original image. Nevertheless, the shipped image reflects the vendor's choice and serves as the starting point for every new device.

## The results

| Product (image tested)                         | Base OS                                      | Base OS support status                                                       | Non-kernel vulns | Critical / High | Fix available | Update path we found                            |
| ---------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------- | ---------------: | --------------: | ------------: | ----------------------------------------------- |
| **Linutop OS** (Jan 2025)                      | Raspbian 10 "buster"                         | **End of life** (Debian LTS ended June 2024)                                 |      318 (756\*) |        28 / 151 |           316 | Plain apt against the archived buster repo      |
| **XOGO** 2.105.21 (Oct 2022)                   | balenaOS host, player container on Debian 10 | **End of life** (Debian 10; Alpine 3.15/3.16 supervisor containers also EoL) |      413 (547\*) |          3 / 37 |           413 | balena fleet updates, if the fleet is managed   |
| **3DPrinterOS** (Mar 2024)                     | Arch Linux ARM snapshot, kernel 6.6.21       | Rolling release, 20 months stale                                             |             299† |         10 / 47 |           299 | Vendor service; no evidence of OS-level updates |
| **info-beamer OS** (Feb 2026)                  | Custom minimal Linux                         | Runtime on **Python 2.7.18** (EoL Jan 2020)                                  |              117 |         19 / 60 |           116 | Signed A/B image updates                        |
| **1Play** V17 (Jul 2025)                       | Raspbian 12 "bookworm" (12.11)               | Debian 12 is in LTS since July 2026                                          |            3,877 |     257 / 1,371 |         2,617 | apt against Raspbian and Raspberry Pi repos     |
| **Yodeck** (Aug 2026, Pi 5)                    | Debian 12.5                                  | Debian 12 LTS; packages from the March 2024 point release                    |            3,266 |     208 / 1,201 |         2,643 | Vendor apt mirror                               |
| **TLXOS** 5.2.4                                | Debian 12.13                                 | Debian 12 LTS                                                                |            6,273 |     598 / 2,581 |         5,252 | Vendor updater service + Debian security repo   |
| **Homey Self-Hosted Server** (Dec 2025)        | Debian 13.2 "trixie"                         | Supported                                                                    |            1,397 |        59 / 429 |         1,103 | Debian security repo, app in Docker             |
| **ScreenlyOS** 26.10.1 (Nov 2026)              | Ubuntu Core 24/26                            | Supported                                                                    |              673 |        37 / 148 |           349 | Transactional snap updates (automatic)          |
| **Android by emteria** 17.2.0 (Nov 2026, Pi 5) | Android 17                                   | Security patch level **2026-06-05**, five months behind its own build date   |             n/a‡ |             n/a |           n/a | Vendor OTA                                      |
| **Fugo One**                                   | n/a                                          | n/a                                                                          |              n/a |             n/a |           n/a | Image URL in Imager returns 404                 |
| **vetra player**                               | n/a                                          | n/a                                                                          |              n/a |             n/a |           n/a | Listed in Imager with no images                 |

\* The same packages, checked against Debian 11 advisory data; see "Scanners go quiet when you need them most" for further details.
† Scanning was limited to the application layer because OSV lacks support for the Arch Linux (ALPM) ecosystem, meaning none of the 386 operating system packages were examined.
‡ We accessed Android build settings, but we did not generate a complete Software Bill of Materials for Android.

Disclosure: ScreenlyOS is developed by Screenly, the firm I co-founded. It is on the list, so it went through exactly the same pipeline, and it does not come out clean either.

## What stands out

### End-of-life bases are still shipping

Two of the nine images we were able to analyze completely rely on Debian 10 "buster". Regular security maintenance for buster ceased in September 2022, with long-term support ending in June 2024. The image from Linutop, dated January 2025, is Raspbian 10.13 featuring a 5.10.103 kernel from early 2022; its package database was last updated in November 2024. XOGO's player operates within a Debian 10 container on a balenaOS host running a 5.10.95 kernel. The supervisor containers are constructed using Alpine 3.15 and 3.16, which also reached end-of-life status in 2023 and 2024 respectively.

info-beamer presents a different scenario. Its foundational system is a compact custom build utilizing signed A/B updates, which constitutes a sound architecture. However, the device management layer relies on Python 2.7.18 alongside Flask 0.12, Werkzeug 0.11, Jinja2 2.8, and Pillow 4.0. Python 2 reached end of life in January 2020, and these libraries originate from 2016-2017. The Pillow library alone is responsible for 70 of the 117 advisories.

3DPrinterOS runs on Arch Linux ARM, a rolling release distribution. This approach functions adequately provided you maintain the rolling cycle. A snapshot from March 2024 represents a Linux system that is 20 months old with no versioned distribution to support backporting fixes.

### "Supported" doesn't mean patched

The Debian 12 images appear superior on paper because bookworm remains under long-term support. In reality, they harbor the highest number of vulnerabilities since they distribute a large volume of software and the image is merely a snapshot:

- **Yodeck's** Pi 5 image carries a date from August 2026 yet relies on Debian 12.5, which came out in February 2024. Chromium is at version 125, from June 2024. Out of its 3,266 non-kernel advisories, fixes are already available for 2,643 within Debian.
- **1Play** provides two full kernel trees (6.12.25 and 6.12.34) for each Pi model, includes Chromium 138, and offers 2,617 advisories that can be patched.
- **TLXOS** has the most current Debian 12 image of the group (12.13), but it also includes a complete thin-client suite: Citrix, VMware Horizon, FreeRDP, NX, SPICE, CUPS, strongSwan, and others. The Chromium component alone accounts for 4,206 advisories. Since Debian manages Chromium security differently than most other packages, treat that single figure with caution. The other 2,000+ need no such caveat.

A small group of packages dominates every Debian-based image: `webkit2gtk`, `imagemagick`, `ffmpeg`, `chromium`, `vim`, `binutils`, `pillow`. These represent the media and browser layers a signage device requires, and they are the components that constantly process untrusted input.

### Scanners go quiet when you need them most

Anyone depending on a scanner dashboard should be concerned by this result. When we checked Linutop's Raspbian 10 packages against OSV's **Debian 10** records, we found **14** Debian advisories. Comparing the same packages against **Debian 11** data showed matches for **452**. XOGO rose from 143 to 280.

The explanation is straightforward. Once a release is archived, the upstream security tracker ceases logging new issues for it, causing vulnerability databases to stop matching it. The longer a system remains unmaintained, the fewer issues appear in its scan results. A simple "0 critical" report on an end-of-life device represents a missed detection rather than actual safety. Verifying the support status of the underlying operating system must be part of the procedure, not just running a scanner.

### Default credentials and shared SSH host keys

A count of CVEs reveals the software a vendor included. It does not indicate how the vendor set up the system. Therefore, we also examined two areas an SBOM misses: the accounts built into the image and the SSH host keys.

The worst case is **Linutop**. Its operating system image includes the `pi` user account still configured with the standard Raspberry Pi password (`raspberry`). This credential was removed from Raspberry Pi OS in 2022 because it represented the single most frequently exploited default on the platform. Anyone who can reach the device and knows this default password, which is to say anyone, is already authenticated. It is a hardcoded credential in the plainest sense.

The SSH configuration presents a distinct issue that impacts multiple images. Several manufacturers embed the **private SSH host keys** directly within the image, meaning every device flashed from that image presents the _same_ host key:

| Product         | SSH on by default   | Host keys               | First-boot regeneration    | Password login                                    |
| --------------- | ------------------- | ----------------------- | -------------------------- | ------------------------------------------------- |
| **Linutop**     | No (needs enabling) | **Baked in, shared**    | None                       | Default `pi` / `raspberry`                        |
| **1Play**       | Yes                 | **Baked in, shared**    | None                       | `pi` set (not default)                            |
| **TLXOS**       | Yes                 | **Baked in, shared**    | None                       | Disabled (key-only, root `prohibit-password`)     |
| **Yodeck**      | Yes                 | Generated on first boot | `regenerate_ssh_host_keys` | `root` / `pi` / `user` set; `PermitRootLogin yes` |
| **Homey**       | Yes                 | Generated on first boot | `regenerate_ssh_host_keys` | `homey` set                                       |
| **3DPrinterOS** | Yes                 | None in image           | n/a                        | `root` / `printeros` set                          |

A shared private host key represents a genuine vulnerability rather than a superficial issue. Since every unit deployed carries the exact same key, its secrecy relies entirely on the image download, which is public. Any attacker who retrieves the image effectively controls the private key for all active devices. This eliminates SSH's defense against man-in-the-middle interception: a device located on the same network can pose as the legitimate player, and the connecting administrator receives no host-key warning because the key matches perfectly. The solution is straightforward (remove the keys during the build process and allow `ssh-keygen` to execute once per unit upon first startup, a practice already implemented by Yodeck and Homey), making its absence in other systems particularly noteworthy.

To clarify exactly what we did and did not extract: the `pi` / `raspberry` pair constitutes the platform's own documented standard default, so identifying it reveals nothing that is not already public knowledge. We did not crack, nor are we publishing, the unique password hashes found on the other images, nor the private key material itself. The finding is simply that these keys exist and are shared, which can be observed without reading them. TLXOS deserves credit for disabling password authentication completely, even though its shared host key remains in place.

Under the CRA this maps to Annex I, Part I(2)(b), "ensure protection from unauthorised access by appropriate control mechanisms", and the guidance that products must not use default or unchangeable passwords. A shipped default credential is close to the textbook example of what that clause aims to prevent.

### Update mechanisms vary widely

| Approach                                                 | Products                                        |
| -------------------------------------------------------- | ----------------------------------------------- |
| Transactional / image-based OTA (A/B or snaps)           | ScreenlyOS, info-beamer, XOGO (balena), emteria |
| Package manager pointed at live security repos           | TLXOS, Homey, 1Play                             |
| Package manager pointed at a vendor-controlled mirror    | Yodeck                                          |
| Package manager pointed at an archived, end-of-life repo | Linutop                                         |
| No OS-level update path visible in the image             | 3DPrinterOS                                     |

Image-based OTA fits the appliance model well, yet it provides no real benefit unless the vendor actually rebuilds the image with up-to-date components. XOGO uses balena's update tools but delivers a Debian 10 payload, while info-beamer has signed A/B updates but still ships Python 2.7. In contrast, a package manager pointing to live Debian security repositories offers little help if no process runs the upgrade. Among the Debian-based images we examined, we found no unattended-upgrades policy configured.

## Why this matters: signage is on your network

Each of these units functions as a Linux computer connected to a network and physically located in public or semi-public areas. They are typically installed by facilities or marketing teams rather than IT staff and often remain untouched for years once operational. Many operate a full browser engine to display remote content, while several include VPN clients, remote-desktop clients, and printing stacks. A compromised signage player provides attackers with a foothold within the building's network that goes unnoticed.

This is not just theoretical concern. Attackers already target unmanaged IoT and edge devices to gain initial access specifically because those units are the least likely to receive patches or monitoring. A device carrying thousands of fixable vulnerabilities in its browser and media stack, fetching content from the internet and sitting next to the corporate LAN, matches exactly the profile they seek.

## Where the CRA comes in

These are commercial products sold in the EU, meaning the [Cyber Resilience Act](/compliance/eu-cra/) applies to them. The main obligations take effect starting **11 December 2027**, while reporting obligations began on **11 September 2026**. When measured against our findings:

- **No known exploitable vulnerabilities at release** (Annex I, Part I(2)(a)). Shipping a 2026 image built on a 2024 point release, or on an end-of-life base, is hard to square with this.
- **Security updates, automatic by default** (Annex I, Part I(2)(c)). An image lacking a functional update path, or one pointing at an archived repository, fails to satisfy it.
- **A defined support period, normally at least five years** (Article 13(8)). Coverage must include the underlying operating system, and you cannot guarantee five years of support for a distribution that has already reached end of life.
- **An SBOM covering at least the top-level dependencies** (Annex I, Part II(1)). Every vendor included here must provide one. Creating it is straightforward; however, acting upon the findings is where most vendors currently fall short.
- **Handling vulnerabilities without delay** (Annex I, Part II(2)). Finding 2,000 to 5,000 advisories for issues already fixed in a shipped image suggests no one is actively tracking them.
- **No default or unchangeable passwords, and protection from unauthorised access** (Annex I, Part I(2)(b)). A shipped `pi` / `raspberry` default and shared SSH host keys are the textbook failures here.

None of this requires extraordinary effort. The majority of the issues listed above vanish if you reconstruct the image from a supported base on a set schedule, deliver it via an update mechanism the device actually uses, and continuously watch the SBOM for new security flaws. That final step is what [sbomify](https://sbomify.com) addresses.

## Takeaways

**If you buy these products**, request an SBOM and a declared support timeline from the vendor, and inquire how operating system updates reach the device. Place signage players on a segregated network segment and include them in your asset inventory.

**If you build them**, consider the base image as a dependency with an end-of-life date. Monitor it just like you monitor application dependencies. Rebuild regularly, distribute through a channel the device uses, and do not rely on a clean scan of an end-of-life system. Also, manage the basics that an SBOM cannot detect: avoid default passwords and regenerate SSH host keys upon first boot instead of embedding one shared key into every unit.

**For everyone**: a hobby image two years old remains a hobby project. A commercial product trailing by two years is a liability, and starting in December 2027, it also becomes a compliance issue.
