# 🚀 Alternatives Simples pour l'Envoi d'Emails

Si Gmail ne fonctionne pas, voici **3 alternatives GRATUITES et FACILES** à configurer :

---

## 🥇 Option 1 : SendGrid (LE PLUS SIMPLE - Recommandé)

**Gratuit** : 100 emails/jour (3000/mois)

### 📖 Guide Complet

**👉 Consultez [GUIDE_SENDGRID.md](GUIDE_SENDGRID.md) pour un guide étape par étape détaillé !**

### Étapes rapides (5 minutes) :

1. **Créer un compte** : https://sendgrid.com
   - Cliquez sur "Start for free"
   - Inscrivez-vous avec votre email

2. **Vérifier votre email** (important !)
   - Vérifiez votre boîte mail et cliquez sur le lien de vérification

3. **Créer une API Key** :
   - Dans le dashboard SendGrid, allez dans **Settings** → **API Keys**
   - Cliquez sur **Create API Key**
   - Nom : `PrestigeDrive`
   - Permissions : **Full Access** (ou "Mail Send" seulement)
   - **Copiez la clé API** (vous ne pourrez plus la voir après !)

4. **Configurer sur Railway** :
   - Allez dans votre projet Railway → **Variables**
   - Ajoutez ces variables :

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

⚠️ **Important** : Remplacez `SG.xxxxxxxx...` par votre vraie clé API SendGrid !

5. **Redéployez** votre service sur Railway

6. **Testez** : `npm run test-email`

**📖 Pour plus de détails, voir [GUIDE_SENDGRID.md](GUIDE_SENDGRID.md)**

✅ **Avantages** :
- Configuration en 5 minutes
- Pas besoin de validation en 2 étapes
- Très fiable
- Statistiques d'envoi
- Gratuit jusqu'à 100 emails/jour

---

## 🥈 Option 2 : Brevo (Sendinblue) - TRÈS FACILE

**Gratuit** : 300 emails/jour (9000/mois) - **3x plus que SendGrid !**

### 📖 Guide Complet

**👉 Consultez [GUIDE_BREVO.md](GUIDE_BREVO.md) pour un guide étape par étape détaillé !**

### Étapes rapides (5 minutes) :

1. **Créer un compte** : https://www.brevo.com
   - Cliquez sur "Sign up free"
   - Inscrivez-vous

2. **Vérifier votre email**

3. **Récupérer les identifiants SMTP** :
   - Allez dans **Settings** → **SMTP & API**
   - Cliquez sur **SMTP**
   - Vous verrez :
     - **Server** : `smtp-relay.brevo.com`
     - **Port** : `587`
     - **Login** : Votre email Brevo
     - **Password** : Cliquez sur "Generate new password" pour créer un mot de passe SMTP

4. **Configurer sur Railway** :

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@brevo.com
SMTP_PASS=votre-mot-de-passe-smtp-brevo
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

5. **Redéployez** et testez

**📖 Pour plus de détails, voir [GUIDE_BREVO.md](GUIDE_BREVO.md)**

✅ **Avantages** :
- 300 emails/jour gratuits (le plus généreux !)
- Interface très simple
- Très fiable
- Pas de configuration compliquée

---

## 🥉 Option 3 : Mailgun - Pour les développeurs

**Gratuit** : 5000 emails/mois (pendant 3 mois, puis payant)

### Étapes :

1. **Créer un compte** : https://www.mailgun.com
2. **Vérifier votre domaine** (peut prendre quelques minutes)
3. **Récupérer les identifiants SMTP** :
   - Dashboard → **Sending** → **SMTP credentials**
   - Copiez le mot de passe SMTP

4. **Configurer** :

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@mg.votre-domaine.com
SMTP_PASS=votre-mot-de-passe-mailgun
SMTP_FROM=contact@votre-domaine.com
ADMIN_EMAIL=votre-email@gmail.com
```

---

## 📊 Comparaison Rapide

| Service | Gratuit | Facilité | Recommandation |
|---------|---------|----------|----------------|
| **SendGrid** | 100/jour | ⭐⭐⭐⭐⭐ | ✅ **MEILLEUR CHOIX** |
| **Brevo** | 300/jour | ⭐⭐⭐⭐⭐ | ✅ Excellent |
| **Mailgun** | 5000/mois | ⭐⭐⭐ | Bon pour début |
| **Gmail** | Illimité | ⭐⭐ | ❌ Problèmes fréquents |

---

## 🎯 Recommandation Finale

**Utilisez SendGrid** :
- ✅ Le plus simple à configurer
- ✅ Très fiable
- ✅ 100 emails/jour suffisent largement pour un site VTC
- ✅ Pas de complications

**Étapes rapides SendGrid** :
1. Créer compte → https://sendgrid.com
2. Créer API Key → Settings → API Keys → Create
3. Copier la clé (commence par `SG.`)
4. Ajouter dans Railway :
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=SG.votre-cle-api
   SMTP_FROM=contact@prestigedrive.fr
   ADMIN_EMAIL=votre-email@gmail.com
   ```
5. Redéployer
6. Tester : `npm run test-email`

---

## ❓ Besoin d'aide ?

Si vous avez des problèmes :
1. Utilisez `npm run diagnostic-email` pour voir les erreurs
2. Vérifiez que toutes les variables sont bien ajoutées sur Railway
3. Vérifiez que vous avez bien copié la clé API (sans espaces)
4. Redéployez après avoir ajouté les variables
