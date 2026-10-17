/* Uitlegfilm op de startpagina.
   - Laadt pas als hij in beeld komt (preload="none"), dus geen 7 MB voor wie
     nooit zo ver scrolt, en pauzeert weer zodra hij uit beeld is.
   - Altijd eerst zonder geluid: browsers starten geen film met geluid zonder tik.
   - De knop "Geluid aan" verschijnt alleen als het bestand een geluidsspoor heeft.
   - Wie op zijn toestel "minder beweging" heeft gekozen, ziet de poster en start
     zelf met Afspelen. */
'use strict';
(function () {
  const v = document.getElementById('uitlegfilm');
  if (!v) return;
  const speel = document.getElementById('film-speel');
  const geluid = document.getElementById('film-geluid');
  const rustig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Knopteksten volgen de taal van de pagina (index.html of index-en.html).
  const en = (document.documentElement.lang || 'nl').slice(0, 2).toLowerCase() === 'en';
  const T = en
    ? { speel: 'Play', pauze: 'Pause', aan: 'Sound on', uit: 'Sound off' }
    : { speel: 'Afspelen', pauze: 'Pauzeer', aan: 'Geluid aan', uit: 'Geluid uit' };

  // Op een smal scherm de staande versie: daar is de tekst in de liggende film te
  // klein. Dit gebeurt vóór het eerste laden (preload="none"), dus geen dubbele download.
  if (window.matchMedia && window.matchMedia('(max-width: 600px)').matches) {
    const bron = v.querySelector('source');
    bron.src = v.dataset.srcStaand || 'film/uitlegfilm-1080x1920.mp4';
    v.poster = v.dataset.posterStaand || 'film/uitlegfilm-poster-staand.jpg';
    v.setAttribute('width', '1080'); v.setAttribute('height', '1920');
    v.closest('.film-kader').classList.add('staand');
    v.load();
  }
  let zelfGepauzeerd = false;

  const toonStand = () => {
    const loopt = !v.paused;
    speel.textContent = loopt ? T.pauze : T.speel;
    speel.setAttribute('aria-pressed', String(loopt));
  };
  const heeftGeluid = () => Boolean(
    v.mozHasAudio || (v.webkitAudioDecodedByteCount > 0) || (v.audioTracks && v.audioTracks.length));
  const start = () => { const p = v.play(); if (p && p.catch) p.catch(() => toonStand()); };

  v.addEventListener('play', toonStand);
  v.addEventListener('pause', toonStand);
  v.addEventListener('timeupdate', () => {
    if (geluid.hidden && v.currentTime > 0.5 && heeftGeluid()) geluid.hidden = false;
  });

  speel.addEventListener('click', () => {
    if (v.paused) { zelfGepauzeerd = false; start(); } else { zelfGepauzeerd = true; v.pause(); }
  });
  geluid.addEventListener('click', () => {
    v.muted = !v.muted;
    geluid.textContent = v.muted ? T.aan : T.uit;
    geluid.setAttribute('aria-pressed', String(!v.muted));
    if (!v.muted && v.paused) start();
  });

  if (rustig || !('IntersectionObserver' in window)) { toonStand(); return; }
  new IntersectionObserver((items) => {
    items.forEach((it) => {
      if (it.isIntersecting && it.intersectionRatio >= 0.4) { if (!zelfGepauzeerd) start(); }
      else if (!v.paused) v.pause();
    });
  }, { threshold: [0, 0.4] }).observe(v);
  toonStand();
})();
