// ============================================
// NAVIGATION BAR
// ============================================

// Variable pour éviter l'initialisation multiple
let navbarInitialized = false;
let navbarHandlers = null;

function initNavbar() {
    'use strict';
    
    // Empêcher l'initialisation multiple
    if (navbarInitialized) {
        return;
    }
    
    const navbar = document.getElementById('mainNavbar');
    const toggle = document.getElementById('navbarToggle');
    const mobileMenu = document.getElementById('navbarMobile');
    const overlay = document.getElementById('navbarOverlay');
    const closeBtn = document.getElementById('mobileClose');
    const navLinks = document.querySelectorAll('.navbar-link, .mobile-menu-link');
    
    if (!navbar || !toggle || !mobileMenu || !overlay || !closeBtn) {
        return;
    }
    
    // Marquer comme initialisé
    navbarInitialized = true;
    
    // Toggle mobile menu
    function toggleMenu() {
        const isActive = mobileMenu.classList.contains('active');
        
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    function openMenu() {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        toggle.classList.add('active');
        toggle.style.display = 'none'; // Cacher le burger quand le menu est ouvert
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        toggle.classList.remove('active');
        toggle.style.display = ''; // Réafficher le burger quand le menu est fermé
        document.body.style.overflow = '';
    }
    
    // Créer les handlers une seule fois et les stocker
    if (!navbarHandlers) {
        navbarHandlers = {
            handleToggle: function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleMenu();
            },
            handleClose: function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                closeMenu();
            },
            handleOverlay: function(e) {
                if (e.target === overlay) {
                    e.stopImmediatePropagation();
                    closeMenu();
                }
            },
            handleMenuClick: function(e) {
                e.stopPropagation();
            }
        };
    }
    
    // Supprimer les anciens listeners s'ils existent (au cas où)
    if (navbarHandlers) {
        toggle.removeEventListener('click', navbarHandlers.handleToggle);
        closeBtn.removeEventListener('click', navbarHandlers.handleClose);
        overlay.removeEventListener('click', navbarHandlers.handleOverlay);
        mobileMenu.removeEventListener('click', navbarHandlers.handleMenuClick);
    }
    
    // Ajouter les nouveaux listeners avec capture: false et once: false
    toggle.addEventListener('click', navbarHandlers.handleToggle, false);
    closeBtn.addEventListener('click', navbarHandlers.handleClose, false);
    overlay.addEventListener('click', navbarHandlers.handleOverlay, false);
    mobileMenu.addEventListener('click', navbarHandlers.handleMenuClick, false);
    
    // Navbar scroll effect
    let lastScroll = 0;
    const scrollThreshold = 50;
    
    function handleScroll() {
        const currentScroll = window.pageYOffset || window.scrollY;
        
        if (currentScroll > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    // Smooth scroll for anchor links + close menu on mobile (un seul listener)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation();
            const href = this.getAttribute('href');
            
            // Close menu on mobile
            if (window.innerWidth <= 768) {
                closeMenu();
            }
            
            // Smooth scroll
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navHeight = navbar.offsetHeight;
                    const targetPosition = targetElement.offsetTop - navHeight;
                    
                    // Small delay on mobile to let menu close first
                    const scrollDelay = window.innerWidth <= 768 ? 300 : 0;
                    
                    setTimeout(() => {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }, scrollDelay);
                }
            }
        });
    });
    
    // Update active link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveLink() {
        const scrollPos = window.pageYOffset + navbar.offsetHeight + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
                closeMenu();
            }
        }, 250);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}

// Debounce function (définie avant utilisation)
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

// Smooth scrolling for navigation links (handled by navbar initNavbar function)
// This is now managed by the navbar's smooth scroll functionality

// Navbar removed - scroll handler disabled

// Intersection Observer for animations
if (!window.observerOptions) {
    window.observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
}
const observerOptions = window.observerOptions;

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, window.observerOptions || { threshold: 0.1 });

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .pricing-card, .feature, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(el);
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const service = formData.get('service');
        const message = formData.get('message');
        
        // Improved validation with specific error messages
        if (!name) {
            showNotification('❌ Veuillez indiquer votre nom complet.', 'error');
            const nameField = document.getElementById('reservation-name') || document.getElementById('name');
            if (nameField) nameField.focus();
            return;
        }
        
        if (!email) {
            showNotification('❌ Veuillez indiquer votre adresse email.', 'error');
            const emailField = document.getElementById('reservation-email') || document.getElementById('email');
            if (emailField) emailField.focus();
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('❌ L\'adresse email n\'est pas valide. Format attendu : nom@exemple.com', 'error');
            const emailField = document.getElementById('reservation-email') || document.getElementById('email');
            if (emailField) emailField.focus();
            return;
        }
        
        if (!service) {
            showNotification('❌ Veuillez sélectionner un type de service.', 'error');
            document.getElementById('service').focus();
            return;
        }
        
        // Simulate form submission
        showNotification('Votre demande a été envoyée avec succès ! Nous vous contacterons bientôt.', 'success');
        this.reset();
    });
}

