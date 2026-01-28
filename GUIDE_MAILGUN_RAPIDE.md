# 🚀 Guide Rapide : Configurer Mailgun (10 minutes)

## 🎯 Objectif

Configurer Mailgun pour envoyer des emails depuis votre application sur Render.

**Temps** : 10 minutes  
**Difficulté** : Facile  
**Coût** : Gratuit (5000 emails/mois pendant 3 mois)

---

## ✅ ÉTAPE 1 : Créer un Compte Mailgun (3 minutes)

1. **Allez sur** : https://www.mailgun.com
2. **Cliquez sur** "Sign Up" (en haut à droite)
3. **Remplissez le formulaire** :
   - Email : Votre email
   - Password : Créez un mot de passe
   - First Name : Votre prénom
   - Last Name : Votre nom
   - Company : PrestigeDrive
4. **Cliquez sur** "Create Account"
5. **Vérifiez votre email** (cherchez un email de Mailgun)

---

## ✅ ÉTAPE 2 : Utiliser le Sandbox (2 minutes)

1. **Dans Mailgun**, allez dans **Sending** → **Domains** (menu de gauche)
2. **Vous verrez** un domaine sandbox automatique : `sandboxXXXXX.mailgun.org`
   - Exemple : `sandbox123456789.mailgun.org`
3. **Cliquez dessus** pour voir les détails
4. **Pas besoin de configurer DNS** - le sandbox fonctionne directement !

---

## ✅ ÉTAPE 3 : Obtenir les Credentials SMTP (2 minutes)

1. **Dans Mailgun**, allez dans **Sending** → **Domain Settings** (pour votre sandbox)
2. **Trouvez la section** "SMTP credentials" ou "SMTP"
3. **Vous verrez** :
   - **SMTP Hostname** : `smtp.mailgun.org`
   - **Default SMTP Login** : `postmaster@sandboxXXXXX.mailgun.org`
   - **Default Password** : Cliquez sur **"Show"** ou **"Reveal"** pour voir le mot de passe
4. **Copiez ces informations** dans un fichier texte temporaire

