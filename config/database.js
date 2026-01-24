const mongoose = require('mongoose');
require('dotenv').config();

// Configuration de la connexion MongoDB
const connectDB = async () => {
    try {
        // Utiliser l'URI MongoDB Atlas depuis .env ou fallback local
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prestigedrive';
        
        // Les options useNewUrlParser et useUnifiedTopology sont dépréciées depuis Mongoose 6+
        // Elles sont maintenant activées par défaut
        const conn = await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
        console.log(`📊 Base de données: ${conn.connection.name}`);
        
        return conn;
    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error.message);
        console.error('💡 Vérifiez votre MONGODB_URI dans le fichier .env');
        process.exit(1);
    }
};

// Gestion de la déconnexion
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB déconnecté');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Erreur MongoDB:', err);
});

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
});

module.exports = connectDB;
