// UI Management Module
class UIManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupMessageSystem();
    }

    setupNavigation() {
        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = '#ffffff';
                header.style.backdropFilter = 'none';
            }
        });

        // Active navigation links
        const navLinks = document.querySelectorAll('.nav__link');
        const sections = document.querySelectorAll('section[id]');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Close menu when clicking on links
            const navLinks = document.querySelectorAll('.nav__link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Hero CTA scroll to products
        const heroCTA = document.getElementById('hero-cta');
        if (heroCTA) {
            heroCTA.addEventListener('click', () => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const targetPosition = productsSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    setupMessageSystem() {
        this.messageContainer = document.getElementById('message-container');
    }

    showMessage(text, type = 'info', duration = 5000) {
        if (!this.messageContainer) return;

        const message = document.createElement('div');
        message.className = `message message--${type}`;
        message.textContent = text;

        this.messageContainer.appendChild(message);

        // Auto remove message
        setTimeout(() => {
            if (message.parentNode) {
                message.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }, 300);
            }
        }, duration);
    }

    showLoading(element, show = true) {
        const loadingText = element.querySelector('.submit-text');
        const loadingSpinner = element.querySelector('.submit-loader');
        
        if (show) {
            element.disabled = true;
            if (loadingText) loadingText.style.display = 'none';
            if (loadingSpinner) loadingSpinner.style.display = 'flex';
        } else {
            element.disabled = false;
            if (loadingText) loadingText.style.display = 'inline';
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }

    createProductCard(product) {
        return `
            <div class="product-card" data-category="${product.category}" data-id="${product.id}">
                ${product.popular ? '<div class="product-card__popular">⭐ Popular</div>' : ''}
                <img class="product-card__image" src="${product.image}" alt="${product.name}" onerror="this.outerHTML='Imagen no disponible';" />
                <div class="product-card__content">
                    <h3 class="product-card__name">${product.name}</h3>
                    <p class="product-card__description">${product.description}</p>
                    <div class="product-card__footer">
                        <span class="product-card__price">$ ${this.formatPrice(product.price)}</span>
                        <button class="product-card__add-btn" data-product-id="${product.id}">
                            Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    formatPrice(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }



    createCartItem(item, product) {
        return `
            <div class="cart-item" data-product-id="${item.product_id}">
                <div class="cart-item__image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.parentElement.innerHTML='🍽️';" />
                </div>
                <div class="cart-item__info">
                    <div class="cart-item__name">${product.name}</div>
                    <div class="cart-item__price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item__controls">
                        <button class="quantity-btn" data-action="decrease" data-product-id="${item.product_id}">-</button>
                        <span class="cart-item__quantity">${item.quantity}</span>
                        <button class="quantity-btn" data-action="increase" data-product-id="${item.product_id}">+</button>
                        <button class="cart-item__remove" data-product-id="${item.product_id}">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }

    updateCartUI(cartItems, products) {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartEmpty = document.getElementById('cart-empty');
        const cartFooter = document.getElementById('cart-footer');
        const cartTotal = document.getElementById('cart-total');
        const cartCount = document.getElementById('cart-count');

        if (!cartItemsContainer) return;

        // Update cart count
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '';
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';

        // Render cart items
        cartItemsContainer.innerHTML = cartItems.map(item => {
            const product = products.find(p => p.id === item.product_id);
            return product ? this.createCartItem(item, product) : '';
        }).join('');

        // Calculate and update total
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) {
            cartTotal.textContent = `$${total.toFixed(2)}`;
        }
    }

    filterProducts(products, category, searchTerm = '') {
        return products.filter(product => {
            const matchesCategory = category === 'all' || product.category === category;
            const matchesSearch = searchTerm === '' || 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesCategory && matchesSearch;
        });
    }

    renderProducts(products) {
        const productsGrid = document.getElementById('products-grid');
        const productsLoading = document.getElementById('products-loading');

        if (!productsGrid) return;

        if (productsLoading) {
            productsLoading.style.display = 'none';
        }

        if (products.length === 0) {
            productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--color-gray);">No se encontraron productos.</p>';
            return;
        }

        productsGrid.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }
}

// Add CSS animation for slideOut
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
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
document.head.appendChild(style);

// Export for use in other modules
window.UIManager = UIManager;