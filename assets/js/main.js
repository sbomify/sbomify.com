(function() {
  function initMobileMenu () {
    var openBtn = document.querySelector('.open-menu');
    var closeBtn = document.querySelector('.close-menu');
    var menu = document.querySelector('.mobile-menu');
    if (!openBtn || !closeBtn || !menu) return;

    function open() {
      menu.classList.remove('hidden');
      openBtn.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
    }
    function close() {
      menu.classList.add('hidden');
      openBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      openBtn.focus();
    }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) close();
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

  initMobileMenu();
  initCodeCopy();
}())