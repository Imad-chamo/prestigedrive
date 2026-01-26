# 🚗 PrestigeDrive - Application VTC

Application complète de gestion de demandes de devis pour service VTC avec interface chauffeur.

## 📋 Description

PrestigeDrive est une application web complète permettant :
- **Site vitrine** : Présentation des services VTC
- **Formulaire de devis** : Clients peuvent demander un devis en ligne
- **Interface chauffeur** : Gestion des demandes, devis et statuts
- **Système d'authentification** : Protection de l'interface admin
- **PWA** : Application installable sur mobile

## 🏗️ Structure du Projet

```
Chamkhi-VTC/
├── config/              # Configuration (base de données, etc.)
│   └── database.js
├── controllers/         # Contrôleurs (logique métier)
├── docs/               # Documentation
│   ├── INSTALLATION_MONGODB.md
│   ├── CONFIGURATION_MONGODB.md
│   └── ...
├── middleware/         # Middlewares Express
├── models/             # Modèles Mongoose
│   └── Demande.js
├── public/             # Fichiers statiques (frontend)
│   ├── index.html      # Site principal
│   ├── chauffeur.html # Interface admin
│   ├── login.html     # Page de connexion
│   ├── css/
│   ├── js/
│   └── ...
├── routes/             # Routes API
├── scripts/            # Scripts utilitaires
│   └── migrate-to-mongodb.js
├── server.js           # Point d'entrée
├── .env               # Variables d'environnement (à créer)
├── .env.example       # Exemple de configuration
├── package.json
└── README.md
```

## 🚀 Installation

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Compte MongoDB Atlas (gratuit)

### Étapes

1. **Cloner le projet**
```bash
git clone <repository-url>
cd Chamkhi-VTC
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env et ajouter votre MONGODB_URI
```

4. **Migrer les données (optionnel)**
```bash
npm run migrate
```

5. **Démarrer le serveur**
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📚 Documentation

Toute la documentation est disponible dans le dossier `docs/` :

- **[Installation MongoDB](docs/INSTALLATION_MONGODB.md)** - Guide complet pour configurer MongoDB Atlas
- **[Configuration MongoDB](docs/CONFIGURATION_MONGODB.md)** - Configuration de la connexion
- **[Options Base de Données](docs/OPTIONS_DATABASE.md)** - Comparaison des solutions de BDD
- **[Améliorations](docs/AMELIORATIONS.md)** - Liste des améliorations apportées

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine avec :

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prestigedrive

# Serveur
PORT=3000
NODE_ENV=development

# JWT (pour l'authentification admin)
JWT_SECRET=votre-secret-jwt-tres-securise

# SMTP (Email) - ⚠️ OBLIGATOIRE pour que les emails fonctionnent
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
ADMIN_EMAIL=votre-email@gmail.com
```

**📧 Configuration Email** : Voir [CONFIGURATION_EMAIL.md](CONFIGURATION_EMAIL.md) pour un guide complet.

### MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit (M0)
3. Créer un utilisateur de base de données
4. Autoriser votre IP dans Network Access
5. Copier la connection string dans `.env`

Voir [docs/INSTALLATION_MONGODB.md](docs/INSTALLATION_MONGODB.md) pour les détails.

## 🎯 Fonctionnalités

### Site Principal (`/`)
- ✅ Page d'accueil avec présentation des services
- ✅ Formulaire de demande de devis
- ✅ Calculateur de prix
- ✅ Carte interactive
- ✅ Design responsive et moderne

### Interface Chauffeur (`/chauffeur.html`)
- ✅ Authentification sécurisée
- ✅ Liste des demandes avec filtres
- ✅ Statistiques en temps réel
- ✅ Gestion des statuts (Nouvelle, En cours, Terminée)
- ✅ Envoi de devis
- ✅ Recherche et tri
- ✅ Badge "Urgent" pour demandes anciennes
- ✅ PWA installable sur mobile

### API REST (`/api/demandes`)
- `GET /api/demandes` - Liste toutes les demandes
- `GET /api/demandes/:id` - Détails d'une demande
- `POST /api/demandes` - Créer une demande
- `PUT /api/demandes/:id` - Mettre à jour une demande
- `PATCH /api/demandes/:id/status` - Changer le statut
- `POST /api/demandes/:id/repondre` - Envoyer un devis
- `DELETE /api/demandes/:id` - Supprimer une demande

## 🔒 Sécurité

- ✅ Rate limiting (100 requêtes/minute)
- ✅ Validation et sanitization des entrées
- ✅ Protection XSS
- ✅ Authentification pour l'interface admin
- ✅ Variables d'environnement pour les secrets

## 📦 Technologies

- **Backend** : Node.js, Express, MongoDB (Mongoose)
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Base de données** : MongoDB Atlas
- **PWA** : Service Worker, Manifest

## 🚀 Déploiement

### OVH Cloud

1. **Préparer le serveur**
   - Node.js installé
   - MongoDB Atlas configuré
   - Variables d'environnement configurées

2. **Déployer**
   ```bash
   git pull
   npm install --production
   npm start
   ```

3. **Utiliser PM2** (recommandé)
   ```bash
   npm install -g pm2
   pm2 start server.js --name prestigedrive
   pm2 save
   pm2 startup
   ```

### Variables d'environnement en production

Assurez-vous de définir :
- `MONGODB_URI` : Votre connexion MongoDB
- `NODE_ENV=production`
- `PORT` : Port du serveur (généralement 3000)
- **Variables SMTP** : Voir [CONFIGURATION_EMAIL.md](CONFIGURATION_EMAIL.md) pour configurer l'envoi d'emails

## 📝 Scripts Disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement (nodemon)
npm run migrate    # Migrer les données JSON vers MongoDB
npm run test-email # Tester la configuration email
```

## 🐛 Dépannage

### Erreur de connexion MongoDB
- Vérifiez votre `MONGODB_URI` dans `.env`
- Vérifiez que votre IP est autorisée dans MongoDB Atlas
- Vérifiez vos identifiants

### Port déjà utilisé
- Changez le `PORT` dans `.env`
- Ou arrêtez le processus utilisant le port

### Emails ne fonctionnent pas
- Vérifiez que les variables SMTP sont configurées (voir [CONFIGURATION_EMAIL.md](CONFIGURATION_EMAIL.md))
- Testez la configuration avec `npm run test-email`
- Vérifiez les logs du serveur pour les erreurs détaillées

## 📄 Licence

ISC

## 👥 Auteur

PrestigeDrive

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024
# prestigedrive



# prestigedrive
# prestigedrive
