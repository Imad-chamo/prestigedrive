const SibApiV3Sdk = require('sib-api-v3-sdk');

// Client Brevo API
let emailApi = null;

// Initialiser le service email avec Brevo API
async function initEmailService() {
    // Vérifier si la clé API Brevo est configurée
    const apiKey = process.env.BREVO_API_KEY;
    
    if (!apiKey) {
        const errorMsg = 'BREVO_API_KEY non défini ! Configurez BREVO_API_KEY dans Render → Environment';
        console.error('='.repeat(60));
        console.error('❌ ERREUR CRITIQUE - BREVO_API_KEY NON CONFIGURÉE');
        console.error('='.repeat(60));
        console.error(`❌ ${errorMsg}`);
        console.error('='.repeat(60));
        throw new Error(errorMsg);
    }

    try {
        // Initialiser le client Brevo selon la méthode officielle
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKeyAuth = defaultClient.authentications['api-key'];
        apiKeyAuth.apiKey = apiKey;
        
        emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

        const fromAddress = process.env.SMTP_FROM || 'PrestigeDrive <a10697001@smtp-brevo.com>';
        
        console.log('='.repeat(60));
        console.log('📧 CONFIGURATION BREVO API');
        console.log('='.repeat(60));
        console.log('📋 Service: Brevo Transactional Emails API');
        console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
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
        throw error;
    }
}

