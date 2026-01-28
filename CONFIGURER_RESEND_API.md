# 🚀 Configurer Resend API (Au lieu de SMTP)

## ❌ Problème

Resend SMTP ne fonctionne pas bien avec Render. **Resend est conçu pour utiliser leur API REST**, pas SMTP.

---

## ✅ Solution : Utiliser l'API Resend Directement

J'ai modifié le code pour **détecter automatiquement** Resend et utiliser l'API au lieu de SMTP.

---

## 🚀 ÉTAPE 1 : Installer le Package Resend

### **Option A : Via GitHub (Recommandé)**

1. **Poussez vos changements** sur GitHub :
   ```bash
   git add .
   git commit -m "Ajout support Resend API"
   git push origin main
   ```

2. **Render installera automatiquement** le package `resend` lors du prochain déploiement

### **Option B : Manuellement**

Si vous voulez tester en local d'abord :

```bash
npm install resend
```

---

## 🔧 ÉTAPE 2 : Configurer les Variables dans Render

### **2.1 Aller dans Render**

1. **Allez sur Render** → Votre Service → **Environment**

### **2.2 Modifier les Variables**

**Gardez ces variables** (pour que le code détecte Resend) :

```
SMTP_HOST=smtp.resend.com          ← Gardez cette valeur (pour la détection)
SMTP_PORT=587                      ← Peu importe (ne sera pas utilisé)
SMTP_SECURE=false                  ← Peu importe (ne sera pas utilisé)
SMTP_USER=resend                   ← Peu importe (ne sera pas utilisé)
SMTP_PASS=re_votre-cle-api-resend  ← VOTRE CLÉ API RESEND (important !)
SMTP_FROM=contact@prestigedrive.fr ← Votre email expéditeur
ADMIN_EMAIL=prestigedrive61@gmail.com
```

**Points importants** :
- ✅ `SMTP_HOST=smtp.resend.com` (pour que le code détecte Resend)
- ✅ `SMTP_PASS` = votre clé API Resend complète (commence par `re_`)
- ✅ `SMTP_FROM` = votre email expéditeur (doit être vérifié dans Resend)

---

## 🚀 ÉTAPE 3 : Vérifier votre Email dans Resend

### **3.1 Ajouter un Domaine ou Email**

1. **Allez sur** https://resend.com
2. **Cliquez sur** **"Domains"** dans le menu de gauche
3. **Deux options** :

#### **Option A : Ajouter un Domaine** (Recommandé pour production)

1. Cliquez sur **"Add Domain"**
2. Entrez votre domaine (ex: `prestigedrive.fr`)
3. Ajoutez les enregistrements DNS dans votre registrar
4. Attendez la vérification

#### **Option B : Utiliser Email de Test** (Pour tester rapidement)

1. Resend vous donne un email de test automatiquement
2. Utilisez cet email dans `SMTP_FROM` pour tester

---

## 🚀 ÉTAPE 4 : Redéployer

1. **Render redéploiera automatiquement** quand vous modifiez les variables
2. **OU** si vous avez poussé sur GitHub, Render déploiera automatiquement
3. **Attendez** 1-2 minutes

---

## 🧪 ÉTAPE 5 : Vérifier les Logs

Dans les logs Render au démarrage, vous devriez voir :

```
📧 Détection de Resend - Utilisation de l'API Resend au lieu de SMTP
📧 Clé API Resend détectée
✅ Service email Resend initialisé avec succès (API)
```

**Si vous voyez ça** → Resend API est activé ! ✅

**Si vous voyez toujours les logs SMTP** :
- Vérifiez que `SMTP_HOST=smtp.resend.com`
- Vérifiez que le package `resend` est installé
- Vérifiez que `SMTP_PASS` est votre clé API Resend

---

## 🧪 ÉTAPE 6 : Tester l'Envoi

1. **Soumettez le formulaire** sur votre site
2. **Vérifiez les logs Render** - vous devriez voir :

```
============================================================
📧 ENVOI EMAIL CLIENT (Resend API)
============================================================
📬 Destinataire: votre@email.com
📋 Sujet: ✅ Confirmation de votre demande - PrestigeDrive
📤 From: contact@prestigedrive.fr
⏰ Timestamp: ...
============================================================
✅ EMAIL CLIENT ENVOYÉ AVEC SUCCÈS (Resend API)
============================================================
✅ Message ID: re_xxxxxxxxxxxxx
📬 Destinataire: votre@email.com
⏱️  Durée: 1234ms
============================================================
```

3. **Vérifiez votre boîte email** - vous devriez recevoir l'email !
4. **Vérifiez Resend** → Emails - vous devriez voir l'email dans la liste

---

## ✅ Avantages de l'API Resend

1. ✅ **Pas de problèmes SMTP** - Utilise HTTP/HTTPS directement
2. ✅ **Plus rapide** - Pas de connexion SMTP à établir
3. ✅ **Plus fiable** - Moins de timeouts
4. ✅ **Dashboard** - Vous voyez tous vos emails dans Resend
5. ✅ **Analytics** - Statistiques sur vos envois

---

## 🆘 Problèmes Courants

### **Problème 1 : "Module not found: resend"**

**Cause** : Le package `resend` n'est pas installé

**Solution** :
1. Vérifiez que vous avez poussé les changements sur GitHub
2. Vérifiez que Render a bien installé le package (regardez les logs de build)
3. Si nécessaire, ajoutez manuellement dans `package.json` et redéployez

### **Problème 2 : Toujours les logs SMTP**

**Cause** : Le code n'a pas détecté Resend

**Solution** :
1. Vérifiez que `SMTP_HOST=smtp.resend.com` (exactement)
2. Vérifiez que `SMTP_PASS` est votre clé API Resend (commence par `re_`)
3. Redéployez

### **Problème 3 : "Invalid API key"**

**Cause** : Clé API Resend incorrecte

**Solution** :
1. Vérifiez que `SMTP_PASS` est votre clé API complète
2. Vérifiez qu'il n'y a pas d'espaces avant/après
3. Générez une nouvelle clé API dans Resend si nécessaire

### **Problème 4 : "Domain not verified"**

**Cause** : L'email dans `SMTP_FROM` n'est pas vérifié dans Resend

**Solution** :
1. Allez dans Resend → Domains
2. Vérifiez votre domaine OU utilisez l'email de test fourni par Resend
3. Mettez à jour `SMTP_FROM` avec un email vérifié

---

## 📋 Checklist

- [ ] J'ai installé le package `resend` (via GitHub ou npm)
- [ ] J'ai configuré `SMTP_HOST=smtp.resend.com` dans Render
- [ ] J'ai configuré `SMTP_PASS` avec ma clé API Resend dans Render
- [ ] J'ai configuré `SMTP_FROM` avec un email vérifié dans Resend
- [ ] Render a redéployé
- [ ] J'ai vérifié les logs - "✅ Service email Resend initialisé avec succès (API)"
- [ ] J'ai testé avec le formulaire
- [ ] J'ai vérifié les logs - "✅ EMAIL CLIENT ENVOYÉ AVEC SUCCÈS (Resend API)"
- [ ] J'ai reçu l'email ✅
- [ ] J'ai vérifié Resend → Emails pour voir l'historique

---

## 💡 Note Importante

**Le code détecte automatiquement Resend** quand `SMTP_HOST=smtp.resend.com` et utilise l'API au lieu de SMTP.

**Vous n'avez rien d'autre à faire** - juste configurer les variables et redéployer !

---

**Resend API devrait fonctionner parfaitement maintenant !** 🚀
