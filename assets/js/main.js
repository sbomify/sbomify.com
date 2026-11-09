(function() {
  // Header: frosted once the page scrolls; the phone menu is a sheet under
  // the bar, opened and closed by one toggle (layouts/partials/nav-mobile.html).
  function initHeader () {
    var header = document.querySelector('[data-header]');
    if (!header) return;
    var ticking = false;
    function onScroll () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var toggle = header.querySelector('.open-menu');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    function setOpen (open) {
      menu.classList.toggle('hidden', !open);
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      document.documentElement.style.overflow = open ? 'hidden' : '';
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    // Back to the desktop layout with the sheet open: close it.
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  // Copy buttons on code blocks (layouts/_default/_markup/render-codeblock.html).
  // They ship hidden so there is no dead control without JavaScript or
  // without clipboard access.
  function initCodeCopy () {
    if (!navigator.clipboard) return;
    document.querySelectorAll('[data-code-copy]').forEach(function (button) {
      var code = button.closest('.code-block').querySelector('pre code');
      if (!code) return;
      button.hidden = false;
      button.addEventListener('click', function () {
        navigator.clipboard.writeText(code.innerText.replace(/\n$/, '')).then(function () {
          button.textContent = 'Copied';
          setTimeout(function () { button.textContent = 'Copy'; }, 2000);
        });
      });
    });
  }

  // Page tools (layouts/partials/agent-tools.html). "Copy as Markdown" fetches
  // the page's index.md; handing ClipboardItem a promise keeps the click's user
  // activation in Safari while the file loads. The button ships hidden.
  function initAgentTools () {
    // Which tools get used, through the posthog stub until consent.
    document.addEventListener('click', function (e) {
      var tool = e.target.closest && e.target.closest('[data-agent-tool]');
      if (tool && window.posthog) window.posthog.capture('agent_tool_click', { tool: tool.dataset.agentTool });
    });
    if (!navigator.clipboard) return;
    var status = document.querySelector('[data-agent-status]');
    document.querySelectorAll('[data-copy-markdown]').forEach(function (button) {
      var label = button.querySelector('[data-label]');
      button.hidden = false;
      button.addEventListener('click', function () {
        var text = fetch(button.dataset.copyMarkdown).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.text();
        });
        var copied = window.ClipboardItem && navigator.clipboard.write
          ? navigator.clipboard.write([new ClipboardItem({ 'text/plain': text.then(function (t) { return new Blob([t], { type: 'text/plain' }); }) })])
          : text.then(function (t) { return navigator.clipboard.writeText(t); });
        copied.then(function () { return 'Copied'; }, function () { return 'Could not copy'; }).then(function (message) {
          label.textContent = message;
          if (status) status.textContent = message;
          setTimeout(function () { label.textContent = 'Copy as Markdown'; }, 2000);
        });
      });
    });
  }

  initHeader();
  initCodeCopy();
  initAgentTools();
}())