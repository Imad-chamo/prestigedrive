require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectDB = require('../config/database');

const createAdmin = async () => {
    try {
        await connectDB();

        const username = process.argv[2];
        const password = process.argv[3];

        if (!username || !password) {
            console.log('Usage: node scripts/create-admin.js <username> <password>');
            process.exit(1);
        }

        // Vérifier si l'admin existe déjà
        const adminExists = await Admin.findOne({ username });
        if (adminExists) {
            console.log('❌ Cet administrateur existe déjà');
            process.exit(1);
        }

        // Créer l'admin
        const admin = await Admin.create({
            username,
            password
        });

        console.log(`✅ Administrateur créé avec succès: ${admin.username}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
};

createAdmin();
