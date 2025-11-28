---
layout: page
title: Public Trust Center
description: "Build customer confidence with a dedicated trust center. Share SBOMs, compliance documents, and security artifacts publicly to demonstrate transparency."
redirect_from:
  - /features/sbom-hub/
  - /features/public-sbom-portal/
---

<div class="text-xl leading-relaxed text-secondaryText mb-16 text-center max-w-3xl mx-auto font-medium">
Turn transparency into a competitive advantage. Showcase your security posture with a branded, automated <span class="text-[#201B4C] font-bold">Trust Center</span>.
</div>

<div class="mb-24">
    <div class="grid lg:grid-cols-3 gap-8">
        {% capture icon_1 %}
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        {% endcapture %}
        {% include components/feature-card.html
            icon_bg_class="bg-purple-50"
            icon_text_class="text-[#8A7DFF]"
            svg=icon_1
            title="Branded Portal"
            description="Your trust center, your brand. Use your own domain (CNAME) and logo to present a unified professional image to customers."
        %}

        {% capture icon_2 %}
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        {% endcapture %}
        {% include components/feature-card.html
            icon_bg_class="bg-blue-50"
            icon_text_class="text-blue-500"
            svg=icon_2
            title="Automated Publishing"
            description="Stop manual uploads. Your trust center stays in sync with your CI/CD pipeline, automatically publishing new SBOMs upon release."
        %}

        {% capture icon_3 %}
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        {% endcapture %}
        {% include components/feature-card.html
            icon_bg_class="bg-pink-50"
            icon_text_class="text-[#d874a9]"
            svg=icon_3
            title="Flexible Access Control"
            description="Choose your audience. Make your Trust Center <strong>public</strong> for broad transparency, or <strong>private</strong> for invited internal and external stakeholders only."
        %}
    </div>
</div>

{% include components/trust-center-pillars.html %}

<div class="mb-24">
    <div class="flex flex-col lg:flex-row gap-16 items-center">
        <div class="flex-1">
            <div class="inline-block px-4 py-1 bg-[#201B4C]/5 text-[#201B4C] border border-[#201B4C]/10 rounded-full text-xs font-bold uppercase tracking-wider mb-6">Comprehensive Coverage</div>
            <h2 class="text-4xl font-bold text-[#201B4C] mb-6">Share More Than Just SBOMs</h2>
            <p class="text-lg text-secondaryText mb-8 leading-relaxed">
                A complete trust center goes beyond dependencies. Provide a comprehensive view of your security posture by hosting all critical artifacts in one searchable library.
            </p>
            <ul class="space-y-6">
                {% include components/check-list-item.html title="Security Certifications" description="SOC 2, ISO 27001, and other audits" %}
                {% include components/check-list-item.html title="Penetration Test Reports" description="Share summaries or full reports securely" %}
                {% include components/check-list-item.html title="Compliance Attestations" description="Proof of regulatory adherence" %}
            </ul>
        </div>
        <div class="flex-1 w-full flex justify-center">
            {% include components/trust-center-artifacts.html %}
        </div>
    </div>
</div>

{% include compliance-block.html %}

<div class="mb-24">
    <h2 class="text-4xl font-bold text-[#201B4C] mb-16 text-center">Real-World Impact</h2>
    <div class="grid md:grid-cols-3 gap-8">
        {% include components/impact-card.html
            emoji="🚀"
            title="Accelerate Sales"
            description="\"Do you have a SOC 2?\" Send a link instead of scheduling a call. Reduce questionnaire response times from weeks to minutes."
            link_text="Sales Enablement"
        %}

        {% include components/impact-card.html
            emoji="🛡️"
            title="Build Trust"
            description="Show, don't just tell. Proactive transparency proves your commitment to security before a prospect even asks."
            link_text="Brand Reputation"
        %}

        {% include components/impact-card.html
            emoji="⚡"
            title="Streamline Ops"
            description="Eliminate ad-hoc email requests. Give customers self-service access to the documents they need, 24/7."
            link_text="Operational Efficiency"
        %}
    </div>
</div>

{% include components/cta-ready.html secondary_url="/features/integrations/" %}
