---
title: "Why We're Bullish on TEA, And Why You Should Be Too"
description: "The Transparency Exchange API (TEA) is the missing standard for automated SBOM discovery and exchange. Here's what it is, why it matters, and why sbomify is all in."
author:
  display_name: Viktor Petersson
date: 2026-03-01
slug: why-were-bullish-on-tea
categories:
  - education
tags: [sbom, tea, transparency, cyclonedx, spdx, vex, standards, ecma]
tldr: "The Transparency Exchange API (TEA) is a format-agnostic standard for automated discovery and exchange of SBOMs, VEX, and other supply chain transparency artifacts. It replaces today's broken workflows of email chains, NDAs, and portal logins with a simple DNS-based resolution mechanism. sbomify now has full TEA support, and we've released py-libtea, an open-source Python client that works with any TEA server."
---

Imagine you're standing in an electronics store, holding a product in your hand. Using a TEA app, you could automatically scan the barcode, look up the manufacturer, and find out everything about that product: what's in it, whether it meets safety standards, and if there are any known issues. Simple, transparent, and completely routine.

Now imagine you could do the same thing for software. And not just software: hardware, AI/ML models, SaaS services, and more.

That's the promise of the **Transparency Exchange API** (TEA), and it's why we've just [added full TEA support](/2026/02/24/announcing-sbomify-v0-27-the-one-with-tea/) to sbomify.

## What Is TEA?

TEA is a standard API specification for the automated exchange of supply chain transparency artifacts. It was originally developed under the [CycloneDX](https://github.com/CycloneDX/transparency-exchange-api) umbrella and is now being standardized within [ECMA TC54 Task Group 1](https://tc54.org).

While TEA lives under the CycloneDX project, a critical design decision is that the specification is explicitly **format agnostic**. You can use TEA to publish and consume SPDX [SBOMs](/what-is-sbom/) just as well as CycloneDX ones. The same goes for VEX: both CycloneDX VEX and OpenVEX are supported artifact types. The goal is a universal discovery and exchange mechanism, not one tied to a single BOM format.

And TEA goes well beyond just SBOMs. The specification supports any type of xBOM (SBOM, HBOM, AI/ML-BOM, SaaSBOM, CBOM), vulnerability information (VDR and VEX), attestations (CDXA), and even product lifecycle events through the Common Lifecycle Enumeration (CLE, now ECMA-428), which tracks things like end-of-life, end-of-support, and mergers and acquisitions.

At the heart of TEA is the **Transparency Exchange Identifier (TEI)**, a URN scheme built on DNS. A TEI can wrap existing identifiers like EAN/UPC barcodes, PURLs, CPEs, SWIDs, or even plain UUIDs. The DNS-based design means the domain name portion resolves to a TEA server, while the identifier portion just needs to be unique within that server. This lets vendors leverage whatever product identification scheme they already use.

Here's the elegant part: given a TEI, a TEA client can automatically resolve it through DNS, discover the API endpoint via the IETF `.well-known` namespace, and retrieve all transparency artifacts for that product, all without any manual intervention.

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "tea-flow" >}}
</div>

For instance, if you know a company's domain and have a software identifier (such as a PURL or CPE), you can automatically discover and retrieve the VEX/VDR file for that specific piece of software. No portal logins. No email requests. No hunting through vendor websites.

## The Problem TEA Solves

If you want to understand just how broken SBOM sharing is today, look no further than CISA's own [SBOM Sharing Primer](https://www.cisa.gov/resources-tools/resources/sbom-sharing-primer). The document walks through the methods currently used in the real world, and they paint a grim picture. In one example, a consumer requests an SBOM via email, the vendor's legal and production teams verify the requester is an existing customer, then they exchange encrypted emails containing NDAs, and only after the NDA is signed does the vendor reply with the actual SBOM as an email attachment. In another example, consumers log into a vendor portal, sign an NDA within the portal, and then download the SBOM manually.

These aren't strawman scenarios. These are the methods CISA documented as being in active use today. Email chains, NDAs, portal logins, manual downloads. This is the state of the art for software transparency in 2025.

Now consider the TEA use case from the spec: Acme LLC buys 3,000 gadgets from a vendor and manages SBOMs for products from 14,385 vendors in their vulnerability management system. How do they get continuous, automated access to current and historical SBOMs, VEX files, and attestations from all those vendors? With today's methods, they don't. With TEA, it's a solved problem.

As regulatory requirements tighten, with frameworks like the EU Cyber Resilience Act, CISA's SBOM mandates, and growing customer demands for supply chain transparency, every organization needs a way to exchange this information efficiently and automatically.

TEA solves this by creating a standardized discovery and retrieval mechanism. If a vendor publishes their transparency data via a TEA-compatible server, any TEA-compatible client can find and consume it. No proprietary integrations. No bespoke APIs. No NDAs over encrypted email. Just a standard.

## TEA Is a Standard, And That's the Point

This is perhaps the most important thing to understand about TEA: **it is a standard, not a product**.

sbomify is one of the first platforms to support TEA, and we've been active contributors to the standard for a long time. But our implementation isn't a walled garden. We've also released [py-libtea](https://github.com/sbomify/py-libtea), an open-source Python client library for TEA. You can use it to interact with _any_ TEA-compatible server, not just sbomify.

This is a powerful concept. It means that the ecosystem isn't locked into any single vendor. A company publishing their SBOMs through sbomify's TEA server can be consumed by a client built by someone else entirely. A security team using a different platform can still query our TEA endpoint, and vice versa. The standard creates interoperability, and interoperability creates adoption.

Think of it like email: it doesn't matter whether you use Gmail and your colleague uses Outlook. The standard ensures the message gets through. TEA aims to do the same for software transparency.

## The Road to an International Standard

TEA isn't just a community effort. It's on a clear path to becoming a formal international standard. The work is being carried out within **ECMA TC54 Task Group 1**, the same technical committee that has already standardized CycloneDX as ECMA-424, Package-URL as ECMA-427, and Common Lifecycle Enumeration as ECMA-428. The goal is to standardize TEA through ECMA, and ultimately submit it to **ISO** for international recognition.

TEA is currently in **Beta 2**, with the consumer side of the API ready for implementation. The working group is actively encouraging developers to build both client and server implementations and participate in interoperability testing. Work on the publisher API will start after the 1.0 release, along with a feature called "Insights" that will allow consumers to query transparency data using an expression language without having to download and process full artifacts locally.

For organizations making investments in their software supply chain transparency infrastructure today, this matters. Building on TEA means building on a foundation that's heading toward the same level of international recognition as the standards that underpin the rest of your compliance stack.

## Why We're All In

We've been contributing to the TEA standard because we believe it's the missing piece of the software transparency puzzle. SBOMs are increasingly mandated, but without a standard way to _discover and exchange_ them, they sit in silos. VEX files exist, but finding the right one for the right software version from the right vendor remains a manual ordeal.

TEA connects the dots. It turns software transparency from a document management problem into an automated, interoperable system, much like how that barcode in the electronics store connects a physical product to an entire ecosystem of information.

We're excited about where this is heading, and we're proud to be one of the first platforms supporting it. If you want to see TEA in action, check out our [v0.27 announcement](/2026/02/24/announcing-sbomify-v0-27-the-one-with-tea/) or try out [py-libtea](https://github.com/sbomify/py-libtea) for yourself.

The era of standardized software transparency exchange is here. It's time to get on board.