// Debounce déjà défini plus haut - cette déclaration en double est supprimée

// Popup de confirmation email
function showEmailConfirmationPopup(email) {
    console.log('📧 Affichage du popup de confirmation pour:', email);
    
    // Remove existing popup
    const existingPopup = document.querySelector('.email-confirmation-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'email-confirmation-popup';
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 0, 0, 0.5) !important;
        z-index: 99999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    `;
    
    // Create popup content
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white !important;
        border-radius: 16px !important;
        padding: 2rem !important;
        max-width: 500px !important;
        width: 90% !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
        text-align: center !important;
        position: relative !important;
        z-index: 100000 !important;
    `;
    
    popup.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">📧</div>
        <h2 style="color: #10b981; margin: 0 0 1rem 0; font-size: 1.5rem;">Email de confirmation envoyé !</h2>
        <p style="color: #666; margin: 0 0 1.5rem 0; line-height: 1.6;">
            Un email de confirmation a été envoyé à :<br>
            <strong style="color: #1f2937;">${email}</strong>
        </p>
        <p style="color: #666; margin: 0 0 1.5rem 0; font-size: 0.9rem;">
            Vérifiez votre boîte de réception (et les spams) pour recevoir les détails de votre demande.
        </p>
        <button class="email-popup-close-btn"
                style="background: linear-gradient(135deg, #D4AF37 0%, #c9a030 100%);
                       color: #000;
                       border: none;
                       padding: 12px 30px;
                       border-radius: 8px;
                       font-weight: bold;
                       cursor: pointer;
                       font-size: 1rem;
                       transition: transform 0.2s;">
            Parfait, j'ai compris
        </button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    console.log('✅ Popup ajouté au DOM');
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    // Close button handler
    const closeBtn = popup.querySelector('button');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            overlay.remove();
        });
    }
    
    // Add animations
    if (!document.getElementById('email-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'email-popup-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    transform: translateY(30px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Auto close after 8 seconds
    setTimeout(() => {
        if (overlay.parentElement) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        }
    }, 8000);
}

// Notification system améliorée
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
        }, duration);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        font-size: 1rem;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('h3');
            const text = statNumber.textContent;
            
            if (text.includes('+')) {
                const number = parseInt(text.replace('+', ''));
                statNumber.textContent = '0+';
                animateCounter(statNumber, number);
                statNumber.textContent = number + '+';
            } else if (text.includes('★')) {
                // Don't animate star rating
                return;
            } else if (text.includes('/')) {
                // Don't animate time-based stats
                return;
            }
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
});


// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add CSS for loading animation
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    .service-card,
    .pricing-card,
    .feature {
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
`;
document.head.appendChild(loadingStyles);




// Lazy loading for images (if any are added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Navbar removed - escape handler disabled
    }
});


// Scroll indicator functionality
document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
    document.querySelector('#services')?.scrollIntoView({
        behavior: 'smooth'
    });
});

// Address Autocomplete System using Nominatim (OpenStreetMap)
let autocompleteTimeout = {};
let selectedSuggestionIndex = {};

function initAddressAutocomplete(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestionsContainer = document.getElementById(suggestionsId);
    
    if (!input || !suggestionsContainer) return;
    
    let currentSuggestions = [];
    let selectedIndex = -1;
    
    // Debounce function to limit API calls (locale, ne conflict pas avec la globale)
    function debounceAutocomplete(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(autocompleteTimeout[inputId]);
                func(...args);
            };
            clearTimeout(autocompleteTimeout[inputId]);
            autocompleteTimeout[inputId] = setTimeout(later, wait);
        };
    }
    
    // Fetch addresses from Nominatim API
    async function fetchAddresses(query) {
        if (!query || query.length < 3) {
            suggestionsContainer.classList.remove('active');
            return;
        }
        
        try {
            suggestionsContainer.innerHTML = '<div class="autocomplete-loading"><i class="fas fa-spinner fa-spin"></i> Recherche...</div>';
            suggestionsContainer.classList.add('active');
            
            // Use Nominatim API (OpenStreetMap) - Free, no API key needed
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=fr&accept-language=fr`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'PrestigeDrive/1.0'
                }
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            currentSuggestions = data;
            selectedIndex = -1;
            
            if (data.length === 0) {
                suggestionsContainer.innerHTML = '<div class="autocomplete-no-results">Aucune adresse trouvée</div>';
                return;
            }
            
            // Display suggestions
            suggestionsContainer.innerHTML = data.map((item, index) => {
                const displayName = item.display_name;
                const parts = displayName.split(',');
                const primary = parts[0];
                const secondary = parts.slice(1, 3).join(', ').trim();
                
                return `
                    <div class="autocomplete-suggestion" data-index="${index}" data-lat="${item.lat}" data-lon="${item.lon}" data-address="${displayName}">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="autocomplete-suggestion-text">
                            <div class="autocomplete-suggestion-primary">${primary}</div>
                            ${secondary ? `<div class="autocomplete-suggestion-secondary">${secondary}</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add click handlers to suggestions
            suggestionsContainer.querySelectorAll('.autocomplete-suggestion').forEach(suggestion => {
                suggestion.addEventListener('click', function() {
                    const address = this.getAttribute('data-address');
                    input.value = address;
                    suggestionsContainer.classList.remove('active');
                    
                    // Trigger input event to update form validation
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    // If map exists, update it
                    if (inputId === 'pickupLocation' && typeof setPickupLocation === 'function') {
                        const lat = parseFloat(this.getAttribute('data-lat'));
                        const lon = parseFloat(this.getAttribute('data-lon'));
                        if (map) {
                            setPickupLocation({ lat, lng: lon });
                        }
                    } else if (inputId === 'destination' && typeof setDestinationLocation === 'function') {
                        const lat = parseFloat(this.getAttribute('data-lat'));
                        const lon = parseFloat(this.getAttribute('data-lon'));
                        if (map) {
                            setDestinationLocation({ lat, lng: lon });
                        }
                    }
                });
            });
            
        } catch (error) {
            suggestionsContainer.innerHTML = '<div class="autocomplete-no-results">Erreur de recherche. Veuillez réessayer.</div>';
        }
    }
    
    // Debounced search function
    const debouncedSearch = debounceAutocomplete(fetchAddresses, 300);
    
    // Input event handler
    input.addEventListener('input', function(e) {
        const query = this.value.trim();
        if (query.length >= 3) {
            debouncedSearch(query);
        } else {
            suggestionsContainer.classList.remove('active');
        }
    });
    
    // Keyboard navigation
    input.addEventListener('keydown', function(e) {
        const suggestions = suggestionsContainer.querySelectorAll('.autocomplete-suggestion');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
            updateSelectedSuggestion(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelectedSuggestion(suggestions);
        } else if (e.key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
            e.preventDefault();
            suggestions[selectedIndex].click();
        } else if (e.key === 'Escape') {
            suggestionsContainer.classList.remove('active');
            selectedIndex = -1;
        }
    });
    
    function updateSelectedSuggestion(suggestions) {
        suggestions.forEach((s, i) => {
            s.classList.toggle('selected', i === selectedIndex);
        });
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            suggestions[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.classList.remove('active');
        }
    });
    
    // Focus event - show suggestions if there's text
    input.addEventListener('focus', function() {
        if (this.value.trim().length >= 3) {
            debouncedSearch(this.value.trim());
        }
    });
}

// Initialize autocomplete when DOM is ready
function initializeAutocomplete() {
    // Wait a bit to ensure form is rendered
    setTimeout(() => {
        initAddressAutocomplete('pickupLocation', 'pickupLocationSuggestions');
        initAddressAutocomplete('destination', 'destinationSuggestions');
    }, 100);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAutocomplete);
} else {
    initializeAutocomplete();
}

// Amélioration UX - Validation en temps réel
function addRealTimeValidation() {
    const form = document.getElementById('devisForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        // Validation au blur
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        // Supprimer l'état d'erreur lors de la saisie
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                this.classList.remove('error');
            }
        });
    });
}

function validateField(field) {
    if (!field.value.trim() && field.hasAttribute('required')) {
        field.classList.add('error');
        return false;
    }
    
    // Validation email
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            field.classList.add('error');
            return false;
        }
    }
    
    // Validation téléphone
    if (field.type === 'tel' && field.value) {
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (!phoneRegex.test(field.value) || field.value.replace(/\D/g, '').length < 10) {
            field.classList.add('error');
            return false;
        }
    }
    
    field.classList.remove('error');
    return true;
}

