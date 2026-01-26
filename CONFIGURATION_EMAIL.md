# 📧 Configuration du Système d'Email

## Problème Actuel

Le système d'email ne fonctionne pas car les variables d'environnement SMTP ne sont pas configurées.

## Variables Requises

Pour que le système d'email fonctionne, vous devez configurer les variables suivantes :

### Variables Obligatoires

- `SMTP_HOST` : Adresse du serveur SMTP (ex: `smtp.gmail.com`, `smtp.office365.com`)
- `SMTP_USER` : Nom d'utilisateur SMTP (votre adresse email)
- `SMTP_PASS` : Mot de passe SMTP (ou mot de passe d'application)

### Variables Optionnelles

- `SMTP_PORT` : Port SMTP (par défaut: `587`)
- `SMTP_SECURE` : Utiliser SSL/TLS (par défaut: `false`, mettre `true` pour le port 465)
- `SMTP_FROM` : Adresse email d'expéditeur (par défaut: utilise `SMTP_USER`)
- `ADMIN_EMAIL` : Email pour recevoir les notifications admin (par défaut: utilise `SMTP_USER`)
- `SMTP_TLS_REJECT_UNAUTHORIZED` : Rejeter les certificats non autorisés (par défaut: `true`)

## Configuration selon le Fournisseur

### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
ADMIN_EMAIL=votre-email@gmail.com
```

**⚠️ IMPORTANT pour Gmail** : Vous DEVEZ utiliser un **mot de passe d'application**, pas votre mot de passe Gmail normal.

#### Comment créer un mot de passe d'application Gmail :

1. **Activez la validation en 2 étapes** (obligatoire) :
   - Allez sur [Google Account](https://myaccount.google.com/)
   - Cliquez sur **Sécurité** dans le menu de gauche
   - Sous "Connexion à Google", cliquez sur **Validation en deux étapes**
   - Suivez les instructions pour l'activer (si ce n'est pas déjà fait)

2. **Créez un mot de passe d'application** :
   - Toujours dans **Sécurité** → **Validation en deux étapes**
   - Faites défiler jusqu'à **Mots de passe des applications**
   - Cliquez sur **Mots de passe des applications**
   - Sélectionnez **Application** : "Mail"
   - Sélectionnez **Appareil** : "Autre (nom personnalisé)"
   - Entrez un nom (ex: "PrestigeDrive VTC")
   - Cliquez sur **Générer**
   - **Copiez le mot de passe de 16 caractères** (vous ne pourrez plus le voir après)

3. **Utilisez ce mot de passe dans votre `.env`** :
   - Collez le mot de passe de 16 caractères dans `SMTP_PASS`
   - **Ne mettez PAS votre mot de passe Gmail normal**

**Erreur "Invalid login" ?** → Vous utilisez probablement votre mot de passe Gmail au lieu d'un mot de passe d'application. Suivez les étapes ci-dessus.

### Outlook / Office 365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM=votre-email@outlook.com
ADMIN_EMAIL=votre-email@outlook.com
```

### OVH

```env
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@votre-domaine.fr
SMTP_PASS=votre-mot-de-passe
SMTP_FROM=votre-email@votre-domaine.fr
ADMIN_EMAIL=votre-email@votre-domaine.fr
```

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
SMTP_FROM=votre-email@votre-domaine.fr
ADMIN_EMAIL=votre-email@votre-domaine.fr
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@votre-domaine.fr
SMTP_PASS=votre-mot-de-passe-mailgun
SMTP_FROM=votre-email@votre-domaine.fr
ADMIN_EMAIL=votre-email@votre-domaine.fr
```

## Configuration Locale (.env)

1. Créez un fichier `.env` à la racine du projet
2. Ajoutez les variables SMTP :

```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
ADMIN_EMAIL=votre-email@gmail.com
```

## Configuration sur Railway

1. Allez sur votre projet Railway
2. Cliquez sur votre service
3. Allez dans l'onglet **Variables**
4. Ajoutez chaque variable d'environnement :
   - Cliquez sur **+ New Variable**
   - Entrez le nom de la variable (ex: `SMTP_HOST`)
   - Entrez la valeur (ex: `smtp.gmail.com`)
   - Cliquez sur **Add**
5. Répétez pour toutes les variables nécessaires
6. Redéployez votre service

## Test de la Configuration

Après avoir configuré les variables, testez la configuration :

```bash
# Test simple
npm run test-email

# Diagnostic avancé (recommandé en cas de problème)
npm run diagnostic-email
```

Le script de diagnostic avancé va :
- ✅ Vérifier toutes les variables d'environnement
- ✅ Analyser la configuration SMTP
- ✅ Tester la connexion
- ✅ Envoyer un email de test
- ✅ Fournir des solutions spécifiques en cas d'erreur

Ou redémarrez le serveur et vérifiez les logs :

```bash
npm start
```

Vous devriez voir :
- `✅ Service email initialisé avec succès`
- `✅ Connexion SMTP vérifiée avec succès`
- `📧 Service email: Activé`

## Dépannage

### Erreur : "Configuration email non trouvée"
- Vérifiez que les variables `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` sont définies
- Vérifiez que le fichier `.env` est à la racine du projet
- Sur Railway, vérifiez que les variables sont bien ajoutées dans l'onglet Variables

### Erreur : "Invalid login" (535-5.7.8 Username and Password not accepted)

**Pour Gmail** : Cette erreur signifie que vous utilisez votre mot de passe Gmail normal au lieu d'un mot de passe d'application.

**Solution** :
1. ✅ Activez la validation en 2 étapes sur votre compte Google
2. ✅ Créez un mot de passe d'application (voir section Gmail ci-dessus)
3. ✅ Utilisez ce mot de passe de 16 caractères dans `SMTP_PASS`
4. ✅ Vérifiez que `SMTP_USER` est votre adresse Gmail complète (ex: `votre-email@gmail.com`)

**Important** : Le mot de passe d'application est différent de votre mot de passe Gmail. Il ressemble à : `abcd efgh ijkl mnop` (16 caractères avec espaces, mais utilisez-le sans espaces dans `.env`)

**Si le problème persiste avec Gmail** :
- ⚠️ Gmail peut bloquer les connexions depuis certains serveurs
- 💡 **Solution recommandée** : Utilisez un service d'email transactionnel comme SendGrid ou Mailgun (gratuit jusqu'à 100 emails/jour)
- 💡 Voir section "Alternatives à Gmail" ci-dessous

### Erreur : "Connection timeout"
- Vérifiez que le port est correct (587 pour TLS, 465 pour SSL)
- Vérifiez que `SMTP_SECURE` est correct (`false` pour 587, `true` pour 465)
- Vérifiez votre pare-feu et que le port n'est pas bloqué

### Erreur : "Certificate verification failed"
- Ajoutez `SMTP_TLS_REJECT_UNAUTHORIZED=false` dans votre `.env`
- ⚠️ **Attention** : Cela réduit la sécurité, utilisez uniquement si nécessaire

## Sécurité

- ⚠️ **Ne commitez jamais** le fichier `.env` dans Git
- ⚠️ Utilisez des mots de passe d'application pour Gmail
- ⚠️ Sur Railway, les variables sont sécurisées et chiffrées
- ⚠️ Ne partagez jamais vos identifiants SMTP

## Alternatives à Gmail (Recommandé)

Si Gmail continue de poser problème, voici des alternatives plus fiables :

### SendGrid (Gratuit jusqu'à 100 emails/jour)

1. **Créer un compte** : [https://sendgrid.com](https://sendgrid.com)
2. **Créer une API Key** :
   - Settings → API Keys → Create API Key
   - Donnez-lui un nom (ex: "PrestigeDrive")
   - Permissions : "Full Access" ou "Mail Send"
   - Copiez la clé API (vous ne pourrez plus la voir après)

3. **Configuration** :
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
SMTP_FROM=votre-email@votre-domaine.fr
ADMIN_EMAIL=votre-email@votre-domaine.fr
```

**Avantages** :
- ✅ Plus fiable que Gmail
- ✅ Gratuit jusqu'à 100 emails/jour
- ✅ Pas besoin de validation en 2 étapes
- ✅ Statistiques d'envoi
- ✅ Meilleure délivrabilité

### Mailgun (Gratuit jusqu'à 5000 emails/mois)

1. **Créer un compte** : [https://www.mailgun.com](https://www.mailgun.com)
2. **Récupérer les identifiants SMTP** :
   - Dashboard → Sending → SMTP credentials
   - Copiez le mot de passe SMTP

3. **Configuration** :
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-mot-de-passe-mailgun
SMTP_FROM=votre-email@votre-domaine.fr
ADMIN_EMAIL=votre-email@votre-domaine.fr
```

**Avantages** :
- ✅ Très fiable
- ✅ Gratuit jusqu'à 5000 emails/mois
- ✅ Excellente délivrabilité
- ✅ API et webhooks

### Resend (Gratuit jusqu'à 3000 emails/mois)

1. **Créer un compte** : [https://resend.com](https://resend.com)
2. **Créer une API Key** :
   - API Keys → Create API Key
   - Copiez la clé

3. **Configuration** :
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=votre-api-key-resend
SMTP_FROM=votre-email@votre-domaine.fr
ADMIN_EMAIL=votre-email@votre-domaine.fr
```

## Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs du serveur pour les erreurs détaillées
2. La configuration de votre fournisseur email
3. Les paramètres de sécurité de votre compte email
4. Utilisez `npm run diagnostic-email` pour un diagnostic complet
5. Envisagez d'utiliser SendGrid ou Mailgun si Gmail pose problème
