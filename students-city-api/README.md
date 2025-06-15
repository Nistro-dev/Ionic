# Students City API

## Description du Projet
Students City est une API REST développée avec Symfony 7.2 qui permet aux étudiants de partager et découvrir des lieux d'intérêt dans leur ville. L'application facilite la découverte de nouveaux endroits et permet aux utilisateurs de laisser des avis et des commentaires.

### Fonctionnalités Principales
- Authentification JWT pour les utilisateurs
- Gestion des lieux
- Système d'avis et de commentaires
- Interface d'administration
- Profils utilisateurs personnalisés

## Installation et Configuration

### Prérequis
- PHP 8.2 ou supérieur
- Composer
- MySQL/MariaDB
- Symfony CLI (recommandé)

### Installation

1. Cloner le repository :
```bash
git clone "https://github.com/benj0s85/students-city-api.git"
cd students-city-api
```

2. Installer les dépendances :
```bash
composer install
```

3. Configurer la base de données :
- Copier le fichier `.env` en `.env.local`
- Modifier les variables d'environnement pour la base de données :
```
DATABASE_URL="mysql://user:password@127.0.0.1:3306/students_city?serverVersion=8.0"
```

4. Créer la base de données et exécuter les migrations :
```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

5. Générer les clés JWT :
```bash
php bin/console lexik:jwt:generate-keypair
```

6. Démarrer le serveur :
```bash
symfony server:start
```

## Utilisation de l'API avec Postman

### Configuration de l'environnement

1. Créez un nouvel environnement dans Postman avec les variables suivantes :
   - `base_url` : http://localhost:8000
   - `token` : (sera automatiquement rempli après la connexion)

### Exemples de requêtes

#### Authentification

1. **Inscription**
   - Méthode : POST
   - URL : {{base_url}}/api/register
   - Headers : 
     - Content-Type: application/json
   - Body :
   ```json
   {
       "pseudo": "example",
       "email": "user@example.com",
       "password": "password123"
   }
   ```

2. **Connexion**
   - Méthode : POST
   - URL : {{base_url}}/api/login
   - Headers : 
     - Content-Type: application/json
   - Body :
   ```json
   {
       "email": "user@example.com",
       "password": "password123"
   }
   ```

#### Lieux

1. **Lister tous les lieux**
   - Méthode : GET
   - URL : {{base_url}}/api/places
   - Headers : 
     - Authorization: Bearer {{token}}

2. **Obtenir un lieu**
   - Méthode : GET
   - URL : {{base_url}}/api/places/1
   - Headers : 
     - Authorization: Bearer {{token}}

3. **Créer un lieu**
   - Méthode : POST
   - URL : {{base_url}}/api/places
   - Headers : 
     - Authorization: Bearer {{token}}
     - Content-Type: application/json
   - Body :
   ```json
   {
       "name": "Nom du lieu",
       "description": "Description du lieu",
       "address": "Adresse du lieu"
   }
   ```

#### Avis

1. **Lister tous les avis**
   - Méthode : GET
   - URL : {{base_url}}/api/reviews
   - Headers : 
     - Authorization: Bearer {{token}}

2. **Obtenir un avis**
   - Méthode : GET
   - URL : {{base_url}}/api/reviews/1
   - Headers : 
     - Authorization: Bearer {{token}}

3. **Ajouter un avis**
   - Méthode : POST
   - URL : {{base_url}}/api/reviews
   - Headers : 
     - Authorization: Bearer {{token}}
     - Content-Type: application/json
   - Body :
   ```json
   {
       "place": 1,
       "rating": 4,
       "comment": "Excellent endroit !"
   }
   ```

#### Profil

1. **Modifier son profil**
   - Méthode : PUT
   - URL : {{base_url}}/api/profile
   - Headers : 
     - Authorization: Bearer {{token}}
     - Content-Type: application/json
   - Body :
   ```json
   {
       "pseudo": "nouveau_pseudo",
       "email": "nouveau@email.com"
   }
   ```

#### Administration

1. **Utilisateurs**
   - Lister tous les utilisateurs
     - Méthode : GET
     - URL : {{base_url}}/api/users
     - Headers : 
       - Authorization: Bearer {{token}}

   - Modifier un utilisateur
     - Méthode : PUT
     - URL : {{base_url}}/api/users/1
     - Headers : 
       - Authorization: Bearer {{token}}
       - Content-Type: application/json
     - Body :
     ```json
     {
         "roles": ["ROLE_ADMIN"]
     }
     ```

2. **Lieux**
   - Approuver un lieu
     - Méthode : POST
     - URL : {{base_url}}/api/admin/places/1/approve
     - Headers : 
       - Authorization: Bearer {{token}}

   - Rejeter un lieu
     - Méthode : POST
     - URL : {{base_url}}/api/admin/places/1/revoke
     - Headers : 
       - Authorization: Bearer {{token}}

3. **Avis**
   - Modérer un avis
     - Méthode : PUT
     - URL : {{base_url}}/api/admin/reviews/1
     - Headers : 
       - Authorization: Bearer {{token}}
       - Content-Type: application/json
     - Body :
     ```json
     {
         "status": "approved"
     }
     ```

### Collection Postman

Pour faciliter l'utilisation de l'API, vous pouvez importer la collection Postman fournie dans le projet. Cette collection contient toutes les requêtes nécessaires pour tester l'API.

1. Ouvrez Postman
2. Cliquez sur "Import"
3. Sélectionnez le fichier `postman_collection.json`
4. Sélectionnez l'environnement que vous avez créé précédemment

## Sécurité

- L'API utilise l'authentification JWT pour sécuriser les endpoints
- Les mots de passe sont hashés avec bcrypt
- Les requêtes sont validées et nettoyées
- Les CORS sont configurés pour la sécurité