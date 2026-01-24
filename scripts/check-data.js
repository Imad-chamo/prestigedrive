// Script pour vérifier les données dans MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const Demande = require('../models/Demande');

async function checkData() {
    try {
        console.log('🔍 Vérification des données...\n');
        
        // Connexion MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ MONGODB_URI non défini dans .env');
            process.exit(1);
        }
        
        console.log('📡 Connexion à MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connecté à MongoDB\n');
        
        // Compter les demandes
        const count = await Demande.countDocuments();
        console.log(`📊 Nombre total de demandes : ${count}\n`);
        
        if (count === 0) {
            console.log('⚠️  Aucune donnée dans MongoDB !');
            console.log('\n💡 Solutions :');
            console.log('  1. Vérifiez que le serveur tourne : npm start');
            console.log('  2. Créez une demande depuis le formulaire sur http://localhost:3000');
            console.log('  3. Ou migrez les anciennes données : npm run migrate');
        } else {
            // Afficher les premières demandes
            const demandes = await Demande.find().sort({ dateCreation: -1 }).limit(5);
            console.log('📋 Dernières demandes :\n');
            demandes.forEach((d, i) => {
                console.log(`${i + 1}. ${d.name} (${d.email}) - ${d.status} - ${d.dateCreation}`);
            });
        }
        
        // Statistiques par statut
        const stats = await Demande.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        console.log('\n📈 Statistiques par statut :');
        stats.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count}`);
        });
        
        await mongoose.disconnect();
        console.log('\n✅ Vérification terminée');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

checkData();
