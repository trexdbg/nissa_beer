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

  // Points d'intérêt géolocalisés d'après OpenStreetMap / Mapcarta et points
  // de passage routiers. Ce sont des repères, PAS une géométrie de route.
  // La géométrie réelle provient au chargement du moteur OSRM profil vélo.
  // Les routes comportent l'ALLER ET LE RETOUR pour tenir compte des sens uniques.
  const PLACES = {
    centenaire: [43.69536, 7.26781],
    negresco: [43.69412, 7.25685],
    magnan: [43.68945, 7.24410],
    lenval: [43.68944, 7.24165],
    carras: [43.67530, 7.22260],
    aeroport: [43.66790, 7.21220],
    pont: [43.663727, 7.198585],
    portLaurent: [43.65632, 7.18467],
    cros: [43.65641, 7.16418],
    hippodrome: [43.64928, 7.14537]
  };

  const ROUTES = {
    prom: {
      id: 'prom',
      title: "La Prom' Signature",
      estimate: 'env. 5–6 km',
      duration: '60–85 min',
      description: "Monument du Centenaire → Le Négresco → Magnan → Lenval → retour. Une Prom' facile à repérer avec vue mer.",
      accessNote: "Le parcours reste soumis aux règles locales et à la largeur réelle du véhicule. Retournement à étudier avec l'exploitant.",
      color: '#ee7053',
      points: ['centenaire', 'negresco', 'magnan', 'lenval'],
      stops: [
        { name: 'Monument du Centenaire · départ envisagé', place: 'centenaire' },
        { name: 'Le Négresco · patrimoine niçois', place: 'negresco' },
        { name: 'Magnan · quartier et plages', place: 'magnan' },
        { name: 'Lenval · demi-tour à confirmer', place: 'lenval' }
      ]
    },
    sunset: {
      id: 'sunset',
      title: "De la Prom' à l'aéroport",
      estimate: 'env. 12–16 km',
      duration: '1 h 45 – 2 h 30',
      description: "Du Centenaire à l'ouest de la Prom' : Magnan, Lenval, Carras et le secteur de l'aéroport, puis retour.",
      accessNote: "Les travaux, traversées et accès autour de l'aéroport sont à contrôler avant toute sortie.",
      color: '#269caf',
      points: ['centenaire', 'magnan', 'lenval', 'carras', 'aeroport'],
      stops: [
        { name: 'Monument du Centenaire · départ envisagé', place: 'centenaire' },
        { name: 'Magnan et Lenval', place: 'lenval' },
        { name: 'Secteur de Carras', place: 'carras' },
        { name: "Secteur aéroport · demi-tour à confirmer", place: 'aeroport' }
      ]
    },
    baie: {
      id: 'baie',
      title: "Cap sur l'hippodrome",
      estimate: 'env. 25–32 km',
      duration: '3 h 30 – 5 h',
      description: "Nice → Promenade des Anglais → aéroport → pont Napoléon III → Saint-Laurent-du-Var → Cros-de-Cagnes → hippodrome. Retour vers Nice.",
      accessNote: "Très long pour un vélo-bar collectif : parcours vélo touristique de référence, non proposé comme activité apéro sans étude spécifique. Pont, virages et zones partagées à vérifier.",
      color: '#d39d1f',
      points: ['centenaire', 'lenval', 'carras', 'aeroport', 'pont', 'portLaurent', 'cros', 'hippodrome'],
      stops: [
        { name: 'Monument du Centenaire · départ envisagé', place: 'centenaire' },
        { name: 'Promenade des Anglais et Lenval', place: 'lenval' },
        { name: 'Pont Napoléon III · traversée du Var', place: 'pont' },
        { name: 'Port de Saint-Laurent-du-Var', place: 'portLaurent' },
        { name: 'Cros-de-Cagnes · front de mer', place: 'cros' },
        { name: "Hippodrome Côte d'Azur · demi-tour à confirmer", place: 'hippodrome' }
      ]
    }
  };
  const ROUTING_URL = 'https://routing.openstreetmap.de/routed-bike/route/v1/driving/';
  const routeCache = new Map();
  let routeAbort = null;
  let routeSerial = 0;

  const $ = function (selector) { return document.querySelector(selector); };
  const $$ = function (selector) { return Array.from(document.querySelectorAll(selector)); };
  let selectedRoute = 'prom';
  let map = null;
  let routeLine = null;
  let routeHalo = null;
  let mapLayerControl = null;
  let activeBase = null;
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

      // Deux fonds distincts, sans clé payante : le plan topographique est plus
      // lisible, CyclOSM permet de visualiser les aménagements cyclables.
      const topo = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, OpenStreetMap contributors',
          maxZoom: 19
        }
      );
      const cycling = L.tileLayer(
        'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
          attribution: 'Données &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributeurs | Rendu &copy; CyclOSM',
          subdomains: 'abc', maxZoom: 19
        }
      );
      const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributeurs',
          maxZoom: 19
        }
      );
      topo.addTo(map);
      activeBase = topo;
      mapLayerControl = L.control.layers(
        { 'Plan clair (Esri)': topo, 'Pistes vélo (CyclOSM)': cycling, 'OpenStreetMap': osm },
        null,
        { position: 'topleft', collapsed: false }
      ).addTo(map);
      map.on('baselayerchange', function (event) { activeBase = event.layer; });
      map.setView([43.681, 7.226], 12);
    } catch (error) {
      console.warn('Nissa Beer : cartographie indisponible', error);
      map = null;
      showMapError();
    }
  }

  function routeCoordinates(data) {
    const outward = data.points.map(function (place) { return PLACES[place]; });
    // Vers le départ par le même corridor : OSRM calcule la direction retour,
    // qui peut emprunter un cheminement différent à cause des sens uniques.
    return outward.concat(outward.slice(0, -1).reverse());
  }

  function nearestVertex(reference, positions) {
    const target = L.latLng(reference);
    let bestIndex = 0;
    let bestDistance = Infinity;
    positions.forEach(function (position, index) {
      const distance = target.distanceTo(L.latLng(position));
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return { coordinate: positions[bestIndex], offsetMeters: bestDistance };
  }

  function routeStatus(message, status) {
    const target = $('#routing-status');
    if (!target) return;
    target.textContent = message;
    target.dataset.status = status;
  }

  function setDistanceLabel(data, distanceKm) {
    const value = Number.isFinite(distanceKm)
      ? '≈ ' + distanceKm.toLocaleString('fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + ' km'
      : data.estimate;
    $('#selected-distance').textContent = value.toUpperCase();
    $$('[data-select-route="' + data.id + '"] small').forEach(function (label) {
      label.textContent = 'Aller-retour · ' + value;
    });
    $$('[data-route-card="' + data.id + '"] .route-meta span:last-child').forEach(function (label) {
      label.textContent = '↔ ' + value;
    });
  }

  function clearRouteLayers() {
    if (!map) return;
    [routeLine, routeHalo].forEach(function (layer) {
      if (layer) map.removeLayer(layer);
    });
    routeLine = null;
    routeHalo = null;
    markers.forEach(function (marker) { map.removeLayer(marker); });
    markers = [];
  }

  function drawStops(data, positions) {
    if (!map) return;
    data.stops.forEach(function (stop, index) {
      const fallbackCoordinate = PLACES[stop.place];
      const nearest = positions && positions.length ? nearestVertex(fallbackCoordinate, positions) : null;
      const coords = nearest && nearest.offsetMeters < 900 ? nearest.coordinate : fallbackCoordinate;
      const icon = L.divIcon({
        className: 'nissa-marker',
        html: '<span class="map-pin' + (index === 0 ? ' is-start' : '') +
          (index === data.stops.length - 1 ? ' is-end' : '') + '">' +
          (index === data.stops.length - 1 ? '↶' : index + 1) + '</span>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      markers.push(L.marker(coords, { icon: icon }).addTo(map)
        .bindPopup('<strong>Étape ' + (index + 1) + '</strong><br>' + escapeMarkup(stop.name)));
    });
  }

  function fitVisibleRoute(data) {
    if (!map) return;
    if (routeLine) {
      map.fitBounds(routeLine.getBounds(), { padding: [40, 40], maxZoom: 15, animate: false });
    } else {
      const positions = data.points.map(function (place) { return PLACES[place]; });
      map.fitBounds(L.latLngBounds(positions), { padding: [50, 50], maxZoom: 14, animate: false });
    }
  }

  function showSuccessfulRoute(data, route) {
    if (!map || typeof window.L === 'undefined') return;
    clearRouteLayers();
    const positions = route.geometry.coordinates.map(function (point) { return [point[1], point[0]]; });
    routeHalo = L.polyline(positions, { color: '#fffdf8', weight: 11, opacity: .96 }).addTo(map);
    routeLine = L.polyline(positions, {
      color: data.color, weight: 6, opacity: .98, lineCap: 'round', lineJoin: 'round'
    }).addTo(map);
    drawStops(data, positions);
    fitVisibleRoute(data);
    const length = route.distance / 1000;
    setDistanceLabel(data, length);
    routeStatus('✓ Tracé calculé sur le réseau cyclable pour l’aller et le retour. Distance calculée : ' +
      length.toLocaleString('fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) +
      ' km. Valider les accès du véhicule sur place.', 'success');
  }

  function routingLink(data) {
    // Lien vers la carte OSM centrée sur l'arrivée, pour garder un secours
    // sans afficher de fausses lignes lorsque le routage n'est pas disponible.
    const point = PLACES[data.points[data.points.length - 1]];
    return 'https://www.openstreetmap.org/#map=14/' + point[0] + '/' + point[1];
  }

  async function drawSelectedRoute() {
    if (!map || typeof window.L === 'undefined') return;
    if (routeAbort) routeAbort.abort();
    routeAbort = new AbortController();
    const signal = routeAbort.signal;
    const serial = ++routeSerial;
    const data = ROUTES[selectedRoute];
    clearRouteLayers();
    drawStops(data, null);
    fitVisibleRoute(data);
    setDistanceLabel(data, null);
    $('#route-fallback-link').href = routingLink(data);

    if (routeCache.has(data.id)) {
      showSuccessfulRoute(data, routeCache.get(data.id));
      return;
    }
    routeStatus('Calcul de l’itinéraire vélo aller-retour en cours…', 'loading');

    const coords = routeCoordinates(data)
      .map(function (p) { return p[1].toFixed(6) + ',' + p[0].toFixed(6); }).join(';');
    const url = ROUTING_URL + coords + '?overview=full&geometries=geojson&steps=false';

    try {
      const response = await fetch(url, { signal: signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Service itinéraire indisponible (' + response.status + ')');
      const json = await response.json();
      const route = json.routes && json.routes[0];
      if (!route || !route.geometry || !Array.isArray(route.geometry.coordinates)
        || route.geometry.coordinates.length < 8
        || !Number.isFinite(route.distance) || route.distance < 3000) {
        throw new Error('Aucun trajet vélo vérifiable de plus de 3 km retourné.');
      }
      if (signal.aborted || serial !== routeSerial) return;
      routeCache.set(data.id, route);
      showSuccessfulRoute(data, route);
    } catch (error) {
      if (signal.aborted || serial !== routeSerial) return;
      console.warn('Nissa Beer : routage vélo indisponible', error);
      routeStatus('Le tracé précis n’a pas pu être chargé. Les repères sont affichés, mais aucune ligne approximative n’est dessinée. Réessaye ou ouvre OpenStreetMap.', 'error');
    }
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
    setDistanceLabel(data, routeCache.has(id) ? routeCache.get(id).distance / 1000 : null);
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
      if (map) {
        map.invalidateSize();
        fitVisibleRoute(ROUTES[selectedRoute]);
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
    const routeKey = routeInUrl === 'vieux-nice' ? 'baie' : routeInUrl;
    selectRoute(Object.prototype.hasOwnProperty.call(ROUTES, routeKey) ? routeKey : 'prom', false);

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
