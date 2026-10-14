# Nissa Beer ☀️🍺🚲

Site vitrine statique du concept **Nissa Beer**, un vélo-bar collectif imaginé à Nice : découverte touristique, convivialité et pauses apéro sur la Côte d'Azur.

**URL du site après activation de GitHub Pages :** https://trexdbg.github.io/nissa_beer/

## Contenu

- Page d'accueil responsive avec présentation du concept et illustration originale en SVG.
- Trois itinéraires **aller-retour** sur la Promenade des Anglais, avec étapes touristiques repérées, temps de visite et distances approximatives recalculées d'après les repères GPS.
- Carte interactive Leaflet + OpenStreetMap : sélection des trois tracés, marqueurs, recentrage et partage par URL.
- Formulaire pour **préparer une demande**, sans serveur et sans conservation des données.
- FAQ, mentions de prévention et crédits de la photographie.

## Publication sur GitHub Pages

Le site est prêt à être servi directement depuis la racine de la branche main (aucune compilation).

1. Ouvrir le dépôt GitHub puis **Settings**.
2. Dans le menu de gauche, cliquer sur **Pages**.
3. Dans **Build and deployment**, choisir **Deploy from a branch**.
4. Sélectionner **main** et **/(root)** puis cliquer sur **Save**.
5. Attendre le déploiement. L'adresse sera normalement https://trexdbg.github.io/nissa_beer/.

Les mises à jour de main seront ensuite publiées automatiquement. Les fichiers sont référencés en chemins relatifs pour fonctionner à l'URL /nissa_beer/.

## Configuration du contact / demandes

Le formulaire fonctionne dans le navigateur : il génère un récapitulatif, permet de le copier ou d'ouvrir la messagerie avec le sujet et le corps du message préremplis. **Il n'envoie pas de demande au serveur et n'effectue aucune réservation.**

Pour préremplir aussi l'adresse du destinataire, éditer le début de app.js :

    const CONFIG = {
      contactEmail: 'adresse-professionnelle@exemple.fr'
    };

Remplacer cet exemple par une **véritable** adresse Nissa Beer. Ne pas publier une adresse fictive. Pour enregistrer les demandes en ligne ou confirmer une réservation, prévoir plus tard un service de formulaire / réservation externe ou une API.

## Personnalisation des itinéraires

Les parcours (noms, points GPS, étapes, textes, couleurs) sont regroupés dans l'objet ROUTES de app.js. La sélection est accessible via :

- ?parcours=prom
- ?parcours=sunset
- ?parcours=baie (l'ancien lien ?parcours=vieux-nice redirige vers cette nouvelle balade)

### Itinéraires révisés (octobre 2026)

Toutes les distances sont données pour **l'aller et le retour sur la même portion**. Les tracés montrés sur la carte ne représentent que **l'aller**, donc ne forment pas une boucle géographique complète.

| Parcours | Aller proposé | Aller-retour estimé | Durée avec arrêts |
| --- | --- | ---: | ---: |
| La Prom' Signature | Monument du Centenaire → Palais de la Méditerranée → Hôtel Negresco | ≈ 1,6 km | 35–50 min |
| Sunset vers Lenval | Hôtel Negresco → Voilier → Magnan → Lenval | ≈ 2,9 km | 45–65 min |
| La Baie Grand Angle | Monument du Centenaire → Negresco → Magnan → Lenval → plage de Carras | ≈ 6,5 km | 75–110 min |

La carte utilise des repères géographiques relevés à partir des coordonnées des sites et du littoral, **pas** les points géométriques exacts d'un cheminement calculé par Geovelo/OSM. Les distances affichées sont des estimations géodésiques (somme des segments à vol d'oiseau rapprochés × 2) et peuvent sous-estimer le trajet réellement praticable.

