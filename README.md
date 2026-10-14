# Nissa Beer ☀️🍺🚲

Site vitrine statique du concept **Nissa Beer**, un vélo-bar collectif imaginé à Nice : découverte touristique, convivialité et pauses apéro sur la Côte d'Azur.

**URL du site après activation de GitHub Pages :** https://trexdbg.github.io/nissa_beer/

## Contenu

- Page d'accueil responsive avec présentation du concept et illustration originale en SVG.
- Trois itinéraires de visite **indicatifs** autour de la Promenade des Anglais, avec étapes et durées approximatives.
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
- ?parcours=vieux-nice

Les lignes sur la carte relient des points d'intérêt **à titre schématique**, elles **ne constituent pas un calcul d'itinéraire cyclable** ni une confirmation que le passage est autorisé à un véhicule spécifique.

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
