# 🔍 Dépannage : Email de confirmation non reçu

## ✅ Vérifications étape par étape

### ÉTAPE 1 : Vérifier les logs Railway

1. **Allez sur Railway** → Votre projet → Logs
2. **Soumettez le formulaire** sur votre site
3. **Regardez immédiatement les logs Railway**

**Ce que vous devriez voir si ça fonctionne** :
```
📤 Envoi de la demande vers /api/demandes...
✅ Email de confirmation envoyé au client: <message-id>
✅ Notification admin envoyée: <message-id>
```

**Si vous voyez** :
- ❌ `⚠️ Service email non initialisé` → Les variables ne sont pas configurées
- ❌ `❌ Erreur lors de l'envoi de l'email` → Problème de configuration SMTP
- ✅ `✅ Email de confirmation envoyé` → L'email est envoyé, problème de réception

**Dites-moi ce que vous voyez dans les logs après avoir soumis le formulaire.**

---

### ÉTAPE 2 : Vérifier dans Brevo → Email → Sent

1. **Allez sur** https://app.brevo.com
2. **Connectez-vous**
3. **Allez dans** Email → Sent (menu de gauche)
4. **Vérifiez** si les emails apparaissent ici

**Si les emails apparaissent dans Brevo** :
- ✅ L'envoi fonctionne !
- ❌ Le problème vient de la réception (spam, email incorrect, filtres)

**Si les emails n'apparaissent PAS dans Brevo** :
- ❌ Le problème vient de l'envoi (configuration SMTP incorrecte)

---

### ÉTAPE 3 : Vérifier votre boîte mail

#### 3.1 Vérifier les spams

1. **Gmail** : Onglet "Spam"
2. **Outlook** : Dossier "Courrier indésirable"
3. **Autres** : Cherchez dans les dossiers de spam

#### 3.2 Vérifier l'adresse email

1. **Vérifiez** que l'email que vous avez utilisé dans le formulaire est correct
2. **Vérifiez** que `ADMIN_EMAIL` dans Railway est correct
3. **Essayez** avec un autre email (Gmail par exemple)

#### 3.3 Vérifier les filtres

1. **Avez-vous des filtres** qui bloquent les emails ?
2. **Avez-vous bloqué** l'expéditeur par erreur ?
3. **Vérifiez** les règles de votre boîte mail

---

### ÉTAPE 4 : Vérifier la configuration Railway

1. **Allez sur Railway** → Variables
2. **Vérifiez** que ces 7 variables existent :

```
✅ SMTP_HOST=smtp-relay.brevo.com
✅ SMTP_PORT=587
✅ SMTP_SECURE=false
✅ SMTP_USER=votre-email@brevo.com
✅ SMTP_PASS=votre-mot-de-passe-smtp
✅ SMTP_FROM=contact@prestigedrive.fr
✅ ADMIN_EMAIL=votre-email@gmail.com
```

3. **Vérifiez** qu'il n'y a pas d'espaces avant/après les valeurs
4. **Vérifiez** que `SMTP_FROM` est une adresse valide

---

### ÉTAPE 5 : Test avec un email simple

Pour tester rapidement :

1. **Modifiez** `ADMIN_EMAIL` dans Railway avec un email Gmail simple :
   ```
   ADMIN_EMAIL=test@gmail.com
   ```

2. **Redéployez** le service

3. **Soumettez** le formulaire avec cet email

4. **Vérifiez** si l'email arrive

**Si ça fonctionne avec Gmail mais pas avec votre email habituel** :
- Le problème vient de votre boîte mail (filtres, spam, etc.)

---

## 🔍 Diagnostic selon les résultats

### Cas 1 : Les logs montrent "✅ Email envoyé" MAIS pas reçu

**Problème** : Réception (spam, filtres, email incorrect)

**Solutions** :
1. Vérifiez les spams
2. Vérifiez que l'email est correct
3. Vérifiez dans Brevo → Email → Sent si les emails apparaissent
4. Si les emails apparaissent dans Brevo → problème de réception

### Cas 2 : Les logs montrent "❌ Erreur lors de l'envoi"

**Problème** : Configuration SMTP incorrecte

**Solutions** :
1. Vérifiez toutes les variables dans Railway
2. Vérifiez qu'il n'y a pas d'espaces
3. Vérifiez que `SMTP_PASS` est le bon mot de passe SMTP
4. Générez un nouveau mot de passe SMTP dans Brevo
5. Redéployez après chaque modification

### Cas 3 : Les logs montrent "⚠️ Service email non initialisé"

**Problème** : Variables non configurées

**Solutions** :
1. Vérifiez que toutes les 7 variables sont bien ajoutées sur Railway
2. Redéployez le service
3. Vérifiez les logs au démarrage

---

## 📋 Checklist de vérification

- [ ] J'ai soumis le formulaire et regardé les logs Railway
- [ ] Les logs montrent "✅ Email de confirmation envoyé"
- [ ] J'ai vérifié dans Brevo → Email → Sent
- [ ] Les emails apparaissent dans Brevo → Sent
- [ ] J'ai vérifié les spams
- [ ] J'ai vérifié que l'email est correct
- [ ] J'ai vérifié que `ADMIN_EMAIL` est correct dans Railway
- [ ] J'ai testé avec un email Gmail simple

---

## 🆘 Besoin d'aide ?

**Dites-moi** :
1. **Ce que vous voyez dans les logs Railway** après avoir soumis le formulaire
2. **Si les emails apparaissent dans Brevo** → Email → Sent
3. **Quel email vous avez utilisé** dans le formulaire

Avec ces informations, je pourrai vous aider plus précisément !
