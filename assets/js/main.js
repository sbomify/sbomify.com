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

  initMobileMenu();
}())