// Devis form handling amélioré
const devisForm = document.getElementById('devisForm');
if (devisForm) {
    // Ajouter validation en temps réel
    addRealTimeValidation();
    
    devisForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Afficher l'état de chargement
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        
        // Get form data
        const formData = new FormData(this);
        const pickup = formData.get('pickupLocation');
        const destination = formData.get('destination');
        const date = formData.get('pickupDate');
        const time = formData.get('pickupTime');
        const passengers = formData.get('passengers');
        const serviceType = formData.get('serviceType');
        const name = formData.get('name');
        const phone = formData.get('phone');
        const email = formData.get('email');
        const notes = formData.get('notes');
        
        // Improved validation with specific error messages
        const pickupInput = document.getElementById('pickupLocation');
        const destinationInput = document.getElementById('destination');
        
        if (!pickup || pickup.trim() === '') {
            showNotification('❌ Veuillez indiquer votre lieu de prise en charge.', 'error');
            if (pickupInput) {
                pickupInput.focus();
                pickupInput.style.borderColor = '#ef4444';
                setTimeout(() => {
                    pickupInput.style.borderColor = '';
                }, 3000);
            }
            return;
        }
        
        if (!destination || destination.trim() === '') {
            showNotification('❌ Veuillez indiquer votre destination.', 'error');
            if (destinationInput) {
                destinationInput.focus();
                destinationInput.style.borderColor = '#ef4444';
                setTimeout(() => {
                    destinationInput.style.borderColor = '';
                }, 3000);
            }
            return;
        }
        
        // Valider tous les champs avant de continuer
        let isValid = true;
        const requiredFields = [
            { field: document.getElementById('pickupLocation'), name: 'lieu de prise en charge' },
            { field: document.getElementById('destination'), name: 'destination' },
            { field: document.getElementById('pickupDate'), name: 'date' },
            { field: document.getElementById('pickupTime'), name: 'heure' },
            { field: document.getElementById('passengers'), name: 'nombre de passagers' },
            { field: document.getElementById('serviceType'), name: 'type de service' },
            { field: document.getElementById('reservation-name'), name: 'nom' },
            { field: document.getElementById('reservation-phone'), name: 'téléphone' },
            { field: document.getElementById('reservation-email'), name: 'email' }
        ];
        
        // Validation des champs requis
        if (!date) {
            showNotification('❌ Veuillez sélectionner une date pour votre trajet.', 'error');
            document.getElementById('pickupDate').focus();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        if (!time) {
            showNotification('❌ Veuillez sélectionner une heure pour votre trajet.', 'error');
            document.getElementById('pickupTime').focus();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        if (!passengers) {
            showNotification('❌ Veuillez indiquer le nombre de passagers.', 'error');
            document.getElementById('passengers').focus();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        if (!serviceType) {
            showNotification('❌ Veuillez choisir un type de service.', 'error');
            document.getElementById('serviceType').focus();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        if (!name) {
            showNotification('❌ Veuillez indiquer votre nom complet.', 'error');
            const nameField = document.getElementById('reservation-name') || document.getElementById('name');
            if (nameField) nameField.focus();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        if (!phone) {
            showNotification('❌ Veuillez indiquer votre numéro de téléphone.', 'error');
            const phoneField = document.getElementById('reservation-phone') || document.getElementById('phone');
            if (phoneField) phoneField.focus();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        if (!email) {
            showNotification('❌ Veuillez indiquer votre adresse email.', 'error');
            const emailField = document.getElementById('reservation-email') || document.getElementById('email');
            if (emailField) emailField.focus();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('❌ L\'adresse email n\'est pas valide. Format attendu : nom@exemple.com', 'error');
            const emailField = document.getElementById('reservation-email') || document.getElementById('email');
            if (emailField) emailField.focus();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        // Phone validation
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(phone)) {
            showNotification('❌ Le numéro de téléphone n\'est pas valide. Utilisez uniquement des chiffres, +, -, espaces et parenthèses.', 'error');
            const phoneField = document.getElementById('reservation-phone') || document.getElementById('phone');
            if (phoneField) phoneField.focus();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        // Date validation (not in the past)
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showNotification('❌ La date ne peut pas être dans le passé. Veuillez sélectionner une date future.', 'error');
            document.getElementById('pickupDate').focus();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        // Get estimated price if available
        const priceElement = document.getElementById('price');
        const distanceElement = document.getElementById('distance');
        const durationElement = document.getElementById('duration');
        
        let prix = 0;
        if (priceElement && priceElement.textContent !== '-- €') {
            // Extract price number from text (e.g., "150 €" -> 150)
            const priceText = priceElement.textContent.replace(/[^\d,.]/g, '').replace(',', '.');
            prix = parseFloat(priceText) || 0;
        }
        
        // If no price calculated, use default calculation
        if (prix === 0 && distanceElement && distanceElement.textContent !== '-- km') {
            const distanceText = distanceElement.textContent.replace(/[^\d,.]/g, '').replace(',', '.');
            const distance = parseFloat(distanceText) || 0;
            prix = Math.round(distance * 1.6); // 1.60€/km
        }
        
        // Prepare data to send to backend (mapped to backend field names)
        const estimatedDistance = distanceElement ? distanceElement.textContent : null;
        const estimatedDuration = durationElement ? durationElement.textContent : null;
        
        let description = notes || '';
        if (estimatedDistance && estimatedDistance !== '-- km') {
            description += (description ? '. ' : '') + `Distance: ${estimatedDistance}`;
        }
        if (estimatedDuration && estimatedDuration !== '-- min') {
            description += (description ? '. ' : '') + `Durée: ${estimatedDuration}`;
        }
        if (!description) {
            description = `Service: ${serviceType || 'standard'}`;
        }
        
        // Prepare data for backend API
        const bookingData = {
            name: name,
            email: email,
            phone: phone,
            pickup: pickup,
            dropoff: destination,
            date: date,
            time: time,
            passengers: parseInt(passengers) || 1,
            serviceType: serviceType || '',
            message: description || notes || null
        };
        
        // Envoyer la demande au backend Node.js
        try {
            console.log('📤 Envoi de la demande vers /api/demandes...', bookingData);
            
            const response = await fetch('/api/demandes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });
            
            console.log('📥 Réponse reçue:', response.status, response.statusText);
            
            // Vérifier si la réponse est OK
            if (!response.ok) {
                // Lire le message d'erreur du serveur (une seule fois)
                let errorMessage = `Erreur ${response.status}`;
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                        console.error('❌ Erreur serveur:', errorData);
                    } catch (e) {
                        console.error('❌ Impossible de parser JSON:', e);
                        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
                    }
                } else {
                    // Si ce n'est pas du JSON, lire comme texte (une seule fois)
                    try {
                        const errorText = await response.text();
                        console.error('❌ Réponse d\'erreur (non JSON):', errorText.substring(0, 200));
                        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
                    } catch (textError) {
                        console.error('❌ Impossible de lire la réponse d\'erreur');
                        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
                    }
                }
                throw new Error(errorMessage);
            }
            
            let result;
            try {
                result = await response.json();
                console.log('✅ Réponse JSON:', result);
            } catch (jsonError) {
                // Si la réponse n'est pas du JSON (ex: page HTML d'erreur)
                const text = await response.text();
                console.error('❌ Réponse n\'est pas du JSON:', text.substring(0, 200));
                throw new Error('Réponse invalide du serveur (attendu JSON, reçu HTML/text). Le serveur est-il démarré ?');
            }
            
            if (result.success) {
                // Success - La demande est maintenant dans MongoDB !
                const clientEmail = bookingData.email;
                
                // Popup de confirmation avec mention de l'email
                showEmailConfirmationPopup(clientEmail);
                
                // Notification standard aussi
                showNotification('✅ Votre demande a bien été enregistrée dans MongoDB. Email: ' + clientEmail, 'success', 5000);
                
                console.log('📋 Demande enregistrée dans MongoDB:', result.data);
                
                // Google Ads Conversion - Demande de devis
                if (typeof gtag_report_conversion === 'function' && window.googleAdsConfig) {
                    gtag_report_conversion(window.googleAdsConfig.conversions.devis, 100);
                }
                
                // Reset form
                this.reset();
                
                // Reset map and quote display
                if (typeof currentRoute !== 'undefined' && currentRoute && typeof map !== 'undefined' && map) {
                    map.removeLayer(currentRoute);
                    currentRoute = null;
                }
                const distanceEl = document.getElementById('distance');
                const durationEl = document.getElementById('duration');
                const priceEl = document.getElementById('price');
                if (distanceEl) distanceEl.textContent = '-- km';
                if (durationEl) durationEl.textContent = '-- min';
                if (priceEl) priceEl.textContent = '-- €';
                
                // Réinitialiser le bouton
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            } else {
                throw new Error(result.error || 'Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi:', error);
            
            // Afficher les détails seulement si disponibles
            if (error && typeof error === 'object') {
                console.error('❌ Détails:', {
                    message: error.message || 'Pas de message',
                    name: error.name || 'Error',
                    stack: error.stack ? error.stack.substring(0, 200) : 'Pas de stack trace'
                });
            }
            
            let errorMsg = (error && error.message) ? error.message : 'Erreur inconnue';
            
            if (errorMsg.includes('404')) {
                errorMsg = 'Erreur 404: Le serveur ne répond pas. Vérifiez que le serveur Node.js est démarré (npm run dev) et que vous accédez à http://localhost:3000';
            } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('fetch')) {
                errorMsg = 'Erreur de connexion: Le serveur n\'est pas accessible. Vérifiez que le serveur Node.js tourne sur http://localhost:3000';
            } else if (errorMsg.includes('File not found')) {
                errorMsg = 'Erreur: Vous accédez au site via un autre serveur (Live Server, Python, etc.). Utilisez http://localhost:3000 avec le serveur Node.js (npm run dev)';
            }
            
            showNotification('❌ ' + errorMsg, 'error', 8000);
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
        
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Map and Quote System
let map;
let pickupMarker;
let destinationMarker;
let routeLayer;

// Pricing configuration - Tarifs réels Chamkhi VTC
const pricing = {
    basePrice: 0, // Pas de prix de base, uniquement au kilomètre
    pricePerKm: 1.6, // 1,60€/km (retour à vide inclus)
    pricePerMinute: 0, // Pas de tarif au temps
    vehicleMultipliers: {
        'standard': 1.0,
        'premium': 1.0, // Même tarif pour tous les véhicules
        'luxury': 1.0,
        'van': 1.0
    }
};

// Chargement lazy de Leaflet (optimisation performance)
function loadLeaflet() {
    return new Promise((resolve, reject) => {
        if (typeof L !== 'undefined') {
            resolve();
            return;
        }
        
        // Charger CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        // Charger JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Leaflet'));
        document.body.appendChild(script);
    });
}

// Initialize map when page loads (lazy loading)
document.addEventListener('DOMContentLoaded', function() {
    setupQuoteCalculation();
    setupMapOverlay();
    
    // Charger la carte seulement si l'élément map existe ET est visible
    const mapElement = document.getElementById('map');
    if (mapElement) {
        // Observer pour charger la carte quand elle devient visible (lazy loading)
        if ('IntersectionObserver' in window) {
            const mapObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadLeaflet().then(() => {
                            initializeMap();
                        }).catch(err => {
                            console.warn('Map not available:', err);
                        });
                        mapObserver.disconnect();
                    }
                });
            }, { rootMargin: '100px' }); // Charger 100px avant d'être visible
            
            mapObserver.observe(mapElement);
        } else {
            // Fallback pour navigateurs anciens
            loadLeaflet().then(() => {
                initializeMap();
            });
        }
    }
});

function initializeMap() {
    // Vérifier que Leaflet est chargé
    if (typeof L === 'undefined') {
        console.warn('Leaflet not loaded yet');
        return;
    }
    
    // Vérifier que l'élément map existe
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        return;
    }
    
    // Initialize map centered on Compiègne
    map = L.map('map').setView([49.4177, 2.8262], 12);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add click event to map
    map.on('click', function(e) {
        const pickupInput = document.getElementById('pickup');
        const destinationInput = document.getElementById('destination');
        
        // Determine which field to fill based on which is empty
        if (!pickupInput.value) {
            setPickupLocation(e.latlng);
        } else if (!destinationInput.value) {
            setDestinationLocation(e.latlng);
        } else {
            // If both are filled, replace pickup
            setPickupLocation(e.latlng);
        }
    });
}

function setPickupLocation(latlng) {
    const pickupInput = document.getElementById('pickup');
    pickupInput.value = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
    
    // Remove existing pickup marker
    if (pickupMarker) {
        map.removeLayer(pickupMarker);
    }
    
    // Add new pickup marker
    pickupMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'custom-marker pickup-marker',
            html: '<div class="marker-content">A</div>',
            iconSize: [30, 30]
        })
    }).addTo(map);
    
    updateRoute();
}

