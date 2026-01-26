/**
 * Script de test pour vérifier la configuration email
 */

require('dotenv').config();
const emailService = require('../services/emailService');

console.log('🧪 Test de la configuration email...\n');

// Vérifier les variables d'environnement
console.log('📋 Vérification des variables d\'environnement :');
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST ? '✅ Configuré' : '❌ Non configuré'}`);
console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '587 (par défaut)'}`);
console.log(`   SMTP_SECURE: ${process.env.SMTP_SECURE || 'false (par défaut)'}`);
console.log(`   SMTP_USER: ${process.env.SMTP_USER ? '✅ Configuré' : '❌ Non configuré'}`);
console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Configuré' : '❌ Non configuré'}`);
console.log(`   SMTP_FROM: ${process.env.SMTP_FROM || process.env.SMTP_USER || 'Non configuré'}`);
console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'Non configuré'}`);
console.log('');

// Initialiser le service email
console.log('🔧 Initialisation du service email...');
const initialized = emailService.initEmailService();

if (!initialized) {
    console.error('❌ Le service email n\'a pas pu être initialisé.');
    console.error('   Vérifiez que SMTP_HOST, SMTP_USER et SMTP_PASS sont configurés.');
    process.exit(1);
}

// Vérifier la connexion SMTP
console.log('🔌 Vérification de la connexion SMTP...');
emailService.verifyConnection()
    .then(success => {
        if (success) {
            console.log('✅ Connexion SMTP réussie !');
            console.log('');
            console.log('🎉 La configuration email est correcte !');
            console.log('   Vous pouvez maintenant envoyer des emails.');
            process.exit(0);
        } else {
            console.error('❌ La connexion SMTP a échoué.');
            console.error('   Vérifiez vos identifiants et la configuration SMTP.');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Erreur lors de la vérification SMTP:', error.message);
        console.error('   Détails:', error);
        process.exit(1);
    });
