const SibApiV3Sdk = require('sib-api-v3-sdk');

// Client Brevo API
let brevoClient = null;
let brevoApiKey = null;

// Initialiser le service email avec Brevo API
async function initEmailService() {
    // Vérifier si la clé API Brevo est configurée
    brevoApiKey = process.env.BREVO_API_KEY;
    
    if (!brevoApiKey) {
        console.warn('='.repeat(60));
        console.warn('⚠️  BREVO_API_KEY NON CONFIGURÉE');
        console.warn('='.repeat(60));
        console.warn('⚠️  Configuration email non trouvée. Les emails ne seront pas envoyés.');
        console.warn('💡 Pour activer les emails, configurez dans Render → Variables :');
        console.warn('   - BREVO_API_KEY (votre clé API Brevo)');
        console.warn('   - SMTP_FROM (email expéditeur, ex: "PrestigeDrive <a10697001@smtp-brevo.com>")');
        console.warn('   - ADMIN_EMAIL (email pour notifications)');
        console.warn('='.repeat(60));
        return false;
    }

    try {
        // Initialiser le client Brevo
        brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
        brevoClient.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);

        const fromAddress = process.env.SMTP_FROM || 'PrestigeDrive <a10697001@smtp-brevo.com>';
        
        console.log('='.repeat(60));
        console.log('📧 CONFIGURATION BREVO API');
        console.log('='.repeat(60));
        console.log('📋 Service: Brevo Transactional Emails API');
        console.log(`🔑 API Key: ${brevoApiKey.substring(0, 10)}...${brevoApiKey.substring(brevoApiKey.length - 5)}`);
        console.log(`📤 From: ${fromAddress}`);
        console.log(`📧 Admin: ${process.env.ADMIN_EMAIL || 'Non configuré'}`);
        console.log('='.repeat(60));
        console.log('✅ Service email Brevo API initialisé avec succès');
        console.log('📧 Prêt à envoyer des emails via API Brevo');
        console.log('='.repeat(60));
        
        return true;
    } catch (error) {
        console.error('='.repeat(60));
        console.error('❌ ERREUR LORS DE L\'INITIALISATION BREVO API');
        console.error('='.repeat(60));
        console.error(`❌ Message: ${error.message}`);
        console.error(`📚 Stack: ${error.stack}`);
        console.error('='.repeat(60));
        return false;
    }
}

// Vérifier la connexion Brevo API
async function verifyConnection() {
    if (!brevoClient) {
        return false;
    }
    
    try {
        // Test simple : vérifier que le client est initialisé
        console.log('✅ Client Brevo API vérifié');
        return true;
    } catch (error) {
        console.error('❌ Erreur de vérification Brevo API:', error.message);
        return false;
    }
}

// Fonction générique pour envoyer un email via Brevo API
async function sendEmail(to, subject, htmlContent, textContent, fromName = 'PrestigeDrive') {
    const startTime = Date.now();
    
    if (!brevoClient) {
        throw new Error('Service email Brevo non initialisé');
    }

    const fromAddress = process.env.SMTP_FROM || 'PrestigeDrive <a10697001@smtp-brevo.com>';
    
    // Extraire l'email FROM (format: "Name <email@domain.com>" ou "email@domain.com")
    let fromEmail = fromAddress;
    if (fromAddress.includes('<') && fromAddress.includes('>')) {
        fromEmail = fromAddress.match(/<([^>]+)>/)[1];
    }
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email: to }];

    try {
        const result = await brevoClient.sendTransacEmail(sendSmtpEmail);
        const duration = Date.now() - startTime;
        
        console.log('='.repeat(60));
        console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS (Brevo API)');
        console.log('='.repeat(60));
        console.log(`✅ Message ID: ${result.messageId || 'N/A'}`);
        console.log(`📬 Destinataire: ${to}`);
        console.log(`📋 Sujet: ${subject}`);
        console.log(`⏱️  Durée: ${duration}ms`);
        console.log('='.repeat(60));
        
        return { success: true, messageId: result.messageId || result.response?.headers?.['x-message-id'] };
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error('='.repeat(60));
        console.error('❌ ERREUR ENVOI EMAIL (Brevo API)');
        console.error('='.repeat(60));
        console.error(`❌ Message: ${error.message}`);
        console.error(`📋 Code: ${error.code || 'N/A'}`);
        console.error(`📬 Destinataire: ${to}`);
        console.error(`⏱️  Durée avant erreur: ${duration}ms`);
        if (error.response) {
            console.error(`📋 Response Status: ${error.response.status || 'N/A'}`);
            console.error(`📋 Response Body: ${JSON.stringify(error.response.body || {})}`);
        }
        console.error(`📚 Stack: ${error.stack}`);
        console.error('='.repeat(60));
        throw error;
    }
}

