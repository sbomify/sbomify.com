---
layout: post
title: "Mastering SBOM Generation with Yocto"
date: 2025-02-21 09:00:00 +0000
categories: [sbom, yocto, linux, embedded]
author:
  display_name: Viktor
---

I recently [spent time with Yocto](https://vpetersson.com/2025/02/21/yocto-rockpi-and-sboms.html) to better understand how it works with SBOMs, and I was very impressed. In short, if you are building your own Linux distribution, Yocto is an excellent choice for many reasons, particularly if you want to provide SBOMs for your product.

Since Yocto builds everything from source, it can provide a complete SBOM for all components it compiles. Because Yocto has a catalog of all the packages it can build, including the corresponding licensing, it is able to generate high-quality SBOMs out of the box. Other platforms are also adopting this approach; for example, the Raspberry Pi Foundation recently introduced [built-in SBOM generation with `rpi-image-gen`]({{ site.baseurl }}{% post_url 2025-04-17-unpacking-raspberry-pi-s-built-in-sbom-magic %}).

## Yocto and SBOMs

It is worth noting that Yocto only generates SPDX SBOMs (SPDX 2.2, to be precise). It also creates a unique SBOM for each package, which are then linked together in `index.json` using document linking.

When you have run `bitbake` to build your disk image, you can find a file named something like `[...].spdx.tar.zst` inside your deploy folder. Extract this file using `tar --zstd -xvf <file>.spdx.tar.zst`, preferably somewhere outside of the deploy folder, because a large number of SBOMs will be generated (as mentioned above):

```bash
$ ls
avahi-daemon.spdx.json
avahi-locale-en-gb.spdx.json
base-files.spdx.json
base-passwd.spdx.json
bash.spdx.json
bridge-utils.spdx.json
busybox.spdx.json
busybox-syslog.spdx.json
busybox-udhcpc.spdx.json
ca-certificates.spdx.json
[...]
```

As you can see, each package that Yocto builds has its own SBOM. As mentioned, there is a file called `index.json` that links all these SBOMs together:

```bash
$ cat index.json | jq
{
  "documents": [
    {
      "documentNamespace": "http://spdx.org/spdxdocs/avahi-daemon-81243a7b-5ae6-57ad-afaf-b9f620b0c46e",
      "filename": "avahi-daemon.spdx.json",
      "sha1": "97f1b5af960fe9e6246ec689a3fe04f874ad1bce"
    },
    {
      "documentNamespace": "http://spdx.org/spdxdocs/avahi-locale-en-gb-35e61a4c-7f43-5d5a-8ee7-c2ba7e00f0ed",
      "filename": "avahi-locale-en-gb.spdx.json",
      "sha1": "a37a234836c785beddfd8c3b0a4343c23ae83851"
    },
    {
      "documentNamespace": "http://spdx.org/spdxdocs/base-files-ee9424e3-1d7e-5739-b9cd-237a1a6f843f",
      "filename": "base-files.spdx.json",
      "sha1": "1d89ffb1e9bfb379df3a35fc3196f1e574895131"
    },
    {
      "documentNamespace": "http://spdx.org/spdxdocs/base-passwd-78e3ab0a-4686-572d-a886-5105dd9b12de",
      "filename": "base-passwd.spdx.json",
[...]
```

If we look into the actual individual SBOMs, they appear as follows:

```bash
$ cat bash.spdx.json | jq
{
  "SPDXID": "SPDXRef-DOCUMENT",
  "creationInfo": {
    "comment": "This document was created by analyzing packages created during the build.",
    "created": "2025-02-18T21:58:47Z",
    "creators": [
      "Tool: OpenEmbedded Core create-spdx.bbclass",
      "Organization: OpenEmbedded ()",
      "Person: N/A ()"
    ],
    "licenseListVersion": "3.14"
  },
  "dataLicense": "CC0-1.0",
  "documentNamespace": "http://spdx.org/spdxdocs/bash-0139ef99-a375-59f8-9ada-833f50f987d3",
  "externalDocumentRefs": [
    {
      "checksum": {
        "algorithm": "SHA1",
        "checksumValue": "e9353b8e26447ef425aa740060f57411420c817a"
      },
      "externalDocumentId": "DocumentRef-recipe-bash",
      "spdxDocument": "http://spdx.org/spdxdocs/recipe-bash-ad5747dc-7b5a-562d-aabf-dfb516e7095d"
    }
  ],
  "files": [
    {
      "SPDXID": "SPDXRef-PackagedFile-bash-1",
      "checksums": [
        {
          "algorithm": "SHA1",
          "checksumValue": "14cd85414db85903029caca727345272de829a69"
        },
        {
          "algorithm": "SHA256",
          "checksumValue": "b1792af9b894206c749b2d03cd58e5544184d7cf49b4db7f3a632961de66231f"
        }
      ],
      "copyrightText": "NOASSERTION",
      "fileName": "usr/bin/bash.bash",
      "fileTypes": [
        "BINARY"
      ],
      "licenseConcluded": "NOASSERTION",
      "licenseInfoInFiles": [
        "NOASSERTION"
      ]
    }
  ],
[...]
```

This SBOM is very detailed and complete. Kudos to the Yocto team for providing such a comprehensive solution, as it can save a significant amount of time and effort.

By analyzing the Bash SBOM further using `sbomqs`, we can see that the quality is quite good:

```bash
$ sbomqs score bash.spdx.json
SBOM Quality by Interlynk Score:7.0     components:1    bash.spdx.json
+-----------------------+--------------------------------+-----------+--------------------------------+
|       CATEGORY        |            FEATURE             |   SCORE   |              DESC              |
+-----------------------+--------------------------------+-----------+--------------------------------+
| NTIA-minimum-elements | comp_with_name                 | 10.0/10.0 | 1/1 have names                 |
+                       +--------------------------------+-----------+--------------------------------+
|                       | comp_with_supplier             | 10.0/10.0 | 1/1 have supplier names        |
+                       +--------------------------------+-----------+--------------------------------+
|                       | comp_with_uniq_ids             | 10.0/10.0 | 1/1 have unique IDs           |
+                       +--------------------------------+-----------+--------------------------------+
|                       | comp_with_version              | 10.0/10.0 | 1/1 have versions              |
+                       +--------------------------------+-----------+--------------------------------+
|                       | sbom_authors                   | 10.0/10.0 | doc has 3 authors              |
+                       +--------------------------------+-----------+--------------------------------+
|                       | sbom_creation_timestamp        | 10.0/10.0 | doc has creation timestamp     |
|                       |                                |           | 2025-02-18T21:58:47Z           |
+                       +--------------------------------+-----------+--------------------------------+
|                       | sbom_dependencies              | 0.0/10.0  | doc has 0 dependencies         |
+-----------------------+--------------------------------+-----------+--------------------------------+
| Quality               | comp_valid_licenses            | 10.0/10.0 | 1/1 components with valid      |
|                       |                                |           | license                        |
+                       +--------------------------------+-----------+--------------------------------+
|                       | comp_with_any_vuln_lookup_id   | 0.0/10.0  | 0/1 components have any lookup |
|                       |                                |           | id                             |
+                       +--------------------------------+-----------+--------------------------------+
|                       | comp_with_deprecated_licenses  | 10.0/10.0 | 0/1 components have deprecated |
|                       |                                |           | licenses                       |
+                       +--------------------------------+-----------+--------------------------------+
|                       | comp_with_multi_vuln_lookup_id | 0.0/10.0  | 0/1 components have multiple   |
|                       |                                |           | lookup id                      |
+                       +--------------------------------+-----------+--------------------------------+
|                       | comp_with_primary_purpose      | 0.0/10.0  | 0/1 components have primary    |
|                       |                                |           | purpose specified              |
+                       +--------------------------------+-----------+--------------------------------+
|                       | comp_with_restrictive_licenses | 10.0/10.0 | 0/1 components have restricted |
|                       |                                |           | licenses                       |
+                       +--------------------------------+-----------+--------------------------------+
|                       | sbom_with_creator_and_version  | 0.0/10.0  | 0/1 tools have creator and     |
|                       |                                |           | version                        |
+                       +--------------------------------+-----------+--------------------------------+
|                       | sbom_with_primary_component    | 10.0/10.0 | primary component found        |
+-----------------------+--------------------------------+-----------+--------------------------------+
| Semantic              | comp_with_checksums            | 0.0/10.0  | 0/1 have checksums             |
+                       +--------------------------------+-----------+--------------------------------+
|                       | comp_with_licenses             | 10.0/10.0 | 1/1 have licenses              |
+                       +--------------------------------+-----------+--------------------------------+
|                       | sbom_required_fields           | 10.0/10.0 | Doc Fields:true Pkg            |
|                       |                                |           | Fields:true                    |
+-----------------------+--------------------------------+-----------+--------------------------------+
| Sharing               | sbom_sharable                  | 0.0/10.0  | doc has a sharable license     |
|                       |                                |           | free 0 :: of 1                 |
+-----------------------+--------------------------------+-----------+--------------------------------+
| Structural            | sbom_parsable                  | 10.0/10.0 | provided sbom is parsable      |
+                       +--------------------------------+-----------+--------------------------------+
|                       | sbom_spec                      | 10.0/10.0 | provided sbom is in a          |
|                       |                                |           | supported sbom format of       |
|                       |                                |           | spdx,cyclonedx                 |
+                       +--------------------------------+-----------+--------------------------------+
|                       | sbom_spec_file_format          | 10.0/10.0 | provided sbom should be in     |
|                       |                                |           | supported file format for      |
|                       |                                |           | spec: json and version:        |
|                       |                                |           | json,yaml,rdf,tag-value        |
+                       +--------------------------------+-----------+--------------------------------+
|                       | sbom_spec_version              | 10.0/10.0 | provided sbom should be in     |
|                       |                                |           | supported spec version for     |
|                       |                                |           | spec:SPDX-2.2 and versions:    |
|                       |                                |           | SPDX-2.1,SPDX-2.2,SPDX-2.3     |
+-----------------------+--------------------------------+-----------+--------------------------------+
```

Overall, Yocto's capabilities for generating SPDX SBOMs are robust, making it an excellent solution for managing SBOM-related tasks when building a Linux distribution.

## Yocto, SBOMs and sbomify

Once you have your SBOMs, you can use sbomify to distribute your SBOMs to your stakeholders. Since we already have all the SBOMs for each package, we need to create a component in sbomify for each package. We can help you with this, but it's important to note that this is just the beginning of the [SBOM lifecycle]({{ site.url }}features/generate-collaborate-analyze/).

![Generation Phases](/assets/images/d2/generation.svg)

We still need to go through the augmentation process, which adds information to the SBOM about you as the vendor. In this particular case, you might not need to go through the Enrichment process, since Yocto already has all the information we need, but you might still want to sign your SBOMs.

![SBOM hub](/assets/images/d2/sbom-hierarchy.svg)

Moreover, since sbomify supports [SBOM hierarchy natively]({{ site.url }}/features/sbom-hierarchy/), there is no need for `index.json`. Moreover, since we've mapped each package to a component, once we release an update to a package, we can track this and have a clear audit trail of the changes.

## Conclusion

If you're interested in Yocto, SBOMs and how sbomify can help you with your SBOM management and life cycle, drop us a line at [hello@sbomify.com](mailto:hello@sbomify.com) and we'll be happy to help you.
