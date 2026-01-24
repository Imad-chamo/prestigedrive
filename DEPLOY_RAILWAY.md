# 🚀 Déployer sur Railway - Guide Simple

## 📋 Prérequis

1. ✅ Compte GitHub (avec votre projet)
2. ✅ Compte Railway (gratuit) : [railway.app](https://railway.app)
3. ✅ Compte MongoDB Atlas (gratuit) : [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## 🎯 Étape 1 : Mettre le Projet sur GitHub

Si ce n'est pas déjà fait :

```bash
# Dans le dossier de votre projet
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
git push -u origin main
```

**💡 Besoin d'aide ?** Consultez les guides GitHub.

---

## 🚂 Étape 2 : Créer un Compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur **"Start a New Project"**
3. Connectez-vous avec **GitHub**
4. Autorisez Railway à accéder à vos repositories

---

## 📦 Étape 3 : Déployer depuis GitHub

1. Dans Railway, cliquez sur **"New Project"**
2. Sélectionnez **"Deploy from GitHub repo"**
3. Choisissez votre repository : `prestigedrive` (ou le nom de votre repo)
4. Railway détecte automatiquement que c'est un projet Node.js
5. Cliquez sur **"Deploy Now"**

**⏱️ Attendez 2-3 minutes** pendant que Railway :
- Installe les dépendances (`npm install`)
- Démarre votre application (`npm start`)

---

## 🔧 Étape 4 : Configurer les Variables d'Environnement

Une fois le déploiement démarré :

1. Cliquez sur votre projet dans Railway
2. Cliquez sur l'onglet **"Variables"**
3. Ajoutez ces variables :

### Variables Obligatoires

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prestigedrive
```

**💡 Comment obtenir MONGODB_URI ?**
- Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Créez un cluster gratuit (M0)
- Cliquez sur **"Connect"** → **"Connect your application"**
- Copiez la connection string
- Remplacez `<password>` par votre mot de passe MongoDB
- Remplacez `<dbname>` par `prestigedrive`

### Variables Optionnelles

```env
PORT=3000
NODE_ENV=production
```

### Variables Email (Optionnel - pour envoyer des emails)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_SECURE=false
```

**💡 Pour Gmail :** Utilisez un "App Password" (pas votre mot de passe normal)

### Variables Stripe (Optionnel - pour les paiements)

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🌐 Étape 5 : Obtenir votre URL

1. Dans Railway, cliquez sur votre service
2. Cliquez sur l'onglet **"Settings"**
3. Dans **"Domains"**, vous verrez votre URL :
   - Exemple : `prestigedrive-production.up.railway.app`

**✅ Votre site est en ligne !**

---

## 🔒 Étape 6 : Configurer un Domaine Personnalisé (Optionnel)

1. Dans **"Settings"** → **"Domains"**
2. Cliquez sur **"Custom Domain"**
3. Entrez votre domaine : `prestigedrive.fr`
4. Suivez les instructions pour configurer les DNS

**💡 DNS Configuration :**
- Type : `CNAME`
- Name : `@` ou `www`
- Value : `votre-projet.up.railway.app`

---

## 🔄 Mettre à Jour votre Site

À chaque fois que vous poussez du code sur GitHub :

```bash
git add .
git commit -m "Description des changements"
git push
```

**Railway déploie automatiquement !** 🚀

---

## 📊 Voir les Logs

1. Dans Railway, cliquez sur votre service
2. Cliquez sur l'onglet **"Deployments"**
3. Cliquez sur un déploiement pour voir les logs

**💡 Utile pour déboguer !**

---

## 🐛 Problèmes Courants

### ❌ "Build failed"
- Vérifiez que `package.json` contient `"start": "node server.js"`
- Vérifiez que `server.js` existe
- Vérifiez les logs dans Railway

### ❌ "Application crashed"
- Vérifiez que `MONGODB_URI` est bien configuré
- Vérifiez les logs dans Railway
- Vérifiez que MongoDB Atlas autorise toutes les IPs (0.0.0.0/0)

### ❌ "Port already in use"
- Railway gère automatiquement le port via `process.env.PORT`
- Ne définissez pas de port fixe dans votre code

### ❌ "MongoDB connection failed"
- Vérifiez votre `MONGODB_URI` dans Railway
- Vérifiez que votre IP est autorisée dans MongoDB Atlas
- Dans MongoDB Atlas : **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)

---

## 💰 Tarification Railway

**Plan Gratuit (Hobby) :**
- ✅ $5 de crédit gratuit par mois
- ✅ Déploiements illimités
- ✅ Domaine Railway gratuit
- ✅ HTTPS automatique
- ⚠️ Application s'endort après 30 min d'inactivité

**Plan Pro ($20/mois) :**
- ✅ Pas de sommeil
- ✅ Plus de ressources
- ✅ Support prioritaire

**💡 Pour un site en production, le plan Pro est recommandé.**

---

## ✅ Checklist de Déploiement

- [ ] Projet sur GitHub
- [ ] Compte Railway créé
- [ ] Projet déployé depuis GitHub
- [ ] Variable `MONGODB_URI` configurée
- [ ] MongoDB Atlas configuré (IP autorisée)
- [ ] Site accessible via l'URL Railway
- [ ] Test du formulaire de devis
- [ ] Test de l'interface admin (`/chauffeur.html`)

---

## 🎉 C'est Fait !

Votre site PrestigeDrive est maintenant en ligne sur Railway ! 🚀

**Prochaines étapes :**
- Configurer un domaine personnalisé
- Configurer les emails (SMTP)
- Configurer Stripe pour les paiements
- Optimiser les performances

---

## 📞 Support

- **Railway Docs** : [docs.railway.app](https://docs.railway.app)
- **Railway Discord** : [discord.gg/railway](https://discord.gg/railway)
- **MongoDB Atlas Docs** : [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

**Bon déploiement ! 🚀**
