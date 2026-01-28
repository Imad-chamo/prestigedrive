require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import de la connexion MongoDB et du modèle
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Demande = require('./models/Demande');
const Admin = require('./models/Admin');
const { protect } = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

// Import du service email
const emailService = require('./services/emailService');

const app = express();

// Configuration du port pour Render
// Render fournit automatiquement PORT via process.env.PORT
const PORT = process.env.PORT || 3000;

// Rate limiting simple (en mémoire)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requêtes par minute

// Middleware de rate limiting
function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }

    const limit = rateLimitMap.get(ip);

    if (now > limit.resetTime) {
        limit.count = 1;
        limit.resetTime = now + RATE_LIMIT_WINDOW;
        return next();
    }

    if (limit.count >= RATE_LIMIT_MAX) {
        return res.status(429).json({
            success: false,
            error: 'Trop de requêtes. Veuillez réessayer plus tard.'
        });
    }

    limit.count++;
    next();
}

// Nettoyer le rate limit map périodiquement
setInterval(() => {
    const now = Date.now();
    for (const [ip, limit] of rateLimitMap.entries()) {
        if (now > limit.resetTime) {
            rateLimitMap.delete(ip);
        }
    }
}, RATE_LIMIT_WINDOW);

// Fonction de sanitization
function sanitizeInput(input) {
    if (typeof input === 'string') {
        return input
            .trim()
            .replace(/[<>]/g, '') // Supprimer les balises HTML
            .substring(0, 10000); // Limiter la longueur
    }
    return input;
}

// Fonction de validation
function validateDemande(body) {
    const errors = [];

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
        errors.push('Le nom doit contenir au moins 2 caractères');
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        errors.push('Email invalide');
    }

    if (!body.phone || typeof body.phone !== 'string' || body.phone.trim().length < 8) {
        errors.push('Numéro de téléphone invalide');
    }

    return errors;
}

// Middleware
app.use(cors());

// Webhook Stripe (DOIT être AVANT bodyParser.json() pour recevoir le body brut)
if (process.env.STRIPE_SECRET_KEY) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
        const stripeService = require('./services/stripeService');
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Erreur webhook:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Gérer les événements
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                // Paiement réussi - créer et envoyer la facture automatiquement
                try {
                    if (session.payment_intent) {
                        const invoice = await stripeService.createInvoice(session.payment_intent);
                        console.log('✅ Facture créée et envoyée:', invoice.id);

                        // Mettre à jour la demande avec l'ID de facture
                        if (session.metadata && session.metadata.demande_id) {
                            await Demande.findByIdAndUpdate(session.metadata.demande_id, {
                                status: 'paye',
                                datePaiement: new Date(),
                                stripeInvoiceId: invoice.id
                            });
                        }
                    }
                } catch (error) {
                    console.error('Erreur traitement paiement:', error);
                }
                break;

            case 'invoice.payment_succeeded':
                console.log('✅ Facture payée:', event.data.object.id);
                break;
        }

        res.json({ received: true });
    });
}

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimit);

// Configuration Helmet personnalisée pour autoriser les images
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https:", "data:"],
            connectSrc: ["'self'", "https://nominatim.openstreetmap.org"],
            frameAncestors: ["'self'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            objectSrc: ["'none'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Route de Login Admin
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Vérifier si l'admin existe
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ success: false, error: 'Identifiants invalides' });
        }

        // Vérifier le mot de passe
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Identifiants invalides' });
        }

        // Mettre à jour la date de dernière connexion
        admin.lastLogin = Date.now();
        await admin.save();

        // Créer le token
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret_par_defaut_a_changer', {
            expiresIn: '30d'
        });

        res.json({ success: true, token, username: admin.username });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Routes Stripe (si configuré) - AVANT les autres routes API