// Vérifier la connexion Brevo API
async function verifyConnection() {
    if (!emailApi) {
        return false;
    }
    
    try {
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
    
    if (!emailApi) {
        throw new Error('Service email Brevo non initialisé. Appelez initEmailService() d\'abord.');
    }

    const fromAddress = process.env.SMTP_FROM || 'PrestigeDrive <a10697001@smtp-brevo.com>';
    
    // Extraire l'email FROM (format: "Name <email@domain.com>" ou "email@domain.com")
    let fromEmail = fromAddress;
    let fromNameExtracted = fromName;
    
    if (fromAddress.includes('<') && fromAddress.includes('>')) {
        const match = fromAddress.match(/^(.+?)\s*<([^>]+)>$/);
        if (match) {
            fromNameExtracted = match[1].trim().replace(/"/g, '');
            fromEmail = match[2].trim();
        } else {
            fromEmail = fromAddress.match(/<([^>]+)>/)[1];
        }
    }
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.sender = { name: fromNameExtracted, email: fromEmail };
    sendSmtpEmail.to = [{ email: to }];

    try {
        const result = await emailApi.sendTransacEmail(sendSmtpEmail);
        const duration = Date.now() - startTime;
        
        console.log(`✅ Email envoyé à ${to} en ${duration}ms`);
        console.log(`   Message ID: ${result.messageId || 'N/A'}`);
        
        return { success: true, messageId: result.messageId };
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ Erreur d'envoi à ${to} après ${duration}ms: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status || 'N/A'}`);
            console.error(`   Body: ${JSON.stringify(error.response.body || {})}`);
        }
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
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
            line-height: 1.7; 
            color: #2c3e50; 
            background-color: #f5f7fa;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        /* Améliorer l'affichage des emojis */
        emoji, .emoji {
            font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
            font-style: normal;
            font-variant: normal;
            font-weight: normal;
            line-height: 1;
            display: inline-block;
            vertical-align: middle;
        }
        .email-wrapper { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #D4AF37 0%, #c9a030 50%, #b8941f 100%); 
            color: #000; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-10px, -10px) rotate(5deg); }
        }
        .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 32px; 
            font-weight: 700;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 1;
        }
        .header p { 
            margin: 0; 
            font-size: 16px;
            font-weight: 500;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        .content { 
            padding: 40px 30px; 
            background: #ffffff;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 500;
        }
        .intro-text {
            font-size: 16px;
            color: #5a6c7d;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
            margin: 30px 0;
        }
        .info-box { 
            background: linear-gradient(to right, #f8f9fa 0%, #ffffff 100%);
            padding: 20px 24px; 
            border-radius: 12px; 
            border-left: 4px solid #D4AF37;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .info-box:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .info-label { 
            font-weight: 600; 
            color: #7f8c9a; 
            font-size: 13px; 
            text-transform: none;
            letter-spacing: 0.3px;
            margin-bottom: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
        }
        .info-value { 
            color: #2c3e50; 
            font-size: 16px; 
            font-weight: 500;
            word-break: break-word;
        }
        .message-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #6c757d;
            margin: 20px 0;
        }
        .next-steps {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin: 35px 0;
            text-align: center;
        }
        .next-steps h2 {
            font-size: 22px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        .next-steps p {
            font-size: 15px;
            opacity: 0.95;
            line-height: 1.7;
        }
        .contact-info {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
        }
        .contact-info ul {
            list-style: none;
            padding: 0;
        }
        .contact-info li {
            padding: 12px 0;
            font-size: 16px;
            border-bottom: 1px solid #e9ecef;
        }
        .contact-info li:last-child {
            border-bottom: none;
        }
        .contact-info strong {
            color: #D4AF37;
            font-weight: 600;
        }
        .signature {
            margin-top: 35px;
            padding-top: 25px;
            border-top: 2px solid #e9ecef;
        }
        .signature p {
            color: #5a6c7d;
            font-size: 15px;
            margin: 5px 0;
        }
        .signature strong {
            color: #2c3e50;
            font-weight: 600;
        }
        .footer { 
            text-align: center; 
            padding: 30px;
            background: #2c3e50;
            color: #95a5a6;
            font-size: 13px;
            line-height: 1.6;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer a {
            color: #D4AF37;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .email-wrapper { width: 100% !important; }
            .content { padding: 25px 20px !important; }
            .header { padding: 30px 20px !important; }
            .header h1 { font-size: 26px !important; }
            .info-box { padding: 18px 20px !important; }
        }
    </style>
</head>
<body>
    <div style="padding: 20px 0; background-color: #f5f7fa;">
        <div class="email-wrapper">
            <div class="header">
                <h1>✅ Demande Reçue</h1>
                <p>PrestigeDrive</p>
            </div>
            <div class="content">
                <div class="greeting">Bonjour <strong style="color: #D4AF37;">${demande.name}</strong>,</div>
                
                <p class="intro-text">Nous avons bien reçu votre demande de devis pour un <strong style="color: #2c3e50;">${serviceLabel}</strong>. Votre demande a été enregistrée avec succès et notre équipe va l'examiner dans les plus brefs délais.</p>
                
                <div class="info-grid">
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
                </div>
                
                ${demande.message ? `
                <div class="message-box">
                    <div class="info-label">💬 Votre message</div>
                    <div class="info-value" style="margin-top: 10px; white-space: pre-wrap;">${demande.message}</div>
                </div>
                ` : ''}
                
                <div class="next-steps">
                    <h2>Prochaines étapes</h2>
                    <p>Notre équipe va examiner votre demande et vous contactera dans les plus brefs délais pour vous proposer un devis personnalisé adapté à vos besoins.</p>
                </div>
                
                <div class="contact-info">
                    <p style="margin-bottom: 15px; font-weight: 600; color: #2c3e50;">En cas d'urgence, contactez-nous directement :</p>
                    <ul>
                        <li>📞 Téléphone : <strong>+33 7 48 14 35 03</strong></li>
                        <li>📧 Email : <strong>contact@prestigedrive.fr</strong></li>
                    </ul>
                </div>
                
                <div class="signature">
                    <p>Cordialement,</p>
                    <p><strong>L'équipe PrestigeDrive</strong></p>
                    <p style="font-size: 14px; margin-top: 15px; color: #95a5a6;">Service VTC Premium - Excellence et Ponctualité</p>
                </div>
            </div>
            <div class="footer">
                <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.</p>
                <p><a href="mailto:contact@prestigedrive.fr">contact@prestigedrive.fr</a> | <a href="tel:+33748143503">+33 7 48 14 35 03</a></p>
                <p style="margin-top: 15px;">© ${new Date().getFullYear()} PrestigeDrive - Tous droits réservés</p>
            </div>
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
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
            line-height: 1.7; 
            color: #2c3e50; 
            background-color: #f5f7fa;
            -webkit-font-smoothing: antialiased;
        }
        .email-wrapper { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
        }
        .header::after {
            content: '🔔';
            position: absolute;
            top: 20px;
            right: 30px;
            font-size: 40px;
            opacity: 0.3;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.1); opacity: 0.5; }
        }
        .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px; 
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p { 
            margin: 0; 
            font-size: 15px;
            opacity: 0.95;
            font-weight: 500;
        }
        .content { 
            padding: 40px 30px; 
            background: #ffffff;
        }
        .alert-banner {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 18px 24px;
            border-radius: 8px;
            margin-bottom: 30px;
            font-weight: 600;
            color: #92400e;
            font-size: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
            margin: 30px 0;
        }
        .info-box { 
            background: linear-gradient(to right, #fef2f2 0%, #ffffff 100%);
            padding: 20px 24px; 
            border-radius: 12px; 
            border-left: 4px solid #dc2626;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease;
        }
        .info-box:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
        }
        .info-label { 
            font-weight: 600; 
            color: #991b1b; 
            font-size: 13px; 
            text-transform: none;
            letter-spacing: 0.3px;
            margin-bottom: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
        }
        .info-value { 
            color: #2c3e50; 
            font-size: 16px; 
            font-weight: 500;
            word-break: break-word;
        }
        .info-value a {
            color: #dc2626;
            text-decoration: none;
            font-weight: 600;
        }
        .info-value a:hover {
            text-decoration: underline;
        }
        .message-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #6c757d;
            margin: 20px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            margin: 30px 0;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            text-align: center;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .footer { 
            text-align: center; 
            padding: 25px;
            background: #1f2937;
            color: #9ca3af;
            font-size: 13px;
            line-height: 1.6;
        }
        @media only screen and (max-width: 600px) {
            .email-wrapper { width: 100% !important; }
            .content { padding: 25px 20px !important; }
            .header { padding: 30px 20px !important; }
            .header h1 { font-size: 24px !important; }
            .info-box { padding: 18px 20px !important; }
            .cta-button { padding: 14px 30px !important; font-size: 15px !important; }
        }
    </style>
</head>
<body>
    <div style="padding: 20px 0; background-color: #f5f7fa;">
        <div class="email-wrapper">
            <div class="header">
                <h1>🔔 Nouvelle Demande</h1>
                <p>PrestigeDrive - Administration</p>
            </div>
            <div class="content">
                <div class="alert-banner">
                    ⚡ Une nouvelle demande de devis nécessite votre attention
                </div>
                
                <p style="font-size: 16px; color: #5a6c7d; margin-bottom: 25px;">Détails de la demande reçue :</p>
                
                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-label">👤 Client</div>
                        <div class="info-value" style="font-size: 18px; font-weight: 600; color: #dc2626;">${demande.name}</div>
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
                        <div class="info-value" style="font-weight: 600;">${serviceLabel}</div>
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
                </div>
                
                ${demande.message ? `
                <div class="message-box">
                    <div class="info-label" style="color: #6c757d;">💬 Message du client</div>
                    <div class="info-value" style="margin-top: 10px; white-space: pre-wrap; color: #2c3e50;">${demande.message}</div>
                </div>
                ` : ''}
                
                <div class="button-container">
                    <a href="${adminUrl}" class="cta-button">📋 Voir dans l'interface admin</a>
                </div>
            </div>
            <div class="footer">
                <p>PrestigeDrive - Système de notification automatique</p>
                <p style="margin-top: 10px; font-size: 12px;">Cet email a été généré automatiquement lors de la réception d'une nouvelle demande.</p>
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
    if (!emailApi) {
        const errorMsg = 'Service email Brevo non initialisé';
        console.error(`❌ ${errorMsg}`);
        return { success: false, error: errorMsg };
    }

    try {
        const template = getClientConfirmationTemplate(demande);
        
        console.log(`📧 Envoi email client vers: ${demande.email}`);
        
        const result = await sendEmail(
            demande.email,
            template.subject,
            template.html,
            template.text,
            'PrestigeDrive'
        );
        
        console.log('✅ Email client envoyé ✅');
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`❌ Erreur d'envoi email client: ${error.message}`);
        return { success: false, error: error.message, code: error.code };
    }
}

