# 🔧 Dépannage : Emails non reçus

## 🎯 Problème : Vous n'avez pas reçu l'email de confirmation

Voici comment diagnostiquer et résoudre le problème étape par étape.

---

## ✅ Étape 1 : Vérifier que le service email est activé

### Sur Railway :

1. **Allez dans les logs** de votre service Railway
2. **Cherchez ces messages** au démarrage :

```
✅ Service email initialisé avec succès
✅ Connexion SMTP vérifiée avec succès
📧 Service email: Activé
```

**Si vous voyez** :
- ❌ `⚠️ Configuration email non trouvée` → Les variables ne sont pas configurées
- ❌ `📧 Service email: Non configuré` → Les variables ne sont pas configurées
- ❌ `❌ Erreur de vérification SMTP` → Problème de connexion/identifiants

### En local :

```bash
npm start
```

Regardez les messages au démarrage.

---

## ✅ Étape 2 : Vérifier les variables d'environnement

### Sur Railway :

1. **Allez dans** Variables de votre service
2. **Vérifiez que ces 7 variables existent** :

```
✅ SMTP_HOST
✅ SMTP_PORT
✅ SMTP_SECURE
✅ SMTP_USER
✅ SMTP_PASS
✅ SMTP_FROM
✅ ADMIN_EMAIL
```

3. **Vérifiez les valeurs** :

**Pour Brevo** :
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@brevo.com
SMTP_PASS=votre-mot-de-passe-smtp
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

**Pour SendGrid** :
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre-cle-api
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

⚠️ **Erreurs courantes** :
- `SMTP_USER` avec des espaces avant/après
- `SMTP_PASS` avec des espaces avant/après
- Mauvaise valeur pour `SMTP_USER` (doit être `apikey` pour SendGrid, votre email pour Brevo)
- `SMTP_HOST` mal écrit (vérifiez les tirets)

---

## ✅ Étape 3 : Tester la connexion SMTP

### Utilisez le script de diagnostic :

```bash
npm run diagnostic-email
```

**Ce script va** :
- ✅ Vérifier toutes les variables
- ✅ Tester la connexion SMTP
- ✅ Envoyer un email de test
- ✅ Vous dire exactement où est le problème

**Si vous voyez** :
- ✅ `✅ Connexion SMTP réussie !` → La connexion fonctionne
- ✅ `✅ Email de test envoyé avec succès !` → Tout fonctionne
- ❌ `❌ Erreur d'authentification` → Problème avec SMTP_USER ou SMTP_PASS
- ❌ `❌ Erreur de connexion` → Problème avec SMTP_HOST ou SMTP_PORT

---

## ✅ Étape 4 : Vérifier les logs lors de l'envoi

### Quand vous soumettez le formulaire :

1. **Allez dans les logs Railway** en temps réel
2. **Soumettez le formulaire** sur votre site
3. **Cherchez dans les logs** :

**Si ça fonctionne** :
```
📤 Envoi de la demande vers /api/demandes...
✅ Email de confirmation envoyé au client: <message-id>
✅ Notification admin envoyée: <message-id>
```

**Si ça ne fonctionne pas** :
```
⚠️ Service email non initialisé. Email non envoyé.
```
ou
```
❌ Erreur lors de l'envoi de l'email au client: <erreur>
```

---

## ✅ Étape 5 : Vérifier dans le dashboard du service email

### Pour Brevo :

1. **Allez sur** https://app.brevo.com
2. **Allez dans** Email → Sent
3. **Vérifiez** si les emails apparaissent ici
4. **Si oui** → Le problème vient de la réception (spam, email incorrect)
5. **Si non** → Le problème vient de l'envoi (configuration)

### Pour SendGrid :

1. **Allez sur** https://app.sendgrid.com
2. **Allez dans** Activity
3. **Vérifiez** si les emails apparaissent ici
4. **Si oui** → Le problème vient de la réception
5. **Si non** → Le problème vient de l'envoi

---

## ✅ Étape 6 : Vérifier la boîte mail

### Vérifications importantes :

1. **Vérifiez les spams** :
   - Gmail : Onglet "Spam"
   - Outlook : Dossier "Courrier indésirable"
   - Autres : Cherchez dans les dossiers de spam