if (process.env.STRIPE_SECRET_KEY) {
    const stripeService = require('./services/stripeService');
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Créer une session de paiement
    app.post('/api/paiement/create-session', async (req, res) => {
        try {
            const { demandeId, amount } = req.body;

            if (!demandeId || !amount) {
                return res.status(400).json({ success: false, error: 'demandeId et amount requis' });
            }

            // Récupérer la demande
            const demande = await Demande.findById(demandeId);
            if (!demande) {
                return res.status(404).json({ success: false, error: 'Demande non trouvée' });
            }

            // Créer la session Stripe
            const session = await stripeService.createCheckoutSession(demande, parseFloat(amount));

            // Sauvegarder l'ID de session dans la demande
            await Demande.findByIdAndUpdate(demandeId, {
                stripeSessionId: session.id
            });

            res.json({
                success: true,
                sessionId: session.id,
                url: session.url
            });
        } catch (error) {
            console.error('Erreur création session paiement:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Webhook Stripe (pour les événements) - DOIT être avant express.json()
    app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Erreur webhook:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Gérer les événements
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                // Paiement réussi - créer et envoyer la facture automatiquement
                try {
                    if (session.payment_intent) {
                        const invoice = await stripeService.createInvoice(session.payment_intent);
                        console.log('✅ Facture créée et envoyée:', invoice.id);

                        // Mettre à jour la demande avec l'ID de facture
                        if (session.metadata && session.metadata.demande_id) {
                            await Demande.findByIdAndUpdate(session.metadata.demande_id, {
                                status: 'paye',
                                datePaiement: new Date(),
                                stripeInvoiceId: invoice.id
                            });
                        }
                    }
                } catch (error) {
                    console.error('Erreur traitement paiement:', error);
                }
                break;

            case 'invoice.payment_succeeded':
                console.log('✅ Facture payée:', event.data.object.id);
                break;
        }

        res.json({ received: true });
    });

    // Récupérer une session
    app.get('/api/paiement/session/:sessionId', async (req, res) => {
        try {
            const session = await stripeService.getSession(req.params.sessionId);
            res.json({ success: true, data: session });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
}

// API Routes - Utilisation de MongoDB (AVANT les fichiers statiques pour éviter les conflits)

// Récupérer toutes les demandes
// Récupérer toutes les demandes (PROTÉGÉ)
app.get('/api/demandes', protect, async (req, res) => {
    try {
        const demandes = await Demande.find().sort({ dateCreation: -1 });
        res.json({ success: true, data: demandes });
    } catch (error) {
        console.error('Erreur récupération demandes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Récupérer une demande par ID
// Récupérer une demande par ID (PROTÉGÉ)
app.get('/api/demandes/:id', protect, async (req, res) => {
    try {
        const demande = await Demande.findById(req.params.id);
        if (demande) {
            res.json({ success: true, data: demande });
        } else {
            res.status(404).json({ success: false, error: 'Demande non trouvée' });
        }
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'ID invalide' });
        }
        console.error('Erreur récupération demande:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route de health check pour Railway
app.get('/api/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            email: (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ? 'configured' : 'not configured'
        }
    };
    console.log('💚 Health check appelé:', health);
    res.json(health);
});

// Route de test pour vérifier l'envoi d'email depuis le formulaire
app.post('/api/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('='.repeat(60));
        console.log('🧪 TEST D\'ENVOI D\'EMAIL');
        console.log('='.repeat(60));
        console.log(`📧 Email de test: ${email}`);
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
        
        if (!email) {
            console.error('❌ Email requis manquant');
            return res.status(400).json({ success: false, error: 'Email requis' });
        }

        console.log('🧪 Test d\'envoi d\'email vers:', email);

        // Créer une demande de test
        const testDemande = {
            name: 'Test User',
            email: email,
            phone: '0600000000',
            pickup: 'Test Pickup',
            dropoff: 'Test Dropoff',
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            passengers: 1,
            serviceType: 'ville',
            message: 'Email de test depuis le formulaire',
            status: 'nouvelle'
        };

        console.log('📤 Envoi des emails de test...');
        const results = await emailService.sendNewDemandeEmails(testDemande);

        console.log('='.repeat(60));
        console.log('📊 RÉSULTATS DU TEST');
        console.log('='.repeat(60));
        console.log(`Client: ${results.client.success ? '✅ Succès' : '❌ Échec'}`);
        if (!results.client.success) {
            console.error(`   Erreur: ${results.client.error}`);
            console.error(`   Code: ${results.client.code || 'N/A'}`);
        }
        console.log(`Admin: ${results.admin.success ? '✅ Succès' : '❌ Échec'}`);
        if (!results.admin.success) {
            console.error(`   Erreur: ${results.admin.error}`);
            console.error(`   Code: ${results.admin.code || 'N/A'}`);
        }
        console.log('='.repeat(60));

        res.json({
            success: true,
            message: 'Test d\'envoi effectué',
            results: {
                client: results.client.success ? '✅ Email client envoyé' : '❌ Erreur: ' + results.client.error,
                admin: results.admin.success ? '✅ Email admin envoyé' : '❌ Erreur: ' + results.admin.error
            }
        });
    } catch (error) {
        console.error('='.repeat(60));
        console.error('❌ ERREUR LORS DU TEST EMAIL');
        console.error('='.repeat(60));
        console.error('❌ Erreur test email:', error);
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
        console.error('='.repeat(60));
        res.status(500).json({ success: false, error: error.message });
    }
});

// Créer une nouvelle demande
app.post('/api/demandes', async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('='.repeat(60));
        console.log('📥 NOUVELLE DEMANDE REÇUE');
        console.log('='.repeat(60));
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
        console.log(`👤 Nom: ${req.body.name || 'N/A'}`);
        console.log(`📧 Email: ${req.body.email || 'N/A'}`);
        console.log(`📞 Téléphone: ${req.body.phone || 'N/A'}`);
        console.log(`📍 Pickup: ${req.body.pickup || 'N/A'}`);
        console.log(`🎯 Dropoff: ${req.body.dropoff || 'N/A'}`);
        console.log(`📅 Date: ${req.body.date || 'N/A'}`);
        console.log(`🕐 Heure: ${req.body.time || 'N/A'}`);
        console.log(`🚗 Service: ${req.body.serviceType || 'N/A'}`);

        // Validation
        const validationErrors = validateDemande(req.body);
        if (validationErrors.length > 0) {
            console.error('='.repeat(60));
            console.error('❌ ERREURS DE VALIDATION');
            console.error('='.repeat(60));
            console.error('Erreurs:', validationErrors);
            console.error('='.repeat(60));
            return res.status(400).json({
                success: false,
                error: validationErrors.join(', ')
            });
        }

        // Sanitization
        const demandeData = {
            name: sanitizeInput(req.body.name),
            email: sanitizeInput(req.body.email),
            phone: sanitizeInput(req.body.phone),
            pickup: sanitizeInput(req.body.pickup || ''),
            dropoff: sanitizeInput(req.body.dropoff || ''),
            date: sanitizeInput(req.body.date || ''),
            time: sanitizeInput(req.body.time || ''),
            passengers: parseInt(req.body.passengers) || 1,
            serviceType: sanitizeInput(req.body.serviceType || ''),
            message: sanitizeInput(req.body.message || ''),
            status: 'nouvelle'
        };

        console.log('💾 Sauvegarde dans MongoDB...');
        const nouvelleDemande = await Demande.create(demandeData);
        console.log('✅ Demande créée dans MongoDB:', nouvelleDemande._id);
        console.log(`   ID: ${nouvelleDemande._id}`);

        console.log('='.repeat(60));
        console.log('📧 ENVOI DES EMAILS');
        console.log('='.repeat(60));
        console.log(`📧 Email client: ${nouvelleDemande.email}`);
        console.log(`📧 Email admin: ${process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'N/A'}`);
        console.log(`📧 SMTP Host: ${process.env.SMTP_HOST || 'N/A'}`);
        console.log(`📧 SMTP Port: ${process.env.SMTP_PORT || '587'}`);

        // Envoyer les emails AVANT de répondre pour éviter que Render arrête le conteneur
        // Brevo API gère les timeouts automatiquement (plus rapide que SMTP)
        console.log('='.repeat(60));
        console.log('📧 ENVOI DES EMAILS');
        console.log('='.repeat(60));
        console.log('📧 Démarrage de l\'envoi des emails...');
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
        
        try {
            // Await direct - Nodemailer gère ses propres timeouts
            const results = await emailService.sendNewDemandeEmails(nouvelleDemande);
            
            const emailTime = Date.now() - startTime;
            console.log('='.repeat(60));
            console.log('📊 RÉSULTATS ENVOI EMAILS');
            console.log('='.repeat(60));
            console.log(`⏱️  Temps total: ${emailTime}ms`);
            console.log(`📧 Email client: ${results.client.success ? '✅ Succès' : '❌ Échec'}`);
            if (!results.client.success) {
                console.error(`   ❌ Erreur: ${results.client.error}`);
                console.error(`   📋 Code: ${results.client.code || 'N/A'}`);
            } else {
                console.log(`   ✅ Message ID: ${results.client.messageId || 'N/A'}`);
            }
            console.log(`📧 Email admin: ${results.admin.success ? '✅ Succès' : '❌ Échec'}`);
            if (!results.admin.success) {
                console.error(`   ❌ Erreur: ${results.admin.error}`);
                console.error(`   📋 Code: ${results.admin.code || 'N/A'}`);
            } else {
                console.log(`   ✅ Message ID: ${results.admin.messageId || 'N/A'}`);
            }
            console.log('='.repeat(60));
        } catch (error) {
            // Erreur non attendue (ne devrait pas arriver car sendNewDemandeEmails retourne toujours un objet)
            const emailTime = Date.now() - startTime;
            console.error('='.repeat(60));
            console.error('⚠️  ERREUR INATTENDUE LORS DE L\'ENVOI DES EMAILS');
            console.error('='.repeat(60));
            console.error(`❌ Erreur: ${error.message}`);
            console.error(`📋 Type: ${error.name || 'Unknown'}`);
            console.error(`⏱️  Temps avant erreur: ${emailTime}ms`);
            if (error.stack) {
                console.error(`📚 Stack: ${error.stack}`);
            }
            console.error('='.repeat(60));
            console.warn('⚠️  La demande a été créée mais une erreur inattendue s\'est produite lors de l\'envoi d\'email');
            console.warn('⚠️  Vérifiez les logs ci-dessus pour les détails des emails individuels');
        }

        const totalTime = Date.now() - startTime;
        console.log(`✅ Demande traitée avec succès en ${totalTime}ms`);
        console.log('='.repeat(60));

        res.status(201).json({ success: true, data: nouvelleDemande });
    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('='.repeat(60));
        console.error('❌ ERREUR CRITIQUE LORS DE LA CRÉATION DE LA DEMANDE');
        console.error('='.repeat(60));
        console.error('❌ Erreur:', error.message);
        console.error('📋 Type:', error.name);
        console.error('📚 Stack:', error.stack);
        console.error(`⏱️  Temps avant erreur: ${totalTime}ms`);
        console.error('='.repeat(60));
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Mettre à jour une demande
// Mettre à jour une demande (PROTÉGÉ)
app.put('/api/demandes/:id', protect, async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: 'ID invalide' });
        }

        // Sanitization des champs mis à jour
        const updateData = {};
        if (req.body.name) updateData.name = sanitizeInput(req.body.name);
        if (req.body.email) updateData.email = sanitizeInput(req.body.email);
        if (req.body.phone) updateData.phone = sanitizeInput(req.body.phone);
        if (req.body.pickup) updateData.pickup = sanitizeInput(req.body.pickup);
        if (req.body.dropoff) updateData.dropoff = sanitizeInput(req.body.dropoff);
        if (req.body.message) updateData.message = sanitizeInput(req.body.message);
        if (req.body.status) updateData.status = req.body.status;

        const demande = await Demande.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!demande) {
            return res.status(404).json({ success: false, error: 'Demande non trouvée' });
        }

        res.json({ success: true, data: demande });
    } catch (error) {
        console.error('Erreur mise à jour demande:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'ID invalide' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Répondre à une demande
// Répondre à une demande (PROTÉGÉ)
app.post('/api/demandes/:id/repondre', protect, async (req, res) => {
    try {
        const { devis, reponse } = req.body;

        // Validation du devis
        const devisNum = parseFloat(devis);
        if (!devis || isNaN(devisNum) || devisNum <= 0 || devisNum > 100000) {
            return res.status(400).json({ success: false, error: 'Devis invalide (doit être entre 0 et 100000)' });
        }

        const id = req.params.id;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: 'ID invalide' });
        }

        const demande = await Demande.findByIdAndUpdate(
            id,
            {
                devis: devisNum,
                reponse: sanitizeInput(reponse || ''),
                dateReponse: new Date(),
                status: 'devis-envoye' // Statut correct : devis envoyé (pas terminée)
            },
            { new: true, runValidators: true }
        );

        if (!demande) {
            return res.status(404).json({ success: false, error: 'Demande non trouvée' });
        }

        // Envoyer l'email de devis au client de manière asynchrone
        emailService.sendDevisEmail(demande).catch(error => {
            console.error('⚠️  Erreur lors de l\'envoi de l\'email de devis (non bloquant):', error);
        });

        res.json({ success: true, data: demande });
    } catch (error) {
        console.error('Erreur réponse demande:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'ID invalide' });
        }
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Changer le statut d'une demande
// Changer le statut d'une demande (PROTÉGÉ)
app.patch('/api/demandes/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['nouvelle', 'en-cours', 'terminee', 'accepte', 'termine', 'devis-envoye', 'paye'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Statut invalide. Statuts valides: ${validStatuses.join(', ')}`
            });
        }

        const id = req.params.id;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: 'ID invalide' });
        }

        const demande = await Demande.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!demande) {
            return res.status(404).json({ success: false, error: 'Demande non trouvée' });
        }

        res.json({ success: true, data: demande });
    } catch (error) {
        console.error('Erreur changement statut:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'ID invalide' });
        }
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Supprimer une demande
// Supprimer une demande (PROTÉGÉ)
app.delete('/api/demandes/:id', protect, async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: 'ID invalide' });
        }

        const demande = await Demande.findByIdAndDelete(id);

        if (!demande) {
            return res.status(404).json({ success: false, error: 'Demande non trouvée' });
        }

        res.json({ success: true, message: 'Demande supprimée' });
    } catch (error) {
        console.error('Erreur suppression demande:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'ID invalide' });
        }
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Note: Les routes Stripe sont déjà définies plus haut (lignes 207-299)
// Pas besoin de les redéfinir ici

// Route spéciale pour les icônes avec headers anti-cache
app.get('/icons/*', (req, res, next) => {
    // Headers pour forcer le rechargement des icônes
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    next();
});

// Route spéciale pour les images gallery avec headers anti-cache
app.get('/gallery/*', (req, res, next) => {
    // Headers pour forcer le rechargement des images
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    next();
});

// Route 404 pour les routes API (APRÈS toutes les routes API définies)
app.use('/api/*', (req, res) => {
    console.log(`❌ Route API non trouvée: ${req.method} ${req.originalUrl}`);
    console.log(`   IP: ${req.ip || req.connection.remoteAddress}`);
    console.log(`   Headers: ${JSON.stringify(req.headers)}`);
    res.status(404).json({ 
        success: false, 
        error: 'Route API non trouvée',
        path: req.originalUrl,
        method: req.method
    });
});

// Servir les fichiers statiques (APRÈS les routes API)
app.use(express.static(path.join(__dirname, 'public')));

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
    console.error('='.repeat(60));
    console.error('❌ ERREUR NON GÉRÉE');
    console.error('='.repeat(60));
    console.error('Erreur:', err);
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Stack:', err.stack);
    console.error('='.repeat(60));
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Erreur serveur'
            : err.message
    });
});

