---
layout: integrations
title: Integrations
description: "Seamlessly integrate SBOM generation, analysis, and enrichment into your existing workflow."
---

<div class="space-y-24">

<!-- CI/CD Section -->
<section>
    <div class="mb-10 text-center max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-primaryText mb-4">CI/CD & Generation</h2>
      <p class="text-lg text-secondaryText">Generate SBOMs automatically in your pipelines. We support all major CI/CD providers.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- GitHub -->
      <div class="bg-[#201B4C] rounded-2xl p-8 border border-[#37306B] shadow-sm hover:border-[#8A7DFF] transition-all" id="github">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <img src="{{ '/assets/images/site/github.svg' | bust_cache }}" class="h-8 w-auto" alt="GitHub">
            <div id="gh-latest-release" class="hidden"></div>
          </div>
          <a href="https://github.com/marketplace/actions/sbomify" class="text-sm font-semibold text-[#8A7DFF] hover:text-white transition-colors" target="_blank">View on Marketplace →</a>
        </div>
        <p class="text-gray-300 mb-6">
          GitHub is at the core of many organizations. Our <a href="https://github.com/sbomify/github-action" class="text-[#8A7DFF] hover:text-white transition-colors">GitHub Action</a> makes integration straightforward.
        </p>
        <div class="bg-[#141035] rounded-lg p-4 overflow-x-auto text-sm text-gray-300 font-mono border border-[#37306B]">

<pre><code>- name: Upload SBOM
  uses: sbomify/github-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: 'my-component-id'
    LOCK_FILE: 'requirements.txt'
    COMPONENT_NAME: 'my-awesome-app'
    COMPONENT_VERSION: ${{ github.ref_name }}
    AUGMENT: true
    ENRICH: true</code></pre>

        </div>
      </div>

      <!-- GitLab -->
      <div class="bg-[#201B4C] rounded-2xl p-8 border border-[#37306B] shadow-sm hover:border-[#8A7DFF] transition-all" id="gitlab">
        <div class="flex items-center justify-between mb-6">
          <img src="{{ '/assets/images/site/gitlab.svg' | bust_cache }}" class="h-8 w-auto" alt="GitLab">
          <a href="https://gitlab.com/sbomify/gitlab-pipeline" class="text-sm font-semibold text-[#8A7DFF] hover:text-white transition-colors" target="_blank">View Pipeline →</a>
        </div>
        <p class="text-gray-300 mb-6">
          For GitLab users, we provide a dedicated pipeline template.
        </p>
        <div class="bg-[#141035] rounded-lg p-4 overflow-x-auto text-sm text-gray-300 font-mono border border-[#37306B]">

<pre><code>generate-sbom:
  image: sbomifyhub/sbomify-action
  variables:
    TOKEN: $SBOMIFY_TOKEN
    COMPONENT_ID: 'Your Component ID'
    UPLOAD: true
    AUGMENT: true
    ENRICH: true
    COMPONENT_NAME: 'my-python-app'
    COMPONENT_VERSION: $CI_COMMIT_SHA
    LOCK_FILE: 'poetry.lock'
    OUTPUT_FILE: test-sbom.cdx.json"
  script:
    - /sbomify.sh</code></pre>

        </div>
      </div>

      <!-- Bitbucket -->
      <div class="bg-[#201B4C] rounded-2xl p-8 border border-[#37306B] shadow-sm hover:border-[#8A7DFF] transition-all" id="bitbucket">
        <div class="flex items-center justify-between mb-6">
          <img src="{{ '/assets/images/site/bitbucket.svg' | bust_cache }}" class="h-8 w-auto" alt="Bitbucket">
          <a href="https://bitbucket.org/sbomify/bitbucket-pipe/" class="text-sm font-semibold text-[#8A7DFF] hover:text-white transition-colors" target="_blank">View Pipe →</a>
        </div>
        <p class="text-gray-300 mb-6">
          Seamlessly integrate with Bitbucket Pipelines using our official pipe.
        </p>
        <div class="bg-[#141035] rounded-lg p-4 overflow-x-auto text-sm text-gray-300 font-mono border border-[#37306B]">

<pre><code>- step:
    name: Build SBOM
    script:
      - pipe: docker://sbomifyhub/sbomify-action:latest
        variables:
          TOKEN: $SBOMIFY_TOKEN
          COMPONENT_ID: "Your Component ID"
          UPLOAD: "true"
          AUGMENT: "true"
          ENRICH: "true"
          COMPONENT_NAME: "my-python-app"
          COMPONENT_VERSION: $BITBUCKET_COMMIT
          LOCK_FILE: "poetry.lock"
          OUTPUT_FILE: "bitbucket-sbom.cdx.json"</code></pre>

        </div>
      </div>

      <!-- Docker -->
      <div class="bg-[#201B4C] rounded-2xl p-8 border border-[#37306B] shadow-sm hover:border-[#8A7DFF] transition-all" id="docker">
        <div class="flex items-center justify-between mb-6">
          <img src="{{ '/assets/images/site/docker.svg' | bust_cache }}" class="h-8 w-auto" alt="Docker">
          <span class="text-sm font-semibold text-gray-400">Universal Support</span>
        </div>
        <p class="text-gray-300 mb-6">
          For any other CI/CD system, you can use our Docker image directly.
        </p>
        <div class="bg-[#141035] rounded-lg p-4 overflow-x-auto text-sm text-gray-300 font-mono border border-[#37306B]">

