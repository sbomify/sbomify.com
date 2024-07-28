(function() {
  /**
   * Toggle hamburger menu
   */
  function initMobileMenu () {
    var openBtn = document.querySelector('.open-menu');
    var closeBtn = document.querySelector('.close-menu');
    var menu = document.querySelector('.mobile-menu');

    openBtn.addEventListener('click', () => {
      menu.classList.remove('hidden');
    })

    closeBtn.addEventListener('click', () => {
      menu.classList.add('hidden');
    })
  }

  initMobileMenu();
}())