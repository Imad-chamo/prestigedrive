# 🔑 Brevo : Mot de passe SMTP vs Mot de passe de connexion

## ⚠️ IMPORTANT : Deux mots de passe différents !

Brevo utilise **DEUX mots de passe différents** :

### 1️⃣ Mot de passe de connexion Brevo
- **Utilisé pour** : Se connecter à votre compte Brevo (https://app.brevo.com)
- **Où le trouver** : Vous l'avez créé lors de l'inscription
- **❌ NE PAS utiliser** ce mot de passe dans `SMTP_PASS`

### 2️⃣ Mot de passe SMTP (pour l'envoi d'emails)
- **Utilisé pour** : Envoyer des emails via SMTP depuis votre application
- **Où le trouver** : Vous devez le générer dans Brevo
- **✅ UTILISER** ce mot de passe dans `SMTP_PASS`

---

## 🔍 Comment trouver le mot de passe SMTP dans Brevo

### Méthode 1 : Via Settings

1. **Connectez-vous** à https://app.brevo.com
2. **Cliquez sur votre nom** (en haut à droite)
3. **Cliquez sur** "SMTP & API"
4. **Ou allez directement** : https://app.brevo.com/settings/keys/api

5. **Dans la section SMTP**, vous verrez :
   - **Server** : `smtp-relay.brevo.com`
   - **Port** : `587`
   - **Login** : Votre email Brevo (ex: `votre-email@brevo.com`)

6. **Pour le mot de passe SMTP** :
   - Cherchez le bouton **"Generate new password"** ou **"Create SMTP password"** ou **"SMTP password"**
   - Cliquez dessus
   - **Un nouveau mot de passe SMTP sera généré**
   - Il ressemble à : `xsmtpib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Copiez-le immédiatement** (vous ne pourrez plus le voir après)

### Méthode 2 : Si vous ne voyez pas le bouton

1. **Allez dans** Settings → SMTP & API
2. **Cherchez** la section "SMTP"
3. **Si vous voyez déjà un mot de passe** affiché :
   - C'est peut-être masqué avec des `*`
   - Cliquez sur **"Show"** ou **"Reveal"** pour le voir
   - Ou générez-en un nouveau avec **"Generate new password"**

---

## 📋 Configuration dans Railway

Une fois que vous avez le mot de passe SMTP :

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@brevo.com        ← Votre email Brevo
SMTP_PASS=xsmtpib-xxxxxxxxxxxxxxxx...   ← Le mot de passe SMTP généré (PAS votre mot de passe de connexion)
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

---

## ❌ Erreurs courantes

### Erreur : "Invalid login"

**Cause** : Vous utilisez votre mot de passe de connexion Brevo au lieu du mot de passe SMTP

**Solution** :
1. Allez dans Brevo → Settings → SMTP & API → SMTP
2. Générez un nouveau mot de passe SMTP
3. Utilisez ce mot de passe SMTP dans `SMTP_PASS` (pas votre mot de passe de connexion)

### Erreur : "SMTP password not found"

**Cause** : Vous n'avez pas encore généré de mot de passe SMTP

**Solution** :
1. Allez dans Brevo → Settings → SMTP & API → SMTP
2. Cliquez sur "Generate new password"
3. Copiez le mot de passe généré
4. Utilisez-le dans `SMTP_PASS`

---

## 🔍 Comment reconnaître le mot de passe SMTP

Le mot de passe SMTP Brevo :
- ✅ Commence souvent par `xsmtpib-` ou similaire
- ✅ Est une longue chaîne de caractères (30-40 caractères)
- ✅ Est généré automatiquement par Brevo
- ✅ Ne peut pas être changé manuellement (vous devez en générer un nouveau)

Le mot de passe de connexion Brevo :
- ❌ Est celui que vous avez créé lors de l'inscription
- ❌ Est celui que vous utilisez pour vous connecter à https://app.brevo.com
- ❌ NE DOIT PAS être utilisé dans `SMTP_PASS`

---

## ✅ Checklist

- [ ] Je me suis connecté à Brevo avec mon mot de passe de connexion
- [ ] J'ai généré un mot de passe SMTP spécifique dans Brevo
- [ ] J'ai copié le mot de passe SMTP généré
- [ ] J'ai utilisé le mot de passe SMTP (pas mon mot de passe de connexion) dans `SMTP_PASS` sur Railway
- [ ] J'ai redéployé le service sur Railway

---

## 💡 Astuce

Si vous n'êtes pas sûr :
1. **Générez un nouveau mot de passe SMTP** dans Brevo
2. **Copiez-le immédiatement**
3. **Utilisez-le dans Railway** → Variables → `SMTP_PASS`
4. **Redéployez** le service

C'est le moyen le plus sûr de s'assurer d'utiliser le bon mot de passe !
