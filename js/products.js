// Products Management Module
class ProductsManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.apiBaseUrl = '/api';
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadProducts();
        this.setupFilters();
        this.setupSearch();
    }

    async loadProducts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/products`);
            if (!response.ok) {
                throw new Error('Error loading products');
            }
            this.products = await response.json();
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            window.ui?.showMessage('Error cargando productos. Intenta recargar la página.', 'error');
            
            // Show error state
            const productsGrid = document.getElementById('products-grid');
            const productsLoading = document.getElementById('products-loading');
            
            if (productsLoading) productsLoading.style.display = 'none';
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                        <p style="color: var(--color-gray); margin-bottom: 1rem;">Error cargando productos</p>
                        <button onclick="window.productsManager.loadProducts()" style="background: var(--color-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">
                            Intentar de nuevo
                        </button>
                    </div>
                `;
            }
        }
    }

    async loadCategories() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/categories`);
            if (!response.ok) {
                throw new Error('Error loading categories');
            }
            this.categories = await response.json();
        } catch (error) {
            console.error('Error loading categories:', error);
            // Use fallback categories
            this.categories = [
                { id: 'sandwiches', name: 'Sándwiches' },
                { id: 'postres', name: 'Postres' }
            ];
        }
    }

    async getProduct(productId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/products/${productId}`);
            if (!response.ok) {
                throw new Error('Product not found');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting product:', error);
            return this.products.find(p => p.id === productId);
        }
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                this.setFilter(category);
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('filter-btn--active'));
                button.classList.add('filter-btn--active');
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.setSearch(e.target.value);
                }, 300); // Debounce search
            });
        }
    }

    setFilter(category) {
        this.currentFilter = category;
        this.renderProducts();
    }

    setSearch(searchTerm) {
        this.currentSearch = searchTerm;
        this.renderProducts();
    }

    getFilteredProducts() {
        if (!window.ui) return this.products;
        return window.ui.filterProducts(this.products, this.currentFilter, this.currentSearch);
    }

    renderProducts() {
        const filteredProducts = this.getFilteredProducts();
        if (window.ui) {
            window.ui.renderProducts(filteredProducts);
        }
        
        // Setup add to cart buttons
        this.setupAddToCartButtons();
    }

    setupAddToCartButtons() {
        const addButtons = document.querySelectorAll('.product-card__add-btn');
        
        addButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(button.getAttribute('data-product-id'));
                const product = this.products.find(p => p.id === productId);
                
                if (product && window.cartManager) {
                    window.cartManager.addItem(product);
                    
                    // Visual feedback
                    const originalText = button.textContent;
                    button.textContent = '¡Agregado!';
                    button.style.background = 'var(--color-primary)';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = '';
                    }, 1000);
                }
            });
        });
    }

    // Public API
    getAllProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    getCategories() {
        return this.categories;
    }

    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    getPopularProducts() {
        return this.products.filter(p => p.popular);
    }

    getProductsByCategory(categoryId) {
        return this.products.filter(p => p.category === categoryId);
    }

    searchProducts(searchTerm) {
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
}

// Export for use in other modules
window.ProductsManager = ProductsManager;