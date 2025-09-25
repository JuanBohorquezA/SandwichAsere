// Shopping Cart Management Module
class CartManager {
    constructor() {
        this.items = [];
        this.storageKey = 'sandwich_asere_cart';
        this.isOpen = false;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupCartSidebar();
        this.setupEventListeners();
        this.updateUI();
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.items = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.items = [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    setupCartSidebar() {
        const cartBtn = document.getElementById('cart-btn');
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartClose = document.getElementById('cart-close');
        const cartOverlay = document.getElementById('cart-overlay');
        const continueShopping = document.getElementById('continue-shopping');

        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.openCart());
        }

        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCart());
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.closeCart());
        }

        if (continueShopping) {
            continueShopping.addEventListener('click', () => this.closeCart());
        }

        // Close cart with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });
    }

    setupEventListeners() {
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }

        // Cart items event delegation
        const cartItems = document.getElementById('cart-items');
        if (cartItems) {
            cartItems.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-product-id'));
                
                if (e.target.classList.contains('quantity-btn')) {
                    const action = e.target.getAttribute('data-action');
                    if (action === 'increase') {
                        this.updateQuantity(productId, this.getItemQuantity(productId) + 1);
                    } else if (action === 'decrease') {
                        this.updateQuantity(productId, this.getItemQuantity(productId) - 1);
                    }
                } else if (e.target.classList.contains('cart-item__remove')) {
                    this.removeItem(productId);
                }
            });
        }
    }

    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('active');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
            this.isOpen = false;
            document.body.style.overflow = '';
        }
    }

    addItem(product, quantity = 1) {
        const existingItemIndex = this.items.findIndex(item => item.product_id === product.id);
        
        if (existingItemIndex >= 0) {
            this.items[existingItemIndex].quantity += quantity;
        } else {
            this.items.push({
                product_id: product.id,
                quantity: quantity,
                price: product.price
            });
        }
        
        this.saveToStorage();
        this.updateUI();
        
        if (window.ui) {
            window.ui.showMessage(`${product.name} agregado al carrito`, 'success', 3000);
        }
    }

    removeItem(productId) {
        const itemIndex = this.items.findIndex(item => item.product_id === productId);
        
        if (itemIndex >= 0) {
            const product = window.productsManager?.getProductById(productId);
            this.items.splice(itemIndex, 1);
            this.saveToStorage();
            this.updateUI();
            
            if (window.ui && product) {
                window.ui.showMessage(`${product.name} eliminado del carrito`, 'info', 3000);
            }
        }
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }
        
        const itemIndex = this.items.findIndex(item => item.product_id === productId);
        
        if (itemIndex >= 0) {
            this.items[itemIndex].quantity = newQuantity;
            this.saveToStorage();
            this.updateUI();
        }
    }

    getItemQuantity(productId) {
        const item = this.items.find(item => item.product_id === productId);
        return item ? item.quantity : 0;
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItems() {
        return this.items;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateUI();
        
        if (window.ui) {
            window.ui.showMessage('Carrito vaciado', 'info', 3000);
        }
    }

    updateUI() {
        if (!window.ui || !window.productsManager) return;
        
        const products = window.productsManager.getAllProducts();
        window.ui.updateCartUI(this.items, products);
    }

    async checkout() {
        if (this.isEmpty()) {
            if (window.ui) {
                window.ui.showMessage('Tu carrito está vacío', 'error');
            }
            return;
        }

        // Get customer information
        const customerInfo = await this.getCustomerInfo();
        if (!customerInfo) return;

        try {
            const purchaseData = {
                items: this.items,
                total: this.getTotalPrice(),
                customer_name: customerInfo.name,
                customer_email: customerInfo.email,
                customer_phone: customerInfo.phone || ''
            };

            const response = await fetch('/api/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchaseData)
            });

            if (!response.ok) {
                throw new Error('Error processing purchase');
            }

            const result = await response.json();
            
            if (window.ui) {
                window.ui.showMessage(`¡Pedido exitoso! ID: ${result.order_id}`, 'success', 8000);
            }
            
            this.clear();
            this.closeCart();
            
        } catch (error) {
            console.error('Checkout error:', error);
            if (window.ui) {
                window.ui.showMessage('Error procesando el pedido. Intenta de nuevo.', 'error');
            }
        }
    }

    async getCustomerInfo() {
        return new Promise((resolve) => {
            // Create a simple modal for customer information
            const modal = this.createCustomerInfoModal();
            document.body.appendChild(modal);
            
            const form = modal.querySelector('#customer-info-form');
            const cancelBtn = modal.querySelector('#cancel-checkout');
            
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const customerInfo = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone')
                };
                
                document.body.removeChild(modal);
                resolve(customerInfo);
            });
            
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(null);
            });
            
            // Close modal with Escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(modal);
                    document.removeEventListener('keydown', handleEscape);
                    resolve(null);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }

    createCustomerInfoModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            backdrop-filter: blur(4px);
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
            ">
                <h3 style="margin-bottom: 1.5rem; color: var(--color-gray-dark); text-align: center;">
                    Información de Contacto
                </h3>
                <form id="customer-info-form">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Nombre *</label>
                        <input type="text" name="name" required style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid var(--color-gray-light);
                            border-radius: 0.5rem;
                            font-size: 1rem;
                        ">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email *</label>
                        <input type="email" name="email" required style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid var(--color-gray-light);
                            border-radius: 0.5rem;
                            font-size: 1rem;
                        ">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Teléfono (opcional)</label>
                        <input type="tel" name="phone" style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid var(--color-gray-light);
                            border-radius: 0.5rem;
                            font-size: 1rem;
                        ">
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button type="button" id="cancel-checkout" style="
                            flex: 1;
                            background: var(--color-gray-light);
                            color: var(--color-gray-dark);
                            border: none;
                            padding: 1rem;
                            border-radius: 0.5rem;
                            font-weight: 600;
                            cursor: pointer;
                        ">Cancelar</button>
                        <button type="submit" style="
                            flex: 1;
                            background: var(--color-primary);
                            color: white;
                            border: none;
                            padding: 1rem;
                            border-radius: 0.5rem;
                            font-weight: 600;
                            cursor: pointer;
                        ">Confirmar Pedido</button>
                    </div>
                </form>
            </div>
        `;
        
        return modal;
    }
}

// Export for use in other modules
window.CartManager = CartManager;