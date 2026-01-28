# 📧 Comment Vérifier les Emails dans Brevo

## 🎯 Objectif
Vérifier si les emails ont bien été envoyés depuis votre application vers Brevo.

---

## 📋 Étapes Détaillées

### ÉTAPE 1 : Se connecter à Brevo

1. **Allez sur** https://app.brevo.com
2. **Connectez-vous** avec votre compte Brevo (email + mot de passe)

---

### ÉTAPE 2 : Accéder à la section "Email"

Une fois connecté, vous verrez le menu de gauche. Cliquez sur :

**📧 Email** (ou **Email** dans le menu)

---

### ÉTAPE 3 : Vérifier les emails envoyés

Dans la section Email, vous verrez plusieurs options :

1. **Cliquez sur "Sent"** (ou **"Envoyés"** en français)
   - C'est ici que vous verrez tous les emails envoyés par votre application

2. **Vous verrez une liste d'emails** avec :
   - 📧 **Subject** (Sujet) : Le sujet de l'email
   - 📬 **To** (À) : L'adresse email du destinataire
   - 📅 **Date** : La date et l'heure d'envoi
   - ✅ **Status** : Le statut (Sent, Delivered, etc.)

---

### ÉTAPE 4 : Filtrer les emails récents

1. **Regardez les emails les plus récents** (en haut de la liste)
2. **Cherchez** les emails avec ces sujets :
   - `✅ Confirmation de votre demande - PrestigeDrive`
   - `📋 Nouvelle demande de devis - PrestigeDrive`

3. **Vérifiez** :
   - ✅ Si les emails apparaissent → **L'envoi fonctionne !**
   - ❌ Si les emails n'apparaissent PAS → **Problème d'envoi** (voir les logs Railway)

---

## 🔍 Autres Sections Utiles dans Brevo

### 📊 Statistics (Statistiques)
- Voir les statistiques d'envoi (emails envoyés, délivrés, ouverts, etc.)

### 📝 Campaigns (Campagnes)
- Voir les campagnes email créées manuellement

### 📧 Email → Transactional
- Voir les emails transactionnels (comme ceux envoyés par votre application)

---

## ✅ Interprétation des Résultats

### ✅ Cas 1 : Les emails apparaissent dans "Sent"
**Signification** :
- ✅ L'envoi depuis votre application vers Brevo fonctionne
- ✅ Brevo a bien reçu les emails
- ❌ **MAIS** le destinataire ne les reçoit pas

**Solutions possibles** :
1. **Vérifier les spams** du destinataire
2. **Vérifier l'adresse email** utilisée dans le formulaire
3. **Vérifier le statut** dans Brevo (Delivered = livré, Bounced = rebondi)

---

### ❌ Cas 2 : Les emails n'apparaissent PAS dans "Sent"
**Signification** :
- ❌ L'envoi depuis votre application vers Brevo ne fonctionne PAS
- ❌ Problème de configuration SMTP ou de code

**Solutions possibles** :
1. **Vérifier les logs Railway** pour voir les erreurs
2. **Vérifier les variables SMTP** dans Railway :
   - `SMTP_HOST` = `smtp-relay.brevo.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = votre email Brevo
   - `SMTP_PASS` = votre mot de passe SMTP Brevo
3. **Tester avec** `/api/test-email` pour voir l'erreur exacte

---

## 📸 Aperçu de l'Interface Brevo

```
┌─────────────────────────────────────────┐
│  Brevo Dashboard                       │
├─────────────────────────────────────────┤
│                                         │
│  📧 Email                    ← Cliquez  │
│  📊 Statistics                          │
│  📝 Campaigns                           │
│  ⚙️  Settings                           │
│                                         │
│  Dans Email :                           │
│  ├─ 📧 Sent              ← Cliquez ici │
│  ├─ 📊 Statistics                      │
│  ├─ 📝 Campaigns                       │
│  └─ ⚙️  Settings                        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🆘 Besoin d'Aide ?

**Si vous ne trouvez pas la section "Sent"** :
1. Assurez-vous d'être connecté à Brevo
2. Cherchez "Email" dans le menu de gauche
3. Cliquez sur "Email" puis "Sent" (ou "Envoyés")

**Si vous voyez "No emails sent"** :
- C'est normal si vous n'avez pas encore envoyé d'emails
- Testez d'abord avec `/api/test-email` ou soumettez le formulaire
- Attendez quelques secondes puis rafraîchissez la page

---

## 📝 Checklist

- [ ] Je suis connecté à Brevo
- [ ] J'ai cliqué sur "Email" dans le menu
- [ ] J'ai cliqué sur "Sent" (Envoyés)
- [ ] J'ai vérifié les emails récents
- [ ] J'ai noté si les emails apparaissent ou non
- [ ] J'ai vérifié le statut des emails (Sent, Delivered, etc.)

---

## 🎯 Prochaines Étapes

**Si les emails apparaissent dans Brevo** :
- ✅ L'envoi fonctionne
- Vérifiez les spams du destinataire
- Vérifiez l'adresse email utilisée

**Si les emails n'apparaissent PAS dans Brevo** :
- ❌ Problème d'envoi
- Vérifiez les logs Railway
- Testez avec `/api/test-email`
- Vérifiez les variables SMTP dans Railway
