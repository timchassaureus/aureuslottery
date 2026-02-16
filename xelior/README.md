## Xelior – Plateforme d’investissement dans les talents (version étudiants)

Xelior est une plateforme qui permet à des investisseurs de financer des **étudiants** (frais de scolarité, vie étudiante, reconversion, etc.) en échange d’un **pourcentage de leurs revenus futurs** pendant une durée donnée.

L’idée de base :

- Les **étudiants** lèvent des fonds (ex : 20k–50k€) en vendant quelques pourcents de leurs revenus futurs.
- Les **investisseurs** construisent un portefeuille de talents et touchent un pourcentage des revenus futurs de chaque étudiant financé.

Ce dépôt ne contient pour l’instant que l’architecture de départ et la documentation.  
Le code applicatif (front + back) sera ajouté progressivement.

---

### Objectifs v1 (MVP)

- Page d’accueil Xelior (présentation du concept).
- Espace **Étudiant** :
  - Création de profil.
  - Description du parcours, de la filière, des besoins de financement.
- Espace **Investisseur** :
  - Parcourir les profils.
  - Voir les besoins de financement et les conditions (% de revenus, durée, etc.).

---

### Pistes techniques (à affiner)

- Framework : Next.js + TypeScript.
- Authentification : email d’abord (OAuth plus tard).
- Base de données : à définir (PostgreSQL / SQLite au début).
- Tracking revenus : conçu pour intégrer plus tard des APIs bancaires et/ou fiscales.

---

### Prochaine étape

1. Définir précisément le **MVP étudiants** (ce qui doit absolument exister pour tester l’idée).
2. Scaffolder l’application (Next.js) dans ce dossier `xelior/`.
3. Créer :
   - Une première page d’accueil.
   - Un formulaire de profil étudiant.
   - Une page de listing pour les investisseurs.

Tu peux maintenant me dire ce que tu veux voir en premier dans Xelior (par exemple : la page d’accueil, ou le profil étudiant), et je construirai directement le code dans ce dossier.

