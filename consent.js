/* TweeHuizen | Cookie-consent + tracking
 * Laadt Meta Pixel en (later) GA4 PAS na expliciet akkoord.
 * AVG-conform: tracking pas na opt-in, weigerknop even prominent als akkoord.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'tweehuizen_consent_v1';
  var META_PIXEL_ID = '1600457547692192';
  var GA4_MEASUREMENT_ID = 'G-QFY2C1QD6K';

  function loadMetaPixel() {
    if (window.fbq) return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function loadGA4() {
    if (!GA4_MEASUREMENT_ID) return;
    if (window.gtag) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function activateTracking() {
    loadMetaPixel();
    loadGA4();
  }

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function injectStyles() {
    var css =
      '#th-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;' +
      'background:#fff;color:#1a1a1a;border:1px solid #e5e5e5;border-radius:12px;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.15);padding:18px 20px;max-width:560px;margin:0 auto;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Arial,sans-serif;font-size:14px;line-height:1.5}' +
      '#th-consent h3{margin:0 0 8px;font-size:15px;font-weight:600;color:#2F5F8F}' +
      '#th-consent p{margin:0 0 14px}' +
      '#th-consent a{color:#2F5F8F;text-decoration:underline}' +
      '#th-consent .th-btns{display:flex;gap:8px;flex-wrap:wrap}' +
      '#th-consent button{flex:1;min-width:120px;padding:10px 14px;border-radius:8px;border:0;' +
      'font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}' +
      '#th-consent .th-accept{background:#2F5F8F;color:#fff}' +
      '#th-consent .th-decline{background:#f3f3f3;color:#1a1a1a}' +
      '#th-consent button:hover{filter:brightness(0.95)}' +
      '@media(max-width:480px){#th-consent{left:8px;right:8px;bottom:8px;padding:14px 16px}}';
    var style = document.createElement('style');
    style.id = 'th-consent-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function showBanner() {
    if (document.getElementById('th-consent')) return;
    injectStyles();
    var div = document.createElement('div');
    div.id = 'th-consent';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-label', 'Cookietoestemming');
    div.innerHTML =
      '<h3>Cookies en tracking</h3>' +
      '<p>We willen graag begrijpen hoe bezoekers TweeHuizen vinden, zodat we de app verder kunnen verbeteren. Daarvoor gebruiken we Meta Pixel en Google Analytics. Geen verkoop van data, geen reclame van derden. Lees meer in onze <a href="privacy.html">privacyverklaring</a>.</p>' +
      '<div class="th-btns">' +
      '<button class="th-decline" type="button">Alleen essentieel</button>' +
      '<button class="th-accept" type="button">Akkoord</button>' +
      '</div>';
    document.body.appendChild(div);

    div.querySelector('.th-accept').addEventListener('click', function () {
      setConsent('granted');
      div.remove();
      activateTracking();
    });
    div.querySelector('.th-decline').addEventListener('click', function () {
      setConsent('denied');
      div.remove();
    });
  }

  function init() {
    var consent = getConsent();
    if (consent === 'granted') {
      activateTracking();
    } else if (consent === 'denied') {
      // niets doen, gebruiker heeft geweigerd
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
