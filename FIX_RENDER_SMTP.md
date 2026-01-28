# 🔧 Fix : Timeout SMTP sur Render

## ❌ Problème Actuel

Vous êtes sur Render maintenant (✅ bien !), mais vous avez toujours des timeouts SMTP :
```
Connection timeout
Code: ETIMEDOUT
Command: CONN
```

**Le problème** : Le port 465 ne fonctionne pas, même sur Render.

---

## ✅ Solution 1 : Changer vers le Port 587 (RECOMMANDÉ)

### **Étape 1 : Modifier les Variables Render**

1. **Allez sur Render** → Votre Service → **Environment**
2. **Trouvez** ces variables :
   - `SMTP_PORT`
   - `SMTP_SECURE`

3. **Modifiez-les** :
   - `SMTP_PORT` : Changez de `465` à `587`
   - `SMTP_SECURE` : Changez de `true` à `false`

### **Étape 2 : Vérifier les Autres Variables**

Assurez-vous que vous avez exactement :

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=a10697001@smtp-brevo.com
SMTP_PASS=votre-mot-de-passe-smtp-brevo
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=prestigedrive61@gmail.com
```

**Points importants** :
- ✅ Pas d'espaces avant/après les valeurs
- ✅ `SMTP_PORT` doit être exactement `587` (pas de guillemets)
- ✅ `SMTP_SECURE` doit être exactement `false` (pas de guillemets)

### **Étape 3 : Redéployer**

1. Render va **redéployer automatiquement** quand vous modifiez les variables
2. **Attendez** que le déploiement se termine (1-2 minutes)
3. **Vérifiez les logs** - vous devriez voir :
   ```
   📧 Configuration SMTP: smtp-relay.brevo.com:587 (secure: false)
   ```

### **Étape 4 : Tester**

1. **Soumettez le formulaire** sur votre site
2. **Vérifiez les logs Render**
3. **Vous devriez voir** : `✅ EMAIL CLIENT ENVOYÉ AVEC SUCCÈS`

---

## ✅ Solution 2 : Vérifier Brevo

### **Vérification 1 : Mot de Passe SMTP**

1. **Allez sur** https://app.brevo.com
2. **Settings** → **SMTP & API** → **SMTP**
3. **Vérifiez** que votre clé SMTP est **Active**
4. **Si nécessaire**, générez un nouveau mot de passe SMTP
5. **Copiez-le** et mettez-le dans Render → Environment → `SMTP_PASS`

### **Vérification 2 : Email Brevo**

Assurez-vous que `SMTP_USER` est votre **email Brevo complet** :
- ✅ `a10697001@smtp-brevo.com` (correct)
- ❌ `a10697001` (incorrect - manque le domaine)

### **Vérification 3 : Quota Brevo**

1. **Allez sur** https://app.brevo.com
2. **Vérifiez** votre quota d'emails
3. **Gratuit** : 300 emails/jour maximum
4. **Si vous avez atteint la limite** → Attendez demain ou passez à un plan payant

---

## ✅ Solution 3 : Utiliser SendGrid (Alternative)

Si Brevo ne fonctionne toujours pas, essayez SendGrid :

### **Étape 1 : Créer un Compte SendGrid**

1. **Allez sur** https://sendgrid.com
2. **Créez un compte gratuit** (100 emails/jour)
3. **Vérifiez votre email**

### **Étape 2 : Générer une Clé API**

1. **Allez dans** SendGrid → **Settings** → **API Keys**
2. **Create API Key**
3. **Nom** : `Render Production`
4. **Permissions** : **Full Access**
5. **Créez** et **copiez** la clé (commence par `SG.`)

### **Étape 3 : Configurer dans Render**

Modifiez les variables dans Render :

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre-cle-api-sendgrid
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=prestigedrive61@gmail.com
```

**Important** :
- `SMTP_USER` doit être exactement `apikey` (pas votre email)
- `SMTP_PASS` doit être votre clé API SendGrid (commence par `SG.`)

### **Étape 4 : Redéployer et Tester**

1. Render redéploiera automatiquement
2. Testez avec le formulaire
3. Vérifiez les logs

---

## 🔍 Debugging Avancé

### **Vérifier la Configuration dans les Logs**

Quand Render démarre, vous devriez voir dans les logs :

```
📧 Configuration SMTP: smtp-relay.brevo.com:587 (secure: false)
📧 User: a10697001@smtp-brevo.com
✅ Service email initialisé avec succès
```

**Si vous voyez** :
- Port 465 → Changez vers 587
- `secure: true` → Changez `SMTP_SECURE` à `false`

### **Vérifier les Timeouts**

Le timeout actuel est de 90 secondes. Si ça prend plus de 30 secondes, il y a un problème réseau.

**Solutions** :
1. Vérifiez que Brevo n'est pas en maintenance
2. Essayez SendGrid à la place
3. Vérifiez votre connexion internet (peu probable sur Render)

---

## 📊 Comparaison Brevo vs SendGrid

| Service | Port Recommandé | Gratuit | Fiabilité |
|---------|-----------------|---------|-----------|
| **Brevo** | 587 | 300/jour | ✅ Bonne |
| **SendGrid** | 587 | 100/jour | ✅ Excellente |

---

## ✅ Checklist

- [ ] J'ai changé `SMTP_PORT` de 465 à 587 dans Render
- [ ] J'ai changé `SMTP_SECURE` de true à false dans Render
- [ ] J'ai vérifié qu'il n'y a pas d'espaces dans les valeurs
- [ ] Render a redéployé automatiquement
- [ ] J'ai vérifié les logs - port 587 maintenant
- [ ] J'ai soumis le formulaire
- [ ] J'ai vérifié les logs - plus de timeout ?
- [ ] Si toujours timeout, j'ai vérifié Brevo → Quota
- [ ] Si toujours timeout, j'ai essayé SendGrid

---

## 🆘 Si Rien Ne Fonctionne

Si même avec le port 587 ça ne fonctionne pas :

1. **Vérifiez Brevo** :
   - Quota non dépassé ?
   - Clé SMTP active ?
   - Email correct ?

2. **Essayez SendGrid** :
   - Créez un compte
   - Générez une clé API
   - Changez les variables dans Render

3. **Vérifiez les logs Render** :
   - Y a-t-il d'autres erreurs ?
   - Le timeout est-il toujours de 90 secondes ?

---

## 💡 Note Importante

**Le port 587 fonctionne généralement mieux** que le port 465 sur toutes les plateformes (Railway, Render, etc.).

**Changez vers le port 587 maintenant et testez !** 🚀
