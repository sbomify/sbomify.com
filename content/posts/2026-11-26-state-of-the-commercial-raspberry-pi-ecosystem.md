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

Hobby Raspberry Pi projects get a pass. Nobody expects a weekend retro-gaming build or a kid's weather station to have a vulnerability management program, and holding them to the same bar as commercial products would be unfair.

Commercial products are another matter. Raspberry Pi Imager has a section called **Freemium and paid-for OS**: images from companies that sell a product or service on top of the Pi. Most of them are digital signage players, alongside a thin client, a smart-home hub, a 3D printer controller and a commercial Android distribution. These aren't hobby projects. They get installed in reception areas, meeting rooms, shop windows, factory floors and hospital corridors, usually on the corporate network, often on a VLAN nobody has looked at since installation day, and almost never in IT's asset inventory.

So we did what we'd do with any product: took the image the vendor ships, generated an SBOM, and checked it for known vulnerabilities.

## Methodology

We deliberately scoped this to the **Freemium and paid-for OS** category alone, and left every other section of Raspberry Pi Imager out. That choice is the whole point: it would be unfair to hold hobbyists and makers — the general-purpose Raspberry Pi OS images, the retro-gaming distros, the tinkerer projects — to the same security standard as a company selling a product. A maker flashing an image for a weekend build has made no promises to anyone. A vendor charging for a signage player, a thin client or a smart-home hub has, implicitly or in a contract, and will soon have to under law. So we judged only the products that are sold as products.

