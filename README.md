# Nissa Beer ☀️🍺🚲

Site vitrine statique du concept **Nissa Beer**, un vélo-bar collectif imaginé à Nice : découverte touristique, convivialité et pauses apéro sur la Côte d'Azur.

**URL du site après activation de GitHub Pages :** https://trexdbg.github.io/nissa_beer/

## Contenu

- Page d'accueil responsive avec présentation du concept et illustration originale en SVG.
- Trois itinéraires vélo aller-retour de plus de 3 km, de la Promenade des Anglais à l'hippodrome de Cagnes-sur-Mer ; distances recalculées par le moteur vélo lorsque celui-ci est disponible.
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

### Parcours littoraux révisés (octobre 2026)

**Tous les circuits font plus de 3 km**, aller-retour compris. La carte ne dessine plus de segments « à vol d'oiseau » dans l'eau.

| Parcours | Étapes principales | Estimation AR avant calcul | Temps indicatif avec pauses |
| --- | --- | ---: | ---: |
| La Prom' Signature | Centenaire → Négresco → Magnan → Lenval → retour | 5–6 km | 60–85 min |
| De la Prom' à l'aéroport | Centenaire → Magnan → Lenval → Carras → secteur aéroport → retour | 12–16 km | 1 h 45 à 2 h 30 |
| Cap sur l'hippodrome | Centenaire → Lenval → aéroport → pont Napoléon III → port de Saint-Laurent → Cros-de-Cagnes → hippodrome → retour | 25–32 km | 3 h 30 à 5 h |

Ces fourchettes sont des **estimations préalables**, pas des distances mesurées. Lorsque le calcul d'itinéraire fonctionne, la page affiche une **distance effective recalculée** à partir de l'itinéraire aller ET retour proposé sur le réseau vélo OSM ; des sens uniques peuvent rendre les deux sens différents.

#### Carte et routage

- Leaflet avec trois fonds : **Esri World Topo** (plan plus lisible, par défaut), **CyclOSM** (aménagements pour cyclistes) et **OpenStreetMap**.
- Au clic sur un circuit, appel HTTP (depuis le navigateur) à `routing.openstreetmap.de/routed-bike/route/v1/driving` (moteur OSRM, **profil cycliste**).
- Le calcul emprunte des points de passage et les routes/piétonniers autorisés d'après les données OSM ; les jalons affichés sont projetés sur la polyligne routée lorsqu'ils sont proches.
- Les trajets calculés sont mis en cache pendant la session de la page.
- Si le service de routage ne répond pas, les points d'intérêt restent visibles **sans fausse polyligne**. Un lien permet de regarder les lieux sur OSM.
- Les anciennes URL de parcours (`?parcours=vieux-nice`) restent compatibles et affichent la nouvelle grande balade (`?parcours=baie`).

#### Limites impératives

**Ces itinéraires sont conçus pour la découverte à vélo classique.** Le moteur vélo peut suggérer des pistes étroites, voies piétons/vélos, passages à sens contraint, et des sections inadaptées voire interdites à un véhicule collectif lourd et large. Le parcours long **jusqu'à Cagnes-sur-Mer** est un exemple touristique, pas un engagement de service de vélo-bar. Il faut un repérage sur place et une validation juridique/technique avec les municipalités concernées, notamment concernant le pont, l'aéroport, le demi-tour, la largeur, l'exploitation commerciale, le nombre de passagers et les pauses apéritives.

**Routage public : prototype uniquement.** Le service public FOSSGIS impose notamment au plus une requête par seconde, une attribution correcte, une absence d'usage lourd et est destiné à un usage léger/non-commercial. Pour une activité commerciale publique, utiliser un moteur hébergé par Nissa Beer ou un prestataire avec licence/SLA adapté ; ne pas s'appuyer durablement sur la disponibilité de ce serveur de démonstration. Source : [FOSSGIS — routage et politique d'usage](https://routing.openstreetmap.de/about.html).

#### Références géographiques / retours terrain

- [La Méditerranée à Vélo (EuroVelo 8), étape Cannes–Nice](https://www.lamediterraneeavelo.com/itineraire/cannes-nice), qui emprunte la baie, le pont et le littoral cagnois.
- [AF3V — Description détaillée de la Littorale / EuroVelo 8](https://www.af3v.org/les-voies-vertes/voies/289-ev8-la-mediterranee-a-velo-de-cannes-a-nice/).
- [Ville de Cagnes-sur-Mer — Le vélo](https://ville.cagnes.fr/circulation/le-velo/) : promenade de l'Hippodrome et promenade de la Plage sur l'EuroVelo 8, piste à 10 km/h et forte fréquentation.
- [Ville de Nice — Se déplacer à vélo](https://www.nice.fr/mobilite/se-deplacer/en-velo/).
- [Forum r/nicefrance — cohabitation piétons / vélos](https://www.reddit.com/r/nicefrance/comments/1p6hec3/) : retours d'usagers utiles au repérage.
- [Mapcarta / OpenStreetMap — Monument du Centenaire](https://mapcarta.com/fr/W572928734), [Lenval](https://mapcarta.com/fr/W140260289), [port Saint-Laurent-du-Var](https://mapcarta.com/fr/34548550) et [hippodrome Côte d'Azur](https://mapcarta.com/fr/W524648113).
- [Hydroportail — Pont Napoléon III](https://www.reperesdecrues.developpement-durable.gouv.fr/site/pont-napoleon-iii) : position de la traversée.

## Technologie

HTML5, CSS3, JavaScript sans framework, [Leaflet 1.9.4](https://leafletjs.com/), tuiles Esri World Topo / CyclOSM / © [OpenStreetMap](https://www.openstreetmap.org/copyright) et serveur OSRM vélo à usage de prototype et photographie de [Nick Page sur Unsplash](https://unsplash.com/photos/a-beach-with-a-lot-of-people-on-it-M2u_fRfluME). La carte et les polices nécessitent une connexion internet ; le reste du site reste consultable sans ces ressources.

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
