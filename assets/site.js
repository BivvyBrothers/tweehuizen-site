/* TweeHuizen | kleine verbeteringen bovenop pagina's die ook zonder JavaScript werken:
   lijn onder de kop na scrollen, het menu op een smal scherm, en inhoud die rustig in beeld komt. */
(function () {
  'use strict';
  var doc = document;

  var kop = doc.querySelector('.topnav');
  function gescrold() { if (kop) kop.classList.toggle('is-scrolled', window.scrollY > 8); }
  gescrold();
  window.addEventListener('scroll', gescrold, { passive: true });

  var knop = doc.querySelector('.nav-toggle');
  var menu = doc.getElementById('hoofdmenu');
  function sluit() {
    if (!kop || !knop) return;
    kop.classList.remove('is-open');
    knop.setAttribute('aria-expanded', 'false');
  }
  if (knop && menu && kop) {
    knop.addEventListener('click', function () {
      var open = kop.classList.toggle('is-open');
      knop.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) sluit(); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && kop.classList.contains('is-open')) { sluit(); knop.focus(); }
    });
  }

  // In beeld komen. Bewust een eenvoudige scrollcontrole: die kan geen inhoud verborgen
  // laten, ook niet na een sprong naar een anker.
  var items = [].slice.call(doc.querySelectorAll('[data-reveal]'));
  var laatst = 0, wacht = null;
  function onthul() {
    laatst = Date.now();
    var grens = window.innerHeight * 0.92;
    items = items.filter(function (el) {
      if (el.getBoundingClientRect().top < grens) { el.classList.add('is-in'); return false; }
      return true;
    });
    if (!items.length) {
      window.removeEventListener('scroll', bijScroll);
      window.removeEventListener('resize', bijScroll);
    }
  }
  function bijScroll() {
    if (Date.now() - laatst > 60) onthul();
    clearTimeout(wacht);
    wacht = setTimeout(onthul, 120);
  }
  if (items.length) {
    window.addEventListener('scroll', bijScroll, { passive: true });
    window.addEventListener('resize', bijScroll);
    window.addEventListener('load', onthul);
    onthul();
  }

  var jaar = doc.getElementById('year');
  if (jaar) jaar.textContent = String(new Date().getFullYear());

  // Menu en onthullen zijn aangesloten: het vangnet in de head hoeft niet in te grijpen.
  window.thKlaar = true;
})();