// Route 404 pour les autres routes (pages HTML uniquement, pas les API)
app.use((req, res) => {
    // Si c'est une route API, elle devrait déjà avoir été gérée plus haut
    // Mais au cas où, on vérifie quand même
    if (req.path.startsWith('/api/')) {
        console.log(`⚠️  Route API non gérée par le middleware précédent: ${req.method} ${req.originalUrl}`);
        return res.status(404).json({
            success: false,
            error: 'Route API non trouvée',
            path: req.originalUrl,
            method: req.method
        });
    }
    // Sinon, servir index.html pour les routes SPA
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Logs de démarrage
console.log('='.repeat(60));
console.log('🚀 DÉMARRAGE DE L\'APPLICATION PRESTIGEDRIVE');
console.log('='.repeat(60));
console.log(`📅 Date: ${new Date().toISOString()}`);
console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
console.log(`📦 Node version: ${process.version}`);

// Log des variables d'environnement importantes
console.log('📋 Configuration:');
console.log(`   - MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Configuré' : '❌ Non configuré'}`);
console.log(`   - SMTP_HOST: ${process.env.SMTP_HOST || '❌ Non configuré'}`);
console.log(`   - SMTP_USER: ${process.env.SMTP_USER ? '✅ Configuré' : '❌ Non configuré'}`);
console.log(`   - SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Configuré' : '❌ Non configuré'}`);
console.log(`   - ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || '❌ Non configuré'}`);
console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configuré' : '❌ Non configuré'}`);

// DÉMARRER LE SERVEUR IMMÉDIATEMENT pour que Render détecte le port
// La connexion MongoDB se fera en arrière-plan
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log('✅ SERVEUR ÉCOUTE SUR LE PORT:', PORT);
    console.log('='.repeat(60));
    console.log(`🚗 Serveur Express démarré sur http://0.0.0.0:${PORT}`);
    console.log(`🌐 Render détectera automatiquement le port: ${PORT}`);
    console.log('='.repeat(60));
    
    // Connexion à MongoDB en arrière-plan
    connectDB().then(async () => {
        console.log('='.repeat(60));
        console.log('✅ MongoDB connecté avec succès');
        console.log('='.repeat(60));
        
        // Initialiser le service email
        console.log('📧 Initialisation du service email...');
        try {
            const emailInitialized = await emailService.initEmailService();
            if (emailInitialized) {
                console.log('✅ Service email prêt');
            } else {
                console.warn('⚠️  Service email non initialisé - vérifiez BREVO_API_KEY dans Render → Variables');
            }
        } catch (error) {
            console.error('⚠️  Erreur lors de l\'initialisation du service email:', error.message);
            console.warn('⚠️  Le service continuera mais les emails peuvent ne pas fonctionner');
        }
        
        console.log('='.repeat(60));
        console.log('🎯 Application complètement initialisée');
        console.log(`📋 Interface chauffeur: http://localhost:${PORT}/chauffeur.html`);
        console.log(`🌐 Site principal: http://localhost:${PORT}/index.html`);
        console.log(`🔒 Rate limiting: ${RATE_LIMIT_MAX} requêtes/${RATE_LIMIT_WINDOW / 1000}s par IP`);
        console.log(`🗄️ Base de données: MongoDB`);
        console.log('='.repeat(60));
        
        // Log de heartbeat toutes les 30 secondes
        setInterval(() => {
            console.log(`💓 Heartbeat - Serveur actif - ${new Date().toISOString()}`);
        }, 30000);
    }).catch((error) => {
        console.error('='.repeat(60));
        console.error('❌ ERREUR DE CONNEXION MONGODB');
        console.error('='.repeat(60));
        console.error('❌ Impossible de se connecter à MongoDB:', error.message);
        console.error('⚠️  Le serveur continue mais certaines fonctionnalités peuvent ne pas fonctionner');
        console.error('💡 Vérifiez votre MONGODB_URI dans les variables d\'environnement');
        console.error('='.repeat(60));
        // Ne pas faire process.exit(1) - le serveur doit continuer pour Render
    });
});
