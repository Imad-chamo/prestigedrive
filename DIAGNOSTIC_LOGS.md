# 🔍 Où Voir les Détails - Diagnostic Email

## 📍 Où Trouver les Logs Détaillés

### **Option 1 : Railway Logs (RECOMMANDÉ - Le Plus Important)**

1. **Allez sur Railway** : https://railway.app
2. **Connectez-vous** à votre compte
3. **Sélectionnez votre projet** (Chamkhi-VTC)
4. **Cliquez sur votre service** (celui qui héberge votre application)
5. **Cliquez sur l'onglet "Logs"** (en haut de la page)

---

## 🧪 Comment Tester et Voir les Logs

### **Étape 1 : Ouvrir les Logs Railway**

1. Ouvrez Railway → Logs dans **un onglet de votre navigateur**
2. **Gardez cet onglet ouvert** pendant le test

### **Étape 2 : Soumettre le Formulaire**

1. Ouvrez votre site dans **un autre onglet**
2. Remplissez le formulaire avec vos informations
3. **Soumettez le formulaire**

### **Étape 3 : Revenir aux Logs Railway**

1. **Revenez immédiatement** sur l'onglet Railway → Logs
2. **Regardez les nouvelles lignes** qui apparaissent

---

## 📋 Ce Que Vous Devriez Voir dans les Logs

### ✅ **Si ça marche :**

```
📥 Nouvelle demande reçue: { name: '...', email: '...', phone: '...' }
✅ Demande créée dans MongoDB: <id>
📧 Tentative d'envoi des emails pour la demande: <id>
   Email client: votre@email.com
   Email admin: admin@email.com
📧 Tentative d'envoi email client vers: votre@email.com
   SMTP Host: smtp-relay.brevo.com
   SMTP Port: 587
✅ Email de confirmation envoyé au client: <message-id>
   📬 Destinataire: votre@email.com
   Response: 250 Message queued
📧 Tentative d'envoi email admin vers: admin@email.com
   SMTP Host: smtp-relay.brevo.com
   SMTP Port: 587
✅ Notification admin envoyée: <message-id>
   📬 Destinataire: admin@email.com
📧 Résultats envoi emails: { client: '✅', admin: '✅' }
```

### ❌ **Si ça ne marche pas, vous verrez :**

#### **Erreur de Connexion :**
```
❌ Erreur lors de l'envoi de l'email au client: Connection timeout
   Code: ETIMEDOUT
   Command: CONN
   Destinataire: votre@email.com
```

#### **Erreur d'Authentification :**
```
❌ Erreur lors de l'envoi de l'email au client: Invalid login: 535-5.7.8 Username and Password not accepted
   Code: EAUTH
   Command: AUTH
   Destinataire: votre@email.com
```

#### **Erreur de Configuration :**
```
⚠️  Service email non initialisé. Email non envoyé.
```

#### **Autre Erreur :**
```
❌ Erreur lors de l'envoi de l'email au client: <message d'erreur>
   Code: <code d'erreur>
   Command: <commande qui a échoué>
   Destinataire: votre@email.com
   Stack: <détails techniques>
```

---

## 🔍 Comment Interpréter les Erreurs

### **ETIMEDOUT (Connection Timeout)**
- **Problème** : Le serveur ne peut pas se connecter à Brevo
- **Solutions possibles** :
  - Vérifier que `SMTP_HOST` = `smtp-relay.brevo.com`
  - Vérifier que `SMTP_PORT` = `587`
  - Vérifier la connexion réseau de Railway

### **EAUTH (Authentication Error)**
- **Problème** : Identifiants SMTP incorrects
- **Solutions possibles** :
  - Vérifier que `SMTP_USER` = votre email Brevo complet (ex: `a10697001@smtp-brevo.com`)
  - Vérifier que `SMTP_PASS` = la clé SMTP générée dans Brevo (pas votre mot de passe de compte)
  - Régénérer la clé SMTP dans Brevo si nécessaire

### **ECONNREFUSED (Connection Refused)**
- **Problème** : Le port ou l'hôte est incorrect
- **Solutions possibles** :
  - Vérifier `SMTP_HOST` et `SMTP_PORT`
  - Vérifier que le port n'est pas bloqué

### **Service email non initialisé**
- **Problème** : Variables d'environnement manquantes
- **Solutions possibles** :
  - Vérifier que toutes les variables sont configurées dans Railway → Variables
  - Redéployer après avoir ajouté les variables

---

## 📝 Checklist de Diagnostic

Quand vous voyez une erreur dans les logs, notez :

- [ ] **Le message d'erreur exact** (copiez-le)
- [ ] **Le code d'erreur** (ex: ETIMEDOUT, EAUTH, etc.)
- [ ] **La commande qui a échoué** (ex: CONN, AUTH, etc.)
- [ ] **L'email destinataire** (pour vérifier s'il est valide)
- [ ] **Les valeurs SMTP affichées** (Host, Port, User)

---

## 🎯 Test Rapide : Endpoint de Test

Vous pouvez aussi tester directement via l'API :

1. **Ouvrez la console du navigateur** (F12)
2. **Collez ce code** :

```javascript
fetch('/api/test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'votre@email.com' })
})
.then(r => r.json())
.then(data => console.log('Résultat:', data))
.catch(err => console.error('Erreur:', err));
```

3. **Regardez les logs Railway** - vous verrez le résultat détaillé

---

## 📞 Que Faire Après Avoir Vu les Logs

1. **Copiez le message d'erreur complet** des logs Railway
2. **Notez le code d'erreur** (ETIMEDOUT, EAUTH, etc.)
3. **Vérifiez les variables d'environnement** dans Railway → Variables
4. **Partagez ces informations** pour obtenir de l'aide précise

---

## 💡 Astuce

**Les logs Railway sont en temps réel** - vous verrez les nouvelles lignes apparaître immédiatement après avoir soumis le formulaire.

**Filtrez les logs** en cherchant :
- `📧` pour voir les tentatives d'envoi
- `✅` pour voir les succès
- `❌` pour voir les erreurs
- `⚠️` pour voir les avertissements

---

## 🆘 Si Vous Ne Voyez Aucun Log

1. **Vérifiez que le service est actif** sur Railway
2. **Attendez quelques secondes** après avoir soumis le formulaire
3. **Rafraîchissez la page des logs** Railway
4. **Vérifiez que vous êtes sur le bon service** (celui qui héberge votre app)

---

**Les logs Railway sont votre meilleur outil de diagnostic !** 🎯
