// Route de test pour vérifier l'envoi d'email
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
            message: 'Email de test',
            status: 'nouvelle'
        };

        const results = await emailService.sendNewDemandeEmails(testDemande);

        res.json({
            success: true,
            results: {
                client: results.client.success ? '✅ Envoyé' : '❌ Erreur: ' + results.client.error,
                admin: results.admin.success ? '✅ Envoyé' : '❌ Erreur: ' + results.admin.error
            }
        });
    } catch (error) {
        console.error('❌ Erreur test email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ... existing code ...