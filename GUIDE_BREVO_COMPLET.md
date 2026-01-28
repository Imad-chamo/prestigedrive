# 📧 Guide Complet : Configuration Brevo (Option 1)

## 🎯 Objectif
Configurer Brevo pour envoyer des emails depuis votre site PrestigeDrive.

**Gratuit** : 300 emails/jour (9000/mois)  
**Temps** : 10 minutes

---

## 📝 ÉTAPE 1 : Créer un compte Brevo

1. **Allez sur** : https://www.brevo.com

2. **Cliquez sur** "Sign up free" (en haut à droite)

3. **Remplissez le formulaire** :
   - **Email** : Votre email (ex: votre-email@gmail.com)
   - **Password** : Créez un mot de passe sécurisé
   - **First Name** : Votre prénom
   - **Last Name** : Votre nom
   - **Company** : PrestigeDrive
   - **Phone** : Votre numéro (optionnel)

4. **Cliquez sur** "Create my free account"

5. **Acceptez les conditions** (cochez la case)

6. **Cliquez sur** "Create account"

---

## ✅ ÉTAPE 2 : Vérifier votre email

1. **Ouvrez votre boîte mail** (celle que vous avez utilisée pour créer le compte)

2. **Cherchez un email de Brevo** (peut prendre 1-2 minutes)
   - Expéditeur : "Brevo" ou "Sendinblue"

3. **Cliquez sur le bouton** "Verify my email" dans l'email

4. **Vous serez redirigé** vers le dashboard Brevo

---

## 🔑 ÉTAPE 3 : Générer le mot de passe SMTP

### 3.1 Accéder aux paramètres SMTP

1. **Dans le dashboard Brevo**, cliquez sur votre **nom** (en haut à droite)
2. **Cliquez sur** "SMTP & API" dans le menu déroulant

   **OU** allez directement : https://app.brevo.com/settings/keys/api

### 3.2 Trouver la section SMTP

