---
layout: default
title: Pricing
description: Simple, transparent pricing for teams of all sizes
---

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
            <li>Unlimited SBOM generation</li>
            <li>Public SBOMs only</li>
            <li>Manual exports only</li>
            <li>Basic compliance reporting (manual export)</li>
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
            <li>Mid-size teams needing private SBOMs, compliance, & Hub Integrations</li>
          </ul>
        </div>

        <div class="section">
          <h3>Features</h3>
          <ul>
            <li><a href="/features/sbom-hierarchy/">5 Products</a> (suggested)</li>
            <li><a href="/features/sbom-hierarchy/">5 Projects per Product</a></li>
            <li><a href="/features/sbom-hierarchy/">200 Components per Project</a></li>
            <li>Unlimited SBOM generation</li>
            <li>Private SBOMs with optional public sharing</li>
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
            <li>Unlimited SBOM generation</li>
            <li>Enterprise-grade controls (RBAC, audits, etc.)</li>
            <li>Custom & Advanced Integrations</li>
            <li>Advanced dashboards & compliance modules</li>
            <li>Org-wide roles, SSO/SCIM</li>
            <li>Dedicated account manager & SLA-backed support</li>
          </ul>
        </div>
      </div>
      <div class="card-footer">
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSe1-SCbmyPnhHxP1RHIYi4iKP2CLy6SXcqFOP1i7B8VHZJYkw/viewform" class="cta-button" onclick="gtag('event', 'click', {
          'event_category': 'Pricing',
          'event_label': 'Enterprise Plan Contact'
        })">Contact Us</a>
      </div>
    </div>
  </div>
</div>

<style>
.pricing-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.pricing-header {
  text-align: center;
  margin-bottom: 3rem;
}

.pricing-header h1 {
  font-size: 3.5rem;
  font-weight: 700;
  color: #14162D;
  margin-bottom: 1rem;
}

.pricing-header p {
  font-size: 1.125rem;
  color: #4B5563;
}

.billing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  font-size: 1rem;
  color: #14162D;
}

.toggle {
  position: relative;
  width: 3.5rem;
  height: 2rem;
  display: inline-block;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.track {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #E5E7EB;
  transition: .3s;
  border-radius: 2rem;
}

.track:before {
  position: absolute;
  content: "";
  height: 1.5rem;
  width: 1.5rem;
  left: 0.25rem;
  bottom: 0.25rem;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .track {
  background-color: #0066FF;
}

input:checked + .track:before {
  transform: translateX(1.5rem);
}

.save-tag {
  background-color: #22C55E;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(360px, 1fr));
  gap: 2rem;
  margin: 0 auto;
}

.pricing-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.pricing-card.featured {
  border-color: #0066FF;
}

.card-header {
  height: 200px;
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
}

.trial-badge {
  display: inline-block;
  background: rgba(34, 197, 94, 0.1);
  color: #16A34A;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  vertical-align: middle;
  margin-left: 12px;
  font-weight: normal;
}

h2 {
  font-size: 32px;
  font-weight: 700;
  color: #14162D;
  margin-bottom: 24px;
}

.price {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}

.price .amount {
  font-size: 48px;
  font-weight: 600;
  color: #0066FF;
  line-height: 1;
}

.price .amount.custom {
  font-size: 48px;
}

.price .suffix {
  font-size: 24px;
  color: #6B7280;
  font-weight: 400;
}

.price .billing {
  font-size: 16px;
  color: #6B7280;
  font-weight: 400;
}

.price.custom {
  display: none;
}

.billing-period {
  font-size: 16px;
  color: #4B5563;
  margin-left: 8px;
}

.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.section + .section {
  margin-top: 32px;
}

.card-footer {
  margin-top: 32px;
  text-align: center;
  padding: 0;
}

.cta-button {
  display: inline-block;
  width: 100%;
  background: #0066FF;
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 16px 32px;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.cta-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.section {
  display: block;
  min-height: initial;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #14162D;
  margin-bottom: 24px;
}

.section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 16px;
}

.section li {
  position: relative;
  padding-left: 28px;
  color: #4B5563;
  font-size: 14px;
  line-height: 1.5;
}

.section li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #22C55E;
  font-weight: 600;
}

.section li a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dashed currentColor;
}

.section li a:hover {
  opacity: 0.8;
}

@media (max-width: 1200px) {
  .pricing-grid {
    grid-template-columns: 1fr;
    max-width: 480px;
    margin: 0 auto;
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('billing-toggle');
  const priceElements = document.querySelectorAll('.price[data-monthly]');

  function updatePrices(isAnnual) {
    priceElements.forEach(el => {
      const monthly = el.getAttribute('data-monthly');
      const annual = el.getAttribute('data-annual');

      if (isAnnual) {
        el.innerHTML = `
          <span class="amount">$${annual}</span>
          <span class="suffix">/ Month</span>
          <span class="billing">billed annually</span>
        `;
      } else {
        el.innerHTML = `
          <span class="amount">$${monthly}</span>
          <span class="suffix">/ Month</span>
        `;
      }
    });
  }

  toggle.addEventListener('change', function() {
    const billingType = this.checked ? 'Annual' : 'Monthly';
    gtag('event', 'billing_toggle', {
      'event_category': 'Pricing',
      'event_label': `Switch to ${billingType}`
    });
    updatePrices(this.checked);
  });

  // Set toggle to checked (annual) by default
  toggle.checked = true;
  // Initialize with annual pricing
  updatePrices(true);
});
</script>
