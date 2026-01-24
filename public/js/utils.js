/**
 * Utilitaires de sécurité et DOM
 * Remplace l'utilisation d'innerHTML par des méthodes sécurisées
 */

// Fonction pour échapper le HTML (prévenir XSS)
function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fonction pour créer un élément de manière sécurisée
function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);

    // Ajouter les attributs
    Object.keys(attributes).forEach(key => {
        if (key === 'class') {
            element.className = attributes[key];
        } else if (key === 'style' && typeof attributes[key] === 'object') {
            Object.assign(element.style, attributes[key]);
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, escapeHtml(String(attributes[key])));
        } else {
            element.setAttribute(key, escapeHtml(String(attributes[key])));
        }
    });

    // Ajouter le contenu texte (échappé)
    if (textContent) {
        element.textContent = textContent;
    }

    return element;
}

// Fonction pour créer un élément avec HTML (à utiliser avec précaution)
function createElementWithHTML(tag, attributes = {}, htmlContent = '') {
    const element = createElement(tag, attributes);
    if (htmlContent) {
        // Utiliser insertAdjacentHTML qui est plus sûr que innerHTML dans certains contextes
        element.insertAdjacentHTML('beforeend', htmlContent);
    }
    return element;
}

// Fonction pour vider un élément de manière sécurisée
function clearElement(element) {
    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}

// Fonction pour ajouter du texte de manière sécurisée
function setTextContent(element, text) {
    if (element) {
        element.textContent = text || '';
    }
}

// Fonction pour formater une date de manière sécurisée
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Date invalide';
    }
}

// Fonction pour formater un prix
function formatPrice(price) {
    if (!price || isNaN(price)) return '0,00 €';
    return parseFloat(price).toFixed(2).replace('.', ',') + ' €';
}

// Fonction pour valider un email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Fonction pour valider un téléphone
function isValidPhone(phone) {
    return /^[\d\s\-\+\(\)]{8,}$/.test(phone);
}

// Fonction pour logger de manière conditionnelle (seulement en dev)
function safeLog(...args) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(...args);
    }
}

// Fonction pour logger les erreurs (toujours actif)
function safeError(...args) {
    console.error(...args);
}

// Fonction pour faire une requête fetch avec gestion d'erreurs améliorée
// Fonction pour faire une requête fetch avec gestion d'erreurs améliorée et authentification
async function safeFetch(url, options = {}) {
    try {
        // Ajouter le token d'authentification si disponible
        const token = localStorage.getItem('chauffeur_token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Gestion de l'expiration du token (401)
        if (response.status === 401) {
            console.warn('Session expirée ou non autorisée');
            localStorage.removeItem('chauffeur_authenticated');
            localStorage.removeItem('chauffeur_token');
            // Rediriger vers la page de connexion si on n'y est pas déjà
            if (!window.location.pathname.endsWith('login.html')) {
                window.location.href = 'login.html';
            }
            throw new Error('Non autorisé');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        safeError('Erreur fetch:', error);
        return {
            success: false,
            error: error.message || 'Erreur de connexion'
        };
    }
}

// Fonction pour debounce (limiter les appels de fonction)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fonction pour throttle (limiter la fréquence d'exécution)
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        createElement,
        createElementWithHTML,
        clearElement,
        setTextContent,
        formatDate,
        formatPrice,
        isValidEmail,
        isValidPhone,
        safeLog,
        safeError,
        safeFetch,
        debounce,
        throttle
    };
}