**Exemple** :
```
SMTP Hostname: smtp.mailgun.org
SMTP Login: postmaster@sandbox123456789.mailgun.org
SMTP Password: abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## ✅ ÉTAPE 4 : Configurer dans Render (2 minutes)

1. **Allez sur Render** → Votre Service → **Environment**
2. **Modifiez ou ajoutez ces variables** :

### **Variable 1 : SMTP_HOST**
- **Key** : `SMTP_HOST`
- **Value** : `smtp.mailgun.org`

### **Variable 2 : SMTP_PORT**
- **Key** : `SMTP_PORT`
- **Value** : `587`

### **Variable 3 : SMTP_SECURE**
- **Key** : `SMTP_SECURE`
- **Value** : `false`

### **Variable 4 : SMTP_USER**
- **Key** : `SMTP_USER`
- **Value** : `postmaster@sandboxXXXXX.mailgun.org` (remplacez par votre vrai sandbox)

### **Variable 5 : SMTP_PASS**
- **Key** : `SMTP_PASS`
- **Value** : Votre mot de passe Mailgun (celui que vous avez révélé)

### **Variable 6 : SMTP_FROM**
- **Key** : `SMTP_FROM`
- **Value** : `contact@prestigedrive.fr` (ou votre email)

### **Variable 7 : ADMIN_EMAIL**
- **Key** : `ADMIN_EMAIL`
- **Value** : `prestigedrive61@gmail.com` (ou votre email admin)

**Important** :
- ✅ Pas d'espaces avant/après les valeurs
- ✅ Remplacez `sandboxXXXXX` par votre vrai sandbox ID
- ✅ Le mot de passe Mailgun est long (30-40 caractères)

---

## ✅ ÉTAPE 5 : Redéployer et Tester (1 minute)

1. **Render redéploiera automatiquement** quand vous modifiez les variables
2. **Attendez** 1-2 minutes que le déploiement se termine
3. **Vérifiez les logs Render** - vous devriez voir :
   ```
   📧 Configuration SMTP: smtp.mailgun.org:587 (secure: false)
   📧 User: postmaster@sandboxXXXXX.mailgun.org
   🧪 Test de vérification SMTP...
   ✅ SMTP Brevo OK - Connexion vérifiée avec succès
   ✅ Service email initialisé avec succès
   ```

4. **Testez avec le formulaire** :
   - Allez sur votre site Render
   - Remplissez le formulaire
   - Soumettez

5. **Vérifiez les logs Render** - vous devriez voir :
   ```
   ✅ EMAIL CLIENT ENVOYÉ AVEC SUCCÈS
   ```

6. **Vérifiez votre boîte email** - vous devriez recevoir l'email !

---

## ✅ ÉTAPE 6 : Vérifier dans Mailgun

1. **Allez sur** https://app.mailgun.com
2. **Cliquez sur** **"Sending"** → **"Logs"** (dans le menu de gauche)
3. **Vous devriez voir** vos emails envoyés dans la liste
4. **Vous pouvez voir** :
   - Le statut (Delivered, Bounced, etc.)
   - Le destinataire
   - La date d'envoi
   - Les détails complets

---

## 📊 Résumé des Variables

Après configuration, vous devriez avoir dans Render :

```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@sandbox123456789.mailgun.org
SMTP_PASS=votre-mot-de-passe-mailgun-complet
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=prestigedrive61@gmail.com
```

---

## ✅ Checklist

- [ ] J'ai créé un compte Mailgun
- [ ] J'ai vérifié mon email Mailgun
- [ ] J'ai trouvé mon domaine sandbox dans Mailgun
- [ ] J'ai copié les credentials SMTP (hostname, login, password)
- [ ] J'ai configuré toutes les variables dans Render
- [ ] Render a redéployé automatiquement
- [ ] J'ai vérifié les logs - "✅ SMTP Brevo OK"
- [ ] J'ai testé avec le formulaire
- [ ] J'ai vérifié les logs - "✅ EMAIL CLIENT ENVOYÉ AVEC SUCCÈS"
- [ ] J'ai reçu l'email dans ma boîte email ✅
- [ ] J'ai vérifié Mailgun → Logs pour voir l'historique

---

## 🆘 Problèmes Courants

### **Problème 1 : "Invalid login"**

**Cause** : `SMTP_USER` incorrect

**Solution** : Vérifiez que `SMTP_USER` est exactement `postmaster@sandboxXXXXX.mailgun.org` (avec votre vrai sandbox ID)

### **Problème 2 : "Authentication failed"**

**Cause** : Mot de passe SMTP incorrect

**Solution** :
1. Allez dans Mailgun → Domain Settings
2. Cliquez sur "Show" pour révéler le mot de passe
3. Copiez-le exactement (sans espaces)
4. Mettez-le dans Render → `SMTP_PASS`

### **Problème 3 : Toujours des timeouts**

**Solution** :
1. Vérifiez que `SMTP_HOST=smtp.mailgun.org` (pas `smtp-relay.brevo.com`)
2. Vérifiez que `SMTP_PORT=587`
3. Vérifiez que `SMTP_SECURE=false`
4. Attendez quelques minutes et réessayez

---

## 💡 Avantages de Mailgun

1. ✅ **Fonctionne très bien avec Render** - Pas de timeouts
2. ✅ **Gratuit** - 5000 emails/mois pendant 3 mois
3. ✅ **Sandbox facile** - Pas besoin de configurer DNS pour tester
4. ✅ **Dashboard** - Vous voyez tous vos emails envoyés
5. ✅ **Fiabilité** - Infrastructure robuste

---

## 🎉 Félicitations !

Une fois configuré, Mailgun devrait fonctionner parfaitement avec Render et vous devriez recevoir vos emails !

**Mailgun est généralement la solution la plus fiable** quand Brevo, SendGrid et Resend SMTP ne fonctionnent pas. 🚀

---

**Suivez les étapes ci-dessus et testez - Mailgun devrait fonctionner !** ✅
