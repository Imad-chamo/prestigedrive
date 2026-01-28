# 📧 Guide Complet : Configuration SendGrid (Option 1)

## 🎯 Objectif
Configurer SendGrid pour envoyer des emails depuis votre site PrestigeDrive.

**Temps estimé** : 5-10 minutes  
**Coût** : GRATUIT (100 emails/jour)

---

## 📝 Étape 1 : Créer un compte SendGrid

1. **Allez sur** : https://sendgrid.com

2. **Cliquez sur** "Start for free" (en haut à droite)

3. **Remplissez le formulaire** :
   - Email : Votre email (ex: votre-email@gmail.com)
   - Password : Créez un mot de passe sécurisé
   - First Name : Votre prénom
   - Last Name : Votre nom
   - Company : PrestigeDrive (ou votre nom d'entreprise)

4. **Cliquez sur** "Create Account"

5. **Acceptez les conditions** (cochez la case)

6. **Cliquez sur** "Get Started"

---

## ✅ Étape 2 : Vérifier votre email

1. **Ouvrez votre boîte mail** (celle que vous avez utilisée pour créer le compte)

2. **Cherchez un email de SendGrid** (peut prendre 1-2 minutes)

3. **Cliquez sur le bouton** "Verify Email" dans l'email

4. **Vous serez redirigé** vers le dashboard SendGrid

---

## 🔑 Étape 3 : Créer une API Key

1. **Dans le dashboard SendGrid**, cliquez sur votre **nom** (en haut à droite)
   - Puis cliquez sur **"Settings"** dans le menu déroulant

2. **Dans le menu de gauche**, cliquez sur **"API Keys"**

3. **Cliquez sur** "Create API Key" (bouton vert en haut à droite)

4. **Remplissez le formulaire** :
   - **API Key Name** : `PrestigeDrive` (ou un nom de votre choix)
   - **API Key Permissions** : 
     - ✅ Sélectionnez **"Full Access"** (ou "Restricted Access" → "Mail Send" seulement)
   
5. **Cliquez sur** "Create & View"

6. **⚠️ IMPORTANT** : 
   - **COPIEZ la clé API** qui s'affiche (elle commence par `SG.`)
   - **Exemple** : `SG.abcdefghijklmnopqrstuvwxyz.1234567890`
   - ⚠️ **Vous ne pourrez plus la voir après** ! Gardez-la dans un endroit sûr.

7. **Collez-la dans un fichier texte temporaire** pour ne pas la perdre

---

## 🚂 Étape 4 : Configurer sur Railway

### Option A : Via l'interface Railway (Recommandé)

1. **Allez sur** https://railway.app

2. **Connectez-vous** à votre compte

3. **Sélectionnez votre projet** PrestigeDrive

4. **Cliquez sur votre service** (celui qui héberge votre application)

5. **Allez dans l'onglet** "Variables" (dans le menu de gauche)

6. **Ajoutez chaque variable** une par une :

   **a) Cliquez sur** "+ New Variable"
   
   **b) Variable 1** :
   - **Name** : `SMTP_HOST`
   - **Value** : `smtp.sendgrid.net`
   - Cliquez sur "Add"

   **c) Variable 2** :
   - **Name** : `SMTP_PORT`
   - **Value** : `587`
   - Cliquez sur "Add"

   **d) Variable 3** :
   - **Name** : `SMTP_SECURE`
   - **Value** : `false`
   - Cliquez sur "Add"

   **e) Variable 4** :
   - **Name** : `SMTP_USER`
   - **Value** : `apikey`
   - Cliquez sur "Add"

   **f) Variable 5** :
   - **Name** : `SMTP_PASS`
   - **Value** : `SG.votre-cle-api-ici` (remplacez par votre vraie clé API SendGrid)
   - Cliquez sur "Add"

   **g) Variable 6** :
   - **Name** : `SMTP_FROM`
   - **Value** : `contact@prestigedrive.fr` (ou votre email)
   - Cliquez sur "Add"

   **h) Variable 7** :
   - **Name** : `ADMIN_EMAIL`
   - **Value** : `votre-email@gmail.com` (votre email pour recevoir les notifications)
   - Cliquez sur "Add"

