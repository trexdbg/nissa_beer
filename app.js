/* Nissa Beer — site statique compatible GitHub Pages.
 * CONFIG.contactEmail : renseigner une véritable adresse de réception pour
 * préremplir le destinataire de la demande d'information (sans backend).
 * Les parcours sont des illustrations touristiques, PAS du guidage vélo.
 */
(function () {
  'use strict';

  const CONFIG = {
    contactEmail: ''
  };

  // Repères estimatifs sur le corridor cyclable du front de mer.
  // Ne provient PAS d'un calculateur routier ni d'une levée GPS officielle.
  // Tous les parcours sont des ALLERS-RETOURS : le tracé représente l'aller.
  const COASTLINE = [
    [43.69515, 7.26785],
    [43.69508, 7.26730],
    [43.69501, 7.26665],
    [43.69497, 7.26570],
    [43.69494, 7.26470],
    [43.69493, 7.26390],
    [43.69488, 7.26300],
    [43.69480, 7.26190],
    [43.69470, 7.26080],
    [43.69458, 7.25990],
    [43.69438, 7.25900],
    [43.69400, 7.25790],
    [43.69370, 7.25690],
    [43.69325, 7.25560],
    [43.69290, 7.25430],
    [43.69255, 7.25300],
    [43.69215, 7.25190],
    [43.69165, 7.25040],
    [43.69115, 7.24920],
    [43.69085, 7.24810],
    [43.69055, 7.24700],
    [43.69024, 7.24580],
    [43.68998, 7.24490],
    [43.68970, 7.24370],
    [43.68942, 7.24260],
    [43.68905, 7.24150],
    [43.68880, 7.24070],
    [43.68825, 7.23950],
    [43.68780, 7.23850],
    [43.68725, 7.23740],
    [43.68670, 7.23630],
    [43.68610, 7.23550],
    [43.68530, 7.23480],
    [43.68440, 7.23420],
    [43.68350, 7.23370],
    [43.68280, 7.23330]
  ];

  const ROUTES = {
    prom: {
      id: 'prom',
      title: "La Prom' Signature",
      distance: '≈ 1,6 km',
      duration: '35–50 min',
      description: "Du Monument du Centenaire jusqu'au Négresco, via les façades Belle Époque. Même trajet au retour.",
      accessNote: "Départ et point de retournement à valider sur place. Pas de demi-tour sur une piste encombrée.",
      color: '#ee7053',
      path: COASTLINE.slice(0, 12),
      stops: [
        { name: 'Monument du Centenaire · départ proposé', coords: COASTLINE[0] },
        { name: 'Palais de la Méditerranée · vue depuis la Prom’', coords: COASTLINE[6] },
        { name: 'Hôtel Le Négresco · retour à confirmer', coords: COASTLINE[11] }
      ]
    },
    sunset: {
      id: 'sunset',
      title: 'Sunset vers Lenval',
      distance: '≈ 2,9 km',
      duration: '45–65 min',
      description: "Du Négresco vers les plages du Voilier et Florida, Magnan, puis Lenval. Retour par le même front de mer.",
      accessNote: "Parcours à privilégier hors affluence ; point de retournement à Lenval à confirmer.",
      color: '#299eae',
      path: COASTLINE.slice(11, 26),
      stops: [
        { name: 'Le Négresco · départ proposé', coords: COASTLINE[11] },
        { name: 'Plage du Voilier · vue sur la baie', coords: COASTLINE[14] },
        { name: 'Secteur Florida et Magnan', coords: COASTLINE[22] },
        { name: 'Lenval · retour à confirmer', coords: COASTLINE[25] }
      ]
    },
    'vieux-nice': {
      id: 'vieux-nice',
      title: 'La Baie Grand Angle',
      distance: '≈ 6,5 km',
      duration: '75–110 min',
      description: "La grande balade littorale du Centenaire à Carras, via Négresco, Magnan et Lenval. Retour sur le même axe.",
      accessNote: "Sortie longue, sections très fréquentées : repérage préalable et point de retournement à Carras indispensables.",
      color: '#d39d1f',
      path: COASTLINE.slice(),
      stops: [
        { name: 'Monument du Centenaire · départ proposé', coords: COASTLINE[0] },
        { name: 'Hôtel Le Négresco', coords: COASTLINE[11] },
        { name: 'Secteur Magnan', coords: COASTLINE[22] },
        { name: 'Lenval · vue sur les plages', coords: COASTLINE[25] },
        { name: 'Plage de Carras · retour à confirmer', coords: COASTLINE[35] }
      ]
    }
  };

  const $ = function (selector) { return document.querySelector(selector); };
  const $$ = function (selector) { return Array.from(document.querySelectorAll(selector)); };
  let selectedRoute = 'prom';
  let map = null;
  let routeLine = null;
  let markers = [];
  let preparedRequest = '';

  function setTodayMin() {
    const input = $('#booking-date');
    if (!input) return;
    const now = new Date();
    const pad = function (value) { return String(value).padStart(2, '0'); };
    input.min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  }

  function closeMobileMenu() {
    const menu = $('#mobile-nav');
    const trigger = $('.menu-toggle');
    if (!menu || !trigger) return;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Ouvrir le menu');
  }

  function setupMenu() {
    const trigger = $('.menu-toggle');
    const menu = $('#mobile-nav');
    if (!trigger || !menu) return;
    trigger.addEventListener('click', function () {
      const opening = menu.hidden;
      menu.hidden = !opening;
      trigger.setAttribute('aria-expanded', String(opening));
      trigger.setAttribute('aria-label', opening ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    $$('#mobile-nav a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMobileMenu();
    });
  }

  function showMapError() {
    const message = $('#map-fallback');
    if (message) message.hidden = false;
    const mapNode = $('#map');
    if (mapNode) mapNode.setAttribute('aria-hidden', 'true');
  }

  function initializeMap() {
    if (typeof window.L === 'undefined') {
      showMapError();
      return;
    }
    try {
      map = L.map('map', { scrollWheelZoom: false, zoomControl: false, preferCanvas: true });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributeurs',
        maxZoom: 19
      }).addTo(map);
      map.on('tileerror', function () {
        // The route remains visible on the map even if one map tile fails.
      });
      map.setView([43.694, 7.264], 13);
    } catch (error) {
      console.warn('Nissa Beer : cartographie indisponible', error);
      map = null;
      showMapError();
    }
  }

  function escapeMarkup(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function drawSelectedRoute() {
    if (!map || typeof window.L === 'undefined') return;
    const data = ROUTES[selectedRoute];
    if (routeLine) map.removeLayer(routeLine);
    markers.forEach(function (marker) { map.removeLayer(marker); });
    markers = [];

    // Visualisation de l'aller uniquement : le retour se fait sur la même portion.
    routeLine = L.polyline(data.path, {
      color: data.color,
      weight: 6,
      opacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);

    data.stops.forEach(function (stop, index) {
      const icon = L.divIcon({
        className: 'nissa-marker',
        html: '<span class="map-pin' + (index === 0 ? ' is-start' : '') + (index === data.stops.length - 1 ? ' is-end' : '') + '">' + (index === data.stops.length - 1 ? '↶' : index + 1) + '</span>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      const marker = L.marker(stop.coords, { icon: icon })
        .addTo(map)
        .bindPopup('<strong>Étape ' + (index + 1) + '</strong><br>' + escapeMarkup(stop.name));
      markers.push(marker);
    });
    map.fitBounds(routeLine.getBounds(), { padding: [55, 55], maxZoom: 15, animate: false });
  }

  function renderStops(data) {
    const target = $('#selected-stops');
    if (!target) return;
    target.replaceChildren();
    data.stops.forEach(function (stop, index) {
      const container = document.createElement('div');
      container.className = 'stop';
      const number = document.createElement('span');
      number.className = 'stop-index';
      number.textContent = String(index + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.className = 'stop-name';
      label.textContent = stop.name;
      container.appendChild(number);
      container.appendChild(label);
      target.appendChild(container);
    });
  }

  function selectRoute(id, scrollToMap) {
    if (!Object.prototype.hasOwnProperty.call(ROUTES, id)) return;
    selectedRoute = id;
    const data = ROUTES[id];
    $('#selected-title').textContent = data.title;
    $('#selected-description').textContent = data.description + ' Durée avec pauses : ' + data.duration + '.';
    $('#selected-access').textContent = data.accessNote;
    $('#selected-distance').textContent = data.distance.toUpperCase();
    $('#share-status').textContent = '';
    renderStops(data);

    $$('[data-select-route]').forEach(function (button) {
      const active = button.getAttribute('data-select-route') === id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const bookingSelect = $('#booking-route');
    if (bookingSelect) bookingSelect.value = data.title;

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('parcours', id);
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (_) { /* Preview contexts may not provide History APIs. */ }

    drawSelectedRoute();
    if (scrollToMap) {
      $('#carte').scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(function () {
        if (map) map.invalidateSize();
      }, 400);
    }
  }

  function fallbackCopy(value) {
    const node = document.createElement('textarea');
    node.value = value;
    node.style.position = 'fixed';
    node.style.opacity = '0';
    document.body.appendChild(node);
    node.focus();
    node.select();
    const success = document.execCommand('copy');
    node.remove();
    if (!success) throw new Error('Copie impossible');
  }

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch (_) { /* Fallback for browsers denying Clipboard API. */ }
    }
    fallbackCopy(value);
  }

  // Expose la mesure géodésique approximative pour contrôler les annonces du site.
  function routeLengthKm(path) {
    const radiusKm = 6371;
    let total = 0;
    for (let i = 1; i < path.length; i += 1) {
      const previous = path[i - 1], next = path[i], rad = Math.PI / 180;
      const lat = (next[0] - previous[0]) * rad;
      const lon = (next[1] - previous[1]) * rad;
      const a = Math.sin(lat / 2) ** 2
        + Math.cos(previous[0] * rad) * Math.cos(next[0] * rad) * Math.sin(lon / 2) ** 2;
      total += 2 * radiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return total * 2; // aller + retour
  }

  function setupRouteButtons() {
    $$('[data-show-route]').forEach(function (button) {
      button.addEventListener('click', function () {
        selectRoute(button.getAttribute('data-show-route'), true);
      });
    });
    $$('[data-select-route]').forEach(function (button) {
      button.addEventListener('click', function () {
        selectRoute(button.getAttribute('data-select-route'), false);
      });
    });
    $('#zoom-route').addEventListener('click', function () {
      if (map && routeLine) {
        map.invalidateSize();
        map.fitBounds(routeLine.getBounds(), { padding: [55, 55], maxZoom: 15 });
      } else {
        $('#share-status').textContent = 'Carte indisponible : consulte les étapes ci-dessus.';
      }
    });
    $('#share-route').addEventListener('click', async function () {
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set('parcours', selectedRoute);
      shareUrl.hash = 'carte';
      try {
        await copyText(shareUrl.href);
        $('#share-status').textContent = 'Lien du parcours copié !';
      } catch (_) {
        $('#share-status').textContent = 'Copie impossible : utilise l’adresse du navigateur.';
      }
    });
  }

  function formatFrenchDate(dateValue) {
    const parts = dateValue.split('-');
    if (parts.length !== 3) return dateValue;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function requestText(form) {
    const name = form.elements.namedItem('prenom').value.trim();
    const email = form.elements.namedItem('email').value.trim();
    const date = form.elements.namedItem('date').value;
    const guests = form.elements.namedItem('participants').value;
    const route = form.elements.namedItem('parcours').value;
    const message = form.elements.namedItem('message').value.trim();
    return 'Bonjour Nissa Beer !\n\nJe souhaite me renseigner pour une sortie :\n\n'
      + 'Prénom : ' + name + '\n'
      + 'E-mail : ' + email + '\n'
      + 'Parcours : ' + route + '\n'
      + 'Date souhaitée : ' + formatFrenchDate(date) + '\n'
      + 'Nombre de participants : ' + guests + '\n'
      + (message ? 'Informations complémentaires : ' + message + '\n' : '')
      + '\nPouvez-vous me renseigner sur les disponibilités, les modalités et le tarif ?\n\nMerci !';
  }

  function setupRequestForm() {
    const form = $('#request-form');
    const result = $('#booking-result');
    if (!form || !result) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      preparedRequest = requestText(form);
      $('#booking-preview').textContent = preparedRequest;
      const subject = 'Demande de sortie Nissa Beer';
      const recipient = CONFIG.contactEmail.trim();
      $('#email-request').href = 'mailto:' + encodeURIComponent(recipient) + '?subject='
        + encodeURIComponent(subject) + '&body=' + encodeURIComponent(preparedRequest);
      form.hidden = true;
      result.hidden = false;
      $('#copy-status').textContent = '';
      result.querySelector('h3').focus({ preventScroll: true });
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    $('#copy-request').addEventListener('click', async function () {
      try {
        await copyText(preparedRequest);
        $('#copy-status').textContent = 'Demande copiée dans le presse-papiers.';
      } catch (_) {
        $('#copy-status').textContent = 'La copie automatique a échoué. Tu peux sélectionner le texte ci-dessus.';
      }
    });

    $('#edit-request').addEventListener('click', function () {
      result.hidden = true;
      form.hidden = false;
      $('#booking-name').focus();
    });
  }

  function bootstrap() {
    const currentYear = $('#year');
    if (currentYear) currentYear.textContent = String(new Date().getFullYear());
    setTodayMin();
    setupMenu();
    initializeMap();
    setupRouteButtons();
    setupRequestForm();

    const routeInUrl = new URLSearchParams(window.location.search).get('parcours');
    Object.values(ROUTES).forEach(function (route) {
      const announced = Number(route.distance.replace(/[^\d,]/g, '').replace(',', '.'));
      if (Math.abs(routeLengthKm(route.path) - announced) > 0.16) {
        console.warn('Distance indicative à vérifier : ' + route.title);
      }
    });
    selectRoute(Object.prototype.hasOwnProperty.call(ROUTES, routeInUrl) ? routeInUrl : 'prom', false);

    // Leaflet needs to re-measure after its container changes width.
    window.addEventListener('resize', function () {
      if (map) map.invalidateSize({ debounceMoveend: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
