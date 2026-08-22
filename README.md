# Académie Shinigami — Cours RP

Cours interactif sur le Hakuda, le Zanjutsu et les tactiques de combat. Les candidats saisissent un nom ou pseudonyme, passent l'évaluation et obtiennent une correction. Les résultats sont conservés dans Supabase et consultables uniquement par les administrateurs approuvés.

## Architecture

- GitHub Pages héberge `index.html` et `admin.html`.
- Supabase Auth gère les comptes administrateurs.
- PostgreSQL stocke les profils et les tentatives avec Row Level Security.
- Les Edge Functions calculent les scores et gèrent les rôles côté serveur.

## Configuration Supabase

1. Créer un projet Supabase.
2. Lier le projet avec la CLI : `supabase link --project-ref VOTRE_REFERENCE`.
3. Appliquer la base : `supabase db push`.
4. Déployer les fonctions :
   - `supabase functions deploy submit-exam --no-verify-jwt`
   - `supabase functions deploy manage-admin`
   - `supabase functions deploy claim-owner`
5. Dans Authentication > URL Configuration, définir le site URL sur `https://ricardoalbertopro-gif.github.io/academie-shinigami-rp/` et ajouter `https://ricardoalbertopro-gif.github.io/academie-shinigami-rp/admin.html` aux URL de redirection.
6. Remplacer les deux valeurs de `config.js` par l'URL du projet et la clé publique `anon`.

## Initialiser le propriétaire

Définir l'adresse du propriétaire uniquement comme secret Edge Function avec `supabase secrets set OWNER_EMAIL=<adresse>`. À sa première connexion, la fonction `claim-owner` attribue le rôle propriétaire si aucun propriétaire n'existe encore.

Ne jamais placer la clé `service_role`, un mot de passe ou l'adresse réelle du propriétaire dans les fichiers publics.

## Vérifications locales

Les scripts navigateur peuvent être contrôlés avec :

```sh
node --check script.js
node --check admin.js
```