// Template email de confirmation pour le client
function getClientConfirmationTemplate(demande) {
    const serviceTypeLabels = {
        'aeroport': 'Transfert Aéroport',
        'gare': 'Transfert Gare',
        'ville': 'Transfert Ville',
        'mariage': 'Mariage',
        'evenement': 'Événement',
        'tourisme': 'Tourisme',
        'affaires': 'Affaires'
    };

    const serviceLabel = serviceTypeLabels[demande.serviceType] || demande.serviceType || 'Service VTC';

    return {
        subject: `✅ Confirmation de votre demande - PrestigeDrive`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37 0%, #c9a030 100%); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #D4AF37; }
        .info-label { font-weight: bold; color: #666; font-size: 0.9em; }
        .info-value { color: #333; font-size: 1.1em; margin-top: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        .button { display: inline-block; background: #D4AF37; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">✅ Demande Reçue</h1>
            <p style="margin: 10px 0 0 0;">PrestigeDrive</p>
        </div>
        <div class="content">
            <p>Bonjour <strong>${demande.name}</strong>,</p>
            
            <p>Nous avons bien reçu votre demande de devis pour un <strong>${serviceLabel}</strong>.</p>
            
            <div class="info-box">
                <div class="info-label">📧 Email</div>
                <div class="info-value">${demande.email}</div>
            </div>
            
            <div class="info-box">
                <div class="info-label">📞 Téléphone</div>
                <div class="info-value">${demande.phone}</div>
            </div>
            
            ${demande.pickup ? `
            <div class="info-box">
                <div class="info-label">📍 Point de départ</div>
                <div class="info-value">${demande.pickup}</div>
            </div>
            ` : ''}
            
            ${demande.dropoff ? `
            <div class="info-box">
                <div class="info-label">🎯 Destination</div>
                <div class="info-value">${demande.dropoff}</div>
            </div>
            ` : ''}
            
            ${demande.date ? `
            <div class="info-box">
                <div class="info-label">📅 Date</div>
                <div class="info-value">${demande.date}</div>
            </div>
            ` : ''}
            
            ${demande.time ? `
            <div class="info-box">
                <div class="info-label">🕐 Heure</div>
                <div class="info-value">${demande.time}</div>
            </div>
            ` : ''}
            
            ${demande.passengers ? `
            <div class="info-box">
                <div class="info-label">👥 Passagers</div>
                <div class="info-value">${demande.passengers}</div>
            </div>
            ` : ''}
            
            ${demande.message ? `
            <div class="info-box">
                <div class="info-label">💬 Message</div>
                <div class="info-value">${demande.message}</div>
            </div>
            ` : ''}
            
            <p style="margin-top: 30px;"><strong>Prochaines étapes :</strong></p>
            <p>Notre équipe va examiner votre demande et vous contactera dans les plus brefs délais pour vous proposer un devis personnalisé.</p>
            
            <p>En cas d'urgence, n'hésitez pas à nous contacter directement :</p>
            <ul>
                <li>📞 Téléphone : <strong>+33 7 48 14 35 03</strong></li>
                <li>📧 Email : <strong>contact@prestigedrive.fr</strong></li>
            </ul>
            
            <p>Cordialement,<br><strong>L'équipe PrestigeDrive</strong></p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            <p>PrestigeDrive - Service VTC Premium</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Bonjour ${demande.name},

Nous avons bien reçu votre demande de devis pour un ${serviceLabel}.

Détails de votre demande :
- Email : ${demande.email}
- Téléphone : ${demande.phone}
${demande.pickup ? `- Point de départ : ${demande.pickup}` : ''}
${demande.dropoff ? `- Destination : ${demande.dropoff}` : ''}
${demande.date ? `- Date : ${demande.date}` : ''}
${demande.time ? `- Heure : ${demande.time}` : ''}
${demande.passengers ? `- Passagers : ${demande.passengers}` : ''}
${demande.message ? `- Message : ${demande.message}` : ''}

Notre équipe va examiner votre demande et vous contactera dans les plus brefs délais.

Contact : +33 7 48 14 35 03 | contact@prestigedrive.fr

Cordialement,
L'équipe PrestigeDrive
        `
    };
}

// Template email de notification pour l'admin
function getAdminNotificationTemplate(demande) {
    const serviceTypeLabels = {
        'aeroport': 'Transfert Aéroport',
        'gare': 'Transfert Gare',
        'ville': 'Transfert Ville',
        'mariage': 'Mariage',
        'evenement': 'Événement',
        'tourisme': 'Tourisme',
        'affaires': 'Affaires'
    };

    const serviceLabel = serviceTypeLabels[demande.serviceType] || demande.serviceType || 'Service VTC';
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3000/chauffeur.html';

    return {
        subject: `🔔 Nouvelle demande de devis - ${demande.name}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
        .info-label { font-weight: bold; color: #666; font-size: 0.9em; }
        .info-value { color: #333; font-size: 1.1em; margin-top: 5px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🔔 Nouvelle Demande</h1>
            <p style="margin: 10px 0 0 0;">PrestigeDrive - Administration</p>
        </div>
        <div class="content">
            <p>Une nouvelle demande de devis a été reçue :</p>
            
            <div class="info-box">
                <div class="info-label">👤 Client</div>
                <div class="info-value">${demande.name}</div>
            </div>
            
            <div class="info-box">
                <div class="info-label">📧 Email</div>
                <div class="info-value"><a href="mailto:${demande.email}">${demande.email}</a></div>
            </div>
            
            <div class="info-box">
                <div class="info-label">📞 Téléphone</div>
                <div class="info-value"><a href="tel:${demande.phone}">${demande.phone}</a></div>
            </div>
            
            <div class="info-box">
                <div class="info-label">🚗 Service</div>
                <div class="info-value">${serviceLabel}</div>
            </div>
            
            ${demande.pickup ? `
            <div class="info-box">
                <div class="info-label">📍 Point de départ</div>
                <div class="info-value">${demande.pickup}</div>
            </div>
            ` : ''}
            
            ${demande.dropoff ? `
            <div class="info-box">
                <div class="info-label">🎯 Destination</div>
                <div class="info-value">${demande.dropoff}</div>
            </div>
            ` : ''}
            
            ${demande.date ? `
            <div class="info-box">
                <div class="info-label">📅 Date</div>
                <div class="info-value">${demande.date}</div>
            </div>
            ` : ''}
            
            ${demande.time ? `
            <div class="info-box">
                <div class="info-label">🕐 Heure</div>
                <div class="info-value">${demande.time}</div>
            </div>
            ` : ''}
            
            ${demande.passengers ? `
            <div class="info-box">
                <div class="info-label">👥 Passagers</div>
                <div class="info-value">${demande.passengers}</div>
            </div>
            ` : ''}
            
            ${demande.message ? `
            <div class="info-box">
                <div class="info-label">💬 Message</div>
                <div class="info-value">${demande.message}</div>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${adminUrl}" class="button">Voir dans l'interface admin</a>
            </div>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Nouvelle demande de devis reçue :

Client : ${demande.name}
Email : ${demande.email}
Téléphone : ${demande.phone}
Service : ${serviceLabel}
${demande.pickup ? `Point de départ : ${demande.pickup}` : ''}
${demande.dropoff ? `Destination : ${demande.dropoff}` : ''}
${demande.date ? `Date : ${demande.date}` : ''}
${demande.time ? `Heure : ${demande.time}` : ''}
${demande.passengers ? `Passagers : ${demande.passengers}` : ''}
${demande.message ? `Message : ${demande.message}` : ''}

Voir dans l'interface admin : ${adminUrl}
        `
    };
}

// Envoyer un email de confirmation au client
async function sendClientConfirmation(demande) {
    const startTime = Date.now();
    
    if (!brevoClient) {
        console.error('='.repeat(60));
        console.error('❌ SERVICE EMAIL NON INITIALISÉ');
        console.error('='.repeat(60));
        console.error('⚠️  Service email Brevo non initialisé. Email non envoyé.');
        console.error('💡 Vérifiez BREVO_API_KEY dans Render → Variables');
        console.error('='.repeat(60));
        return { success: false, error: 'Service email non configuré' };
    }

    try {
        const template = getClientConfirmationTemplate(demande);
        
        console.log('='.repeat(60));
        console.log('📧 ENVOI EMAIL CLIENT');
        console.log('='.repeat(60));
        console.log(`📬 Destinataire: ${demande.email}`);
        console.log(`📋 Sujet: ${template.subject}`);
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
        console.log('='.repeat(60));
        
        const result = await sendEmail(
            demande.email,
            template.subject,
            template.html,
            template.text,
            'PrestigeDrive'
        );
        
        return { success: true, messageId: result.messageId };
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`⏱️  Durée avant erreur: ${duration}ms`);
        return { success: false, error: error.message, code: error.code };
    }
}

// Envoyer une notification à l'admin
async function sendAdminNotification(demande) {
    const startTime = Date.now();
    
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
        console.error('='.repeat(60));
        console.error('❌ ADMIN_EMAIL NON CONFIGURÉ');
        console.error('='.repeat(60));
        console.error('⚠️  ADMIN_EMAIL non configuré. Notification admin non envoyée.');
        console.error('💡 Configurez ADMIN_EMAIL dans Render → Variables');
        console.error('='.repeat(60));
        return { success: false, error: 'ADMIN_EMAIL non configuré' };
    }
    
    if (!brevoClient) {
        console.error('='.repeat(60));
        console.error('❌ SERVICE EMAIL NON INITIALISÉ');
        console.error('='.repeat(60));
        console.error('⚠️  Service email Brevo non initialisé. Email non envoyé.');
        console.error('💡 Vérifiez BREVO_API_KEY dans Render → Variables');
        console.error('='.repeat(60));
        return { success: false, error: 'Service email non configuré' };
    }

    try {
        const template = getAdminNotificationTemplate(demande);
        
        console.log('='.repeat(60));
        console.log('📧 ENVOI EMAIL ADMIN');
        console.log('='.repeat(60));
        console.log(`📬 Destinataire: ${adminEmail}`);
        console.log(`📋 Sujet: ${template.subject}`);
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
        console.log('='.repeat(60));
        
        const result = await sendEmail(
            adminEmail,
            template.subject,
            template.html,
            template.text,
            'PrestigeDrive - Système'
        );
        
        return { success: true, messageId: result.messageId };
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`⏱️  Durée avant erreur: ${duration}ms`);
        return { success: false, error: error.message, code: error.code };
    }
}

// Template email de devis pour le client
function getDevisTemplate(demande) {
    const serviceTypeLabels = {
        'aeroport': 'Transfert Aéroport',
        'gare': 'Transfert Gare',
        'ville': 'Transfert Ville',
        'mariage': 'Mariage',
        'evenement': 'Événement',
        'tourisme': 'Tourisme',
        'affaires': 'Affaires'
    };

    const serviceLabel = serviceTypeLabels[demande.serviceType] || demande.serviceType || 'Service VTC';
    const devisAmount = parseFloat(demande.devis || 0).toFixed(2);

    return {
        subject: `💰 Votre devis PrestigeDrive - ${devisAmount} €`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37 0%, #c9a030 100%); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .devis-box { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; border: 3px solid #D4AF37; text-align: center; }
        .devis-amount { font-size: 3em; font-weight: bold; color: #D4AF37; margin: 10px 0; }
        .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #D4AF37; }
        .info-label { font-weight: bold; color: #666; font-size: 0.9em; }
        .info-value { color: #333; font-size: 1.1em; margin-top: 5px; }
        .button { display: inline-block; background: #D4AF37; color: #000; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        .reponse-box { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">💰 Votre Devis</h1>
            <p style="margin: 10px 0 0 0;">PrestigeDrive</p>
        </div>
        <div class="content">
            <p>Bonjour <strong>${demande.name}</strong>,</p>
            
            <p>Nous avons le plaisir de vous transmettre votre devis personnalisé pour votre <strong>${serviceLabel}</strong>.</p>
            
            <div class="devis-box">
                <div style="font-size: 1.2em; color: #666; margin-bottom: 10px;">Montant du devis</div>
                <div class="devis-amount">${devisAmount} €</div>
                <div style="color: #666; font-size: 0.9em;">TTC</div>
            </div>
            
            ${demande.reponse ? `
            <div class="reponse-box">
                <div class="info-label">💬 Message de notre équipe</div>
                <div class="info-value" style="margin-top: 10px; white-space: pre-wrap;">${demande.reponse}</div>
            </div>
            ` : ''}
            
            <div class="info-box">
                <div class="info-label">📋 Détails de votre demande</div>
                <div class="info-value" style="margin-top: 10px;">
                    ${demande.pickup ? `<strong>📍 Départ :</strong> ${demande.pickup}<br>` : ''}
                    ${demande.dropoff ? `<strong>🎯 Destination :</strong> ${demande.dropoff}<br>` : ''}
                    ${demande.date ? `<strong>📅 Date :</strong> ${demande.date}<br>` : ''}
                    ${demande.time ? `<strong>🕐 Heure :</strong> ${demande.time}<br>` : ''}
                    ${demande.passengers ? `<strong>👥 Passagers :</strong> ${demande.passengers}<br>` : ''}
                </div>
            </div>
            
            <p style="margin-top: 30px;"><strong>Prochaines étapes :</strong></p>
            <p>Pour accepter ce devis et confirmer votre réservation, merci de nous contacter :</p>
            <ul>
                <li>📞 Téléphone : <strong>+33 7 48 14 35 03</strong></li>
                <li>📧 Email : <strong>contact@prestigedrive.fr</strong></li>
            </ul>
            
            <p style="text-align: center;">
                <a href="tel:+33748143503" class="button">📞 Appeler maintenant</a>
            </p>
            
            <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <strong>⏰ Validité du devis :</strong> Ce devis est valable 7 jours. N'hésitez pas à nous contacter pour toute question ou modification.
            </p>
            
            <p>Cordialement,<br><strong>L'équipe PrestigeDrive</strong></p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement. Pour toute question, contactez-nous au +33 7 48 14 35 03</p>
            <p>PrestigeDrive - Service VTC Premium</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Bonjour ${demande.name},

Nous avons le plaisir de vous transmettre votre devis personnalisé pour votre ${serviceLabel}.

MONTANT DU DEVIS : ${devisAmount} € TTC

${demande.reponse ? `\nMessage de notre équipe :\n${demande.reponse}\n` : ''}

Détails de votre demande :
${demande.pickup ? `- Départ : ${demande.pickup}` : ''}
${demande.dropoff ? `- Destination : ${demande.dropoff}` : ''}
${demande.date ? `- Date : ${demande.date}` : ''}
${demande.time ? `- Heure : ${demande.time}` : ''}
${demande.passengers ? `- Passagers : ${demande.passengers}` : ''}

Pour accepter ce devis et confirmer votre réservation :
📞 Téléphone : +33 7 48 14 35 03
📧 Email : contact@prestigedrive.fr

⏰ Validité du devis : 7 jours

Cordialement,
L'équipe PrestigeDrive
        `
    };
}

// Envoyer l'email de devis au client
async function sendDevisEmail(demande) {
    const startTime = Date.now();
    
    if (!brevoClient) {
        console.warn('⚠️  Service email Brevo non initialisé. Email de devis non envoyé.');
        return { success: false, error: 'Service email non configuré' };
    }

    try {
        const template = getDevisTemplate(demande);
        
        console.log('='.repeat(60));
        console.log('📧 ENVOI EMAIL DEVIS');
        console.log('='.repeat(60));
        console.log(`📬 Destinataire: ${demande.email}`);
        console.log(`📋 Sujet: ${template.subject}`);
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
        console.log('='.repeat(60));
        
        const result = await sendEmail(
            demande.email,
            template.subject,
            template.html,
            template.text,
            'PrestigeDrive'
        );
        
        return { success: true, messageId: result.messageId };
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`⏱️  Durée avant erreur: ${duration}ms`);
        return { success: false, error: error.message, code: error.code };
    }
}

// Envoyer les deux emails (client + admin)
async function sendNewDemandeEmails(demande) {
    const results = {
        client: { success: false },
        admin: { success: false }
    };

    // Envoyer l'email au client
    results.client = await sendClientConfirmation(demande);

    // Envoyer la notification à l'admin
    results.admin = await sendAdminNotification(demande);

    return results;
}

module.exports = {
    initEmailService,
    verifyConnection,
    sendClientConfirmation,
    sendAdminNotification,
    sendNewDemandeEmails,
    sendDevisEmail
};
