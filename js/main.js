// Main Application Entry Point
class SandwichAsereApp {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('App initialization error:', error);
        }
    }

    async initializeApp() {
        try {
            // Initialize UI Manager first
            window.ui = new UIManager();
            
            // Initialize Products Manager
            window.productsManager = new ProductsManager();
            
            // Initialize Cart Manager
            window.cartManager = new CartManager();
            
            // Setup contact form
            this.setupContactForm();
            
            // Setup health check
            this.checkApiHealth();
            
            console.log('Sandwich Asere app initialized successfully');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showErrorState();
        }
    }

    async checkApiHealth() {
        try {
            const response = await fetch('/api/health');
            if (!response.ok) {
                throw new Error('API health check failed');
            }
            const health = await response.json();
            console.log('API Health:', health);
        } catch (error) {
            console.error('API health check failed:', error);
            if (window.ui) {
                window.ui.showMessage('Advertencia: Algunas funciones pueden no estar disponibles', 'error', 8000);
            }
        }
    }

    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        const submitButton = document.getElementById('contact-submit');
        
        if (!contactForm || !submitButton) return;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const contactData = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            
            // Validate form data
            if (!this.validateContactForm(contactData)) {
                return;
            }
            
            // Show loading state
            if (window.ui) {
                window.ui.showLoading(submitButton, true);
            }
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(contactData)
                });
                
                if (!response.ok) {
                    throw new Error('Error sending message');
                }
                
                const result = await response.json();
                
                if (window.ui) {
                    window.ui.showMessage('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success', 6000);
                }
                
                // Reset form
                contactForm.reset();
                
            } catch (error) {
                console.error('Contact form error:', error);
                if (window.ui) {
                    window.ui.showMessage('Error enviando mensaje. Intenta de nuevo más tarde.', 'error');
                }
            } finally {
                // Hide loading state
                if (window.ui) {
                    window.ui.showLoading(submitButton, false);
                }
            }
        });
    }

    validateContactForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            if (window.ui) {
                window.ui.showMessage('Por favor ingresa un nombre válido', 'error');
            }
            return false;
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            if (window.ui) {
                window.ui.showMessage('Por favor ingresa un email válido', 'error');
            }
            return false;
        }
        
        if (!data.message || data.message.trim().length < 10) {
            if (window.ui) {
                window.ui.showMessage('El mensaje debe tener al menos 10 caracteres', 'error');
            }
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showErrorState() {
        // Show a user-friendly error message
        const body = document.body;
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
            text-align: center;
            z-index: 9999;
            max-width: 400px;
            width: 90%;
        `;
        
        errorDiv.innerHTML = `
            <h3 style="color: var(--color-accent); margin-bottom: 1rem;">
                Error de Inicialización
            </h3>
            <p style="color: var(--color-gray); margin-bottom: 1.5rem;">
                Ocurrió un error al cargar la aplicación. Por favor recarga la página.
            </p>
            <button onclick="window.location.reload()" style="
                background: var(--color-primary);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
            ">
                Recargar Página
            </button>
        `;
        
        body.appendChild(errorDiv);
    }

    // Public API methods
    getProducts() {
        return window.productsManager?.getAllProducts() || [];
    }

    getCart() {
        return window.cartManager?.getItems() || [];
    }

    addToCart(productId, quantity = 1) {
        const product = window.productsManager?.getProductById(productId);
        if (product && window.cartManager) {
            window.cartManager.addItem(product, quantity);
            return true;
        }
        return false;
    }

    removeFromCart(productId) {
        if (window.cartManager) {
            window.cartManager.removeItem(productId);
            return true;
        }
        return false;
    }

    clearCart() {
        if (window.cartManager) {
            window.cartManager.clear();
            return true;
        }
        return false;
    }

    showMessage(text, type = 'info') {
        if (window.ui) {
            window.ui.showMessage(text, type);
        }
    }
}

// Initialize the application
window.sandwichAsereApp = new SandwichAsereApp();

// Error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.ui) {
        window.ui.showMessage('Error inesperado. Intenta recargar la página.', 'error');
    }
});

// Error handling for JavaScript errors
window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    if (window.ui) {
        window.ui.showMessage('Error en la aplicación. Algunas funciones pueden no funcionar correctamente.', 'error');
    }
});

// Development helpers (only available in development)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.dev = {
        app: () => window.sandwichAsereApp,
        ui: () => window.ui,
        products: () => window.productsManager,
        cart: () => window.cartManager,
        addProduct: (productId) => window.sandwichAsereApp.addToCart(productId),
        clearCart: () => window.sandwichAsereApp.clearCart(),
        showProducts: () => console.table(window.sandwichAsereApp.getProducts()),
        showCart: () => console.table(window.sandwichAsereApp.getCart())
    };
    
    console.log('Development helpers available in window.dev');
}