(function() {
  // Header: frosted once the page scrolls; the phone menu is a sheet under
  // the bar, opened and closed by one toggle (layouts/partials/header.html).
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
      // Unhide first, then fade in on the next frame so the transition runs.
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
      } else {
        menu.classList.remove('is-open');
        menu.hidden = true;
      }
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
    window.matchMedia('(min-width: 1061px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  // Megamenus (layouts/partials/header.html). Without this the panels open
  // on CSS hover and focus; here they become disclosure buttons: a click
  // toggles, a mouse opens them with a short hover intent and closes them
  // shortly after leaving, Escape or a click outside closes. Moving from
  // one open menu to the next swaps panels at once (.mega-instant).
  function initMega () {
    var header = document.querySelector('[data-header]');
    if (!header) return;
    var items = header.querySelectorAll('.nav-item[data-mega]');
    if (!items.length) return;
    header.classList.add('mega-ready');
    var current = null;
    var openTimer, closeTimer, openedAt = 0;

    function set (item, on) {
      item.classList.toggle('is-open', on);
      item.querySelector('.nav-trigger').setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    function open (item) {
      clearTimeout(closeTimer);
      if (current === item) return;
      header.classList.toggle('mega-instant', !!current);
      if (current) set(current, false);
      set(item, true);
      current = item;
      openedAt = Date.now();
      header.classList.add('mega-open');
    }
    function close () {
      clearTimeout(openTimer);
      if (!current) return;
      set(current, false);
      current = null;
      header.classList.remove('mega-open', 'mega-instant');
    }

    items.forEach(function (item) {
      var trigger = item.querySelector('.nav-trigger');
      trigger.addEventListener('click', function () {
        // A hover just opened it: the click that follows keeps it open.
        if (current === item && Date.now() - openedAt > 400) close();
        else open(item);
      });
      item.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        openTimer = setTimeout(function () { open(item); }, current ? 0 : 90);
      });
      item.addEventListener('pointerleave', function (e) {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(openTimer);
        // Only close the menu this pointer left, not one opened since.
        closeTimer = setTimeout(function () { if (current === item) close(); }, 220);
      });
      // Tabbing out of an open menu closes it.
      item.addEventListener('focusout', function (e) {
        if (current === item && !item.contains(e.relatedTarget)) close();
      });
    });

    // Plain links in the bar (Pricing) close an open menu on hover.
    header.querySelectorAll('.nav-item:not([data-mega])').forEach(function (item) {
      item.addEventListener('pointerenter', function (e) {
        if (e.pointerType === 'mouse' && current) { clearTimeout(closeTimer); closeTimer = setTimeout(close, 120); }
      });
    });

    header.querySelector('.mega-scrim').addEventListener('click', close);
    document.addEventListener('click', function (e) {
      if (current && !current.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && current) {
        var trigger = current.querySelector('.nav-trigger');
        close();
        trigger.focus();
      }
    });
    window.matchMedia('(max-width: 1060px)').addEventListener('change', function (e) {
      if (e.matches) close();
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

  // Reveal: [data-reveal] blocks animate in once when they scroll into view.
  // The class that hides them is added here, so without JavaScript (or with
  // reduced motion) they are simply shown.
  function initReveal () {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });
    els.forEach(function (el) {
      // Already on screen at load: show it as is.
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) return;
      el.classList.add('reveal-ready');
      io.observe(el);
    });
  }

  // Steps (home page, How it works): tabs beside a product window. Advances
  // on its own every --dwell while on screen; pauses on hover or focus;
  // stops for good once someone picks a step; never auto-plays for reduced
  // motion. Without this script every step and screen is shown.
  function initSteps () {
    document.querySelectorAll('[data-steps]').forEach(function (root) {
      var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
      var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
      if (!tabs.length || panels.indexOf(null) !== -1) return;
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var dwell = parseFloat(getComputedStyle(root).getPropertyValue('--dwell')) * 1000 || 6000;
      var current = 0, timer = null, visible = false, hovered = false, manual = reduce;

      function show (i, focus) {
        current = i;
        tabs.forEach(function (t, n) {
          var on = n === i;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
          t.parentElement.classList.toggle('is-active', on);
          panels[n].classList.toggle('is-active', on);
          panels[n].hidden = false;
          panels[n].setAttribute('aria-hidden', on ? 'false' : 'true');
        });
        // The app picture's sidebar follows the step.
        var win = root.querySelector('[data-step]');
        if (win) win.setAttribute('data-step', String(i + 1));
        if (focus) tabs[i].focus();
        schedule();
      }

      function schedule () {
        clearTimeout(timer);
        var paused = hovered || !visible;
        root.classList.toggle('is-paused', paused && !manual);
        root.classList.toggle('is-manual', manual);
        if (manual || paused) return;
        // Restart the progress bar from empty for this step.
        var bar = tabs[current].parentElement.querySelector('.steps-progress');
        if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
        timer = setTimeout(function () { show((current + 1) % tabs.length); }, dwell);
      }

      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { manual = true; show(i); });
        t.addEventListener('keydown', function (e) {
          var k = e.key, n = null;
          if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % tabs.length;
          else if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
          else if (k === 'Home') n = 0;
          else if (k === 'End') n = tabs.length - 1;
          if (n === null) return;
          e.preventDefault();
          manual = true;
          show(n, true);
        });
      });

      root.addEventListener('mouseenter', function () { hovered = true; schedule(); });
      root.addEventListener('mouseleave', function () { hovered = false; schedule(); });
      root.addEventListener('focusin', function () { hovered = true; schedule(); });
      root.addEventListener('focusout', function (e) {
        if (!root.contains(e.relatedTarget)) { hovered = false; schedule(); }
      });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          schedule();
        }, { threshold: 0.4 }).observe(root);
      } else {
        visible = true;
      }

      root.classList.add('is-ready');
      show(0);
    });
  }

  // Stages (home page, CVE example): [data-stages] counts data-stage up
  // from 0 to its last stage once it scrolls into view, holds the finished
  // state, then plays again while it stays on screen. The HTML ships the
  // finished state, which is all that shows without JavaScript or with
  // reduced motion.
  function initStages () {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('[data-stages]').forEach(function (root) {
      var last = parseInt(root.getAttribute('data-stages'), 10) || 1;
      var STEP = 1600, HOLD = 6000;
      var timer = null, visible = false, stage = last;

      function set (n) {
        stage = n;
        root.setAttribute('data-stage', String(n));
      }

      // Below the fold at load: start from the beginning, so the first
      // thing a visitor sees here is the triage starting, not resetting.
      if (root.getBoundingClientRect().top > window.innerHeight) set(0);

      function tick () {
        if (!visible) return;
        if (stage >= last) {
          set(0);
          timer = setTimeout(tick, 900);
        } else {
          set(stage + 1);
          timer = setTimeout(tick, stage >= last ? HOLD : STEP);
        }
      }

      new IntersectionObserver(function (entries) {
        var was = visible;
        visible = entries[0].isIntersecting;
        clearTimeout(timer);
        if (visible && !was) timer = setTimeout(tick, 400);
      }, { threshold: 0.45 }).observe(root);
    });
  }

  // Agent session (home page): each [data-t] element inside [data-agent] is
  // marked .on at its time in ms once the picture is on screen; the
  // finished state holds, then it plays again. Leaving the screen resets to
  // the finished state, which is also what shows without JavaScript or with
  // reduced motion.
  function initAgent () {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('[data-agent]').forEach(function (root) {
      var items = Array.prototype.slice.call(root.querySelectorAll('[data-t]'));
      var end = items.reduce(function (m, el) { return Math.max(m, +el.getAttribute('data-t')); }, 0);
      var HOLD = 6000;
      var timers = [];

      function clear () {
        timers.forEach(clearTimeout);
        timers = [];
      }

      function play () {
        clear();
        items.forEach(function (el) { el.classList.remove('on'); });
        root.classList.add('is-playing');
        items.forEach(function (el) {
          timers.push(setTimeout(function () { el.classList.add('on'); }, +el.getAttribute('data-t') + 300));
        });
        timers.push(setTimeout(play, end + 300 + HOLD));
      }

      function stop () {
        clear();
        root.classList.remove('is-playing');
        items.forEach(function (el) { el.classList.add('on'); });
      }

      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { if (!timers.length) play(); }
        else stop();
      }, { threshold: 0.35 }).observe(root);
    });
  }

  initHeader();
  initMega();
  initReveal();
  initSteps();
  initStages();
  initAgent();
  initCodeCopy();
  initAgentTools();
}())