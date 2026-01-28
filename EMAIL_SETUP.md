# 📧 Configuration Email - Guide Simple

## 🎯 Configuration Rapide

Pour activer l'envoi d'emails, ajoutez ces variables dans **Railway → Variables** :

### Option 1 : Brevo (Recommandé - 300 emails/jour gratuits)

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@brevo.com
SMTP_PASS=votre-mot-de-passe-smtp-brevo
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

**Comment obtenir le mot de passe SMTP Brevo** :
1. Allez sur https://app.brevo.com
2. Settings → SMTP & API → SMTP
3. Cliquez sur "Générer une nouvelle clé SMTP"
4. Copiez le mot de passe généré

### Option 2 : SendGrid (100 emails/jour gratuits)

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre-cle-api-sendgrid
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

**Comment obtenir la clé API SendGrid** :
1. Allez sur https://app.sendgrid.com
2. Settings → API Keys → Create API Key
3. Copiez la clé API (commence par SG.)

---

## ✅ Après Configuration

1. Redéployez votre service sur Railway
2. Vérifiez les logs : vous devriez voir `✅ Service email initialisé avec succès`
3. Testez en soumettant le formulaire sur votre site

---

## ❌ Si ça ne fonctionne pas

- Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs
- Vérifiez l'orthographe exacte de SMTP_HOST
- Vérifiez que SMTP_PORT est 587 et SMTP_SECURE est false
- Redéployez après avoir modifié les variables
