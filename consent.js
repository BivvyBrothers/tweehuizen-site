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

  // De vormgeving van de banner staat sinds de merkombouw in assets/stijl-v2.css,
  // zodat hij dezelfde tokens gebruikt als de rest van de site. Deze functie
  // bestaat nog als terugval voor een pagina die dat stijlblad niet laadt.
  function injectStyles() {
    if (document.querySelector('link[href*="stijl-v2.css"]')) return;
    var css =
      '#th-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;' +
      'background:#FFFFFF;color:#36064D;border:2px solid #36064D;border-radius:20px;' +
      'padding:24px;max-width:560px;margin:0 auto;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:16px;line-height:1.6}' +
      '#th-consent h3{margin:0 0 8px;font-size:17px;font-weight:700;color:#36064D}' +
      '#th-consent a{color:#36064D}' +
      '#th-consent .th-btns{display:flex;gap:16px;flex-wrap:wrap}' +
      '#th-consent button{flex:1;min-width:140px;padding:14px 24px;border-radius:14px;' +
      'border:2px solid #36064D;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit}' +
      '#th-consent .th-accept{background:#36064D;color:#F7F6E5}' +
      '#th-consent .th-decline{background:#FFFFFF;color:#36064D}';
    var style = document.createElement('style');
    style.id = 'th-consent-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Codex-audit 21 sep: de keuze was niet opnieuw te openen; het privacybeleid
  // verwees naar het handmatig wissen van localStorage. Elke pagina heeft nu
  // een link "Cookievoorkeuren" in de voettekst die hierop uitkomt.
  function heropenVoorkeuren() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    var bestaand = document.getElementById('th-consent');
    if (bestaand) bestaand.remove();
    showBanner();
  }

  function showBanner() {
    if (document.getElementById('th-consent')) return;
    injectStyles();

    // De banner volgt de taal van de pagina. Zonder dit kreeg een bezoeker van
    // support-en.html een Nederlandse toestemmingsvraag te zien, precies het
    // moment waarop je duidelijk hoort te zijn over wat je bijhoudt.
    var texts = {
      nl: {
        label: 'Cookietoestemming',
        title: 'Cookies en tracking',
        body: 'We willen graag begrijpen hoe bezoekers TweeHuizen vinden, zodat we de app verder kunnen verbeteren. Daarvoor gebruiken we Meta Pixel en Google Analytics. Geen verkoop van data, geen reclame van derden. Lees meer in onze <a href="privacy.html">privacyverklaring</a>.',
        decline: 'Alleen essentieel',
        accept: 'Akkoord'
      },
      en: {
        label: 'Cookie consent',
        title: 'Cookies and tracking',
        body: 'We would like to understand how visitors find TweeHuizen, so we can keep improving the app. For that we use the Meta Pixel and Google Analytics. We do not sell data and we do not run third-party advertising. Read more in our <a href="privacy.html" hreflang="nl" lang="nl">privacy policy</a> (in Dutch).',
        decline: 'Essential only',
        accept: 'Accept'
      }
    };
    var lang = (document.documentElement.lang || 'nl').slice(0, 2).toLowerCase();
    var t = texts[lang] || texts.nl;

    var div = document.createElement('div');
    div.id = 'th-consent';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-label', t.label);
    div.innerHTML =
      '<h3>' + t.title + '</h3>' +
      '<p>' + t.body + '</p>' +
      '<div class="th-btns">' +
      '<button class="th-decline" type="button">' + t.decline + '</button>' +
      '<button class="th-accept" type="button">' + t.accept + '</button>' +
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
  window.tweeHuizenCookievoorkeuren = heropenVoorkeuren;
})();
