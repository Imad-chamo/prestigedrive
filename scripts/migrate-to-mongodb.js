/**
 * Script de migration des données JSON vers MongoDB
 * Usage: node scripts/migrate-to-mongodb.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Demande = require('../models/Demande');

const DATA_FILE = path.join(__dirname, '..', 'data', 'demandes.json');

async function migrate() {
    try {
        // Connexion à MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prestigedrive';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connecté à MongoDB');

        // Vérifier si le fichier JSON existe
        if (!fs.existsSync(DATA_FILE)) {
            console.log('⚠️ Aucun fichier JSON trouvé. Migration terminée.');
            await mongoose.connection.close();
            return;
        }

        // Lire les données JSON
        const jsonData = fs.readFileSync(DATA_FILE, 'utf8');
        const demandes = JSON.parse(jsonData);

        if (!Array.isArray(demandes) || demandes.length === 0) {
            console.log('⚠️ Aucune donnée à migrer.');
            await mongoose.connection.close();
            return;
        }

        console.log(`📦 ${demandes.length} demandes trouvées dans le fichier JSON`);

        // Vérifier si des données existent déjà dans MongoDB
        const existingCount = await Demande.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️ ${existingCount} demandes existent déjà dans MongoDB`);
            console.log('💡 Pour éviter les doublons, videz d\'abord la collection ou utilisez --force');
            
            // Option pour forcer la migration
            if (process.argv.includes('--force')) {
                console.log('🗑️ Suppression des données existantes...');
                await Demande.deleteMany({});
            } else {
                console.log('❌ Migration annulée. Utilisez --force pour forcer la migration.');
                await mongoose.connection.close();
                return;
            }
        }

        // Migrer les données
        let successCount = 0;
        let errorCount = 0;

        for (const demande of demandes) {
            try {
                // Convertir l'ID string en ObjectId si nécessaire
                const demandeData = {
                    ...demande,
                    _id: undefined, // Laisser MongoDB générer un nouvel ID
                    dateCreation: demande.dateCreation ? new Date(demande.dateCreation) : new Date(),
                    dateReponse: demande.dateReponse ? new Date(demande.dateReponse) : null
                };

                // Supprimer l'ancien ID string
                delete demandeData.id;

                await Demande.create(demandeData);
                successCount++;
            } catch (error) {
                console.error(`❌ Erreur migration demande ${demande.id || demande._id}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n✅ Migration terminée !');
        console.log(`✅ ${successCount} demandes migrées avec succès`);
        if (errorCount > 0) {
            console.log(`❌ ${errorCount} erreurs`);
        }

        // Option pour sauvegarder le fichier JSON
        if (process.argv.includes('--backup')) {
            const backupFile = DATA_FILE.replace('.json', `.backup.${Date.now()}.json`);
            fs.copyFileSync(DATA_FILE, backupFile);
            console.log(`💾 Backup créé: ${backupFile}`);
        }

        await mongoose.connection.close();
        console.log('🔌 Connexion fermée');
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Exécuter la migration
migrate();
