---
layout: pricing
title: Pricing
description: Simple, transparent pricing for teams of all sizes
---

<div class="bg-primaryBG py-16 lg:py-24">
<div class="pricing-page">
  <div class="pricing-header">
    <h1>Pricing Plans</h1>
    <p>Choose the plan that's right for your team</p>
  </div>

<div class="billing-toggle">
    <span>Monthly</span>
    <label class="toggle">
      <input type="checkbox" id="billing-toggle">
      <span class="track"></span>
    </label>
    <span>Annual <span class="save-tag">Save 20%</span></span>
  </div>

<div class="pricing-grid">
    <div class="pricing-card">
      <div class="card-header">
        <h2>Community</h2>
        <div class="price">
          <span class="amount">$0</span>
          <span class="suffix">/ Month</span>
        </div>
      </div>

      <div class="card-body">
        <div class="section">
          <h3>Ideal For</h3>
          <ul>
            <li>OSS maintainers / hobby projects</li>
            <li>Test-drive sbomify</li>
          </ul>
        </div>

        <div class="section">
          <h3>Features</h3>
          <ul>
            <li><a href="/features/sbom-hierarchy/">1 Product</a></li>
            <li><a href="/features/sbom-hierarchy/">1 Project per Product</a></li>
            <li><a href="/features/sbom-hierarchy/">5 Components per Project</a></li>
            <li>Unlimited SBOMs & compliance documents</li>
            <li>Public documents only</li>
            <li><a href="/features/public-sbom-portal/">Public trust center</a></li>
            <li>Manual exports only</li>
            <li>Basic compliance reporting</li>
            <li>Single user with community support</li>
          </ul>
        </div>
      </div>
      <div class="card-footer">
        <a href="https://app.sbomify.com" class="cta-button" onclick="gtag('event', 'click', {
          'event_category': 'Pricing',
          'event_label': 'Community Plan Signup'
        })">Sign Up</a>
      </div>
    </div>

    <div class="pricing-card featured">
      <div class="card-header">
        <h2>Business <span class="trial-badge">14-day free trial</span></h2>
        <div class="price" data-monthly="199" data-annual="159">
          <span class="amount">$199</span>
          <span class="suffix">/ Month</span>
        </div>
      </div>

      <div class="card-body">
        <div class="section">
          <h3>Ideal For</h3>
          <ul>
            <li>Mid-size teams needing private SBOMs, compliance documents & integrations</li>
          </ul>
        </div>

        <div class="section">
          <h3>Features</h3>
          <ul>
            <li><a href="/features/sbom-hierarchy/">5 Products</a></li>
            <li><a href="/features/sbom-hierarchy/">5 Projects per Product</a></li>
            <li><a href="/features/sbom-hierarchy/">20 Components per Project</a></li>
            <li>Unlimited SBOMs & compliance documents</li>
            <li>Private documents with optional public sharing</li>
            <li><a href="/features/public-sbom-portal/">Custom trust center on your domain</a></li>
            <li>Standard Integrations</li>
            <li>Automated reports & vulnerability insights</li>
            <li>Team/role-based access</li>
            <li>Priority email support</li>
          </ul>
        </div>
      </div>
      <div class="card-footer">
        <a href="https://app.sbomify.com" class="cta-button" onclick="gtag('event', 'click', {
          'event_category': 'Pricing',
          'event_label': 'Business Plan Signup'
        })">Sign Up</a>
      </div>
    </div>

    <div class="pricing-card">
      <div class="card-header">
        <h2>Enterprise</h2>
        <div class="price">
          <span class="amount custom">Custom Quote</span>
        </div>
      </div>

      <div class="card-body">
        <div class="section">
          <h3>Ideal For</h3>
          <ul>
            <li>Large orgs with advanced security & compliance needs</li>
          </ul>
        </div>

        <div class="section">
          <h3>Features</h3>
          <ul>
            <li><a href="/features/sbom-hierarchy/">Unlimited Products</a></li>
            <li><a href="/features/sbom-hierarchy/">Unlimited Projects</a></li>
            <li><a href="/features/sbom-hierarchy/">Unlimited Components</a></li>
            <li>Unlimited SBOMs & compliance documents</li>
            <li><a href="/features/public-sbom-portal/">Custom trust center on your domain</a></li>
            <li>Enterprise-grade controls (RBAC, audits, etc.)</li>
            <li>Custom & Advanced Integrations</li>
            <li>Advanced dashboards & compliance modules</li>
            <li>Org-wide roles, SSO/SCIM</li>
            <li>Dedicated account manager & SLA-backed support</li>
          </ul>
        </div>
      </div>
      <div class="card-footer">
        <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button" onclick="gtag('event', 'click', {
          'event_category': 'Pricing',
          'event_label': 'Enterprise Plan Contact'
        })">Contact Us</a>
      </div>
    </div>

</div>

<!-- FAQ Section -->
<div class="mt-24">
    <h2 class="text-white text-3xl font-medium mb-12 text-center">Frequently Asked Questions</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-[#201B4C] border border-[#37306B] rounded-lg p-8">
        <h3 class="text-[#8A7DFF] text-lg font-semibold mb-4">What's included in the free tier?</h3>
        <p class="text-gray-300 leading-relaxed">The Community tier is perfect for open source projects and includes public SBOM hosting, 1 product with 1 project and 5 components, and community support.</p>
      </div>

      <div class="bg-[#201B4C] border border-[#37306B] rounded-lg p-8">
        <h3 class="text-[#8A7DFF] text-lg font-semibold mb-4">Can I upgrade or downgrade at any time?</h3>
        <p class="text-gray-300 leading-relaxed">Yes, you can change your plan at any time. Your billing will be prorated accordingly.</p>
      </div>

      <div class="bg-[#201B4C] border border-[#37306B] rounded-lg p-8">
        <h3 class="text-[#8A7DFF] text-lg font-semibold mb-4">What payment methods do you accept?</h3>
        <p class="text-gray-300 leading-relaxed">We accept all major credit cards and can arrange alternative payment methods for enterprise customers.</p>
      </div>

      <div class="bg-[#201B4C] border border-[#37306B] rounded-lg p-8">
        <h3 class="text-[#8A7DFF] text-lg font-semibold mb-4">Do you offer custom solutions?</h3>
        <p class="text-gray-300 leading-relaxed">Yes, our enterprise tier can be customized to meet your specific needs. Contact our sales team to learn more.</p>
      </div>

      <div class="bg-[#201B4C] border border-[#37306B] rounded-lg p-8">
        <h3 class="text-[#8A7DFF] text-lg font-semibold mb-4">Can I self-host Sbomify?</h3>
        <p class="text-gray-300 leading-relaxed">Yes! Sbomify is open source and available for self-hosting. Check out our <a href="https://github.com/sbomify/sbomify" class="text-[#8A7DFF] hover:text-[#9A8DFF] underline">GitHub repository</a> for installation instructions and documentation.</p>
      </div>
    </div>

</div>
  </div>
</div>
