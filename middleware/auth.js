const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Récupérer le token (Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // Vérifier le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_par_defaut_a_changer');

            // Récupérer l'admin associé au token
            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                return res.status(401).json({ success: false, error: 'Non autorisé, utilisateur introuvable' });
            }

            next();
        } catch (error) {
            console.error('Erreur authentification:', error.message);
            return res.status(401).json({ success: false, error: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, error: 'Non autorisé, pas de token' });
    }
};

module.exports = { protect };