<pre><code>docker run --rm \
  -v $(pwd):/code \
  -e TOKEN=&lt;my token&gt; \
  -e COMPONENT_ID=&lt;my component id&gt; \
  -e LOCK_FILE=/code/requirements.txt \
  -e COMPONENT_NAME=my-app \
  sbomifyhub/sbomify-action</code></pre>

        </div>
      </div>
    </div>

</section>

<!-- Vulnerability Analysis Section -->
<section>
    <div class="mb-10 text-center max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-primaryText mb-4">Vulnerability Analysis</h2>
      <p class="text-lg text-secondaryText">Comprehensive scanning powered by industry-leading databases.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- OSV -->
      <div class="bg-[#201B4C] rounded-2xl p-8 border border-[#37306B] shadow-sm hover:border-[#8A7DFF] transition-all flex flex-col">
        <img src="{{ '/assets/images/site/osv.png' | bust_cache }}" class="h-8 w-auto mb-6 self-start" alt="Google OSV">
        <h3 class="text-xl font-bold text-white mb-3">Google OSV</h3>
        <p class="text-gray-300 flex-grow">
          We integrate with the Open Source Vulnerability (OSV) database to provide precise, distributed vulnerability intelligence across a wide range of ecosystems.
        </p>
      </div>

      <!-- Dependency Track -->
      <div class="bg-[#201B4C] rounded-2xl p-8 border border-[#37306B] shadow-sm hover:border-[#8A7DFF] transition-all flex flex-col">
        <img src="{{ '/assets/images/site/dependency-track-white.svg' | bust_cache }}" class="h-8 w-auto mb-6 self-start" alt="Dependency Track">
        <h3 class="text-xl font-bold text-white mb-3">Dependency Track</h3>
        <p class="text-gray-300 mb-4 flex-grow">
          Leverage the power of OWASP Dependency-Track for continuous component analysis.
        </p>
        <div class="mt-4 pt-4 border-t border-[#37306B]">
          <div class="flex items-start gap-2">
            <span class="bg-[#8A7DFF]/10 text-[#8A7DFF] text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Enterprise</span>
            <p class="text-sm text-gray-400">
              <strong>Bring Your Own:</strong> Enterprise customers can connect their existing Dependency Track instance for unified visibility.
            </p>
          </div>
        </div>
      </div>
    </div>

</section>

<!-- Enrichment Section -->
<section>
    <div class="mb-10 text-center max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-primaryText mb-4">Enrichment</h2>
      <p class="text-lg text-secondaryText">Add context to your artifacts automatically.</p>
    </div>

    <div class="bg-[#201B4C] rounded-2xl p-8 border border-[#37306B] shadow-sm hover:border-[#8A7DFF] transition-all">
      <div class="flex flex-col md:flex-row gap-8 items-start">
        <div class="flex-shrink-0">
          <img src="{{ '/assets/images/site/ecosystems-white.svg' | bust_cache }}" class="h-10 w-auto" alt="Ecosyste.ms">
        </div>
        <div>
          <h3 class="text-xl font-bold text-white mb-3">Ecosyste.ms</h3>
          <p class="text-gray-300 mb-4">
            We partner with Ecosyste.ms to enrich your SBOMs with metadata, licensing information, and project health metrics.
          </p>
          <div class="bg-[#141035] rounded-lg p-4 text-sm text-gray-300 border border-[#37306B]">
            <p class="mb-2">
              <span class="font-semibold text-white">How it works:</span>
              Enrichment happens automatically when using our <a href="https://github.com/sbomify/github-action" class="text-[#8A7DFF] hover:text-white transition-colors">GitHub Action module</a>.
            </p>
            <code class="bg-[#201B4C] px-2 py-1 rounded text-[#8A7DFF] font-mono border border-[#37306B]">ENRICH: true</code>
          </div>
        </div>
      </div>
    </div>

</section>

</div>

<script>
  fetch('https://api.github.com/repos/sbomify/github-action/releases/latest')
    .then(response => response.json())
    .then(data => {
      if (data.tag_name) {
        const releaseBadge = `
          <a href="${data.html_url}" target="_blank" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A7DFF]/10 border border-[#8A7DFF]/20 hover:bg-[#8A7DFF]/20 transition-colors group">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span class="text-xs font-medium text-[#8A7DFF] group-hover:text-white">Release ${data.tag_name}</span>
          </a>
        `;

        const container = document.getElementById('gh-latest-release');
        if (container) {
          container.innerHTML = releaseBadge;
          container.classList.remove('hidden');
        }
      }
    })
    .catch(e => console.log('Error fetching release:', e));
</script>
