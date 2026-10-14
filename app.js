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

  const ROUTES = {
    prom: {
      id: 'prom',
      title: "La Prom' Signature",
      distance: '≈ 2,4 km',
      duration: '45–60 min',
      description: "Palmiers, grands hôtels et bord de mer : l'essentiel de la Promenade des Anglais.",
      color: '#ee7053',
      path: [
        [43.6949, 7.2750],
        [43.6955, 7.2722],
        [43.6959, 7.2689],
        [43.6958, 7.2657],
        [43.6954, 7.2624],
        [43.6948, 7.2598],
        [43.6940, 7.2567],
        [43.6931, 7.2510]
      ],
      stops: [
        { name: 'Quai des États-Unis', coords: [43.6949, 7.2750] },
        { name: 'Jardin Albert 1er', coords: [43.6959, 7.2689] },
        { name: 'Palais de la Méditerranée', coords: [43.6954, 7.2624] },
        { name: 'Hôtel Negresco', coords: [43.6940, 7.2567] },
        { name: 'Plage du Voilier', coords: [43.6931, 7.2510] }
      ]
    },
    sunset: {
      id: 'sunset',
      title: 'Sunset sur la Baie',
      distance: '≈ 2,6 km',
      duration: '50–70 min',
      description: "Vers l'ouest de la Baie des Anges : panorama ouvert et couchers de soleil.",
      color: '#299eae',
      path: [
        [43.6931, 7.2510],
        [43.6922, 7.2489],
        [43.6910, 7.2467],
        [43.6895, 7.2440],
        [43.6880, 7.2409],
        [43.6868, 7.2377],
        [43.6848, 7.2344],
        [43.6832, 7.2317]
      ],
      stops: [
        { name: 'Plage du Voilier', coords: [43.6931, 7.2510] },
        { name: 'Plage Florida', coords: [43.6910, 7.2467] },
        { name: 'Magnan', coords: [43.6895, 7.2440] },
        { name: 'Hôpital Lenval (front de mer)', coords: [43.6868, 7.2377] },
        { name: 'Plage Carras', coords: [43.6832, 7.2317] }
      ]
    },
    'vieux-nice': {
      id: 'vieux-nice',
      title: 'Nice Carte Postale',
      distance: '≈ 1,5 km',
      duration: '40–60 min',
      description: "Du jardin Albert 1er au quai des États-Unis, jusqu'au point de vue de Rauba Capèu.",
      color: '#d39d1f',
      path: [
        [43.6959, 7.2689],
        [43.6957, 7.2708],
        [43.6952, 7.2730],
        [43.6945, 7.2756],
        [43.6935, 7.2771],
        [43.6923, 7.2785],
        [43.6909, 7.2804]
      ],
      stops: [
        { name: 'Jardin Albert 1er', coords: [43.6959, 7.2689] },
        { name: 'Quai des États-Unis', coords: [43.6945, 7.2756] },
        { name: 'Vieux-Nice (visite à pied à proximité)', coords: [43.6935, 7.2771] },
        { name: 'Rauba Capèu — point de vue', coords: [43.6909, 7.2804] }
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
        html: '<span class="map-pin' + (index === 0 ? ' is-start' : '') + '">' + (index + 1) + '</span>',
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
    $('#selected-description').textContent = data.description + ' Durée indicative : ' + data.duration + '.';
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
    selectRoute(ROUTES[routeInUrl] ? routeInUrl : 'prom', false);

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