function setDestinationLocation(latlng) {
    const destinationInput = document.getElementById('destination');
    destinationInput.value = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
    
    // Remove existing destination marker
    if (destinationMarker) {
        map.removeLayer(destinationMarker);
    }
    
    // Add new destination marker
    destinationMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'custom-marker destination-marker',
            html: '<div class="marker-content">B</div>',
            iconSize: [30, 30]
        })
    }).addTo(map);
    
    updateRoute();
}

function updateRoute() {
    if (pickupMarker && destinationMarker) {
        const pickupLatLng = pickupMarker.getLatLng();
        const destinationLatLng = destinationMarker.getLatLng();
        
        // Remove existing route
        if (routeLayer) {
            map.removeLayer(routeLayer);
        }
        
        // Add route line
        routeLayer = L.polyline([pickupLatLng, destinationLatLng], {
            color: '#D4AF37',
            weight: 4,
            opacity: 0.8
        }).addTo(map);
        
        // Fit map to show both markers
        const group = new L.featureGroup([pickupMarker, destinationMarker]);
        map.fitBounds(group.getBounds().pad(0.1));
        
        // Calculate and update quote
        calculateQuote(pickupLatLng, destinationLatLng);
    }
}

function calculateQuote(pickup, destination) {
    // Calculate distance using Haversine formula
    const distance = calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng);
    
    // Estimate duration (assuming average speed of 30 km/h in city)
    const duration = Math.round((distance / 30) * 60);
    
    // Get vehicle type
    const vehicleType = document.getElementById('vehicle').value || 'standard';
    const multiplier = pricing.vehicleMultipliers[vehicleType] || 1.0;
    
    // Calculate price
    const basePrice = pricing.basePrice;
    const distancePrice = distance * pricing.pricePerKm;
    const timePrice = duration * pricing.pricePerMinute;
    const totalPrice = Math.round((basePrice + distancePrice + timePrice) * multiplier);
    
    // Update display
    document.getElementById('distance').textContent = `${distance.toFixed(1)} km`;
    document.getElementById('duration').textContent = `${duration} min`;
    document.getElementById('price').textContent = `${totalPrice} €`;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function setupQuoteCalculation() {
    // Listen for changes in vehicle type
    const vehicleSelect = document.getElementById('vehicle');
    if (vehicleSelect) {
        vehicleSelect.addEventListener('change', function() {
            if (pickupMarker && destinationMarker) {
                const pickupLatLng = pickupMarker.getLatLng();
                const destinationLatLng = destinationMarker.getLatLng();
                calculateQuote(pickupLatLng, destinationLatLng);
            }
        });
    }
    
    // Listen for manual address input
    const pickupInput = document.getElementById('pickup');
    const destinationInput = document.getElementById('destination');
    
    if (pickupInput) {
        pickupInput.addEventListener('blur', function() {
            if (this.value && !this.value.includes(',')) {
                // If it's not coordinates, try to geocode
                geocodeAddress(this.value, 'pickup');
            }
        });
    }
    
    if (destinationInput) {
        destinationInput.addEventListener('blur', function() {
            if (this.value && !this.value.includes(',')) {
                // If it's not coordinates, try to geocode
                geocodeAddress(this.value, 'destination');
            }
        });
    }
}

