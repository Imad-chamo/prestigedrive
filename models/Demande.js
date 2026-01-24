const mongoose = require('mongoose');

const demandeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide']
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        maxlength: 20
    },
    pickup: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    dropoff: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    date: {
        type: String,
        trim: true,
        default: ''
    },
    time: {
        type: String,
        trim: true,
        default: ''
    },
    passengers: {
        type: Number,
        default: 1,
        min: 1,
        max: 50
    },
    serviceType: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ''
    },
    message: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: ''
    },
    status: {
        type: String,
        enum: ['nouvelle', 'en-cours', 'terminee', 'accepte', 'termine', 'devis-envoye', 'paye'],
        default: 'nouvelle',
        index: true
    },
    devis: {
        type: Number,
        min: 0,
        max: 100000,
        default: null
    },
    reponse: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: null
    },
    dateCreation: {
        type: Date,
        default: Date.now,
        index: true
    },
    dateReponse: {
        type: Date,
        default: null
    },
    datePaiement: {
        type: Date,
        default: null
    },
    stripeSessionId: {
        type: String,
        default: null
    },
    stripeInvoiceId: {
        type: String,
        default: null
    }
}, {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
    collection: 'demandes'
});

// Index pour améliorer les performances
demandeSchema.index({ status: 1, dateCreation: -1 });
demandeSchema.index({ email: 1 });
demandeSchema.index({ dateCreation: -1 });

// Méthode pour obtenir les statistiques
demandeSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const result = {
        total: 0,
        nouvelle: 0,
        'en-cours': 0,
        terminee: 0,
        accepte: 0,
        termine: 0
    };
    
    stats.forEach(stat => {
        result.total += stat.count;
        if (result.hasOwnProperty(stat._id)) {
            result[stat._id] = stat.count;
        }
    });
    
    return result;
};

// Méthode pour formater la demande pour l'API (compatibilité avec l'ancien format)
demandeSchema.methods.toJSON = function() {
    const obj = this.toObject();
    obj.id = obj._id.toString();
    obj.dateCreation = obj.dateCreation ? obj.dateCreation.toISOString() : new Date().toISOString();
    obj.dateReponse = obj.dateReponse ? obj.dateReponse.toISOString() : null;
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Demande', demandeSchema);
