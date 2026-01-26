/**
 * Script de diagnostic avancé pour le système d'email
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Diagnostic complet du système d\'email...\n');

// 1. Vérifier les variables d'environnement
console.log('1️⃣  Vérification des variables d\'environnement :');
const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
const optionalVars = ['SMTP_PORT', 'SMTP_SECURE', 'SMTP_FROM', 'ADMIN_EMAIL'];

let allPresent = true;
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Masquer le mot de passe
        if (varName === 'SMTP_PASS') {
            console.log(`   ✅ ${varName}: ${'*'.repeat(Math.min(value.length, 8))} (${value.length} caractères)`);
        } else {
            console.log(`   ✅ ${varName}: ${value}`);
        }
    } else {
        console.log(`   ❌ ${varName}: NON CONFIGURÉ`);
        allPresent = false;
    }
});

optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`   ℹ️  ${varName}: ${value}`);
    } else {
        console.log(`   ⚠️  ${varName}: Non configuré (utilisera la valeur par défaut)`);
    }
});

console.log('');

if (!allPresent) {
    console.error('❌ Variables obligatoires manquantes !');
    process.exit(1);
}

// 2. Configuration du transporteur
console.log('2️⃣  Configuration du transporteur SMTP :');
const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
    }
};

console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
console.log(`   Secure: ${config.secure} (SSL/TLS)`);
console.log(`   User: ${config.auth.user}`);
console.log(`   Pass: ${'*'.repeat(Math.min(config.auth.pass.length, 8))} (${config.auth.pass.length} caractères)`);
console.log(`   TLS Reject Unauthorized: ${config.tls.rejectUnauthorized}`);
console.log('');

// 3. Vérifications spécifiques pour Gmail
if (config.host.includes('gmail.com')) {
    console.log('3️⃣  Vérifications spécifiques Gmail :');
    
    // Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.auth.user)) {
        console.error('   ❌ Format d\'email invalide pour SMTP_USER');
    } else {
        console.log('   ✅ Format d\'email valide');
    }
    
    // Vérifier la longueur du mot de passe
    if (config.auth.pass.length === 16) {
        console.log('   ✅ Longueur du mot de passe correcte (16 caractères - mot de passe d\'application)');
    } else if (config.auth.pass.length < 8) {
        console.warn('   ⚠️  Mot de passe très court - assurez-vous d\'utiliser un mot de passe d\'application');
    } else {
        console.warn('   ⚠️  Longueur du mot de passe inhabituelle - pour Gmail, utilisez un mot de passe d\'application (16 caractères)');
    }
    
    // Vérifier le port
    if (config.port === 587 && !config.secure) {
        console.log('   ✅ Port 587 avec TLS (recommandé)');
    } else if (config.port === 465 && config.secure) {
        console.log('   ✅ Port 465 avec SSL (alternatif)');
    } else {
        console.warn(`   ⚠️  Configuration de port inhabituelle pour Gmail (port ${config.port}, secure: ${config.secure})`);
    }
    
    console.log('');
}

// 4. Test de connexion
console.log('4️⃣  Test de connexion SMTP :');
const transporter = nodemailer.createTransport(config);

transporter.verify()
    .then(() => {
        console.log('   ✅ Connexion SMTP réussie !');
        console.log('');
        console.log('5️⃣  Test d\'envoi d\'email :');
        
        // Test d'envoi
        const testEmail = {
            from: `"Test PrestigeDrive" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
            subject: 'Test Email - PrestigeDrive',
            text: 'Ceci est un email de test. Si vous recevez ce message, la configuration email fonctionne correctement !',
            html: '<p>Ceci est un email de test. Si vous recevez ce message, la configuration email fonctionne correctement !</p>'
        };
        
        return transporter.sendMail(testEmail);
    })
    .then(info => {
        console.log('   ✅ Email de test envoyé avec succès !');
        console.log(`   📧 Message ID: ${info.messageId}`);
        console.log(`   📬 Destinataire: ${info.accepted.join(', ')}`);
        console.log('');
        console.log('🎉 Tous les tests sont passés ! Le système d\'email est correctement configuré.');
        process.exit(0);
    })
    .catch(error => {
        console.error('   ❌ Erreur:', error.message);
        console.log('');
        
        // Analyse détaillée de l'erreur
        console.log('6️⃣  Analyse de l\'erreur :');
        
        if (error.code === 'EAUTH') {
            console.error('   ❌ Erreur d\'authentification');
            console.error('   Causes possibles :');
            console.error('      - Mot de passe incorrect');
            console.error('      - Pour Gmail : vous utilisez votre mot de passe Gmail au lieu d\'un mot de passe d\'application');
            console.error('      - Validation en 2 étapes non activée (requis pour Gmail)');
            console.error('      - Nom d\'utilisateur incorrect');
        } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
            console.error('   ❌ Erreur de connexion');
            console.error('   Causes possibles :');
            console.error('      - Serveur SMTP inaccessible');
            console.error('      - Port bloqué par le pare-feu');
            console.error('      - Host SMTP incorrect');
        } else if (error.code === 'EENVELOPE') {
            console.error('   ❌ Erreur d\'enveloppe');
            console.error('   Causes possibles :');
            console.error('      - Adresse email destinataire invalide');
            console.error('      - Adresse email expéditeur invalide');
        } else {
            console.error('   ❌ Erreur inconnue');
            console.error('   Code:', error.code);
            console.error('   Détails:', error);
        }
        
        console.log('');
        console.log('💡 Solutions :');
        console.log('   1. Vérifiez que vous utilisez un mot de passe d\'application pour Gmail');
        console.log('   2. Vérifiez que la validation en 2 étapes est activée');
        console.log('   3. Vérifiez que SMTP_USER est votre adresse email complète');
        console.log('   4. Essayez avec un autre fournisseur email (SendGrid, Mailgun, etc.)');
        console.log('   5. Consultez CONFIGURATION_EMAIL.md pour plus d\'aide');
        
        process.exit(1);
    });
