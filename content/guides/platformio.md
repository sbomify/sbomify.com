---

url: /guides/platformio/
title: "SBOM Generation Guide for PlatformIO - Arduino, ESP32 and Embedded Firmware"
description: "Learn how to generate a Software Bill of Materials for PlatformIO firmware projects. Covers platformio.ini, lib_deps pinning, the Arduino-ESP32 and ESP-IDF frameworks, CPEs for vulnerability scanning, and CI setup."
keywords: ["PlatformIO SBOM", "ESP32 SBOM", "Arduino SBOM", "ESP-IDF SBOM", "firmware SBOM", "platformio.ini", "embedded SBOM"]
tldr: "Run pio pkg install, then point the sbomify action at platformio.ini. The SBOM lists the libraries each environment builds with, plus the platform and framework packages, with CPEs on Arduino-ESP32 and ESP-IDF so vulnerability scanners can match them."
---

## Why SBOMs for PlatformIO firmware?

[PlatformIO](https://platformio.org/) builds firmware for ESP32, ESP8266, AVR, STM32 and hundreds of other boards. Firmware raises the same supply chain questions as any other software, with a few that are harder to answer:

- **The framework is most of the binary.** An ESP32 Arduino sketch links Arduino-ESP32, and with it a precompiled copy of Espressif's ESP-IDF. Most of the published vulnerabilities live there, not in your `lib_deps`.
- **Devices stay in the field for years.** When an advisory lands, you need to know which firmware releases shipped the affected framework version.
- **Regulation now covers it.** The [EU Cyber Resilience Act](/compliance/eu-cra/) applies to connected hardware, so a device maker has to be able to say what is in their firmware.

## Why PlatformIO needs its own generator

PlatformIO has no lock file, and the generic SBOM tools (cdxgen, Syft) have no cataloger for it. A common workaround is to run `jq` over every `.pio/libdeps/*/*/library.json`. That has four problems:

- it reports the version each library's author wrote in its manifest, not the version that was installed;
- a library used by three environments appears three times;
- libraries that ship only a `library.properties` are missed;
- the framework isn't in the SBOM at all.

The sbomify action reads `platformio.ini` the way PlatformIO does, and reads what PlatformIO actually installed. That covers `[env]` inheritance, `extends`, `extra_configs` and `${...}` interpolation.

## What the SBOM contains

For each environment you installed, the SBOM lists:

1. **Libraries** the build uses. These are resolved the same way `pio pkg list` resolves them:
   - each `lib_deps` entry is matched to the library installed for it;
   - each library's own dependencies are then followed, respecting the platform and framework restrictions in its `library.json`.

   A library left behind in `.pio/libdeps` that nothing uses, such as an old copy or a test framework, is not included.
2. **The platform**, for example `espressif32@7.1.3`.
3. **The framework packages** that platform builds with, at the exact version installed. Any `platform_packages` override in `platformio.ini` is respected.
4. **ESP-IDF as its own component** when you build with Arduino-ESP32, because Arduino-ESP32 ships ESP-IDF precompiled inside it.

A library shared by several environments appears once. The dependency graph runs from your project to its `lib_deps`, and from each library to the libraries it pulls in.

### Vulnerability matching

Arduino-ESP32 and ESP-IDF carry CPEs in the form NVD uses, so scanners such as grype match them against published advisories.

PlatformIO repackages these frameworks under its own version numbers. The action translates them back to the upstream release:

| PlatformIO package                            | Upstream release     | CPE                                            |
| --------------------------------------------- | -------------------- | ---------------------------------------------- |
| `framework-arduinoespressif32@3.20017.241212` | Arduino-ESP32 2.0.17 | `cpe:2.3:a:espressif:arduino-esp32:2.0.17:...` |
| `framework-espidf@3.50301.0`                  | ESP-IDF 5.3.1        | `cpe:2.3:a:espressif:esp-idf:5.3.1:...`        |
| ESP-IDF bundled in Arduino-ESP32 2.0.17       | ESP-IDF 4.4.7        | `cpe:2.3:a:espressif:esp-idf:4.4.7:...`        |

In testing against real projects, this is what made the difference. An SBOM for OpenDTU, an ESP32 project, went from zero grype matches to 19: 14 against ESP-IDF 4.4.7 and 5 against Arduino-ESP32 2.0.17.

### Package identifiers

There is no `platformio` type in the purl specification, so components are identified like this:

| Installed from                     | purl                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| The PlatformIO registry            | `pkg:generic/<owner>/<name>@<version>?repository_url=https://registry.platformio.org` |
| GitHub (clone, archive or release) | `pkg:github/<owner>/<repo>@<commit or tag>`                                           |
| Another git host                   | `pkg:generic/<name>@<version>?vcs_url=git+<url>@<commit>`                             |
| Another archive URL                | `pkg:generic/<name>@<version>?download_url=<url>`                                     |

### Metadata

Each library's description, license, authors, repository and homepage come from its `library.json` or `library.properties`. If neither names a license, a recognisable `LICENSE` or `COPYING` file is used instead.

GPL and LGPL license files are recorded by name, such as "GNU Lesser General Public License v2.1", and not as an SPDX ID. The file alone doesn't say whether "or any later version" applies, and that is exactly the difference between `LGPL-2.1-only` and `LGPL-2.1-or-later`.

With `ENRICH: true`, libraries from the PlatformIO registry also get the SHA-256 that the registry publishes for the release archive. This is the same file `pio pkg install` downloads.

## Generating an SBOM

### 1. Install the packages

The action reads what PlatformIO installed, so run `pio pkg install` (or a build) first.

```bash
pio pkg install -e esp32dev
```

The SBOM covers the environments that are installed in `.pio/libdeps/` or built in `.pio/build/`. If there are neither, it covers your `default_envs`. Use `-e` to choose which firmware the SBOM describes.

### 2. Keep PlatformIO's core directory where the action can see it

Libraries live in your project's `.pio/` directory. Platforms and frameworks live in PlatformIO's _core directory_, which is `~/.platformio` by default.

The sbomify GitHub Action runs in a container that sees your workspace but not the runner's home directory. Put the core directory inside the workspace by setting `PLATFORMIO_CORE_DIR` to a relative path for the whole job. PlatformIO and the action then both find it.

If the core directory can't be found, the SBOM still lists your libraries, but the platform and framework are left out. Those are the components vulnerability scanners match.

### 3. Run the action

```yaml
name: Firmware SBOM

on:
  push:
    tags: ["v*"]

jobs:
  sbom:
    runs-on: ubuntu-latest
    env:
      PLATFORMIO_CORE_DIR: .platformio
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install PlatformIO
        run: pip install platformio

      - name: Install firmware dependencies
        run: pio pkg install -e esp32dev

      - uses: sbomify/sbomify-action@master
        env:
          LOCK_FILE: platformio.ini
          OUTPUT_FILE: sbom.cdx.json
          COMPONENT_NAME: my-firmware
          COMPONENT_VERSION: ${{ github.ref_name }}
          ENRICH: true
          UPLOAD: false
```

For SPDX output, add `SBOM_FORMAT: spdx`. To upload to sbomify, set `TOKEN` and `COMPONENT_ID` and drop `UPLOAD: false`. See [publishing](/sbomify-action/publishing/).

If `platformio.ini` is in a subdirectory, set the core directory in the project instead, so that it resolves against the project rather than the current directory:

```ini
[platformio]
core_dir = .platformio
```

Add `.platformio/` to `.gitignore` either way.

### Running locally

Outside a container, the default `~/.platformio` works as is:

```bash
pio pkg install
uvx sbomify-action --lock-file platformio.ini --no-upload --enrich -o sbom.cdx.json
```

## Pin your lib_deps

The SBOM records what one install resolved. Whether the next build gets the same thing depends on `lib_deps`. The action counts an entry as pinned only when it uses one of these:

- a full `MAJOR.MINOR.PATCH` version: `bblanchon/ArduinoJson@7.4.3`
- a full commit: `https://github.com/owner/repo.git#3f2a...` (40 characters)
- a release tag: `https://github.com/owner/repo.git#v1.2.3`

Some entries are not pinned:

- `@7.4` is a wildcard in PlatformIO and also matches 7.4.4.
- `^7.0.0` is a range.
- A branch such as `#main` moves.
- A git URL with no `#ref` follows the default branch.

When any entry is unpinned, the action says that versions were inferred and recommends pinning. Pin the platform too (`platform = espressif32@7.1.3`), because it decides the framework version.

## Limitations

- **Libraries in `lib/` aren't components.** PlatformIO treats code in the project's `lib/` directory, or in `lib_extra_dirs`, as part of your project. A project that copies its third-party libraries there (Tasmota does this for nearly everything) has to declare them some other way, for example with [`ADDITIONAL_PACKAGES`](/sbomify-action/configuration/).
- **Toolchains aren't listed.** The compiler's libc and libstdc++ are linked into the firmware. But the platform's build script chooses the toolchain per board, so it can't be read reliably from configuration.
- **CPEs cover Arduino-ESP32 and ESP-IDF only.** The ESP8266, AVR and most other cores have no NVD product to map to.
- **GitHub archive installs have no hash.** PlatformIO keeps neither the archive nor its checksum. These components are identified by their `pkg:github` commit or tag instead.

## Further reading

- [Input sources](/sbomify-action/sources/): every input the sbomify action accepts
- [Enrichment](/sbomify-action/enrichment/): where licenses, suppliers and hashes come from
- [Yocto guide](/guides/yocto/): SBOMs for embedded Linux
- [C/C++ guide](/guides/cpp/): SBOMs for Conan projects