1. We fetched the Raspberry Pi Imager OS list (`os_list_imagingutility_v4.json`) on 20 November 2026 and took every entry under **Freemium and paid-for OS**.
2. For each vendor we picked the newest image that supports a Raspberry Pi 4 or Pi 5. A vendor with several images got one scan, the most current.
3. We decompressed the image, attached it as a read-only loop device and mounted every partition. Where the root filesystem was nested (Ubuntu Core snaps, balenaOS container layers, an LVM volume, a squashfs payload) we mounted that too.
4. We recorded the OS release, kernel, package sources and update mechanism, then generated an SBOM with [Syft](https://github.com/anchore/syft) 1.57.2 and scanned it with [OSV-Scanner](https://github.com/google/osv-scanner) 2.7.1.

A few details matter for reading the numbers:

- **Counts are unique advisories** after OSV's alias grouping. A CVE that also has a DSA, GHSA or PYSEC ID counts once.
- **"Fix available"** means OSV lists a fixed version for that package in that ecosystem. In other words, the problem is already solved upstream and the vendor just hasn't shipped it.
- **The kernel is counted separately.** Since the Linux kernel became its own CNA, it publishes thousands of CVEs a year, and matching Raspberry Pi kernels against Debian's `linux` advisories is noisy. We report it, but leave it out of the headline numbers.
- **Raspbian has no OSV ecosystem of its own.** We mapped Raspbian packages to the matching Debian release and used source package names, which is how Debian's advisories are keyed.
- **This is the out-of-the-box state.** Some of these products update themselves after first boot, so a device in the field may be in better (or worse) shape than its image. Still, the image is what the vendor chose to ship, and it's what every new device starts from.

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

\* Same packages checked against Debian 11 advisory data. See "Scanners go quiet when you need them most" below.
† Only the application layer could be scanned: OSV has no Arch Linux (ALPM) ecosystem, so none of the 386 OS packages were checked.
‡ We read the Android build properties. We didn't build a full Android SBOM.

Disclosure: ScreenlyOS is made by Screenly, the company I co-founded. It's included because it's on the list, and we ran it through exactly the same pipeline. It doesn't come out clean either.

## What stands out

### End-of-life bases are still shipping

Two of the nine images we could fully analyse are built on Debian 10 "buster". Regular security support for buster ended in September 2022 and LTS in June 2024. Linutop's image (dated January 2025) is Raspbian 10.13 with a 5.10.103 kernel from early 2022, and the package database was last touched in November 2024. XOGO's player runs in a Debian 10 container on a balenaOS host with a 5.10.95 kernel. Its supervisor containers are built on Alpine 3.15 and 3.16, which also reached end of life in 2023 and 2024.

info-beamer is a different case. Its base system is a small custom build with signed A/B updates, which is a good architecture. But the device management stack runs on Python 2.7.18 with Flask 0.12, Werkzeug 0.11, Jinja2 2.8 and Pillow 4.0. Python 2 reached end of life in January 2020, and those libraries are from 2016-2017. Pillow alone accounts for 70 of the 117 advisories.

3DPrinterOS uses Arch Linux ARM, a rolling release. That works fine if you keep rolling. A March 2024 snapshot is simply a 20-month-old Linux system with no versioned distribution behind it to backport fixes.

### "Supported" doesn't mean patched

The Debian 12 images look better on paper because bookworm is still in LTS. In practice they carry the most vulnerabilities, because they ship a lot of software and the image is a snapshot:

- **Yodeck's** Pi 5 image is dated August 2026 but is built from Debian 12.5, released in February 2024. Chromium is at 125 (June 2024). 2,643 of its 3,266 non-kernel advisories already have a fix in Debian.
- **1Play** ships two complete kernel trees (6.12.25 and 6.12.34) for every Pi generation, Chromium 138, and 2,617 fixable advisories.
- **TLXOS** is the most current Debian 12 image (12.13), but it bundles a full thin-client stack: Citrix, VMware Horizon, FreeRDP, NX, SPICE, CUPS, strongSwan and more. Its Chromium build alone matches 4,206 advisories. Debian handles Chromium security differently from most packages, so take that one number with a pinch of salt. The other 2,000+ don't need it.

The same handful of packages dominate every Debian-based image: `webkit2gtk`, `imagemagick`, `ffmpeg`, `chromium`, `vim`, `binutils`, `pillow`. These are the media and browser stacks a signage player needs, and they're the ones that parse untrusted content all day.

### Scanners go quiet when you need them most

This finding should worry anyone who relies on a scanner dashboard. When we scanned Linutop's Raspbian 10 packages against OSV's **Debian 10** data, we got **14** Debian advisories. Against **Debian 11** data, the same packages matched **452**. XOGO went from 143 to 280.

The reason is mundane. Once a release is archived, the upstream security tracker stops recording new issues against it, so the vulnerability databases stop matching it. The older and less maintained a system gets, the cleaner its scan looks. A naive "0 critical" report on an end-of-life device is a false negative, not a clean bill of health. Checking the support status of the base OS, not just running a scanner, has to be part of the process.

### Default credentials and shared SSH host keys

A CVE count tells you about the software a vendor pulled in. It says nothing about how the vendor configured the system. So we also looked at two things that an SBOM won't catch: the accounts baked into the image, and the SSH host keys.

The worst case is **Linutop**. Its image ships with the `pi` account still set to the well-known default Raspberry Pi password (`raspberry`) — the password Raspberry Pi OS itself stopped shipping with in 2022, precisely because it was the single most exploited default on the platform. Anyone who can reach the device and knows the default, which is to say anyone, is already authenticated. This is a hardcoded credential in the plainest sense.

The SSH story is separate and affects more images. Several vendors bake the **private SSH host keys** straight into the image, so every device flashed from that image presents the _same_ host key:

| Product         | SSH on by default   | Host keys               | First-boot regeneration    | Password login                                    |
| --------------- | ------------------- | ----------------------- | -------------------------- | ------------------------------------------------- |
| **Linutop**     | No (needs enabling) | **Baked in, shared**    | None                       | Default `pi` / `raspberry`                        |
| **1Play**       | Yes                 | **Baked in, shared**    | None                       | `pi` set (not default)                            |
| **TLXOS**       | Yes                 | **Baked in, shared**    | None                       | Disabled (key-only, root `prohibit-password`)     |
| **Yodeck**      | Yes                 | Generated on first boot | `regenerate_ssh_host_keys` | `root` / `pi` / `user` set; `PermitRootLogin yes` |
| **Homey**       | Yes                 | Generated on first boot | `regenerate_ssh_host_keys` | `homey` set                                       |
| **3DPrinterOS** | Yes                 | None in image           | n/a                        | `root` / `printeros` set                          |

A shared private host key is a real weakness, not a cosmetic one. Because every device in the field holds the identical key, the key is only as secret as the image download — which is public — so an attacker who pulls the image owns the private key for every deployed unit. That removes SSH's protection against man-in-the-middle interception: a device on the same network can impersonate the real player, and the connecting admin gets no host-key warning because the key matches. The fix is routine (delete the keys at build time and let `ssh-keygen` run once per device on first boot, which Yodeck and Homey already do), which makes its absence in the others notable.

To be clear about what we did and didn't extract: the `pi` / `raspberry` pair is the platform's own documented default, so naming it exposes nothing that isn't already public. We did not crack, and are not publishing, the unique password hashes on the other images, nor the private key material itself — the finding is that the keys are _present and shared_, which is observable without reading them. TLXOS deserves credit for disabling password authentication entirely, though its shared host key still stands.

Under the CRA this lands on Annex I, Part I(2)(b) — "ensure protection from unauthorised access by appropriate control mechanisms" — and the guidance that products not use default or unchangeable passwords. A shipped default credential is close to the canonical example of what that clause exists to stop.

### Update mechanisms vary widely

| Approach                                                 | Products                                        |
| -------------------------------------------------------- | ----------------------------------------------- |
| Transactional / image-based OTA (A/B or snaps)           | ScreenlyOS, info-beamer, XOGO (balena), emteria |
| Package manager pointed at live security repos           | TLXOS, Homey, 1Play                             |
| Package manager pointed at a vendor-controlled mirror    | Yodeck                                          |
| Package manager pointed at an archived, end-of-life repo | Linutop                                         |
| No OS-level update path visible in the image             | 3DPrinterOS                                     |

Image-based OTA is the right architecture for an appliance, but it only helps if the vendor actually rebuilds the image with current components. XOGO has balena's update machinery but ships a Debian 10 payload, and info-beamer has signed A/B updates but ships Python 2.7. Conversely, a package manager pointed at live Debian security repos only helps if something runs the upgrade. In the Debian-based images we didn't find an unattended-upgrades policy configured.

## Why this matters: signage is on your network

Every one of these devices is a Linux computer with network access, physically exposed in a public or semi-public space, typically installed by facilities or marketing rather than IT, and left alone for years once it works. Many run a full browser engine that renders remote content. Several bundle VPN clients, remote-desktop clients and printing stacks. A compromised signage player is a foothold inside the building's network that nobody is watching.

This isn't hypothetical hand-wringing. Attackers already target unmanaged IoT and edge devices to get initial access, precisely because those devices are the least likely to be patched or monitored. Thousands of fixable vulnerabilities in a browser and media stack, on a device that fetches content from the internet and sits next to the corporate LAN, is exactly the profile they look for.

## Where the CRA comes in

These are commercial products sold in the EU, so the [Cyber Resilience Act](/compliance/eu-cra/) applies to them. The main obligations apply from **11 December 2027**, and the reporting obligations already applied from **11 September 2026**. Measured against what we found:

- **No known exploitable vulnerabilities at release** (Annex I, Part I(2)(a)). Shipping a 2026 image built on a 2024 point release, or on an end-of-life base, is hard to square with this.
- **Security updates, automatic by default** (Annex I, Part I(2)(c)). An image with no working update path, or one that points at an archived repository, doesn't meet it.
- **A defined support period, normally at least five years** (Article 13(8)). It has to cover the base OS too, and you can't promise five years of support on a distribution that has already reached end of life.
- **An SBOM covering at least the top-level dependencies** (Annex I, Part II(1)). Every vendor here would need one. Generating it is the easy part. Acting on it is where most of them fall short today.
- **Handling vulnerabilities without delay** (Annex I, Part II(2)). 2,000-5,000 already-fixed advisories in a shipping image suggests nobody is tracking them.
- **No default or unchangeable passwords, and protection from unauthorised access** (Annex I, Part I(2)(b)). A shipped `pi` / `raspberry` default and shared SSH host keys are the textbook failures here.

None of this requires heroics. Most of the problems above disappear if you rebuild the image on a supported base on a schedule, ship it through an update mechanism the device actually uses, and continuously monitor the SBOM for new vulnerabilities. That last part is what [sbomify](https://sbomify.com) is for.

## Takeaways

**If you buy these products**, ask the vendor for an SBOM and a stated support period, and ask how OS-level updates reach the device. Put signage players on an isolated network segment, and add them to your asset inventory.

**If you build them**, treat the base image as a dependency with an end-of-life date. Track it the same way you track your application dependencies. Rebuild regularly, ship through an update channel the device uses, and don't trust a clean scan of an end-of-life system. And handle the basics an SBOM won't catch: no default passwords, and regenerate SSH host keys on first boot rather than baking one shared key into every device.

**For everyone**: a hobby image that's two years old is a hobby image. A commercial product that's two years behind is a liability, and from December 2027 it's a compliance problem too.