// Envoyer une notification à l'admin
async function sendAdminNotification(demande) {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
        const errorMsg = 'ADMIN_EMAIL non configuré';
        console.error(`❌ ${errorMsg}`);
        return { success: false, error: errorMsg };
    }
    
    if (!emailApi) {
        const errorMsg = 'Service email Brevo non initialisé';
        console.error(`❌ ${errorMsg}`);
        return { success: false, error: errorMsg };
    }

    try {
        const template = getAdminNotificationTemplate(demande);
        
        console.log(`📧 Envoi email admin vers: ${adminEmail}`);
        
        const result = await sendEmail(
            adminEmail,
            template.subject,
            template.html,
            template.text,
            'PrestigeDrive - Système'
        );
        
        console.log('✅ Email admin envoyé ✅');
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`❌ Erreur d'envoi email admin: ${error.message}`);
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
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
            line-height: 1.7; 
            color: #2c3e50; 
            background-color: #f5f7fa;
            -webkit-font-smoothing: antialiased;
        }
        .email-wrapper { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #D4AF37 0%, #c9a030 50%, #b8941f 100%); 
            color: #000; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
        }
        .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 32px; 
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p { 
            margin: 0; 
            font-size: 16px;
            font-weight: 500;
            opacity: 0.9;
        }
        .content { 
            padding: 40px 30px; 
            background: #ffffff;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 500;
        }
        .intro-text {
            font-size: 16px;
            color: #5a6c7d;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .devis-box { 
            background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
            padding: 40px 30px; 
            margin: 30px 0; 
            border-radius: 16px; 
            border: 3px solid #D4AF37;
            text-align: center;
            box-shadow: 0 8px 24px rgba(212, 175, 55, 0.2);
            position: relative;
            overflow: hidden;
        }
        .devis-box::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .devis-label {
            font-size: 14px;
            color: #7f8c9a;
            text-transform: none;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
            font-weight: 600;
            position: relative;
            z-index: 1;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
        }
        .devis-amount { 
            font-size: 56px; 
            font-weight: 800; 
            color: #D4AF37; 
            margin: 15px 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
            letter-spacing: -2px;
        }
        .devis-ttc {
            color: #7f8c9a;
            font-size: 14px;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }
        .reponse-box {
            background: linear-gradient(to right, #f0f4f8 0%, #ffffff 100%);
            padding: 24px;
            margin: 30px 0;
            border-radius: 12px;
            border-left: 4px solid #64748b;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .reponse-label {
            font-weight: 600;
            color: #475569;
            font-size: 13px;
            text-transform: none;
            letter-spacing: 0.3px;
            margin-bottom: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
        }
        .reponse-text {
            color: #2c3e50;
            font-size: 15px;
            line-height: 1.8;
            white-space: pre-wrap;
        }
        .details-box {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
        }
        .details-label {
            font-weight: 600;
            color: #5a6c7d;
            font-size: 13px;
            text-transform: none;
            letter-spacing: 0.3px;
            margin-bottom: 15px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
        }
        .details-list {
            list-style: none;
            padding: 0;
        }
        .details-list li {
            padding: 10px 0;
            font-size: 15px;
            color: #2c3e50;
            border-bottom: 1px solid #e9ecef;
        }
        .details-list li:last-child {
            border-bottom: none;
        }
        .details-list strong {
            color: #D4AF37;
            font-weight: 600;
            margin-right: 8px;
        }
        .cta-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 35px;
            border-radius: 12px;
            margin: 35px 0;
            text-align: center;
        }
        .cta-section h2 {
            font-size: 22px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        .cta-section p {
            font-size: 15px;
            opacity: 0.95;
            margin-bottom: 20px;
            line-height: 1.7;
        }
        .cta-button {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .contact-info {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
        }
        .contact-info ul {
            list-style: none;
            padding: 0;
        }
        .contact-info li {
            padding: 12px 0;
            font-size: 16px;
            border-bottom: 1px solid #e9ecef;
        }
        .contact-info li:last-child {
            border-bottom: none;
        }
        .contact-info strong {
            color: #D4AF37;
            font-weight: 600;
        }
        .validity-box {
            background: linear-gradient(135deg, #fff9e6 0%, #fef3c7 100%);
            border-left: 4px solid #f59e0b;
            padding: 20px 24px;
            border-radius: 12px;
            margin: 30px 0;
        }
        .validity-box strong {
            color: #92400e;
            font-weight: 600;
        }
        .validity-box p {
            color: #78350f;
            margin: 0;
            font-size: 14px;
            line-height: 1.7;
        }
        .signature {
            margin-top: 35px;
            padding-top: 25px;
            border-top: 2px solid #e9ecef;
        }
        .signature p {
            color: #5a6c7d;
            font-size: 15px;
            margin: 5px 0;
        }
        .signature strong {
            color: #2c3e50;
            font-weight: 600;
        }
        .footer { 
            text-align: center; 
            padding: 30px;
            background: #2c3e50;
            color: #95a5a6;
            font-size: 13px;
            line-height: 1.6;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer a {
            color: #D4AF37;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .email-wrapper { width: 100% !important; }
            .content { padding: 25px 20px !important; }
            .header { padding: 30px 20px !important; }
            .header h1 { font-size: 26px !important; }
            .devis-amount { font-size: 42px !important; }
            .devis-box { padding: 30px 20px !important; }
            .cta-button { padding: 14px 30px !important; font-size: 15px !important; }
        }
    </style>
</head>
<body>
    <div style="padding: 20px 0; background-color: #f5f7fa;">
        <div class="email-wrapper">
            <div class="header">
                <h1>💰 Votre Devis</h1>
                <p>PrestigeDrive</p>
            </div>
            <div class="content">
                <div class="greeting">Bonjour <strong style="color: #D4AF37;">${demande.name}</strong>,</div>
                
                <p class="intro-text">Nous avons le plaisir de vous transmettre votre devis personnalisé pour votre <strong style="color: #2c3e50;">${serviceLabel}</strong>. Ce devis a été préparé avec soin pour répondre à vos besoins spécifiques.</p>
                
                <div class="devis-box">
                    <div class="devis-label">Montant du devis</div>
                    <div class="devis-amount">${devisAmount} €</div>
                    <div class="devis-ttc">Toutes taxes comprises</div>
                </div>
                
                ${demande.reponse ? `
                <div class="reponse-box">
                    <div class="reponse-label">💬 Message de notre équipe</div>
                    <div class="reponse-text">${demande.reponse}</div>
                </div>
                ` : ''}
                
                <div class="details-box">
                    <div class="details-label">📋 Détails de votre demande</div>
                    <ul class="details-list">
                        ${demande.pickup ? `<li><strong>📍 Départ :</strong> ${demande.pickup}</li>` : ''}
                        ${demande.dropoff ? `<li><strong>🎯 Destination :</strong> ${demande.dropoff}</li>` : ''}
                        ${demande.date ? `<li><strong>📅 Date :</strong> ${demande.date}</li>` : ''}
                        ${demande.time ? `<li><strong>🕐 Heure :</strong> ${demande.time}</li>` : ''}
                        ${demande.passengers ? `<li><strong>👥 Passagers :</strong> ${demande.passengers}</li>` : ''}
                    </ul>
                </div>
                
                <div class="cta-section">
                    <h2>Prochaines étapes</h2>
                    <p>Pour accepter ce devis et confirmer votre réservation, contactez-nous dès maintenant. Notre équipe est à votre disposition pour répondre à toutes vos questions.</p>
                    <a href="tel:+33748143503" class="cta-button">📞 Appeler maintenant</a>
                </div>
                
                <div class="contact-info">
                    <p style="margin-bottom: 15px; font-weight: 600; color: #2c3e50;">Nos coordonnées :</p>
                    <ul>
                        <li>📞 Téléphone : <strong>+33 7 48 14 35 03</strong></li>
                        <li>📧 Email : <strong>contact@prestigedrive.fr</strong></li>
                    </ul>
                </div>
                
                <div class="validity-box">
                    <p><strong>⏰ Validité du devis :</strong> Ce devis est valable 7 jours à compter de sa réception. N'hésitez pas à nous contacter pour toute question ou modification de votre demande.</p>
                </div>
                
                <div class="signature">
                    <p>Cordialement,</p>
                    <p><strong>L'équipe PrestigeDrive</strong></p>
                    <p style="font-size: 14px; margin-top: 15px; color: #95a5a6;">Service VTC Premium - Excellence et Ponctualité</p>
                </div>
            </div>
            <div class="footer">
                <p>Cet email a été envoyé automatiquement. Pour toute question, contactez-nous au +33 7 48 14 35 03</p>
                <p><a href="mailto:contact@prestigedrive.fr">contact@prestigedrive.fr</a> | <a href="tel:+33748143503">+33 7 48 14 35 03</a></p>
                <p style="margin-top: 15px;">© ${new Date().getFullYear()} PrestigeDrive - Tous droits réservés</p>
            </div>
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
    if (!emailApi) {
        console.warn('⚠️  Service email Brevo non initialisé. Email de devis non envoyé.');
        return { success: false, error: 'Service email non configuré' };
    }

    try {
        const template = getDevisTemplate(demande);
        
        console.log(`📧 Envoi email devis vers: ${demande.email}`);
        
        const result = await sendEmail(
            demande.email,
            template.subject,
            template.html,
            template.text,
            'PrestigeDrive'
        );
        
        console.log('✅ Email devis envoyé ✅');
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`❌ Erreur d'envoi email devis: ${error.message}`);
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