2. **Vérifiez l'adresse email** :
   - Est-ce que `ADMIN_EMAIL` est correct ?
   - Est-ce que l'email du client dans le formulaire est correct ?

3. **Vérifiez les filtres** :
   - Avez-vous des filtres qui bloquent les emails ?
   - Avez-vous bloqué l'expéditeur par erreur ?

---

## 🔧 Solutions selon l'erreur

### Erreur : "Configuration email non trouvée"

**Solution** :
1. Vérifiez que toutes les variables sont ajoutées sur Railway
2. Redéployez le service après avoir ajouté les variables
3. Attendez 1-2 minutes que Railway redéploie

### Erreur : "Invalid login" ou "Authentication failed"

**Pour Brevo** :
- ✅ Vérifiez que `SMTP_USER` est votre email Brevo complet
- ✅ Vérifiez que `SMTP_PASS` est le mot de passe SMTP généré (pas votre mot de passe de connexion)
- ✅ Générez un nouveau mot de passe SMTP dans Brevo

**Pour SendGrid** :
- ✅ Vérifiez que `SMTP_USER` est exactement `apikey` (en minuscules)
- ✅ Vérifiez que `SMTP_PASS` est votre clé API SendGrid (commence par `SG.`)
- ✅ Vérifiez qu'il n'y a pas d'espaces avant/après

### Erreur : "Connection timeout"

**Solution** :
- ✅ Vérifiez que `SMTP_HOST` est correct :
  - Brevo : `smtp-relay.brevo.com` (avec le tiret)
  - SendGrid : `smtp.sendgrid.net`
- ✅ Vérifiez que `SMTP_PORT` est `587`
- ✅ Vérifiez que `SMTP_SECURE` est `false`

### Les emails sont envoyés mais pas reçus

**Solution** :
1. Vérifiez les spams
2. Vérifiez que `ADMIN_EMAIL` est correct
3. Vérifiez dans le dashboard Brevo/SendGrid si les emails sont bien envoyés
4. Essayez avec une autre adresse email

---

## 🧪 Test complet étape par étape

### 1. Test de connexion :

```bash
npm run diagnostic-email
```

### 2. Si le test fonctionne, testez avec le formulaire :

1. Allez sur votre site
2. Remplissez le formulaire avec votre email
3. Soumettez
4. Vérifiez les logs Railway
5. Vérifiez votre boîte mail (et les spams)

### 3. Si ça ne fonctionne toujours pas :

1. Vérifiez dans le dashboard Brevo/SendGrid si les emails sont envoyés
2. Vérifiez que `SMTP_FROM` est une adresse valide
3. Vérifiez que `ADMIN_EMAIL` est correct

---

## 📋 Checklist de dépannage

- [ ] Les variables sont bien ajoutées sur Railway (7 variables)
- [ ] Le service a été redéployé après avoir ajouté les variables
- [ ] Les logs montrent "Service email: Activé"
- [ ] `npm run diagnostic-email` fonctionne
- [ ] Les emails apparaissent dans le dashboard Brevo/SendGrid
- [ ] J'ai vérifié les spams
- [ ] `ADMIN_EMAIL` est correct
- [ ] `SMTP_FROM` est correct
- [ ] Les valeurs des variables n'ont pas d'espaces avant/après

---

## 🆘 Besoin d'aide supplémentaire ?

Si rien ne fonctionne :

1. **Copiez les logs Railway** (les messages d'erreur exacts)
2. **Copiez le résultat de** `npm run diagnostic-email`
3. **Vérifiez** dans le dashboard Brevo/SendGrid si les emails sont envoyés
4. **Essayez** avec une autre adresse email pour `ADMIN_EMAIL`

---

## 💡 Astuce : Test avec un email simple

Pour tester rapidement, modifiez temporairement `ADMIN_EMAIL` avec un email Gmail simple :

```
ADMIN_EMAIL=test@gmail.com
```

Redéployez et testez. Si ça fonctionne avec Gmail mais pas avec votre email habituel, le problème vient de votre boîte mail (filtres, spam, etc.).