function geocodeAddress(address, type) {
    // Simple geocoding using Nominatim (OpenStreetMap)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                const latlng = L.latLng(lat, lng);
                
                if (type === 'pickup') {
                    setPickupLocation(latlng);
                } else {
                    setDestinationLocation(latlng);
                }
            }
        })
        .catch(error => {
        });
}

function setupMapOverlay() {
    const mapOverlay = document.querySelector('.map-overlay');
    if (mapOverlay) {
        mapOverlay.addEventListener('click', function() {
            this.classList.add('hidden');
            showNotification('Cliquez sur la carte pour sélectionner vos points de départ et d\'arrivée', 'info');
        });
    }
}

// ===== GESTION DES COOKIES RGPD =====
const cookieBanner = document.getElementById('cookie-banner');
const cookieModal = document.getElementById('cookie-modal');
const btnAcceptAll = document.getElementById('cookie-accept-all');
const btnReject = document.getElementById('cookie-reject');
const btnCustomize = document.getElementById('cookie-customize');
const btnModalClose = document.getElementById('cookie-modal-close');
const btnSavePreferences = document.getElementById('cookie-save-preferences');

// Vérifier si l'utilisateur a déjà fait un choix
function checkCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
        // Afficher la bannière après 1 seconde
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1000);
    }
}

