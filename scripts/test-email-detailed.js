/**
 * Script de test détaillé pour diagnostiquer les problèmes d'email
 * Ce script explique chaque étape et identifie les problèmes
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 TEST DÉTAILLÉ DE LA CONFIGURATION EMAIL\n');
console.log('='.repeat(60));
console.log('');

// ============================================
// ÉTAPE 1 : Vérifier les variables d'environnement
// ============================================
console.log('📋 ÉTAPE 1 : Vérification des variables d\'environnement');
console.log('-'.repeat(60));

const requiredVars = {
    'SMTP_HOST': process.env.SMTP_HOST,
    'SMTP_PORT': process.env.SMTP_PORT || '587 (par défaut)',
    'SMTP_SECURE': process.env.SMTP_SECURE || 'false (par défaut)',
    'SMTP_USER': process.env.SMTP_USER,
    'SMTP_PASS': process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) + ' (' + process.env.SMTP_PASS.length + ' caractères)' : null,
    'SMTP_FROM': process.env.SMTP_FROM || process.env.SMTP_USER || 'Non configuré',
    'ADMIN_EMAIL': process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'Non configuré'
};

let allPresent = true;
for (const [varName, value] of Object.entries(requiredVars)) {
    if (value && value !== 'Non configuré' && !value.includes('par défaut')) {
        console.log(`   ✅ ${varName}: ${value}`);
    } else if (value && value.includes('par défaut')) {
        console.log(`   ℹ️  ${varName}: ${value}`);
    } else {
        console.log(`   ❌ ${varName}: NON CONFIGURÉ`);
        if (['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].includes(varName)) {
            allPresent = false;
        }
    }
}

console.log('');

if (!allPresent) {
    console.error('❌ PROBLÈME : Variables obligatoires manquantes !');
    console.error('   Configurez SMTP_HOST, SMTP_USER et SMTP_PASS dans Railway → Variables');
    console.error('');
    process.exit(1);
}

// ============================================
// ÉTAPE 2 : Vérifier le format des valeurs
// ============================================
console.log('🔍 ÉTAPE 2 : Vérification du format des valeurs');
console.log('-'.repeat(60));

const issues = [];

// Vérifier SMTP_HOST
const smtpHost = process.env.SMTP_HOST;
if (smtpHost) {
    if (smtpHost.includes(' ')) {
        issues.push('SMTP_HOST contient des espaces');
    }
    if (smtpHost.startsWith(' ') || smtpHost.endsWith(' ')) {
        issues.push('SMTP_HOST a des espaces avant/après');
    }
    if (smtpHost === 'smtp-relay.brevo.com') {
        console.log('   ✅ SMTP_HOST: Format correct pour Brevo');
    } else if (smtpHost === 'smtp.sendgrid.net') {
        console.log('   ✅ SMTP_HOST: Format correct pour SendGrid');
    } else {
        console.log(`   ⚠️  SMTP_HOST: "${smtpHost}" - Vérifiez l\'orthographe`);
    }
}

// Vérifier SMTP_PORT
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
if (smtpPort === 587) {
    console.log('   ✅ SMTP_PORT: 587 (correct pour TLS)');
} else if (smtpPort === 465) {
    console.log('   ✅ SMTP_PORT: 465 (correct pour SSL)');
} else {
    console.log(`   ⚠️  SMTP_PORT: ${smtpPort} - Devrait être 587 ou 465`);
    issues.push(`SMTP_PORT devrait être 587 ou 465, pas ${smtpPort}`);
}

// Vérifier SMTP_SECURE
const smtpSecure = process.env.SMTP_SECURE === 'true';
if (smtpPort === 587 && !smtpSecure) {
    console.log('   ✅ SMTP_SECURE: false (correct pour port 587)');
} else if (smtpPort === 465 && smtpSecure) {
    console.log('   ✅ SMTP_SECURE: true (correct pour port 465)');
} else {
    console.log(`   ⚠️  SMTP_SECURE: ${process.env.SMTP_SECURE} - Vérifiez la cohérence avec le port`);
    issues.push(`SMTP_SECURE devrait être false pour port 587, true pour port 465`);
}

// Vérifier SMTP_USER
const smtpUser = process.env.SMTP_USER;
if (smtpUser) {
    if (smtpUser.includes(' ')) {
        issues.push('SMTP_USER contient des espaces');
    }
    if (smtpUser === 'apikey' && smtpHost === 'smtp.sendgrid.net') {
        console.log('   ✅ SMTP_USER: "apikey" (correct pour SendGrid)');
    } else if (smtpUser.includes('@') && smtpHost === 'smtp-relay.brevo.com') {
        console.log('   ✅ SMTP_USER: Format email (correct pour Brevo)');
    } else {
        console.log(`   ⚠️  SMTP_USER: "${smtpUser}" - Vérifiez le format`);
    }
}

// Vérifier SMTP_PASS
const smtpPass = process.env.SMTP_PASS;
if (smtpPass) {
    if (smtpPass.includes(' ')) {
        issues.push('SMTP_PASS contient des espaces');
    }
    if (smtpPass.length < 10) {
        console.log('   ⚠️  SMTP_PASS: Très court - Vérifiez que c\'est le bon mot de passe');
    } else if (smtpPass.startsWith('SG.') && smtpHost === 'smtp.sendgrid.net') {
        console.log('   ✅ SMTP_PASS: Format correct pour SendGrid (commence par SG.)');
    } else if (smtpPass.startsWith('xsmtpib-') && smtpHost === 'smtp-relay.brevo.com') {
        console.log('   ✅ SMTP_PASS: Format correct pour Brevo (commence par xsmtpib-)');
    } else {
        console.log(`   ℹ️  SMTP_PASS: ${smtpPass.length} caractères`);
    }
}

console.log('');

if (issues.length > 0) {
    console.log('⚠️  PROBLÈMES DÉTECTÉS :');
    issues.forEach(issue => console.log(`   - ${issue}`));
    console.log('');
}

// ============================================
// ÉTAPE 3 : Créer la configuration SMTP
// ============================================
console.log('⚙️  ÉTAPE 3 : Création de la configuration SMTP');
console.log('-'.repeat(60));

const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
};

console.log(`   Host: ${smtpConfig.host}`);
console.log(`   Port: ${smtpConfig.port}`);
console.log(`   Secure: ${smtpConfig.secure} (SSL/TLS)`);
console.log(`   User: ${smtpConfig.auth.user}`);
console.log(`   Pass: ${'*'.repeat(Math.min(smtpPass.length, 8))} (${smtpPass.length} caractères)`);
console.log('');

// ============================================
// ÉTAPE 4 : Tester la connexion SMTP
// ============================================
console.log('🔌 ÉTAPE 4 : Test de connexion SMTP');
console.log('-'.repeat(60));

let transporter;
try {
    transporter = nodemailer.createTransport(smtpConfig);
    console.log('   ✅ Transporteur SMTP créé');
} catch (error) {
    console.error('   ❌ Erreur lors de la création du transporteur:', error.message);
    process.exit(1);
}

console.log('   🔄 Tentative de connexion au serveur SMTP...');
console.log('   ⏳ Cela peut prendre jusqu\'à 30 secondes...');
console.log('');

transporter.verify()
    .then(() => {
        console.log('   ✅ CONNEXION SMTP RÉUSSIE !');
        console.log('');
        
        // ============================================
        // ÉTAPE 5 : Test d'envoi d'email
        // ============================================
        console.log('📧 ÉTAPE 5 : Test d\'envoi d\'email');
        console.log('-'.repeat(60));
        
        const testEmail = {
            from: `"Test PrestigeDrive" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
            subject: 'Test Email - PrestigeDrive',
            text: 'Ceci est un email de test. Si vous recevez ce message, la configuration email fonctionne correctement !',
            html: '<p>Ceci est un email de test. Si vous recevez ce message, la configuration email fonctionne correctement !</p>'
        };
        
        console.log(`   📬 Envoi vers: ${testEmail.to}`);
        console.log('   ⏳ Envoi en cours...');
        console.log('');
        
        return transporter.sendMail(testEmail);
    })
    .then(info => {
        console.log('   ✅ EMAIL DE TEST ENVOYÉ AVEC SUCCÈS !');
        console.log(`   📧 Message ID: ${info.messageId}`);
        console.log(`   📬 Destinataire: ${info.accepted.join(', ')}`);
        console.log('');
        console.log('='.repeat(60));
        console.log('🎉 RÉSULTAT : TOUT FONCTIONNE CORRECTEMENT !');
        console.log('='.repeat(60));
        console.log('');
        console.log('✅ La configuration email est correcte');
        console.log('✅ La connexion SMTP fonctionne');
        console.log('✅ L\'envoi d\'emails fonctionne');
        console.log('');
        console.log('💡 Vérifiez votre boîte mail (et les spams) pour recevoir l\'email de test');
        console.log('');
        process.exit(0);
    })
    .catch(error => {
        console.log('');
        console.error('   ❌ ERREUR LORS DU TEST');
        console.error('   Code:', error.code);
        console.error('   Message:', error.message);
        console.log('');
        
        // Analyse détaillée de l'erreur
        console.log('🔍 ANALYSE DE L\'ERREUR :');
        console.log('-'.repeat(60));
        
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
            console.error('   ❌ Type: Connection Timeout');
            console.error('   📋 Explication: Railway ne peut pas se connecter au serveur SMTP');
            console.error('');
            console.error('   💡 Solutions possibles :');
            console.error('      1. Vérifiez que SMTP_HOST est correct :');
            console.error('         - Brevo: smtp-relay.brevo.com');
            console.error('         - SendGrid: smtp.sendgrid.net');
            console.error('      2. Vérifiez qu\'il n\'y a pas d\'espaces avant/après SMTP_HOST');
            console.error('      3. Vérifiez que SMTP_PORT est 587 (ou 465 pour SSL)');
            console.error('      4. Vérifiez que SMTP_SECURE est false pour port 587');
            console.error('      5. Essayez le port 465 avec SMTP_SECURE=true');
            console.error('      6. Vérifiez dans Brevo/SendGrid que votre compte est actif');
        } else if (error.code === 'EAUTH') {
            console.error('   ❌ Type: Erreur d\'authentification');
            console.error('   📋 Explication: Les identifiants SMTP sont incorrects');
            console.error('');
            console.error('   💡 Solutions possibles :');
            console.error('      1. Pour Brevo: Vérifiez que SMTP_USER est votre email Brevo complet');
            console.error('      2. Pour Brevo: Vérifiez que SMTP_PASS est le mot de passe SMTP généré');
            console.error('      3. Pour SendGrid: Vérifiez que SMTP_USER est exactement "apikey"');
            console.error('      4. Pour SendGrid: Vérifiez que SMTP_PASS est votre clé API (commence par SG.)');
            console.error('      5. Générez un nouveau mot de passe SMTP dans Brevo/SendGrid');
            console.error('      6. Vérifiez qu\'il n\'y a pas d\'espaces avant/après SMTP_USER et SMTP_PASS');
        } else if (error.code === 'EENVELOPE') {
            console.error('   ❌ Type: Erreur d\'enveloppe');
            console.error('   📋 Explication: L\'adresse email destinataire est invalide');
            console.error('');
            console.error('   💡 Solutions possibles :');
            console.error('      1. Vérifiez que ADMIN_EMAIL est une adresse email valide');
            console.error('      2. Vérifiez que SMTP_FROM est une adresse email valide');
        } else {
            console.error('   ❌ Type: Erreur inconnue');
            console.error('   Code:', error.code);
            console.error('   Message:', error.message);
        }
        
        console.log('');
        console.log('='.repeat(60));
        console.log('❌ RÉSULTAT : PROBLÈME DÉTECTÉ');
        console.log('='.repeat(60));
        console.log('');
        console.log('💡 Consultez les solutions ci-dessus pour résoudre le problème');
        console.log('');
        process.exit(1);
    });
