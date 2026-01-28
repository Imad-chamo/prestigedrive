# 🔧 Fix : Connection Timeout SMTP

## ❌ Problème : Connection timeout

L'erreur "Connection timeout" signifie que Railway ne peut pas se connecter au serveur SMTP de Brevo.

---

## ✅ Solutions

### Solution 1 : Vérifier les variables Railway

**Allez dans Railway → Variables** et vérifiez exactement :

```
SMTP_HOST=smtp-relay.brevo.com  ← Vérifiez l'orthographe (avec le tiret)
SMTP_PORT=587                    ← Doit être 587
SMTP_SECURE=false                ← Doit être "false" (pas true)
SMTP_USER=votre-email@brevo.com  ← Votre email Brevo complet
SMTP_PASS=votre-mot-de-passe     ← Le mot de passe SMTP généré
```

**Erreurs courantes** :
- ❌ Espaces avant/après les valeurs → Supprimez-les
- ❌ `SMTP_HOST` mal écrit → Doit être `smtp-relay.brevo.com` (avec le tiret)
- ❌ `SMTP_PORT` incorrect → Doit être `587` (pas 465, pas 25)
- ❌ `SMTP_SECURE` incorrect → Doit être `false` pour le port 587

### Solution 2 : Essayer le port 465 (SSL)

Si le port 587 ne fonctionne pas, essayez le port 465 :

**Dans Railway → Variables**, modifiez :

```
SMTP_PORT=465
SMTP_SECURE=true
```

Puis redéployez.

### Solution 3 : Vérifier que Brevo est bien configuré

1. **Allez sur** https://app.brevo.com
2. **Settings** → SMTP & API → SMTP
3. **Vérifiez** que votre clé SMTP est **Active**
4. **Vérifiez** que le **Server** est bien `smtp-relay.brevo.com`
5. **Vérifiez** que le **Port** est bien `587`

### Solution 4 : Générer un nouveau mot de passe SMTP

1. **Dans Brevo** → Settings → SMTP & API → SMTP
2. **Générez un nouveau mot de passe SMTP**
3. **Copiez-le immédiatement**
4. **Dans Railway** → Variables → `SMTP_PASS` → Remplacez par le nouveau
5. **Redéployez**

---

## 🔍 Vérifications détaillées

### Vérification 1 : Format exact des variables

**Dans Railway, chaque variable doit être exactement** :

```
SMTP_HOST=smtp-relay.brevo.com
```

**PAS** :
- ❌ `SMTP_HOST = smtp-relay.brevo.com` (espaces)
- ❌ `SMTP_HOST=smtp-relay.brevo.com ` (espace après)
- ❌ `SMTP_HOST= smtp-relay.brevo.com` (espace avant)
- ❌ `SMTP_HOST=smtprelay.brevo.com` (sans tiret)

### Vérification 2 : Mot de passe SMTP

Le mot de passe SMTP doit être :
- ✅ Le mot de passe généré dans Brevo (pas votre mot de passe de connexion)
- ✅ Une longue chaîne (30-40 caractères)
- ✅ Commence souvent par `xsmtpib-`
- ✅ Pas d'espaces avant/après

### Vérification 3 : Email Brevo

`SMTP_USER` doit être :
- ✅ Votre email Brevo complet (ex: `votre-email@brevo.com`)
- ✅ Le même email que celui utilisé pour créer le compte Brevo
- ✅ Pas d'espaces avant/après

---

## 🧪 Test après correction

1. **Modifiez les variables** dans Railway
2. **Redéployez** le service
3. **Vérifiez les logs** Railway :
   - Vous devriez voir : `✅ Service email initialisé avec succès`
   - Vous ne devriez PAS voir : `❌ Erreur de vérification SMTP`
4. **Soumettez le formulaire** sur votre site
5. **Vérifiez les logs** :
   - Vous devriez voir : `✅ Email de confirmation envoyé au client`

---

## 📋 Checklist

- [ ] `SMTP_HOST` est exactement `smtp-relay.brevo.com` (avec tiret, pas d'espaces)
- [ ] `SMTP_PORT` est `587`
- [ ] `SMTP_SECURE` est `false`
- [ ] `SMTP_USER` est mon email Brevo complet (pas d'espaces)
- [ ] `SMTP_PASS` est le mot de passe SMTP généré (pas d'espaces)
- [ ] J'ai redéployé le service après avoir modifié les variables
- [ ] Les logs montrent "Service email: Activé"

---

## 💡 Si ça ne fonctionne toujours pas

Essayez SendGrid à la place de Brevo :

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre-cle-api-sendgrid
SMTP_FROM=contact@prestigedrive.fr
ADMIN_EMAIL=votre-email@gmail.com
```

SendGrid est parfois plus fiable sur Railway.
