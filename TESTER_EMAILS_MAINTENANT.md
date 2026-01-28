# 🧪 Tester les Emails Maintenant

## ✅ État Actuel

Votre serveur est **démarré et prêt** :
- ✅ MongoDB connecté
- ✅ Service email initialisé (port 465 avec SSL)
- ✅ Serveur actif sur le port 3000

---

## 🎯 Test 1 : Soumettre le Formulaire

### **Étape 1 : Ouvrir les Logs Railway**

1. **Allez sur Railway** → Votre Service → **Logs**
2. **Gardez cet onglet ouvert** pendant le test

### **Étape 2 : Soumettre le Formulaire**

1. **Allez sur votre site** PrestigeDrive (dans un autre onglet)
2. **Remplissez le formulaire** avec vos informations réelles
3. **Soumettez le formulaire**

### **Étape 3 : Vérifier les Logs**

**Revenez immédiatement** sur Railway → Logs. Vous devriez voir :

```
============================================================
📥 NOUVELLE DEMANDE REÇUE
============================================================
⏰ Timestamp: 2026-01-28T15:30:00.000Z
👤 Nom: Votre Nom
📧 Email: votre@email.com
📞 Téléphone: 0600000000
...
✅ Demande créée dans MongoDB: <id>
============================================================
📧 ENVOI DES EMAILS
============================================================
📧 Email client: votre@email.com
📧 Email admin: admin@email.com
============================================================
📧 ENVOI EMAIL CLIENT
============================================================
...
```

**Puis soit** :
- ✅ `✅ EMAIL CLIENT ENVOYÉ AVEC SUCCÈS` → L'email est parti !
- ❌ `❌ ERREUR ENVOI EMAIL CLIENT` → Il y a un problème (voir les détails)

---

## 🧪 Test 2 : Utiliser l'Endpoint de Test

### **Option A : Via le Navigateur**

1. **Allez sur** : `https://votre-app.railway.app/api/test-email`
2. **Vous verrez** une erreur (c'est normal, c'est un POST)
3. **Utilisez plutôt l'option B**

### **Option B : Via curl (Terminal)**

```bash
curl -X POST https://votre-app.railway.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "votre-email@example.com"}'
```

**Remplacez** `votre-email@example.com` par votre vraie adresse email.

### **Option C : Via le Frontend**

Si vous avez un formulaire de test dans votre interface admin, utilisez-le.

---

## 📋 Ce Que Vous Devriez Voir

### **Si ça fonctionne ✅**

Dans les logs Railway :
```
============================================================
✅ EMAIL CLIENT ENVOYÉ AVEC SUCCÈS
============================================================
✅ Message ID: <message-id>
📬 Destinataire: votre@email.com
📧 Response: 250 Message queued
⏱️  Durée: 1234ms
============================================================
```

Dans votre boîte email :
- 📧 **Email de confirmation** de PrestigeDrive
- 📧 **Email de notification** pour l'admin (si ADMIN_EMAIL est configuré)

### **Si ça ne fonctionne pas ❌**

Dans les logs Railway, vous verrez :
```
============================================================
❌ ERREUR ENVOI EMAIL CLIENT
============================================================
❌ Message: [message d'erreur]
📋 Code: [code d'erreur]
...
============================================================
```

**Erreurs courantes** :

1. **ETIMEDOUT** → Problème de connexion (port 465 devrait résoudre ça)
2. **EAUTH** → Problème d'authentification (vérifiez SMTP_USER et SMTP_PASS)
3. **ECONNREFUSED** → Serveur SMTP inaccessible

---

## 🔍 Vérifications Si Ça Ne Fonctionne Pas

### **Vérification 1 : Variables Railway**

Allez sur **Railway → Variables** et vérifiez :

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=a10697001@smtp-brevo.com
SMTP_PASS=votre-mot-de-passe-smtp
ADMIN_EMAIL=votre-email-admin@example.com
SMTP_FROM=votre-email@example.com (optionnel)
```

**Points importants** :
- ✅ Pas d'espaces avant/après les valeurs
- ✅ `SMTP_PORT` doit être `465` (pas `587`)
- ✅ `SMTP_SECURE` doit être `true` (pas `false`)
- ✅ `SMTP_PASS` doit être le mot de passe SMTP généré dans Brevo (pas votre mot de passe de connexion)

### **Vérification 2 : Mot de Passe SMTP**

1. **Allez sur** https://app.brevo.com
2. **Settings** → **SMTP & API** → **SMTP**
3. **Vérifiez** que votre clé SMTP est **Active**
4. **Si nécessaire**, générez un nouveau mot de passe SMTP
5. **Copiez-le** et mettez-le dans Railway → Variables → `SMTP_PASS`

### **Vérification 3 : Email Admin**

Vérifiez que `ADMIN_EMAIL` est configuré dans Railway → Variables.

---

## 📊 Checklist de Test

- [ ] Le serveur est démarré (vous voyez les logs de démarrage)
- [ ] J'ai ouvert Railway → Logs dans un onglet
- [ ] J'ai soumis le formulaire sur mon site
- [ ] J'ai vérifié les logs Railway après la soumission
- [ ] J'ai vérifié ma boîte email (inbox + spam)
- [ ] Si erreur, j'ai noté le message d'erreur complet

---

## 🆘 Si Vous Voyez Toujours une Erreur

1. **Copiez le message d'erreur complet** des logs Railway
2. **Vérifiez les variables Railway** (voir Vérification 1 ci-dessus)
3. **Vérifiez le mot de passe SMTP** dans Brevo
4. **Essayez de générer un nouveau mot de passe SMTP** dans Brevo

---

## 💡 Note Importante

Le port **465 avec SSL** est souvent **plus fiable** sur Railway que le port 587. Votre configuration actuelle (port 465, secure: true) est donc **optimale** pour Railway.

---

**Testez maintenant et vérifiez les logs !** 🚀