**À ne pas interpréter comme des voies autorisées pour le vélo-bar** : la géométrie et le statut juridique d'un pédalo-bar sur roues, les largeurs, priorités de passage, intersections, accès des véhicules hors gabarit, zones d'arrêt et manœuvres de demi-tour restent à expertiser avec les autorités locales. Aucune halte apéro ne doit empiéter sur une piste cyclable ou sur un espace interdit.

### Sources et retours terrain consultés

- [Ville de Nice : En vélo — itinéraires patrimoniaux](https://www.nice.fr/mobilite/se-deplacer/en-velo/) et [Plan Vélo](https://www.nice.fr/plan-velo/) : front de mer cyclable et fréquentation importante de la Promenade.
- [Ville de Nice : restrictions de circulation](https://www.nice.fr/restrictions-importantes-de-circulation/) : voies cyclables parfois fermées pendant des événements.
- [Tribunal administratif de Nice (2024)](https://nice.tribunal-administratif.fr/decisions-de-justice/dernieres-decisions/annulation-du-sens-unique-sur-l-axe-de-circulation-reliant-la-promenade-des-anglais-au-port-lympia) : changements réglementaires à l'est de la Promenade.
- [Forum r/nicefrance — quai des États-Unis (novembre 2025)](https://www.reddit.com/r/nicefrance/comments/1p6hec3/) : plusieurs usagers rapportent des conflits piétons/vélos. Cet axe a donc été retiré des balades vélo-bar proposées.
- [Forum r/nicefrance — conseils vélo (février 2026)](https://www.reddit.com/r/nicefrance/comments/1qxiw2m/) : le front de mer est cité comme l'option plane, plus adaptée aux sorties faciles que les voies vers les collines.
- Repères GPS contrôlés sur [Mapcarta / OpenStreetMap (Monument du Centenaire)](https://mapcarta.com/fr/W572928734), [Palais de la Méditerranée](https://mapcarta.com/fr/30699624), [Le Negresco](https://mapcarta.com/fr/25319046), [Lenval](https://mapcarta.com/fr/27637266) et [Plage Carras](https://mapcarta.com/fr/W487779939).

Pour un itinéraire **prêt à suivre** en vélo classique, passer par le calculateur [Geovelo](https://geovelo.app/) et inspecter la circulation sur place. Une validation spécifique sera nécessaire avant tout usage par Nissa Beer.

Les lignes sur la carte visualisent un axe touristique indicatif : elles **ne constituent ni un calcul d'itinéraire GPS utilisable tel quel, ni une confirmation que le passage est autorisé à un véhicule spécifique**.

## Technologie

HTML5, CSS3, JavaScript sans framework, [Leaflet 1.9.4](https://leafletjs.com/), tuiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) et photographie de [Nick Page sur Unsplash](https://unsplash.com/photos/a-beach-with-a-lot-of-people-on-it-M2u_fRfluME). La carte et les polices nécessitent une connexion internet ; le reste du site reste consultable sans ces ressources.

## Important avant exploitation commerciale

Le site est une présentation du **concept en préparation**, pas une annonce de service déjà autorisé. Vérifier notamment auprès des autorités compétentes :

- Autorisation de circulation et dimensions / homologation du vélo-bar collectif sur chaque voie.
- Règles municipales d'occupation du domaine public, de nuisance et, le cas échéant, autorisations d'événement.
- Licence ou autorisation appropriée au service et à la vente de bière, hygiène, assurance et responsabilité.
- Encadrement de l'activité, contrôle de majorité et prévention des risques liés à l'alcool.

Références utiles :
- [Ville de Nice — Se déplacer à vélo](https://www.nice.fr/mobilite/se-deplacer/en-velo/)
- [Ville de Nice — Commerce local et débits de boissons](https://www.nice.fr/commerce-local/)
- [Métropole — Voirie et espaces publics](https://www.nicecotedazur.org/services/voirie-et-espaces-publics/vos-demarches/)

L'abus d'alcool est dangereux pour la santé, à consommer avec modération. La consommation d'alcool par les mineurs est interdite. Aucune consommation pendant le déplacement.
