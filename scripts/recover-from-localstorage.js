/**
 * Script pour récupérer les données depuis localStorage du navigateur
 * Usage: 
 * 1. Ouvrez la console du navigateur (F12)
 * 2. Copiez le contenu de localStorage.getItem('demandes_devis')
 * 3. Collez-le dans un fichier data/demandes.json
 * 4. Exécutez: npm run migrate
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Demande = require('../models/Demande');

const DATA_FILE = path.join(__dirname, '..', 'data', 'demandes.json');

async function recoverData() {
    try {
        console.log('🔍 Recherche des anciennes données...\n');
        
        // Connexion à MongoDB
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error('❌ MONGODB_URI non défini dans .env');
            process.exit(1);
        }
        
        console.log('📡 Connexion à MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connecté à MongoDB\n');
        
        // Vérifier si le fichier JSON existe
        if (!fs.existsSync(DATA_FILE)) {
            console.log('⚠️  Aucun fichier JSON trouvé dans data/demandes.json');
            console.log('\n💡 Pour récupérer les données depuis localStorage :');
            console.log('  1. Ouvrez la console du navigateur (F12)');
            console.log('  2. Tapez : localStorage.getItem("demandes_devis")');
            console.log('  3. Copiez le résultat (sans les guillemets)');
            console.log('  4. Créez le dossier : mkdir -p data');
            console.log('  5. Créez le fichier data/demandes.json avec le contenu copié');
            console.log('  6. Relancez : npm run migrate\n');
            
            // Vérifier s'il y a des données dans MongoDB
            const count = await Demande.countDocuments();
            if (count === 0) {
                console.log('❌ Aucune donnée trouvée dans MongoDB non plus.');
                console.log('💡 Les données ont peut-être été perdues lors de la migration.');
            } else {
                console.log(`✅ ${count} demande(s) trouvée(s) dans MongoDB`);
            }
            
            await mongoose.connection.close();
            return;
        }
        
        // Lire les données JSON
        console.log('📂 Lecture du fichier JSON...');
        const jsonData = fs.readFileSync(DATA_FILE, 'utf8');
        let demandes;
        
        try {
            demandes = JSON.parse(jsonData);
        } catch (parseError) {
            console.error('❌ Erreur de parsing JSON:', parseError.message);
            console.log('\n💡 Le fichier JSON est peut-être mal formaté.');
            console.log('   Vérifiez que c\'est un tableau JSON valide : [...]');
            await mongoose.connection.close();
            return;
        }
        
        if (!Array.isArray(demandes)) {
            console.error('❌ Le fichier JSON doit contenir un tableau de demandes');
            await mongoose.connection.close();
            return;
        }
        
        if (demandes.length === 0) {
            console.log('⚠️  Le fichier JSON est vide.');
            await mongoose.connection.close();
            return;
        }
        
        console.log(`📦 ${demandes.length} demande(s) trouvée(s) dans le fichier JSON\n`);
        
        // Vérifier si des données existent déjà
        const existingCount = await Demande.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  ${existingCount} demande(s) existe(nt) déjà dans MongoDB`);
            console.log('💡 Utilisez --force pour remplacer les données existantes\n');
            
            if (!process.argv.includes('--force')) {
                console.log('❌ Migration annulée. Utilisez --force pour forcer.');
                await mongoose.connection.close();
                return;
            }
            
            console.log('🗑️  Suppression des données existantes...');
            await Demande.deleteMany({});
        }
        
        // Migrer les données
        console.log('📤 Migration des données...\n');
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < demandes.length; i++) {
            const demande = demandes[i];
            try {
                const demandeData = {
                    name: demande.name || '',
                    email: demande.email || '',
                    phone: demande.phone || '',
                    pickup: demande.pickup || '',
                    dropoff: demande.dropoff || '',
                    date: demande.date || '',
                    time: demande.time || '',
                    passengers: demande.passengers || 1,
                    serviceType: demande.serviceType || '',
                    message: demande.message || '',
                    status: demande.status || 'nouvelle',
                    devis: demande.devis || null,
                    reponse: demande.reponse || null,
                    dateCreation: demande.dateCreation ? new Date(demande.dateCreation) : new Date(),
                    dateReponse: demande.dateReponse ? new Date(demande.dateReponse) : null
                };
                
                await Demande.create(demandeData);
                successCount++;
                process.stdout.write(`\r✅ ${i + 1}/${demandes.length} migrées...`);
            } catch (error) {
                console.error(`\n❌ Erreur migration demande ${i + 1}:`, error.message);
                errorCount++;
            }
        }
        
        console.log('\n\n✅ Migration terminée !');
        console.log(`✅ ${successCount} demande(s) migrée(s) avec succès`);
        if (errorCount > 0) {
            console.log(`❌ ${errorCount} erreur(s)`);
        }
        
        // Créer un backup
        const backupFile = DATA_FILE.replace('.json', `.backup.${Date.now()}.json`);
        fs.copyFileSync(DATA_FILE, backupFile);
        console.log(`💾 Backup créé: ${backupFile}`);
        
        await mongoose.connection.close();
        console.log('🔌 Connexion fermée');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.message.includes('IP')) {
            console.log('\n💡 Votre IP n\'est pas autorisée dans MongoDB Atlas.');
            console.log('   Consultez docs/FIX_IP_MONGODB.md pour résoudre ce problème.');
        }
        process.exit(1);
    }
}

recoverData();
