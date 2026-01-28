# 📧 Guide Complet : Configuration Brevo (Sendinblue) - Option 2

## 🎯 Objectif
Configurer Brevo pour envoyer des emails depuis votre site PrestigeDrive.

**Temps estimé** : 5-10 minutes  
**Coût** : GRATUIT (300 emails/jour - 9000/mois)  
**Avantage** : Plus d'emails gratuits que SendGrid !

---

## 📝 Étape 1 : Créer un compte Brevo

1. **Allez sur** : https://www.brevo.com

2. **Cliquez sur** "Sign up free" (en haut à droite)

3. **Remplissez le formulaire** :
   - Email : Votre email (ex: votre-email@gmail.com)
   - Password : Créez un mot de passe sécurisé
   - First Name : Votre prénom
   - Last Name : Votre nom
   - Company : PrestigeDrive (ou votre nom d'entreprise)
   - Phone : Votre numéro de téléphone (optionnel)

4. **Cliquez sur** "Create my free account"

5. **Acceptez les conditions** (cochez la case)

6. **Cliquez sur** "Create account"

---

## ✅ Étape 2 : Vérifier votre email

1. **Ouvrez votre boîte mail** (celle que vous avez utilisée pour créer le compte)

2. **Cherchez un email de Brevo** (peut prendre 1-2 minutes)
   - Expéditeur : "Brevo" ou "Sendinblue"

3. **Cliquez sur le bouton** "Verify my email" dans l'email

4. **Vous serez redirigé** vers le dashboard Brevo

---

## 🔑 Étape 3 : Récupérer les identifiants SMTP

1. **Dans le dashboard Brevo**, cliquez sur votre **nom** (en haut à droite)
   - Puis cliquez sur **"SMTP & API"** dans le menu

2. **Ou allez directement** : https://app.brevo.com/settings/keys/api

3. **Vous verrez deux sections** :
   - **SMTP** (pour l'envoi d'emails)
   - **API Keys** (pour l'API, pas nécessaire pour nous)

4. **Dans la section SMTP**, vous verrez :
   - **Server** : `smtp-relay.brevo.com`
   - **Port** : `587`
   - **Login** : Votre email Brevo (ex: `votre-email@brevo.com`)

5. **Pour le mot de passe SMTP** :
   - Cliquez sur **"Generate new password"** (ou "Create SMTP password")
   - **Copiez le mot de passe** qui s'affiche
   - ⚠️ **Vous ne pourrez plus le voir après** ! Gardez-le dans un endroit sûr.

6. **Collez-le dans un fichier texte temporaire** pour ne pas le perdre

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
   - **Value** : `smtp-relay.brevo.com`
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
   - **Value** : `votre-email@brevo.com` (votre email Brevo complet)
   - Cliquez sur "Add"

   **f) Variable 5** :
   - **Name** : `SMTP_PASS`
   - **Value** : `votre-mot-de-passe-smtp-brevo` (le mot de passe SMTP que vous avez généré)
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
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@brevo.com
SMTP_PASS=votre-mot-de-passe-smtp-brevo
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
- ✅ Vérifiez que `SMTP_USER` est votre email Brevo complet (ex: `votre-email@brevo.com`)
- ✅ Vérifiez que `SMTP_PASS` est le mot de passe SMTP généré (pas votre mot de passe Brevo normal)
- ✅ Vérifiez qu'il n'y a pas d'espaces avant/après le mot de passe
- ✅ Assurez-vous d'avoir généré un nouveau mot de passe SMTP (pas votre mot de passe de connexion)

### Erreur : "Connection timeout"
- ✅ Vérifiez que `SMTP_HOST` est `smtp-relay.brevo.com` (avec le tiret)
- ✅ Vérifiez que `SMTP_PORT` est `587`
- ✅ Vérifiez que `SMTP_SECURE` est `false`

### Pas d'emails reçus
- ✅ Vérifiez les logs Railway pour voir les erreurs
- ✅ Vérifiez que votre email Brevo est vérifié
- ✅ Vérifiez que `ADMIN_EMAIL` est correct
- ✅ Vérifiez les spams
- ✅ Dans Brevo, allez dans "Email" → "Sent" pour voir si les emails ont été envoyés

### Variables non prises en compte
- ✅ Redéployez votre service après avoir ajouté les variables
- ✅ Attendez 1-2 minutes que Railway redéploie

### "SMTP password not found" ou "Invalid login"
- ✅ Vous devez générer un mot de passe SMTP spécifique dans Brevo
- ✅ Ce n'est **PAS** votre mot de passe de connexion Brevo
- ✅ Allez dans Settings → SMTP & API → SMTP → Generate new password
- ✅ Le mot de passe SMTP ressemble à : `xsmtpib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- ✅ C'est une longue chaîne de caractères générée automatiquement
- ❌ **NE PAS utiliser** le mot de passe avec lequel vous vous connectez à Brevo

---

## 📊 Vérifier l'utilisation

1. **Dans Brevo**, allez dans **"Email"** → **"Sent"** (menu de gauche)
2. **Vous verrez** tous les emails envoyés
3. **Gratuit jusqu'à** 300 emails/jour (9000/mois)

---

## 🔍 Où trouver les identifiants SMTP dans Brevo

1. **Connectez-vous** à https://app.brevo.com
2. **Cliquez sur votre nom** (en haut à droite)
3. **Cliquez sur** "SMTP & API"
4. **Ou allez directement** : https://app.brevo.com/settings/keys/api
5. **Dans la section SMTP**, vous verrez :
   - Server : `smtp-relay.brevo.com`
   - Port : `587`
   - Login : Votre email Brevo
   - Password : Cliquez sur "Generate new password" pour créer un mot de passe SMTP

---

## ✅ Checklist finale

- [ ] Compte Brevo créé
- [ ] Email vérifié
- [ ] Mot de passe SMTP généré et copié
- [ ] Variables ajoutées sur Railway (7 variables)
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

4. **Assurez-vous d'avoir généré un mot de passe SMTP** (pas votre mot de passe de connexion)

5. **Vérifiez dans Brevo** : Email → Sent pour voir si les emails sont envoyés

---

## 🎯 Résumé rapide

1. Créer compte → https://www.brevo.com
2. Vérifier email
3. Settings → SMTP & API → SMTP → Generate new password
4. Copier le mot de passe SMTP
5. Railway → Variables → Ajouter les 7 variables
6. Redéployer
7. Tester

**C'est tout !** 🎉

---

## 💡 Avantages de Brevo vs SendGrid

| Fonctionnalité | Brevo | SendGrid |
|----------------|-------|----------|
| **Emails gratuits/jour** | 300 | 100 |
| **Emails gratuits/mois** | 9000 | 3000 |
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Fiabilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Brevo offre 3x plus d'emails gratuits !** 🎉
