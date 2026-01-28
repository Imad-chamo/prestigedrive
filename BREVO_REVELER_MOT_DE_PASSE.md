# 👁️ Brevo : Révéler le mot de passe SMTP masqué

## ✅ Vous avez déjà une clé SMTP !

Vous avez une clé SMTP active :
- **Nom** : prestigedrive
- **Statut** : Active
- **Créée le** : 28 janvier 2026 à 14:28
- **Valeur** : **********184qaW (masquée)

---

## 🔍 Comment révéler le mot de passe masqué

### Méthode 1 : Bouton "Show" / "Afficher"

1. **Dans Brevo**, allez dans **Settings** → **SMTP & API** → **SMTP**
2. **Trouvez votre clé SMTP** "prestigedrive"
3. **Cherchez un bouton** :
   - **"Show"** ou **"Afficher"** ou **"Reveal"** ou **"Révéler"**
   - Ou une icône d'œil 👁️
4. **Cliquez dessus** pour révéler le mot de passe complet
5. **Copiez le mot de passe** qui s'affiche

### Méthode 2 : Si vous ne voyez pas le bouton "Show"

1. **Cliquez sur la clé SMTP** "prestigedrive"
2. **Ou cliquez sur les trois points** (...) à côté
3. **Cherchez** "View" / "Voir" / "Show" / "Afficher"
4. **Le mot de passe complet sera révélé**

### Méthode 3 : Générer une nouvelle clé (si vous ne pouvez pas révéler)

Si vous ne pouvez pas révéler l'ancienne clé :

1. **Cliquez sur** "Générer une nouvelle clé SMTP"
2. **Donnez-lui un nom** : `prestigedrive-v2` (ou un autre nom)
3. **Copiez le nouveau mot de passe** immédiatement
4. **Utilisez ce nouveau mot de passe** dans Railway

⚠️ **Note** : Si vous générez une nouvelle clé, l'ancienne restera active mais vous pouvez la supprimer après avoir testé la nouvelle.

---

## 📋 Utiliser le mot de passe dans Railway

Une fois que vous avez révélé le mot de passe SMTP :

1. **Allez sur Railway** → Votre projet → Variables
2. **Trouvez la variable** `SMTP_PASS`
3. **Remplacez la valeur** par le mot de passe SMTP complet (pas seulement `**********184qaW`)
4. **Sauvegardez**
5. **Redéployez** le service

---

## ⚠️ Important

- ✅ **Utilisez le mot de passe COMPLET** révélé (pas seulement la partie visible `184qaW`)
- ✅ Le mot de passe complet ressemble à : `xsmtpib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx184qaW`
- ❌ **NE PAS utiliser** seulement `184qaW` - c'est juste la fin du mot de passe

---

## 🔍 Si vous ne trouvez pas le bouton "Show"

### Option 1 : Interface différente

Parfois le bouton peut être :
- Un **icône d'œil** 👁️ à côté du mot de passe masqué
- Un **bouton "Reveal"** ou **"Afficher"**
- Un **clic droit** sur le mot de passe masqué
- Un **double-clic** sur le mot de passe masqué

### Option 2 : Générer une nouvelle clé

Si vous ne pouvez vraiment pas révéler l'ancienne :
1. **Générez une nouvelle clé SMTP**
2. **Copiez le nouveau mot de passe** immédiatement
3. **Utilisez-le dans Railway**

---

## ✅ Checklist

- [ ] J'ai trouvé le bouton "Show" / "Afficher" / 👁️ dans Brevo
- [ ] J'ai révélé le mot de passe SMTP complet
- [ ] J'ai copié le mot de passe complet (pas seulement `184qaW`)
- [ ] J'ai collé ce mot de passe dans Railway → Variables → `SMTP_PASS`
- [ ] J'ai vérifié qu'il n'y a pas d'espaces avant/après
- [ ] J'ai redéployé le service sur Railway

---

## 💡 Astuce

Si vous avez des difficultés à révéler l'ancienne clé :
- **Générez simplement une nouvelle clé SMTP**
- **Copiez le nouveau mot de passe** immédiatement
- **Utilisez-le dans Railway**

C'est souvent plus simple et plus sûr !

---

## 🧪 Test après configuration

1. **Redéployez** votre service sur Railway
2. **Vérifiez les logs** Railway :
   - Vous devriez voir : `✅ Service email initialisé avec succès`
   - Vous devriez voir : `✅ Connexion SMTP vérifiée avec succès`
3. **Testez** en soumettant le formulaire sur votre site
4. **Vérifiez** dans Brevo → Email → Sent si les emails apparaissent
