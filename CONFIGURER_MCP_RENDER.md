# 🔧 Configurer MCP Render pour Cursor

## 🎯 Objectif

Configurer l'intégration Render avec Cursor via MCP (Model Context Protocol) pour pouvoir interagir avec Render directement depuis Cursor.

---

## 📋 Étape 1 : Créer le Fichier de Configuration

### **Option A : Via Terminal**

1. **Ouvrez un terminal**
2. **Créez le répertoire** (s'il n'existe pas) :
   ```bash
   mkdir -p ~/.cursor
   ```

3. **Créez le fichier** `mcp.json` :
   ```bash
   nano ~/.cursor/mcp.json
   ```
   OU
   ```bash
   code ~/.cursor/mcp.json
   ```

4. **Collez ce contenu** :
   ```json
   {
     "mcpServers": {
       "render": {
         "url": "https://mcp.render.com/mcp",
         "headers": {
           "Authorization": "Bearer re_UAKiVT49_6hvYsCwQNu1CzBhsiakkUkeZ"
         }
       }
     }
   }
   ```

5. **Sauvegardez** le fichier (Ctrl+O puis Enter dans nano, ou Cmd+S dans VS Code)

### **Option B : Via Finder**

1. **Ouvrez Finder**
2. **Appuyez sur** `Cmd+Shift+G` (Aller au dossier)
3. **Tapez** : `~/.cursor`
4. **Créez le fichier** `mcp.json` dans ce dossier
5. **Collez le contenu JSON** ci-dessus

---

## 🔑 Étape 2 : Obtenir votre Clé API Render

Si vous n'avez pas encore votre clé API Render :

1. **Allez sur** https://render.com
2. **Connectez-vous** à votre compte
3. **Allez dans** Settings → API Keys
4. **Créez une nouvelle clé API** (ou utilisez une existante)
5. **Copiez la clé** (commence par `rnd_`)

### **Remplacez dans le fichier** :

Dans `~/.cursor/mcp.json`, remplacez :
```json
"Authorization": "Bearer re_UAKiVT49_6hvYsCwQNu1CzBhsiakkUkeZ"
```

Par votre vraie clé API Render :
```json
"Authorization": "Bearer rnd_votre-cle-api-render"
```

---

## ✅ Étape 3 : Redémarrer Cursor

1. **Fermez complètement Cursor** (Cmd+Q)
2. **Rouvrez Cursor**
3. **La configuration MCP sera chargée automatiquement**

---

## 🧪 Étape 4 : Vérifier que ça Fonctionne

Une fois Cursor redémarré, vous devriez pouvoir :

1. **Interagir avec Render** directement depuis Cursor
2. **Voir vos services Render** dans le contexte
3. **Gérer vos déploiements** depuis Cursor

---

## 📋 Structure du Fichier

Le fichier `~/.cursor/mcp.json` doit contenir :

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer VOTRE_CLE_API_RENDER"
      }
    }
  }
}
```

**Points importants** :
- ✅ Le fichier doit être dans `~/.cursor/mcp.json`
- ✅ Le format JSON doit être valide
- ✅ Remplacez `VOTRE_CLE_API_RENDER` par votre vraie clé
- ✅ La clé doit commencer par `rnd_` (pour Render)

---

## 🆘 Problèmes Courants

### **Problème 1 : Le fichier n'existe pas**

**Solution** : Créez-le manuellement dans `~/.cursor/mcp.json`

### **Problème 2 : Erreur JSON**

**Solution** : Vérifiez que le JSON est valide (pas de virgule en trop, guillemets corrects)

### **Problème 3 : Clé API invalide**

**Solution** : Vérifiez que votre clé API Render est correcte dans Render → Settings → API Keys

---

## 💡 Note

**Cette configuration MCP n'est pas nécessaire** pour résoudre le problème d'envoi d'emails. C'est juste une intégration pratique pour gérer Render depuis Cursor.

**Pour résoudre les emails**, concentrez-vous sur **Mailgun** (voir `SOLUTION_FINALE_EMAIL.md`).

---

**Le fichier de configuration MCP a été créé ! Redémarrez Cursor pour l'activer.** 🚀