Vous verrez deux sections :
- **SMTP** (pour l'envoi d'emails) ← C'est celle-ci qu'il vous faut
- **API Keys** (pour l'API, pas nécessaire)

### 3.3 Générer le mot de passe SMTP

Dans la section **SMTP**, vous verrez :
- **Server** : `smtp-relay.brevo.com`
- **Port** : `587`
- **Login** : Votre email Brevo (ex: `votre-email@brevo.com`)

**Pour le mot de passe SMTP** :

1. **Cherchez le bouton** :
   - "Générer une nouvelle clé SMTP"
   - "Generate new password"
   - "Create SMTP password"
   - Ou une icône de clé 🔑

2. **Cliquez dessus**

3. **Un nouveau mot de passe SMTP sera généré**
   - Il ressemble à : `xsmtpib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - C'est une longue chaîne de caractères (30-40 caractères)
   - ⚠️ **COPIEZ-LE IMMÉDIATEMENT** - vous ne pourrez plus le voir après !

4. **Collez-le dans un fichier texte temporaire** pour ne pas le perdre

### 3.4 Si vous avez déjà une clé SMTP

Si vous voyez une clé SMTP existante masquée avec des `*` :
- Cliquez sur **"Show"** ou **"Afficher"** ou **👁️** pour la révéler
- Ou générez-en une nouvelle avec "Générer une nouvelle clé SMTP"

---

## 🚂 ÉTAPE 4 : Configurer sur Railway

### 4.1 Accéder aux variables Railway

1. **Allez sur** https://railway.app

2. **Connectez-vous** à votre compte

3. **Sélectionnez votre projet** PrestigeDrive

4. **Cliquez sur votre service** (celui qui héberge votre application)

5. **Allez dans l'onglet** "Variables" (dans le menu de gauche)

### 4.2 Supprimer les anciennes variables (si elles existent)

1. **Cherchez** toutes les variables qui commencent par `SMTP_`
2. **Supprimez-les** une par une (cliquez sur la poubelle 🗑️)

### 4.3 Ajouter les nouvelles variables

**Ajoutez chaque variable une par une** :

#### Variable 1 : SMTP_HOST
- **Cliquez sur** "+ New Variable"
- **Name** : `SMTP_HOST`
- **Value** : `smtp-relay.brevo.com`
- **Cliquez sur** "Add"

#### Variable 2 : SMTP_PORT
- **Cliquez sur** "+ New Variable"
- **Name** : `SMTP_PORT`
- **Value** : `587`
- **Cliquez sur** "Add"

#### Variable 3 : SMTP_SECURE
- **Cliquez sur** "+ New Variable"
- **Name** : `SMTP_SECURE`
- **Value** : `false`
- **Cliquez sur** "Add"

#### Variable 4 : SMTP_USER
- **Cliquez sur** "+ New Variable"
- **Name** : `SMTP_USER`
- **Value** : `votre-email@brevo.com` (remplacez par votre email Brevo complet)
- **Cliquez sur** "Add"

#### Variable 5 : SMTP_PASS
- **Cliquez sur** "+ New Variable"
- **Name** : `SMTP_PASS`
- **Value** : `xsmtpib-xxxxxxxxxxxxxxxx...` (collez le mot de passe SMTP que vous avez copié)
- **Cliquez sur** "Add"

#### Variable 6 : SMTP_FROM
- **Cliquez sur** "+ New Variable"
- **Name** : `SMTP_FROM`
- **Value** : `contact@prestigedrive.fr` (ou votre email)
- **Cliquez sur** "Add"

#### Variable 7 : ADMIN_EMAIL
- **Cliquez sur** "+ New Variable"
- **Name** : `ADMIN_EMAIL`
- **Value** : `votre-email@gmail.com` (votre email pour recevoir les notifications)
- **Cliquez sur** "Add"

### 4.4 Vérifier les variables

Vous devriez avoir exactement **7 variables** :
```
✅ SMTP_HOST
✅ SMTP_PORT
✅ SMTP_SECURE
✅ SMTP_USER
✅ SMTP_PASS
✅ SMTP_FROM
✅ ADMIN_EMAIL
```

### 4.5 Redéployer le service

1. **Cliquez sur l'onglet** "Deployments"
2. **Cliquez sur** "Redeploy" (ou attendez que Railway redéploie automatiquement)
3. **Attendez** 1-2 minutes que le déploiement se termine

---

## 🧪 ÉTAPE 5 : Vérifier que ça fonctionne

### 5.1 Vérifier les logs Railway

1. **Allez dans l'onglet** "Logs" de votre service Railway

2. **Cherchez ces messages** au démarrage :

```
✅ Service email initialisé avec succès
📧 Service email: Activé
```

**Si vous voyez** :
- ❌ `⚠️ Configuration email non trouvée` → Les variables ne sont pas bien configurées
- ❌ `❌ Erreur de vérification SMTP` → Problème avec les identifiants

### 5.2 Tester en soumettant le formulaire

1. **Allez sur votre site** PrestigeDrive

2. **Remplissez le formulaire de devis** avec votre email

3. **Soumettez le formulaire**

4. **Regardez les logs Railway** immédiatement après

**Si ça fonctionne**, vous verrez :
```
✅ Email de confirmation envoyé au client: <message-id>
✅ Notification admin envoyée: <message-id>
```

### 5.3 Vérifier dans Brevo

1. **Allez sur** https://app.brevo.com
2. **Allez dans** Email → Sent (menu de gauche)
3. **Vérifiez** si les emails apparaissent ici

**Si les emails apparaissent** :
- ✅ L'envoi fonctionne !
- Vérifiez votre boîte mail (et les spams)

**Si les emails n'apparaissent pas** :
- ❌ Le problème vient de l'envoi (configuration)

### 5.4 Vérifier votre boîte mail

1. **Vérifiez les spams** :
   - Gmail : Onglet "Spam"
   - Outlook : Dossier "Courrier indésirable"
   - Autres : Cherchez dans les dossiers de spam

2. **Vérifiez que** `ADMIN_EMAIL` est correct dans Railway

---

## ❌ Problèmes courants et solutions

### Erreur : "Configuration email non trouvée"

**Solution** :
- Vérifiez que toutes les 7 variables sont bien ajoutées sur Railway
- Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs
- Redéployez le service après avoir ajouté les variables

### Erreur : "Invalid login" ou "Authentication failed"

**Solution** :
- ✅ Vérifiez que `SMTP_USER` est votre email Brevo complet (ex: `votre-email@brevo.com`)
- ✅ Vérifiez que `SMTP_PASS` est le mot de passe SMTP généré (pas votre mot de passe de connexion Brevo)
- ✅ Vérifiez qu'il n'y a pas d'espaces avant/après le mot de passe
- ✅ Générez un nouveau mot de passe SMTP dans Brevo si nécessaire

### Erreur : "Connection timeout"

**Solution** :
- ✅ Vérifiez que `SMTP_HOST` est `smtp-relay.brevo.com` (avec le tiret, pas d'espaces)
- ✅ Vérifiez que `SMTP_PORT` est `587`
- ✅ Vérifiez que `SMTP_SECURE` est `false`
- ✅ Redéployez le service

### Pas d'emails reçus

**Solution** :
- ✅ Vérifiez les spams
- ✅ Vérifiez que `ADMIN_EMAIL` est correct
- ✅ Vérifiez dans Brevo → Email → Sent si les emails sont envoyés
- ✅ Si les emails apparaissent dans Brevo mais pas dans votre boîte mail → problème de réception (spam, filtres)

---

## 📋 Checklist finale

- [ ] Compte Brevo créé
- [ ] Email vérifié
- [ ] Mot de passe SMTP généré et copié
- [ ] Anciennes variables SMTP supprimées sur Railway
- [ ] 7 nouvelles variables ajoutées sur Railway
- [ ] Service redéployé sur Railway
- [ ] Logs Railway montrent "Service email: Activé"
- [ ] Test réussi (formulaire soumis)
- [ ] Emails apparaissent dans Brevo → Email → Sent
- [ ] Emails reçus dans la boîte mail (vérifier spams)

---

## 🎯 Résumé des valeurs à utiliser

**Dans Railway → Variables**, ajoutez exactement :

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@brevo.com
SMTP_PASS=votre-mot-de-passe-smtp-brevo
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

**Remplacez** :
- `votre-email@brevo.com` par votre email Brevo
- `votre-mot-de-passe-smtp-brevo` par le mot de passe SMTP généré
- `votre-email@gmail.com` par votre email pour les notifications

---

## 💡 Astuces

1. **Générez un nouveau mot de passe SMTP** si vous avez des doutes
2. **Copiez le mot de passe immédiatement** après l'avoir généré
3. **Vérifiez qu'il n'y a pas d'espaces** avant/après les valeurs dans Railway
4. **Redéployez toujours** après avoir modifié les variables
5. **Vérifiez les spams** si vous ne recevez pas les emails

---

## 🆘 Besoin d'aide ?

Si vous avez des problèmes :
1. Vérifiez les logs Railway pour voir les erreurs exactes
2. Vérifiez dans Brevo → Email → Sent si les emails sont envoyés
3. Vérifiez que toutes les 7 variables sont bien configurées
4. Redéployez le service après chaque modification

---

**C'est tout !** Une fois configuré, les emails seront envoyés automatiquement quand quelqu'un remplit le formulaire sur votre site. 🎉