// Accepter tous les cookies
if (btnAcceptAll) {
    btnAcceptAll.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', JSON.stringify({
            necessary: true,
            analytics: true,
            timestamp: new Date().toISOString()
        }));
        cookieBanner.classList.remove('show');
        // Activer les cookies analytiques si besoin
        enableAnalyticsCookies();
    });
}

// Refuser les cookies (sauf nécessaires)
if (btnReject) {
    btnReject.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', JSON.stringify({
            necessary: true,
            analytics: false,
            timestamp: new Date().toISOString()
        }));
        cookieBanner.classList.remove('show');
    });
}

// Ouvrir le modal de personnalisation
if (btnCustomize) {
    btnCustomize.addEventListener('click', () => {
        cookieBanner.classList.remove('show');
        cookieModal.classList.add('show');
    });
}

// Fermer le modal
if (btnModalClose) {
    btnModalClose.addEventListener('click', () => {
        cookieModal.classList.remove('show');
        cookieBanner.classList.add('show');
    });
}

// Enregistrer les préférences
if (btnSavePreferences) {
    btnSavePreferences.addEventListener('click', () => {
        const analyticsChecked = document.getElementById('cookie-analytics').checked;
        localStorage.setItem('cookieConsent', JSON.stringify({
            necessary: true,
            analytics: analyticsChecked,
            timestamp: new Date().toISOString()
        }));
        cookieModal.classList.remove('show');
        
        if (analyticsChecked) {
            enableAnalyticsCookies();
        }
        
        showNotification('✅ Vos préférences ont été enregistrées', 'success');
    });
}

