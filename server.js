require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import de la connexion MongoDB et du modèle
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

// Route de test pour vérifier l'envoi d'email depuis le formulaire
app.post('/api/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
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

        const results = await emailService.sendNewDemandeEmails(testDemande);

        res.json({
            success: true,
            message: 'Test d\'envoi effectué',
            results: {
                client: results.client.success ? '✅ Email client envoyé' : '❌ Erreur: ' + results.client.error,
                admin: results.admin.success ? '✅ Email admin envoyé' : '❌ Erreur: ' + results.admin.error
            }
        });
    } catch (error) {
        console.error('❌ Erreur test email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Créer une nouvelle demande
app.post('/api/demandes', async (req, res) => {
    try {
        console.log('📥 Nouvelle demande reçue:', {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone
        });

        // Validation
        const validationErrors = validateDemande(req.body);
        if (validationErrors.length > 0) {
            console.error('❌ Erreurs de validation:', validationErrors);
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

        const nouvelleDemande = await Demande.create(demandeData);
        console.log('✅ Demande créée dans MongoDB:', nouvelleDemande._id);

        console.log('📧 Tentative d\'envoi des emails pour la demande:', nouvelleDemande._id);
        console.log('   Email client:', nouvelleDemande.email);
        console.log('   Email admin:', process.env.ADMIN_EMAIL || process.env.SMTP_USER);

        // Envoyer les emails (client + admin) de manière asynchrone
        // Ne pas bloquer la réponse si l'envoi d'email échoue
        emailService.sendNewDemandeEmails(nouvelleDemande)
            .then(results => {
                console.log('📧 Résultats envoi emails:', {
                    client: results.client.success ? '✅' : '❌',
                    admin: results.admin.success ? '✅' : '❌'
                });
                if (!results.client.success) {
                    console.error('❌ Erreur email client:', results.client.error);
                    console.error('   Code:', results.client.error?.code || 'N/A');
                }
                if (!results.admin.success) {
                    console.error('❌ Erreur email admin:', results.admin.error);
                    console.error('   Code:', results.admin.error?.code || 'N/A');
                }
            })
            .catch(error => {
                console.error('⚠️  Erreur lors de l\'envoi des emails (non bloquant):', error);
                console.error('   Détails:', error.message);
                console.error('   Stack:', error.stack);
            });

        res.status(201).json({ success: true, data: nouvelleDemande });
    } catch (error) {
        console.error('Erreur création demande:', error);
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

// Route 404 pour les routes API (AVANT les fichiers statiques)
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: 'Route API non trouvée' });
});

// Routes Stripe (si configuré)
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

    // Webhook Stripe (pour les événements)
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
                    }

                    // Mettre à jour la demande
                    if (session.metadata && session.metadata.demande_id) {
                        await Demande.findByIdAndUpdate(session.metadata.demande_id, {
                            status: 'paye',
                            datePaiement: new Date(),
                        });
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

// Servir les fichiers statiques (APRÈS les routes API)
app.use(express.static(path.join(__dirname, 'public')));

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
    console.error('Erreur non gérée:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Erreur serveur'
            : err.message
    });
});

// Route 404 pour les autres routes (pages HTML uniquement, pas les API)
app.use((req, res) => {
    // Si c'est une route API, retourner une erreur JSON
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: 'Route API non trouvée'
        });
    }
    // Sinon, servir index.html pour les routes SPA
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connexion à MongoDB puis démarrage du serveur
connectDB().then(async () => {
    // Initialiser le service email
    const emailInitialized = emailService.initEmailService();
    if (emailInitialized) {
        // Ne pas vérifier la connexion SMTP au démarrage (peut causer des timeouts sur Railway)
        // La vérification sera faite lors du premier envoi d'email
        console.log('📧 Vérification SMTP différée (sera testée lors du premier envoi)');
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚗 Serveur VTC démarré sur http://0.0.0.0:${PORT}`);
        console.log(`📋 Interface chauffeur: http://localhost:${PORT}/chauffeur.html`);
        console.log(`🌐 Site principal: http://localhost:${PORT}/index.html`);
        console.log(`🔒 Rate limiting: ${RATE_LIMIT_MAX} requêtes/${RATE_LIMIT_WINDOW / 1000}s par IP`);
        console.log(`🗄️ Base de données: MongoDB`);
        if (emailInitialized) {
            console.log(`📧 Service email: Activé`);
        } else {
            console.log(`📧 Service email: Non configuré (voir .env)`);
        }
    });
}).catch((error) => {
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
});
