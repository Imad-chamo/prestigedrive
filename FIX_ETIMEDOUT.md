# 🔧 Fix : ETIMEDOUT - Connection Timeout

## ❌ Problème Actuel

Vous voyez cette erreur :
```
❌ Erreur lors de l'envoi de l'email au client: Connection timeout
   Code: ETIMEDOUT
```

**Cela signifie** : Railway ne peut pas établir une connexion avec le serveur SMTP de Brevo.

---

## ✅ Solution 1 : Essayer le Port 465 (SSL) - RECOMMANDÉ

Le port 465 avec SSL est souvent **plus fiable** sur Railway que le port 587.

### **Étape 1 : Modifier les Variables Railway**

Allez sur **Railway → Variables** et modifiez :

```
SMTP_PORT=465          ← Changez de 587 à 465
SMTP_SECURE=true      ← Changez de false à true
```

**Gardez les autres variables identiques** :
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_USER=a10697001@smtp-brevo.com
SMTP_PASS=votre-mot-de-passe-smtp
```

### **Étape 2 : Redéployer**

1. **Redéployez** le service sur Railway
2. **Attendez** que le déploiement se termine

### **Étape 3 : Tester**

1. **Soumettez le formulaire** sur votre site
2. **Vérifiez les logs Railway**
3. **Vous devriez voir** : `✅ Email de confirmation envoyé au client`

---

## ✅ Solution 2 : Vérifier les Variables Exactes

**Dans Railway → Variables**, vérifiez que chaque variable est **exactement** :

```
SMTP_HOST=smtp-relay.brevo.com
```

**PAS** :
- ❌ `SMTP_HOST = smtp-relay.brevo.com` (espaces)
- ❌ `SMTP_HOST=smtp-relay.brevo.com ` (espace après)
- ❌ `SMTP_HOST= smtp-relay.brevo.com` (espace avant)
- ❌ `SMTP_HOST=smtprelay.brevo.com` (sans tiret)

**Vérifiez aussi** :
- ✅ Pas d'espaces avant/après `SMTP_USER`
- ✅ Pas d'espaces avant/après `SMTP_PASS`
- ✅ `SMTP_PORT` est un nombre (587 ou 465)
- ✅ `SMTP_SECURE` est exactement `true` ou `false` (pas de guillemets)

---

## ✅ Solution 3 : Vérifier le Mot de Passe SMTP

Le mot de passe SMTP doit être :
- ✅ **Le mot de passe généré dans Brevo** (pas votre mot de passe de connexion)
- ✅ Une longue chaîne (30-40 caractères)
- ✅ Commence souvent par `xsmtpib-`
- ✅ **Pas d'espaces avant/après**

### **Comment vérifier dans Brevo** :

1. Allez sur https://app.brevo.com
2. **Settings** → **SMTP & API** → **SMTP**
3. **Vérifiez** que votre clé SMTP est **Active**
4. **Cliquez sur** l'icône 👁️ pour révéler le mot de passe
5. **Copiez-le** sans espaces
6. **Collez-le** dans Railway → Variables → `SMTP_PASS`

---

## ✅ Solution 4 : Essayer SendGrid (Alternative)

Si Brevo ne fonctionne toujours pas, essayez **SendGrid** qui est souvent plus fiable sur Railway.

### **Configuration SendGrid** :

1. **Créez un compte** sur https://sendgrid.com (gratuit jusqu'à 100 emails/jour)
2. **Générez une clé API** : Settings → API Keys → Create API Key
3. **Dans Railway → Variables**, remplacez par :

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre-cle-api-sendgrid-complete
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

4. **Redéployez**

---

## 🔍 Diagnostic Détaillé

### **Vérification 1 : Les Logs au Démarrage**

Après redéploiement, vous devriez voir :
```
📧 Configuration SMTP: smtp-relay.brevo.com:465 (secure: true)
📧 User: a10697001@smtp-brevo.com
✅ Service email initialisé avec succès
```

### **Vérification 2 : Les Logs Après Soumission**

Après avoir soumis le formulaire, vous devriez voir :
```
📧 Tentative d'envoi email client vers: votre@email.com
   SMTP Host: smtp-relay.brevo.com
   SMTP Port: 465
✅ Email de confirmation envoyé au client: <message-id>
```

**OU** si ça ne marche toujours pas :
```
❌ Erreur lors de l'envoi de l'email au client: <nouvelle erreur>
   Code: <code>
```

---

## 📋 Checklist Complète

- [ ] J'ai essayé le port 465 avec `SMTP_SECURE=true`
- [ ] J'ai vérifié qu'il n'y a pas d'espaces dans les variables Railway
- [ ] J'ai vérifié que `SMTP_HOST` est exactement `smtp-relay.brevo.com`
- [ ] J'ai vérifié que le mot de passe SMTP est correct dans Brevo
- [ ] J'ai redéployé après chaque modification
- [ ] J'ai testé avec le formulaire après chaque redéploiement
- [ ] J'ai vérifié les logs Railway après soumission (pas seulement au démarrage)

---

## 🆘 Si Rien Ne Fonctionne

**Essayez SendGrid** (Solution 4 ci-dessus). SendGrid est souvent plus fiable sur Railway que Brevo.

---

## 💡 Pourquoi le Port 465 ?

- **Port 587** : STARTTLS (connexion non chiffrée puis upgrade)
- **Port 465** : SSL direct (connexion chiffrée dès le début)

Sur Railway, le port 465 est souvent **plus fiable** car il évite les problèmes de négociation STARTTLS.

---

**Commencez par la Solution 1 (Port 465) - c'est souvent la solution !** 🎯