// Fermer le modal en cliquant à l'extérieur
if (cookieModal) {
    cookieModal.addEventListener('click', (e) => {
        if (e.target === cookieModal) {
            cookieModal.classList.remove('show');
            cookieBanner.classList.add('show');
        }
    });
}

// Activer les cookies analytiques (Google Analytics, etc.)
function enableAnalyticsCookies() {
    // Ajouter ici le code pour activer Google Analytics ou autres services
    
    // Exemple avec Google Analytics (à décommenter si vous utilisez GA)
    /*
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
    */
}

// Initialiser la vérification des cookies
checkCookieConsent();

// ===== FAQ ACCORDÉON (VERSION AMÉLIORÉE) =====
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length === 0) {
        return;
    }
    
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (!question || !answer) {
            return;
        }
        
        // Ajouter l'événement de clic
        question.addEventListener('click', function(e) {
            e.preventDefault();
            
            const isCurrentlyActive = item.classList.contains('active');
            
            // Fermer tous les items FAQ
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Si ce n'était pas actif, l'ouvrir
            if (!isCurrentlyActive) {
                item.classList.add('active');
            } else {
            }
        });
        
        // Ajouter l'accessibilité
        question.setAttribute('aria-expanded', 'false');
        answer.setAttribute('aria-hidden', 'true');
        
        // Observer les changements de classe
        const mutationObserver = new MutationObserver(function(mutations) {
            const isActive = item.classList.contains('active');
            question.setAttribute('aria-expanded', isActive);
            answer.setAttribute('aria-hidden', !isActive);
        });
        
        mutationObserver.observe(item, { attributes: true, attributeFilter: ['class'] });
    });
    
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFAQ);
} else {
    initFAQ();
}

// Hero Services Dropdown - REMOVED
// Function removed as dropdown was removed from HTML

// Fancy Effects & Scroll Animations
function initFancyEffects() {
    // Navbar removed - scroll effect disabled
    
    // Scroll animations
    const scrollObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, scrollObserverOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach(el => {
        scrollObserver.observe(el);
    });
    
    // Add animation classes to service cards
    document.querySelectorAll('.service-card-premium').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
        scrollObserver.observe(card);
    });
    
    // Add animation classes to pricing cards
    document.querySelectorAll('.forfait-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
        scrollObserver.observe(card);
    });
    
    // Parallax effect DÉSACTIVÉ pour performance
    // const hero = document.querySelector('.hero');
    // if (hero) {
    //     window.addEventListener('scroll', () => {
    //         const scrolled = window.pageYOffset;
    //         const parallax = scrolled * 0.5;
    //         hero.style.transform = `translateY(${parallax}px)`;
    //     });
    // }
    
    // Enhanced hover effects for buttons
    document.querySelectorAll('.btn-primary-presentation, .hero-services-cta').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Ripple effect on button clicks
    document.querySelectorAll('button, .btn-primary-presentation, .hero-services-cta').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Smooth reveal animations for sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        sectionObserver.observe(section);
    });
}

// Initialize fancy effects
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFancyEffects);
} else {
    initFancyEffects();
}


// Google Ads Conversion Tracking - Clics sur téléphone
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function() {
        if (typeof gtag_report_conversion === 'function' && window.googleAdsConfig) {
            gtag_report_conversion(window.googleAdsConfig.conversions.phone, 50);
        }
    });
});

// Google Ads Conversion Tracking - Clics sur email
document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', function() {
        if (typeof gtag_report_conversion === 'function' && window.googleAdsConfig) {
            gtag_report_conversion(window.googleAdsConfig.conversions.email, 30);
        }
    });
});

