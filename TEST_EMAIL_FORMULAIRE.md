# 🧪 Test Email depuis le Formulaire

## ✅ Ce qui fonctionne
- ✅ Email de test reçu (via script `test-email-detailed.js`)
- ❌ Email de confirmation non reçu après soumission du formulaire

---

## 🔍 Diagnostic Étape par Étape

### ÉTAPE 1 : Redéployer sur Railway

1. **Poussez les changements** sur Railway (ou redéployez)
2. **Attendez** que le déploiement soit terminé

---

### ÉTAPE 2 : Tester avec la route de test

**Option A : Via curl (terminal)**

Remplacez `VOTRE_URL_RAILWAY` par votre URL Railway (ex: `https://votre-app.railway.app`)

```bash
curl -X POST https://VOTRE_URL_RAILWAY/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"votre-email@gmail.com"}'
```

**Option B : Via le navigateur (console JavaScript)**

1. Ouvrez votre site sur Railway
2. Ouvrez la console (F12)
3. Collez ce code :

```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'votre-email@gmail.com' })
})
.then(r => r.json())
.then(data => console.log('📧 Résultat:', data))
.catch(e => console.error('❌ Erreur:', e));
```

**Vous devriez voir** :
```json
{
  "success": true,
  "message": "Test d'envoi effectué",
  "results": {
    "client": "✅ Email client envoyé",
    "admin": "✅ Email admin envoyé"
  }
}
```

**Si vous voyez des erreurs**, notez-les et dites-moi ce que vous voyez.

---

### ÉTAPE 3 : Soumettre le formulaire et vérifier les logs

1. **Allez sur Railway** → Logs
2. **Gardez la page des logs ouverte**
3. **Allez sur votre site** (dans un autre onglet)
4. **Remplissez le formulaire** avec votre email
5. **Soumettez le formulaire**
6. **Revenez immédiatement sur les logs Railway**

**Vous devriez voir** :
```
📥 Nouvelle demande reçue: { name: '...', email: '...', phone: '...' }
✅ Demande créée dans MongoDB: <id>
📧 Tentative d'envoi des emails pour la demande: <id>
   Email client: votre-email@gmail.com
   Email admin: votre-admin-email@gmail.com
✅ Email de confirmation envoyé au client: <message-id>
   📬 Destinataire: votre-email@gmail.com
✅ Notification admin envoyée: <message-id>
   📬 Destinataire: votre-admin-email@gmail.com
📧 Résultats envoi emails: { client: '✅', admin: '✅' }
```

**Si vous voyez des erreurs** :
```
❌ Erreur email client: <erreur>
   Code: <code>
   Destinataire: votre-email@gmail.com
```

**Copiez exactement ce que vous voyez dans les logs** et dites-moi.

---

### ÉTAPE 4 : Vérifier dans Brevo

1. **Allez sur** https://app.brevo.com
2. **Email** → **Sent**
3. **Vérifiez** si les emails apparaissent ici

**Si les emails apparaissent dans Brevo** :
- ✅ L'envoi fonctionne
- ❌ Problème de réception (spam, email incorrect)

**Si les emails n'apparaissent PAS dans Brevo** :
- ❌ Problème d'envoi (voir les logs Railway pour l'erreur)

---

## 📋 Checklist

- [ ] J'ai redéployé sur Railway
- [ ] J'ai testé avec `/api/test-email` et vu le résultat
- [ ] J'ai soumis le formulaire et regardé les logs Railway
- [ ] J'ai vérifié dans Brevo → Email → Sent
- [ ] J'ai vérifié mes spams
- [ ] J'ai noté exactement ce que je vois dans les logs

---

## 🆘 Besoin d'aide ?

**Dites-moi** :
1. **Résultat du test** `/api/test-email` (succès ou erreur ?)
2. **Ce que vous voyez dans les logs Railway** après avoir soumis le formulaire
3. **Si les emails apparaissent dans Brevo** → Email → Sent
4. **Quel email vous avez utilisé** dans le formulaire

Avec ces informations, je pourrai identifier le problème exact !