7. **Redéployez votre service** :
   - Cliquez sur l'onglet "Deployments"
   - Cliquez sur "Redeploy" (ou attendez que Railway redéploie automatiquement)

### Option B : Via le fichier .env (Local uniquement)

Si vous testez en local, créez un fichier `.env` à la racine du projet :

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre-cle-api-ici
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

⚠️ **Ne commitez jamais** le fichier `.env` dans Git !

---

## 🧪 Étape 5 : Tester la configuration

### Sur Railway :

1. **Allez dans l'onglet** "Logs" de votre service Railway

2. **Cherchez** dans les logs :
   - ✅ `Service email initialisé avec succès`
   - ✅ `Connexion SMTP vérifiée avec succès`
   - ✅ `Service email: Activé`

### En local :

```bash
npm run test-email
```

Vous devriez voir :
```
✅ Service email initialisé avec succès
✅ Connexion SMTP vérifiée avec succès
✅ Email de test envoyé avec succès !
```

---

## 🎉 Étape 6 : Vérifier que ça fonctionne

1. **Allez sur votre site** PrestigeDrive

2. **Remplissez le formulaire de devis** avec votre email

3. **Soumettez le formulaire**

4. **Vérifiez votre boîte mail** :
   - Vous devriez recevoir un email de confirmation
   - L'admin devrait recevoir une notification

---

## ❌ Problèmes courants

### Erreur : "Invalid login"
- ✅ Vérifiez que `SMTP_USER` est bien `apikey` (en minuscules)
- ✅ Vérifiez que `SMTP_PASS` est votre vraie clé API SendGrid (commence par `SG.`)
- ✅ Vérifiez qu'il n'y a pas d'espaces avant/après la clé

### Erreur : "Connection timeout"
- ✅ Vérifiez que `SMTP_HOST` est `smtp.sendgrid.net`
- ✅ Vérifiez que `SMTP_PORT` est `587`
- ✅ Vérifiez que `SMTP_SECURE` est `false`

### Pas d'emails reçus
- ✅ Vérifiez les logs Railway pour voir les erreurs
- ✅ Vérifiez que votre email SendGrid est vérifié
- ✅ Vérifiez que `ADMIN_EMAIL` est correct
- ✅ Vérifiez les spams

### Variables non prises en compte
- ✅ Redéployez votre service après avoir ajouté les variables
- ✅ Attendez 1-2 minutes que Railway redéploie

---

## 📊 Vérifier l'utilisation

1. **Dans SendGrid**, allez dans **"Activity"** (menu de gauche)
2. **Vous verrez** tous les emails envoyés
3. **Gratuit jusqu'à** 100 emails/jour

---

## ✅ Checklist finale

- [ ] Compte SendGrid créé
- [ ] Email vérifié
- [ ] API Key créée et copiée
- [ ] Variables ajoutées sur Railway
- [ ] Service redéployé
- [ ] Test réussi (`npm run test-email`)
- [ ] Email de test reçu

---

## 🆘 Besoin d'aide ?

Si vous avez des problèmes :

1. **Utilisez le diagnostic** :
   ```bash
   npm run diagnostic-email
   ```

2. **Vérifiez les logs Railway** pour voir les erreurs exactes

3. **Vérifiez que toutes les variables sont bien ajoutées** sur Railway

4. **Assurez-vous d'avoir redéployé** après avoir ajouté les variables

---

## 🎯 Résumé rapide

1. Créer compte → https://sendgrid.com
2. Vérifier email
3. Settings → API Keys → Create API Key
4. Copier la clé (SG.xxx...)
5. Railway → Variables → Ajouter les 7 variables
6. Redéployer
7. Tester

**C'est tout !** 🎉
