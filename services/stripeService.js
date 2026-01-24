const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Créer une session de paiement Stripe avec facture automatique
 */
async function createCheckoutSession(demande, amount) {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Devis PrestigeDrive - ${demande.pickup || 'Départ'} → ${demande.dropoff || 'Destination'}`,
                            description: `Service VTC - ${demande.serviceType || 'Standard'} - ${demande.passengers || 1} passager(s)`,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe utilise les centimes
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.ADMIN_URL || 'http://localhost:3000'}/paiement-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.ADMIN_URL || 'http://localhost:3000'}/chauffeur.html`,
            customer_email: demande.email,
            metadata: {
                demande_id: demande.id || demande._id.toString(),
                demande_name: demande.name,
            },
            // Activer les factures automatiques
            invoice_creation: {
                enabled: true,
            },
            // Activer l'envoi automatique de la facture
            automatic_tax: {
                enabled: false, // Désactivé par défaut (activer si TVA nécessaire)
            },
        });

        return session;
    } catch (error) {
        console.error('Erreur création session Stripe:', error);
        throw error;
    }
}

/**
 * Créer une facture après paiement réussi
 */
async function createInvoice(paymentIntentId) {
    try {
        // Récupérer le PaymentIntent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (!paymentIntent.customer) {
            throw new Error('Pas de client associé au paiement');
        }

        // Créer une facture
        const invoice = await stripe.invoices.create({
            customer: paymentIntent.customer,
            auto_advance: true, // Envoyer automatiquement
        });

        // Finaliser et envoyer la facture
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {
            auto_advance: true,
        });

        // Envoyer la facture par email
        await stripe.invoices.sendInvoice(finalizedInvoice.id);

        return finalizedInvoice;
    } catch (error) {
        console.error('Erreur création facture:', error);
        throw error;
    }
}

/**
 * Envoyer une facture par email
 */
async function sendInvoice(invoiceId) {
    try {
        const invoice = await stripe.invoices.sendInvoice(invoiceId);
        return invoice;
    } catch (error) {
        console.error('Erreur envoi facture:', error);
        throw error;
    }
}

/**
 * Récupérer une session de paiement
 */
async function getSession(sessionId) {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent', 'customer'],
        });
        return session;
    } catch (error) {
        console.error('Erreur récupération session:', error);
        throw error;
    }
}

/**
 * Récupérer une facture
 */
async function getInvoice(invoiceId) {
    try {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        return invoice;
    } catch (error) {
        console.error('Erreur récupération facture:', error);
        throw error;
    }
}

module.exports = {
    createCheckoutSession,
    createInvoice,
    sendInvoice,
    getSession,
    getInvoice,
};
