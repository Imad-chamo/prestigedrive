/**
 * Script pour tester l'API et voir pourquoi les données ne s'affichent pas
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Demande = require('../models/Demande');

async function testAPI() {
    try {
        console.log('🔍 Test de l\'API MongoDB...\n');
        
        // Connexion MongoDB
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error('❌ MONGODB_URI non défini dans .env');
            process.exit(1);
        }
        
        console.log('📡 Connexion à MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connecté à MongoDB\n');
        
        // Compter les demandes
        const count = await Demande.countDocuments();
        console.log(`📊 Nombre total de demandes : ${count}\n`);
        
        if (count === 0) {
            console.log('⚠️  Aucune donnée dans MongoDB !');
            console.log('💡 Créez une demande depuis le formulaire sur http://localhost:3000');
            await mongoose.connection.close();
            return;
        }
        
        // Récupérer les demandes (comme l'API)
        console.log('📤 Récupération des demandes (comme l\'API)...');
        const demandes = await Demande.find().sort({ dateCreation: -1 });
        
        console.log(`✅ ${demandes.length} demande(s) trouvée(s)\n`);
        
        // Afficher le format de la première demande
        if (demandes.length > 0) {
            const first = demandes[0];
            console.log('📋 Format de la première demande :');
            console.log(JSON.stringify(first.toJSON(), null, 2));
            console.log('\n');
            
            // Vérifier les champs requis
            console.log('🔍 Vérification des champs :');
            console.log(`  - id: ${first.toJSON().id ? '✅' : '❌'}`);
            console.log(`  - name: ${first.name ? '✅' : '❌'}`);
            console.log(`  - email: ${first.email ? '✅' : '❌'}`);
            console.log(`  - status: ${first.status ? '✅' : '❌'}`);
            console.log(`  - dateCreation: ${first.dateCreation ? '✅' : '❌'}`);
            console.log('\n');
        }
        
        // Tester le format de l'API
        console.log('🧪 Test du format API (comme server.js) :');
        const apiFormat = {
            success: true,
            data: demandes.map(d => d.toJSON())
        };
        
        console.log(`✅ Format API valide :`);
        console.log(`  - success: ${apiFormat.success}`);
        console.log(`  - data.length: ${apiFormat.data.length}`);
        console.log(`  - Premier élément a un 'id': ${apiFormat.data[0]?.id ? '✅' : '❌'}`);
        console.log('\n');
        
        // Vérifier les statuts
        const stats = await Demande.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        console.log('📈 Statistiques par statut :');
        stats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count}`);
        });
        console.log('\n');
        
        // Vérifier si le serveur est démarré
        console.log('💡 Pour tester l\'API HTTP :');
        console.log('  1. Assurez-vous que le serveur tourne : npm start');
        console.log('  2. Testez : curl http://localhost:3000/api/demandes');
        console.log('  3. Ou ouvrez : http://localhost:3000/api/demandes dans votre navigateur');
        
        await mongoose.connection.close();
        console.log('\n✅ Test terminé');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.message.includes('IP')) {
            console.log('\n💡 Votre IP n\'est pas autorisée dans MongoDB Atlas.');
            console.log('   Consultez docs/FIX_IP_MONGODB.md');
        }
        process.exit(1);
    }
}

testAPI();
