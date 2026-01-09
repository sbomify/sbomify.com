---
layout: post
title: "Unpacking Raspberry Pi's Built‑In SBOM Magic"
description: "How Raspberry Pi's rpi-image-gen tool generates SPDX SBOMs out of the box, achieving a 7.8/10 quality score with sbomqs for embedded image builds."
date: 2025-04-17
author:
  display_name: Viktor Petersson
category: news
tags: [sbom, raspberry-pi, embedded, spdx]

---

When the Raspberry Pi Foundation quietly unveiled [rpi‑image‑gen](https://github.com/raspberrypi/rpi-image-gen), most of the headlines focused on how it streamlines custom image creation. Tucked inside that announcement is something even more exciting for anyone who cares about software supply‑chain transparency: every image it builds comes with a Software Bill of Materials (SBOM) out of the box.

If you live and breathe SBOMs, or you just want to understand why this matters, read on. We will walk through how the tool works, where the SBOM lives, and what is inside it.

## A Quick Primer on rpi‑image‑gen

Think of rpi‑image‑gen as the flexible cousin of the long‑standing [pi‑gen](https://github.com/RPi-Distro/pi-gen) project that the Raspberry Pi team uses for the official Raspberry Pi OS builds. While pi‑gen is opinionated and optimized for the distro maintainers' workflow, rpi‑image‑gen is designed for developers and device makers who need bespoke images.

Building a minimal Debian 12 image for 64‑bit devices takes just a few commands:

```bash
git clone https://github.com/raspberrypi/rpi-image-gen.git
cd rpi-image-gen
sudo ./install_deps.sh
./build.sh
```

Important: run it on a Raspberry Pi OS (f.k.a. Raspbian) machine for the smoothest experience. Running under plain Debian or Ubuntu tends to trip over architecture mismatches.

Once the build finishes, you will find everything in `work/deb12-arm64-min/artefacts/`:

```text
boot.vfat
boot.vfat.sparse
config.yaml
deb12-arm64-min.img
deb12-arm64-min.img.sparse
deb12-arm64-min.sbom   <-- the star of the show
fstab
...
```

`deb12-arm64-min.img` is the file you flash to your SD card. Right beside it sits `deb12-arm64-min.sbom`, a 6.8 MB JSON document that catalogues every component in the image.

## How the SBOM Gets Made

Under the hood, rpi‑image‑gen calls a helper script at `sbom/gen.sh`. That script invokes **Syft**, Anchore's open‑source SBOM generator, to crawl the root filesystem and spit out an SPDX 2.3‑compliant file. The default settings live in `sbom/defaults`, so you can swap formats or tweak depth without touching the core builder.

Running `jq` on the finished SBOM shows 214 packages detected:

```bash
cat deb12-arm64-min.sbom | jq '.packages | length'
# 214
```

## Measuring Quality with `sbomqs`

A big SBOM is not automatically a good SBOM. To gauge quality, we ran **sbomqs** from Interlynk:

```
SBOM Quality Score: 7.8 / 10.0
Components: 214
```

Here are a few highlights from the report:

| Category              | Metric          | Score | Notes                                          |
| --------------------- | --------------- | ----- | ---------------------------------------------- |
| NTIA minimum elements | Unique IDs      | 10.0  | All components identified                      |
| NTIA minimum elements | Supplier info   | 5.8   | 124 of 214 list a supplier                     |
| Quality               | Valid licenses  | 7.0   | 187 of 214 carry a recognized license          |
| Semantic              | Checksums       | 0.0   | Checksums missing, an easy win for improvement |
| Structural            | Spec compliance | 10.0  | Valid SPDX 2.3 JSON                            |

Even with a few gaps, an out‑of‑the‑box score of 7.8 is impressive. Most importantly, the file is fully parsable and ready for vulnerability scans and license audits.

## Why Built‑In SBOMs Matter

- **Zero setup overhead** – You do not need to glue extra scanners into your pipeline; the SBOM arrives with every build.
- **Reproducibility** – Anyone flashing your image can inspect exactly what shipped, making security reviews and bug hunts faster.
- **Regulatory head‑start** – As governments push for transparency (think EU Cyber Resilience Act or US Executive Order 14028), having machine‑readable SBOMs from day one keeps you ahead of the curve.

## Tips for Taking It Further

1. **Enable checksum generation**: Edit `sbom/defaults` and add `--file-digests` to Syft's args to fill that gap in the quality score.
2. **Switch formats**: Need CycloneDX instead of SPDX? Change `output_format` from `spdx-json` to `cyclonedx-json` in `sbom/defaults`.
3. **Automate uploads**: Pipe the `.sbom` file into your CI artefact store or an SBOM analysis platform such as sbomify.

## Final Thoughts

Raspberry Pi has quietly raised the bar for embedded‑image builders by shipping SBOMs as a first‑class citizen. If you already depend on Raspberry Pi boards, rpi‑image‑gen is worth the upgrade for this feature alone. And if you are exploring ways to make your firmware supply chain more transparent, it is one of the simplest on‑ramps you will find. For those using other embedded build systems, check out how [Yocto handles SBOM generation]({{ site.baseurl }}{% post_url 2025-02-21-mastering-sbom-generation-with-yocto %}).

Give it a spin, peek inside the SBOM, and let us know what you discover.
