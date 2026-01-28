# 🔍 Vérifier les Logs Railway

## ❌ Problème : "No logs in this time range"

Si vous voyez "No logs in this time range", voici comment résoudre :

---

## ✅ Solution 1 : Vérifier que le service est actif

1. **Allez sur Railway** → Votre projet
2. **Vérifiez** que votre service est **"Active"** (pas "Stopped" ou "Building")
3. **Si le service est arrêté** :
   - Cliquez sur "Deploy" ou "Redeploy"
   - Attendez que le déploiement se termine

---

## ✅ Solution 2 : Attendre quelques secondes

1. **Rafraîchissez** la page des logs (F5 ou Cmd+R)
2. **Attendez** 10-20 secondes
3. **Les logs devraient apparaître**

---

## ✅ Solution 3 : Générer des logs en soumettant le formulaire

1. **Gardez la page des logs Railway ouverte**
2. **Allez sur votre site** PrestigeDrive (dans un autre onglet)
3. **Remplissez le formulaire de devis**
4. **Soumettez le formulaire**
5. **Retournez immédiatement** sur la page des logs Railway
6. **Les logs devraient apparaître** avec les messages d'envoi d'email

---

## ✅ Solution 4 : Vérifier les logs au démarrage

Les logs au démarrage du service devraient montrer :

```
✅ Service email initialisé avec succès
📧 Service email: Activé
🚗 Serveur VTC démarré sur http://0.0.0.0:3000
```

**Si vous ne voyez pas ces messages** :
- Le service n'est peut-être pas démarré
- Redéployez le service

---

## ✅ Solution 5 : Vérifier l'onglet "Deployments"

1. **Allez dans** Railway → Deployments
2. **Vérifiez** que le dernier déploiement est **"Active"**
3. **Si le déploiement est en cours** :
   - Attendez qu'il se termine
   - Les logs apparaîtront après

---

## 🧪 Test : Générer des logs

Pour générer des logs et tester les emails :

1. **Allez sur votre site** PrestigeDrive
2. **Remplissez le formulaire** avec votre email
3. **Soumettez le formulaire**
4. **Retournez sur Railway** → Logs
5. **Vous devriez voir** :
   ```
   📤 Envoi de la demande vers /api/demandes...
   ✅ Email de confirmation envoyé au client: <message-id>
   ✅ Notification admin envoyée: <message-id>
   ```

---

## 📋 Checklist

- [ ] Le service Railway est "Active"
- [ ] J'ai rafraîchi la page des logs
- [ ] J'ai attendu quelques secondes
- [ ] J'ai soumis le formulaire sur le site
- [ ] Les logs apparaissent maintenant

---

## 🆘 Si les logs n'apparaissent toujours pas

1. **Vérifiez** que votre service Railway est bien déployé
2. **Redéployez** le service (Deployments → Redeploy)
3. **Attendez** 1-2 minutes que le déploiement se termine
4. **Rafraîchissez** les logs
