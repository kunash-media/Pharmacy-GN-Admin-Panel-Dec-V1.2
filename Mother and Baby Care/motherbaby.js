 // ============================================
    // CONFIGURATION
    // ============================================
    const API_BASE_URL = 'http://localhost:8083/api/mb/products';

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    function showSuccessPopup(message, type = 'success') {
        const successPopup = document.getElementById('successPopup');
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = message;
        const icon = document.getElementById('popupIcon');
        icon.className = type === 'success' ? 'fas fa-check-circle text-green-500' : 'fas fa-exclamation-circle text-red-500';
        successPopup.style.display = 'flex';
    }

    function getStockStatus(quantity) {
        if (quantity === 0 || quantity === null || quantity === undefined) return 'Out of Stock';
        if (quantity < 10) return 'Low Stock';
        return 'In Stock';
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    function getStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-yellow-400"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        }
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-yellow-400"></i>';
        }
        return stars;
    }

    // ============================================
    // API SERVICE - FOR MB PRODUCTS
    // ============================================

    class ProductService {
        async getAllProducts() {
            try {
                const response = await fetch(`${API_BASE_URL}/get-all-product`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Error fetching products:', error);
                showSuccessPopup('Error loading products. Please check if server is running.', 'error');
                return [];
            }
        }

        async getProductById(id) {
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Error fetching product:', error);
                throw error;
            }
        }

        async createProduct(productData) {
            try {
                const formData = new FormData();
                
                // Prepare product JSON for MB products
                const productJson = {
                    sku: productData.sku,
                    title: productData.title,
                    category: productData.category,
                    subCategory: productData.subCategory,
                    price: parseFloat(productData.price),
                    originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
                    discount: productData.discount ? parseInt(productData.discount) : null,
                    rating: productData.rating ? parseFloat(productData.rating) : 0,
                    reviewCount: productData.reviewCount ? parseInt(productData.reviewCount) : 0,
                    brand: productData.brand,
                    inStock: productData.inStock === 'true',
                    stockQuantity: parseInt(productData.stockQuantity),
                    description: productData.description ? productData.description.split('\n').filter(d => d.trim()) : [],
                    sizes: productData.sizes ? productData.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
                    features: productData.features ? productData.features.split('\n').filter(f => f.trim()) : [],
                    specifications: productData.specifications || '{}'
                };

                formData.append('productData', JSON.stringify(productJson));
                
                // Add main image
                if (productData.mainImage) {
                    formData.append('mainImage', productData.mainImage);
                }
                
                // Add sub images
                if (productData.subImages && productData.subImages.length > 0) {
                    productData.subImages.forEach((image, index) => {
                        formData.append('subImages', image);
                    });
                }

                const response = await fetch(`${API_BASE_URL}/create-product`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server error response:', errorText);
                    throw new Error(`Failed to create product: ${response.status} ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error creating product:', error);
                throw error;
            }
        }

        async updateProduct(id, productData) {
            try {
                const formData = new FormData();
                
                const productJson = {
                    sku: productData.sku,
                    title: productData.title,
                    category: productData.category,
                    subCategory: productData.subCategory,
                    price: parseFloat(productData.price),
                    originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
                    discount: productData.discount ? parseInt(productData.discount) : null,
                    rating: productData.rating ? parseFloat(productData.rating) : 0,
                    reviewCount: productData.reviewCount ? parseInt(productData.reviewCount) : 0,
                    brand: productData.brand,
                    inStock: productData.inStock === 'true',
                    stockQuantity: parseInt(productData.stockQuantity),
                    description: productData.description ? productData.description.split('\n').filter(d => d.trim()) : [],
                    sizes: productData.sizes ? productData.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
                    features: productData.features ? productData.features.split('\n').filter(f => f.trim()) : [],
                    specifications: productData.specifications || '{}'
                };

                formData.append('productData', JSON.stringify(productJson));
                
                // Add main image if provided
                if (productData.mainImage) {
                    formData.append('mainImage', productData.mainImage);
                }
                
                // Add sub images if provided
                if (productData.subImages && productData.subImages.length > 0) {
                    productData.subImages.forEach((image) => {
                        formData.append('subImages', image);
                    });
                }

                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'PATCH',
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to update product: ${errorText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error updating product:', error);
                throw error;
            }
        }

        async deleteProduct(id) {
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to delete product: ${errorText}`);
                }

                return true;
            } catch (error) {
                console.error('Error deleting product:', error);
                throw error;
            }
        }

        async getStats() {
            try {
                const products = await this.getAllProducts();
                const total = products.length;
                const lowStock = products.filter(p => getStockStatus(p.stockQuantity) === 'Low Stock').length;
                const inStock = products.filter(p => getStockStatus(p.stockQuantity) === 'In Stock').length;
                const expiring = products.filter(p => {
                    try {
                        const specs = JSON.parse(p.specifications || '{}');
                        if (!specs.expiryDate) return false;
                        const expiry = new Date(specs.expiryDate);
                        const today = new Date();
                        const diffTime = expiry - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffTime > 0 && diffDays <= 30;
                    } catch {
                        return false;
                    }
                }).length;
                
                return { total, lowStock, inStock, expiring };
            } catch (error) {
                console.error('Error getting stats:', error);
                return { total: 0, lowStock: 0, inStock: 0, expiring: 0 };
            }
        }
    }

    // ============================================
    // UI MANAGEMENT
    // ============================================

    let dataTableInstance = null;
    let allProducts = [];
    let allCategories = [];
    let allSubcategories = [];
    const productService = new ProductService();

    async function loadProducts() {
        try {
            allProducts = await productService.getAllProducts();
            renderProductsTable(allProducts);
            updateStats();
            populateCategoryFilters();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    function renderProductsTable(products) {
        const tableBody = document.getElementById('productTableBody');
        tableBody.innerHTML = '';

        if (products.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="11" class="text-center py-8 text-gray-500">
                    <i class="fas fa-box-open text-3xl mb-2 text-gray-300"></i>
                    <p class="text-sm">No products found</p>
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }

        products.forEach(product => {
            const stockStatus = getStockStatus(product.stockQuantity);
            const imageUrl = product.mainImageUrl ? 
                `http://localhost:8083${product.mainImageUrl}` : 
                'https://via.placeholder.com/40?text=No+Image';
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4 text-center">${product.id}</td>
                <td class="py-3 px-4 text-center">
                    <img src="${imageUrl}" alt="${product.title}" class="product-thumbnail mx-auto" 
                         onerror="this.src='https://via.placeholder.com/40?text=No+Image'">
                </td>
                <td class="py-3 px-4">${product.sku || 'N/A'}</td>
                <td class="py-3 px-4">${product.title}</td>
                <td class="py-3 px-4">${product.category || 'N/A'}</td>
                <td class="py-3 px-4">${product.subCategory || 'N/A'}</td>
                <td class="py-3 px-4">${product.brand || 'N/A'}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                        stockStatus === 'In Stock' ? 'bg-green-100 text-green-800' :
                        stockStatus === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">
                        ${stockStatus} (${product.stockQuantity || 0})
                    </span>
                </td>
                <td class="py-3 px-4">
                    <div class="font-semibold">₹${product.price ? Number(product.price).toFixed(2) : '0.00'}</div>
                    ${product.originalPrice ? `<div class="text-xs text-gray-500 line-through">₹${Number(product.originalPrice).toFixed(2)}</div>` : ''}
                </td>
                <td class="py-3 px-4">
                    <div class="flex items-center">
                        <span class="rating-stars mr-1">${getStarRating(product.rating || 0)}</span>
                        <span class="text-xs">${(product.rating || 0).toFixed(1)}</span>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <div class="flex justify-center space-x-2">
                        <button onclick="showProductDetails(${product.id})" 
                                class="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" 
                                title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="openEditModal(${product.id})" 
                                class="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-50" 
                                title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProduct(${product.id})" 
                                class="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" 
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    async function updateStats() {
        const stats = await productService.getStats();
        document.getElementById('totalProducts').textContent = stats.total;
        document.getElementById('lowStockItems').textContent = stats.lowStock;
        document.getElementById('inStockProducts').textContent = stats.inStock;
        document.getElementById('expiringSoon').textContent = stats.expiring;
    }

    function populateCategoryFilters() {
        const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
        const subcategories = [...new Set(allProducts.map(p => p.subCategory).filter(Boolean))];
        
        const categoryFilter = document.getElementById('categoryFilter');
        const subcategoryFilter = document.getElementById('subcategoryFilter');
        const editCategory = document.getElementById('edit-category');
        
        // Clear existing options except first
        while (categoryFilter.options.length > 1) categoryFilter.remove(1);
        while (subcategoryFilter.options.length > 1) subcategoryFilter.remove(1);
        while (editCategory.options.length > 1) editCategory.remove(1);
        
        // Populate category filters
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option.cloneNode(true));
            editCategory.appendChild(option);
        });
        
        // Populate subcategory filter
        subcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory;
            option.textContent = subcategory;
            subcategoryFilter.appendChild(option);
        });
        
        // Enable subcategory filter if categories exist
        if (categories.length > 0) {
            subcategoryFilter.disabled = false;
        }
        
        // Store for later use
        allCategories = categories;
        allSubcategories = subcategories;
    }

    // ============================================
    // STICKY ACTION BUTTON FUNCTIONS
    // ============================================

    function setupStickyActionButton() {
        const actionBtn = document.getElementById('stickyActionBtn');
        const actionMenu = document.getElementById('stickyActionMenu');
        
        // Toggle action menu
        actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            actionMenu.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!actionMenu.contains(e.target) && !actionBtn.contains(e.target)) {
                actionMenu.classList.remove('show');
            }
        });
        
        // Quick actions
        document.getElementById('quickAddProduct').addEventListener('click', (e) => {
            e.preventDefault();
            actionMenu.classList.remove('show');
            openEditModal();
        });
        
        document.getElementById('quickExport').addEventListener('click', (e) => {
            e.preventDefault();
            actionMenu.classList.remove('show');
            exportToExcel();
        });
        
        document.getElementById('quickImport').addEventListener('click', (e) => {
            e.preventDefault();
            actionMenu.classList.remove('show');
            showSuccessPopup('Import functionality coming soon!', 'info');
        });
        
        document.getElementById('quickRefresh').addEventListener('click', (e) => {
            e.preventDefault();
            actionMenu.classList.remove('show');
            loadProducts();
            showSuccessPopup('Data refreshed successfully!');
        });
        
        document.getElementById('quickAddCategory').addEventListener('click', (e) => {
            e.preventDefault();
            actionMenu.classList.remove('show');
            showSuccessPopup('Category management feature coming soon!', 'info');
        });
    }

    // ============================================
    // SIDEBAR FUNCTIONS (FIXED)
    // ============================================

    // ---------------------------------------------------------------------
// SIDEBAR TOGGLE
// ---------------------------------------------------------------------


function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarArrow = document.getElementById('sidebar-arrow');
    const logoDiv = document.querySelector('div > div'); // Logo container
    const navTexts = document.querySelectorAll('.nav-text');
    const navIcons = document.querySelectorAll('.nav-icon');
    
    if (window.innerWidth < 768) {
        // Mobile: Just toggle visibility with smooth transition
        sidebar.classList.toggle('-translate-x-full');
        sidebar.classList.toggle('translate-x-0');
    } else {
        // Desktop: Toggle between collapsed and expanded
        sidebar.classList.toggle('collapsed');
        
        if (sidebar.classList.contains('collapsed')) {
            // Collapsed state
            sidebar.style.width = '64px'; // Smaller width when collapsed
            sidebarArrow.classList.remove('fa-chevron-left');
            sidebarArrow.classList.add('fa-chevron-right');
            
            // Hide logo smoothly
            logoDiv.style.opacity = '0';
            logoDiv.style.width = '0';
            
            // Hide nav texts with delay
            navTexts.forEach((text, index) => {
                text.style.opacity = '0';
                text.style.width = '0';
                text.style.overflow = 'hidden';
                text.style.transitionDelay = `${index * 20}ms`;
            });
            
            // Center icons
            navIcons.forEach(icon => {
                icon.style.marginLeft = '0';
                icon.style.marginRight = '0';
            });
            
        } else {
            // Expanded state
            sidebar.style.width = '256px'; // Original width
            sidebarArrow.classList.remove('fa-chevron-right');
            sidebarArrow.classList.add('fa-chevron-left');
            
            // Show logo smoothly
            logoDiv.style.opacity = '1';
            logoDiv.style.width = 'auto';
            
            // Show nav texts with staggered animation
            navTexts.forEach((text, index) => {
                text.style.opacity = '1';
                text.style.width = 'auto';
                text.style.overflow = 'visible';
                text.style.transitionDelay = `${index * 20}ms`;
            });
            
            // Restore icon margins
            navIcons.forEach(icon => {
                icon.style.marginLeft = '0';
                icon.style.marginRight = '0.75rem'; // mr-3
            });
        }
    }
}


// Add event listeners
document.getElementById('toggle-sidebar-logo').addEventListener('click', toggleSidebar);
document.getElementById('close-sidebar').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
});

// Optional: Close sidebar when clicking outside on mobile
document.addEventListener('click', (event) => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar-logo');
    
    if (window.innerWidth < 768 && 
        !sidebar.contains(event.target) && 
        !toggleBtn.contains(event.target) &&
        sidebar.classList.contains('translate-x-0')) {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
    }
});
    function initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarArrow = document.getElementById('sidebar-arrow');
        
        // Set initial state based on screen width
        if (window.innerWidth >= 768) {
            // Desktop: Start expanded
            sidebar.classList.remove('collapsed');
            sidebarArrow.classList.remove('fa-chevron-right');
            sidebarArrow.classList.add('fa-chevron-left');
        } else {
            // Mobile: Start hidden
            sidebar.classList.remove('translate-x-0');
        }
    }




    function initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');
        const mobileToggle = document.getElementById('toggle-sidebar-mobile');
        // const desktopToggle = document.getElementById('toggle-sidebar-desktop');
        const closeSidebar = document.getElementById('close-sidebar');
        
        // Mobile toggle
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            backdrop.classList.add('active');
        });
        
        // Desktop toggle
        // desktopToggle.addEventListener('click', () => {
        //     sidebar.classList.toggle('open');
        // });
        
        // Close sidebar buttons
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('open');
            backdrop.classList.remove('active');
        });
        
        // Close sidebar when clicking backdrop
        backdrop.addEventListener('click', () => {
            sidebar.classList.remove('open');
            backdrop.classList.remove('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768) {
                if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                    backdrop.classList.remove('active');
                }
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                sidebar.classList.remove('open');
                backdrop.classList.remove('active');
            }
        });
    }

    // ============================================
    // MODAL FUNCTIONS
    // ============================================

    async function showProductDetails(productId) {
        try {
            const product = await productService.getProductById(productId);
            
            // Populate modal fields
            document.getElementById('detail-id').textContent = product.id;
            document.getElementById('detail-sku').textContent = product.sku || 'N/A';
            document.getElementById('detail-name').textContent = product.title;
            document.getElementById('detail-category').textContent = product.category || 'N/A';
            document.getElementById('detail-type').textContent = product.subCategory || 'N/A';
            document.getElementById('detail-brand').textContent = product.brand || 'N/A';
            document.getElementById('detail-quantity').textContent = product.stockQuantity || 0;
            document.getElementById('detail-price').textContent = `₹${(product.price || 0).toFixed(2)}`;
            document.getElementById('detail-original-price').textContent = product.originalPrice ? `₹${Number(product.originalPrice).toFixed(2)}` : 'N/A';
            document.getElementById('detail-discount').textContent = product.discount ? `${product.discount}%` : 'N/A';
            document.getElementById('detail-rating').innerHTML = `${getStarRating(product.rating || 0)} ${(product.rating || 0).toFixed(1)}`;
            document.getElementById('detail-review-count').textContent = product.reviewCount || 0;
            
            const stockStatus = getStockStatus(product.stockQuantity);
            const statusElement = document.getElementById('detail-stock-status');
            statusElement.textContent = stockStatus;
            statusElement.className = `status-badge ${
                stockStatus === 'In Stock' ? 'status-in-stock' :
                stockStatus === 'Low Stock' ? 'status-low-stock' : 'status-out-of-stock'
            }`;
            
            document.getElementById('detail-description').textContent = product.description?.join(', ') || 'N/A';
            
            const featuresList = document.getElementById('detail-features');
            featuresList.innerHTML = '';
            if (product.features && product.features.length > 0) {
                product.features.forEach(feature => {
                    const li = document.createElement('li');
                    li.textContent = `• ${feature}`;
                    featuresList.appendChild(li);
                });
            } else {
                featuresList.textContent = 'N/A';
            }
            
            const sizesContainer = document.getElementById('detail-sizes');
            sizesContainer.innerHTML = '';
            if (product.sizes && product.sizes.length > 0) {
                product.sizes.forEach(size => {
                    const span = document.createElement('span');
                    span.className = 'inline-block bg-gray-200 rounded px-2 py-1 text-xs mr-1 mb-1';
                    span.textContent = size;
                    sizesContainer.appendChild(span);
                });
            } else {
                sizesContainer.textContent = 'N/A';
            }
            
            try {
                const specs = JSON.parse(product.specifications || '{}');
                document.getElementById('detail-specifications').textContent = JSON.stringify(specs, null, 2);
            } catch {
                document.getElementById('detail-specifications').textContent = product.specifications || 'N/A';
            }
            
            document.getElementById('detail-created').textContent = formatDate(product.createdAt);
            
            const mainImageContainer = document.getElementById('detail-main-image');
            mainImageContainer.innerHTML = '';
            if (product.mainImageUrl) {
                const img = document.createElement('img');
                img.src = `http://localhost:8083${product.mainImageUrl}`;
                img.alt = 'Main Product Image';
                img.className = 'w-32 h-32 object-cover rounded-lg shadow-sm';
                img.onerror = function() {
                    this.src = 'https://via.placeholder.com/150?text=No+Image';
                };
                mainImageContainer.appendChild(img);
            } else {
                mainImageContainer.textContent = 'No image available';
            }
            
            // Set edit button
            document.getElementById('editProductBtn').onclick = () => openEditModal(productId);
            
            // Show modal
            document.getElementById('productDetailModal').style.display = 'flex';
        } catch (error) {
            console.error('Error showing product details:', error);
            showSuccessPopup('Error loading product details', 'error');
        }
    }

    let currentEditingProductId = null;

    async function openEditModal(productId = null) {
        const modal = document.getElementById('editProductModal');
        const title = document.getElementById('editModalTitle');
        
        if (productId) {
            // Edit mode
            currentEditingProductId = productId;
            title.textContent = 'Edit Product';
            
            try {
                const product = await productService.getProductById(productId);
                
                // Fill form
                document.getElementById('edit-sku').value = product.sku || '';
                document.getElementById('edit-title').value = product.title || '';
                document.getElementById('edit-category').value = product.category || '';
                document.getElementById('edit-subcategory').value = product.subCategory || '';
                document.getElementById('edit-brand').value = product.brand || '';
                document.getElementById('edit-instock').value = product.inStock ? 'true' : 'false';
                document.getElementById('edit-price').value = product.price || 0;
                document.getElementById('edit-original-price').value = product.originalPrice || '';
                document.getElementById('edit-discount').value = product.discount || '';
                document.getElementById('edit-rating').value = product.rating || 0;
                document.getElementById('edit-review-count').value = product.reviewCount || 0;
                document.getElementById('edit-stock-quantity').value = product.stockQuantity || 0;
                document.getElementById('edit-description').value = product.description?.join('\n') || '';
                document.getElementById('edit-features').value = product.features?.join('\n') || '';
                document.getElementById('edit-sizes').value = product.sizes?.join(', ') || '';
                document.getElementById('edit-specifications').value = product.specifications || '{"": ""}';
                
            } catch (error) {
                console.error('Error loading product for edit:', error);
                showSuccessPopup('Error loading product data', 'error');
                return;
            }
        } else {
            // Add mode
            currentEditingProductId = null;
            title.textContent = 'Add New Product';
            document.getElementById('editProductForm').reset();
            document.getElementById('edit-specifications').value = '{"": ""}';
        }
        
        modal.style.display = 'flex';
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            // Collect form data
            const formData = {
                sku: document.getElementById('edit-sku').value.trim(),
                title: document.getElementById('edit-title').value.trim(),
                category: document.getElementById('edit-category').value,
                subCategory: document.getElementById('edit-subcategory').value.trim(),
                brand: document.getElementById('edit-brand').value.trim(),
                inStock: document.getElementById('edit-instock').value,
                price: parseFloat(document.getElementById('edit-price').value),
                originalPrice: document.getElementById('edit-original-price').value ? parseFloat(document.getElementById('edit-original-price').value) : null,
                discount: document.getElementById('edit-discount').value ? parseInt(document.getElementById('edit-discount').value) : null,
                rating: document.getElementById('edit-rating').value ? parseFloat(document.getElementById('edit-rating').value) : 0,
                reviewCount: document.getElementById('edit-review-count').value ? parseInt(document.getElementById('edit-review-count').value) : 0,
                stockQuantity: parseInt(document.getElementById('edit-stock-quantity').value),
                description: document.getElementById('edit-description').value,
                features: document.getElementById('edit-features').value,
                sizes: document.getElementById('edit-sizes').value,
                specifications: document.getElementById('edit-specifications').value
            };

            // Validation
            if (!formData.sku || !formData.title || !formData.category || !formData.brand) {
                showSuccessPopup('SKU, Title, Category, and Brand are required', 'error');
                return;
            }

            if (isNaN(formData.price) || formData.price < 0) {
                showSuccessPopup('Price must be a valid number', 'error');
                return;
            }

            if (isNaN(formData.stockQuantity) || formData.stockQuantity < 0) {
                showSuccessPopup('Stock quantity must be a valid number', 'error');
                return;
            }

            // Get image files
            const mainImageInput = document.getElementById('edit-main-image');
            const mainImage = mainImageInput.files[0];
            
            const subImagesInput = document.getElementById('edit-sub-images');
            const subImages = subImagesInput.files ? Array.from(subImagesInput.files) : [];

            // For new product, require main image
            if (!currentEditingProductId && !mainImage) {
                showSuccessPopup('Main image is required for new products', 'error');
                return;
            }

            // Add images to form data
            if (mainImage) formData.mainImage = mainImage;
            if (subImages.length > 0) formData.subImages = subImages;

            // Call API
            if (currentEditingProductId) {
                await productService.updateProduct(currentEditingProductId, formData);
                showSuccessPopup('Product updated successfully!');
            } else {
                await productService.createProduct(formData);
                showSuccessPopup('Product created successfully!');
            }

            // Close modal and reload
            document.getElementById('editProductModal').style.display = 'none';
            document.getElementById('editProductForm').reset();
            await loadProducts();
            
        } catch (error) {
            console.error('Error saving product:', error);
            showSuccessPopup(error.message || 'Error saving product', 'error');
        }
    }

    async function deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            await productService.deleteProduct(productId);
            showSuccessPopup('Product deleted successfully!');
            await loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            showSuccessPopup('Error deleting product', 'error');
        }
    }

    // ============================================
    // FILTER FUNCTIONS
    // ============================================

    function applyFilters() {
        const category = document.getElementById('categoryFilter').value;
        const subcategory = document.getElementById('subcategoryFilter').value;
        const stock = document.getElementById('stockFilter').value;
        const search = document.getElementById('searchInput').value.trim().toLowerCase();
        
        let filtered = allProducts;
        
        // Search filter
        if (search) {
            filtered = filtered.filter(p => 
                (p.sku && p.sku.toLowerCase().includes(search)) ||
                (p.title && p.title.toLowerCase().includes(search)) ||
                (p.brand && p.brand.toLowerCase().includes(search)) ||
                (p.category && p.category.toLowerCase().includes(search))
            );
        }
        
        // Category filter
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }
        
        // Subcategory filter
        if (subcategory) {
            filtered = filtered.filter(p => p.subCategory === subcategory);
        }
        
        // Stock filter
        if (stock) {
            filtered = filtered.filter(p => {
                const status = getStockStatus(p.stockQuantity);
                if (stock === 'in-stock') return status === 'In Stock';
                if (stock === 'low-stock') return status === 'Low Stock';
                if (stock === 'out-of-stock') return status === 'Out of Stock';
                return true;
            });
        }
        
        renderProductsTable(filtered);
    }

    // ============================================
    // EXPORT FUNCTION
    // ============================================

    async function exportToExcel() {
        try {
            showSuccessPopup('Preparing export...', 'info');
            
            // Fetch all products
            const products = await productService.getAllProducts();
            
            if (!products || products.length === 0) {
                showSuccessPopup('No data to export', 'error');
                return;
            }
            
            // Prepare data for export
            const exportData = [
                ['ID', 'SKU', 'Title', 'Category', 'Subcategory', 'Brand', 'Price', 'Original Price', 'Discount', 'Rating', 'Reviews', 'Stock', 'Status', 'Created']
            ];
            
            products.forEach(product => {
                exportData.push([
                    product.id,
                    product.sku || '',
                    product.title,
                    product.category || '',
                    product.subCategory || '',
                    product.brand || '',
                    product.price || 0,
                    product.originalPrice || '',
                    product.discount || '',
                    product.rating || 0,
                    product.reviewCount || 0,
                    product.stockQuantity || 0,
                    getStockStatus(product.stockQuantity),
                    formatDate(product.createdAt)
                ]);
            });
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(exportData);
            XLSX.utils.book_append_sheet(wb, ws, 'MB Products');
            
            // Generate and download
            const filename = `mother_baby_products_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            showSuccessPopup(`Exported ${products.length} products successfully!`);
            
        } catch (error) {
            console.error('Export error:', error);
            showSuccessPopup('Error exporting data: ' + error.message, 'error');
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    function setupEventListeners() {
        // Initialize sidebar
        initializeSidebar();
        
        // Modal close buttons
        document.getElementById('closeDetailModal').addEventListener('click', () => {
            document.getElementById('productDetailModal').style.display = 'none';
        });
        
        document.getElementById('closeEditModal').addEventListener('click', () => {
            document.getElementById('editProductModal').style.display = 'none';
        });
        
        document.getElementById('cancelEdit').addEventListener('click', () => {
            document.getElementById('editProductModal').style.display = 'none';
        });
        
        document.getElementById('closeSuccessPopup').addEventListener('click', () => {
            document.getElementById('successPopup').style.display = 'none';
        });

        // Add product button
        document.getElementById('addProductBtn').addEventListener('click', () => openEditModal());

        // Form submission
        document.getElementById('editProductForm').addEventListener('submit', handleFormSubmit);

        // Export button
        document.getElementById('exportBtn').addEventListener('click', exportToExcel);

        // Filters
        document.getElementById('categoryFilter').addEventListener('change', function() {
            applyFilters();
        });
        
        document.getElementById('subcategoryFilter').addEventListener('change', applyFilters);
        document.getElementById('stockFilter').addEventListener('change', applyFilters);
        
        // Search with debounce
        let searchTimeout;
        document.getElementById('searchInput').addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 500);
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const modals = ['productDetailModal', 'editProductModal', 'successPopup'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Logout Modal
        const logoutBtn = document.getElementById('logoutBtn');
        const logoutModal = document.getElementById('logoutModal');
        const confirmLogout = document.getElementById('confirmLogout');
        const cancelLogout = document.getElementById('cancelLogout');
        const closeLogoutModal = document.getElementById('closeLogoutModal');

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutModal.classList.remove('hidden');
        });

        function closeLogout() {
            logoutModal.classList.add('hidden');
        }

        cancelLogout.addEventListener('click', closeLogout);
        closeLogoutModal.addEventListener('click', closeLogout);
        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) closeLogout();
        });

        confirmLogout.addEventListener('click', () => {
            window.location.href = '../Login/login.html';
        });

        // Setup sticky action button
        setupStickyActionButton();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    document.addEventListener('DOMContentLoaded', async function() {
        try {
            // Setup event listeners
            setupEventListeners();
            
            // Load initial data
            await loadProducts();
            
        } catch (error) {
            console.error('Error initializing application:', error);
            showSuccessPopup('Error initializing application. Please refresh the page.', 'error');
        }
    });

    // Make functions available globally
    window.showProductDetails = showProductDetails;
    window.openEditModal = openEditModal;
    window.deleteProduct = deleteProduct;
    window.exportToExcel = exportToExcel;


























//=============================================================================================//
// // User profile
// const user = {
//   name: "",
//   role: "Admin",
// };

// // API Base URL
// const API_BASE_URL = "http://localhost:8083/api/mb/products";

// // Categories with subcategories - Only Mother Care & Baby Care
// let categories = [
//   {
//     name: "Mother Care & Maternity",
//     subcategories: [
//       "Maternity Wear (Dresses, Nursing Wear, Innerwear)",
//       "Pregnancy Nutrition (Prenatal Vitamins, Supplements)",
//       "Skincare for Moms (Stretch Mark Cream, Sunscreen, Moisturizers)",
//       "Trimester Kits (1st, 2nd, 3rd Trimester Essentials)",
//       "Postpartum Recovery (Belly Belts, Nursing Pads, Sitz Baths)",
//       "Breastfeeding Essentials (Pumps, Bottles, Nipple Creams)",
//     ],
//   },
//   {
//     name: "Baby Care",
//     subcategories: [
//       "Diapers & Wipes",
//       "Baby Skin & Hair Care",
//       "Feeding & Nursing",
//       "Baby Health & Safety",
//       "Toys & Learning",
//       "Baby Clothing & Accessories",
//     ],
//   },
// ];

// // Product data array - will be populated from backend
// let products = [];

// // DOM elements
// const productTableBody = document.getElementById("productTableBody");
// const totalProducts = document.getElementById("totalProducts");
// const lowStockItems = document.getElementById("lowStockItems");
// const inStockProducts = document.getElementById("inStockProducts");
// const expiringSoon = document.getElementById("expiringSoon");
// const productDetailModal = document.getElementById("productDetailModal");
// const editProductModal = document.getElementById("editProductModal");
// const addCategoryModal = document.getElementById("addCategoryModal");
// const successPopup = document.getElementById("successPopup");
// const successMessage = document.getElementById("successMessage");
// const editModalTitle = document.getElementById("editModalTitle");
// const editProductForm = document.getElementById("editProductForm");
// let currentProductId = null;
// let dataTableInstance = null;
// const today = new Date();

// // Toast notification function
// function showToast(message, type = "success") {
//   // Remove existing toasts
//   const existingToasts = document.querySelectorAll(".custom-toast");
//   existingToasts.forEach((toast) => toast.remove());

//   const toast = document.createElement("div");
//   toast.className = `custom-toast fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${
//     type === "success"
//       ? "bg-green-500"
//       : type === "error"
//       ? "bg-red-500"
//       : "bg-blue-500"
//   }`;
//   toast.innerHTML = `
//             <div class="flex items-center">
//                 <i class="fas ${
//                   type === "success"
//                     ? "fa-check-circle"
//                     : type === "error"
//                     ? "fa-exclamation-circle"
//                     : "fa-info-circle"
//                 } mr-2"></i>
//                 <span>${message}</span>
//             </div>
//         `;
//   document.body.appendChild(toast);

//   // Auto remove after 3 seconds
//   setTimeout(() => {
//     toast.remove();
//   }, 3000);
// }

// // API Service functions
// const apiService = {
//   // Get all products
//   async getAllProducts() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/get-all`);
//       if (!response.ok) throw new Error("Failed to fetch products");
//       return await response.json();
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       showToast("Failed to load products", "error");
//       return [];
//     }
//   },

//   // Get product by ID
//   async getProductById(id) {
//     try {
//       const response = await fetch(`${API_BASE_URL}/${id}`);
//       if (!response.ok) throw new Error("Failed to fetch product");
//       return await response.json();
//     } catch (error) {
//       console.error("Error fetching product:", error);
//       showToast("Failed to load product details", "error");
//       return null;
//     }
//   },

//   // Create new product
//   async createProduct(productData) {
//     try {
//       const formData = new FormData();

//       // Append product data
//       formData.append(
//         "dto",
//         new Blob(
//           [
//             JSON.stringify({
//               title: productData.name,
//               category: productData.category,
//               price: productData.price,
//               originalPrice: productData.mrp,
//               discount: Math.round(
//                 ((productData.mrp - productData.price) / productData.mrp) * 100
//               ),
//               rating: 4.5, // Default rating
//               reviewCount: 0, // Default review count
//               brand: productData.brand,
//               inStock: productData.quantity > 0,
//               stockQuantity: productData.quantity,
//               description: [productData.description],
//               sizes: [productData.unit],
//               features: [productData.storage],
//               specifications: JSON.stringify({
//                 batchNumber: productData.batch,
//                 expiryDate: productData.expiry,
//                 prescriptionRequired: productData.prescription === "Yes",
//               }),
//             }),
//           ],
//           { type: "application/json" }
//         )
//       );

//       // Append main image
//       if (productData.mainImage) {
//         formData.append("mainImage", productData.mainImage);
//       }

//       // Append sub images
//       if (productData.subImages) {
//         productData.subImages.forEach((image, index) => {
//           formData.append("subImages", image);
//         });
//       }

//       const response = await fetch(`${API_BASE_URL}/create-product`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) throw new Error("Failed to create product");
//       return await response.json();
//     } catch (error) {
//       console.error("Error creating product:", error);
//       throw error;
//     }
//   },

//   // Update product
//   async updateProduct(id, productData) {
//     try {
//       const formData = new FormData();

//       // Append product data
//       formData.append(
//         "dto",
//         new Blob(
//           [
//             JSON.stringify({
//               title: productData.name,
//               category: productData.category,
//               price: productData.price,
//               originalPrice: productData.mrp,
//               discount: Math.round(
//                 ((productData.mrp - productData.price) / productData.mrp) * 100
//               ),
//               rating: 4.5, // Default rating
//               reviewCount: 0, // Default review count
//               brand: productData.brand,
//               inStock: productData.quantity > 0,
//               stockQuantity: productData.quantity,
//               description: [productData.description],
//               sizes: [productData.unit],
//               features: [productData.storage],
//               specifications: JSON.stringify({
//                 batchNumber: productData.batch,
//                 expiryDate: productData.expiry,
//                 prescriptionRequired: productData.prescription === "Yes",
//               }),
//             }),
//           ],
//           { type: "application/json" }
//         )
//       );

//       // Append main image if provided
//       if (productData.mainImage) {
//         formData.append("mainImage", productData.mainImage);
//       }

//       // Append sub images if provided
//       if (productData.subImages) {
//         productData.subImages.forEach((image, index) => {
//           formData.append("subImages", image);
//         });
//       }

//       const response = await fetch(`${API_BASE_URL}/${id}`, {
//         method: "PATCH",
//         body: formData,
//       });

//       if (!response.ok) throw new Error("Failed to update product");
//       return await response.json();
//     } catch (error) {
//       console.error("Error updating product:", error);
//       throw error;
//     }
//   },

//   // Delete product
//   async deleteProduct(id) {
//     try {
//       const response = await fetch(`${API_BASE_URL}/${id}`, {
//         method: "DELETE",
//       });
//       if (!response.ok) throw new Error("Failed to delete product");
//       return true;
//     } catch (error) {
//       console.error("Error deleting product:", error);
//       throw error;
//     }
//   },
// };

// // Initialize the page
// document.addEventListener("DOMContentLoaded", async function () {
//   displayUserProfile();
//   populateCategorySelects();
//   populateSubcategoryFilter();
//   await loadProductsFromBackend();
//   setupEventListeners();
//   updateStats();
//   initializeDataTable();
// });

// // Display user profile
// function displayUserProfile() {
//   const userInitials = document.getElementById("user-initials");
//   const userName = document.getElementById("user-name");
//   const userRole = document.getElementById("user-role");

//   const nameParts = user.name.trim().split(" ");
//   const initials =
//     nameParts.length > 1
//       ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
//       : nameParts[0][0];
//   userInitials.textContent = initials.toUpperCase();
//   userName.textContent = user.name;
//   userRole.textContent = user.role;
// }

// // Determine stock status based on quantity
// function getStockStatus(quantity) {
//   if (quantity === 0) return "Out of Stock";
//   if (quantity < 10) return "Low Stock";
//   return "In Stock";
// }

// // Populate category selects
// function populateCategorySelects() {
//   const categoryFilter = document.getElementById("categoryFilter");
//   const editCategory = document.getElementById("edit-category");

//   categoryFilter.innerHTML = '<option value="">All Categories</option>';
//   editCategory.innerHTML = '<option value="">Select Category</option>';

//   categories.forEach((cat) => {
//     const filterOption = document.createElement("option");
//     filterOption.value = cat.name;
//     filterOption.textContent = cat.name;
//     categoryFilter.appendChild(filterOption);

//     const editOption = document.createElement("option");
//     editOption.value = cat.name;
//     editOption.textContent = cat.name;
//     editCategory.appendChild(editOption);
//   });
// }

// // Populate subcategory filter based on selected category
// function populateSubcategoryFilter() {
//   const subcategoryFilter = document.getElementById("subcategoryFilter");
//   const selectedCategory = document.getElementById("categoryFilter").value;
//   subcategoryFilter.innerHTML = '<option value="">All Subcategories</option>';

//   if (selectedCategory) {
//     const cat = categories.find((c) => c.name === selectedCategory);
//     if (cat) {
//       cat.subcategories.forEach((sub) => {
//         const option = document.createElement("option");
//         option.value = sub;
//         option.textContent = sub;
//         subcategoryFilter.appendChild(option);
//       });
//     }
//   } else {
//     // Show all subcategories when no category is selected
//     const allSubcategories = [
//       ...new Set(categories.flatMap((cat) => cat.subcategories)),
//     ];
//     allSubcategories.sort().forEach((sub) => {
//       const option = document.createElement("option");
//       option.value = sub;
//       option.textContent = sub;
//       subcategoryFilter.appendChild(option);
//     });
//   }
// }

// // Update type options based on selected category
// function updateTypeOptions() {
//   const selectedCat = document.getElementById("edit-category").value;
//   const typeSelect = document.getElementById("edit-type");
//   typeSelect.innerHTML = '<option value="">Select Subcategory</option>';

//   if (selectedCat) {
//     const cat = categories.find((c) => c.name === selectedCat);
//     if (cat) {
//       cat.subcategories.forEach((sub) => {
//         const option = document.createElement("option");
//         option.value = sub;
//         option.textContent = sub;
//         typeSelect.appendChild(option);
//       });
//     }
//   }
// }

// // Load products from backend
// async function loadProductsFromBackend() {
//   try {
//     showToast("Loading products...", "info");
//     products = await apiService.getAllProducts();
//     loadProducts(products);
//     showToast("Products loaded successfully");
//   } catch (error) {
//     showToast("Failed to load products", "error");
//   }
// }

// // Load products into the table
// function loadProducts(filteredProducts = products) {
//   productTableBody.innerHTML = "";

//   filteredProducts.forEach((product) => {
//     const row = document.createElement("tr");
//     const stockStatus = getStockStatus(product.stockQuantity);
//     const expiryDate = new Date(JSON.parse(product.specifications).expiryDate);
//     const diffTime = expiryDate - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     const isExpiringSoon = diffTime > 0 && diffDays <= 30;

//     row.innerHTML = `
//                 <td class="text-center">${product.id}</td>
//                 <td>${product.id}</td>
//                 <td>${product.title}</td>
//                 <td>${product.category}</td>
//                 <td>${product.brand}</td>
//                 <td class="${
//                   stockStatus === "Low Stock"
//                     ? "low-stock"
//                     : stockStatus === "Out of Stock"
//                     ? "status-out-of-stock"
//                     : ""
//                 }">${product.stockQuantity} ${
//       product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Unit"
//     }</td>
//                 <td>₹${product.price.toFixed(2)}</td>
//                 <td class="${
//                   isExpiringSoon ? "expiring-soon" : ""
//                 }">${formatDate(
//       JSON.parse(product.specifications).expiryDate
//     )}</td>
//                 <td>${
//                   JSON.parse(product.specifications).prescriptionRequired
//                     ? "Yes"
//                     : "No"
//                 }</td>
//                 <td class="text-center">
//                     <div class="action-buttons">
//                         <button class="view-btn text-blue-500 hover:text-blue-700" data-id="${
//                           product.id
//                         }"><i class="fas fa-eye"></i></button>
//                         <button class="edit-btn text-yellow-500 hover:text-yellow-700" data-id="${
//                           product.id
//                         }"><i class="fas fa-edit"></i></button>
//                         <button class="delete-btn text-red-500 hover:text-red-700" data-id="${
//                           product.id
//                         }"><i class="fas fa-trash"></i></button>
//                     </div>
//                 </td>
//             `;
//     productTableBody.appendChild(row);
//   });

//   // Reinitialize DataTable after updating the table
//   if (dataTableInstance) {
//     dataTableInstance.destroy();
//   }
//   initializeDataTable();
// }

// // Format date to DD-MM-YYYY
// function formatDate(dateString) {
//   if (!dateString) return "N/A";
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return "N/A";
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`;
// }

// // Update dashboard stats
// function updateStats() {
//   const total = products.length;
//   const lowStock = products.filter(
//     (p) => getStockStatus(p.stockQuantity) === "Low Stock"
//   ).length;
//   const inStock = products.filter(
//     (p) => getStockStatus(p.stockQuantity) === "In Stock"
//   ).length;
//   const expiring = products.filter((p) => {
//     const expiryDate = new Date(JSON.parse(p.specifications).expiryDate);
//     const diffTime = expiryDate - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffTime > 0 && diffDays <= 30;
//   }).length;

//   totalProducts.textContent = total;
//   lowStockItems.textContent = lowStock;
//   inStockProducts.textContent = inStock;
//   expiringSoon.textContent = expiring;
// }

// // Initialize DataTable
// function initializeDataTable() {
//   dataTableInstance = $("#productTable").DataTable({
//     pageLength: 5,
//     lengthMenu: [5, 10, 25, 50],
//     searching: false, // Disable DataTable's built-in search
//     ordering: true,
//     columnDefs: [
//       { targets: 0, orderDataType: "dom-text-numeric" },
//       { targets: 5, orderDataType: "dom-text-numeric" },
//       { targets: 6, orderDataType: "dom-text-numeric" },
//       { targets: 7, orderDataType: "dom-date-dd-mm-yyyy" },
//       { orderable: false, targets: 9 }, // Disable sorting for Actions column
//     ],
//     order: [[0, "asc"]], // Default sort by ID
//     language: {
//       emptyTable: "No products available",
//     },
//   });

//   // Custom sorting for date format (DD-MM-YYYY)
//   $.fn.dataTable.ext.type.order["dom-date-dd-mm-yyyy-pre"] = function (data) {
//     if (!data || data === "N/A") return 0;
//     const parts = data.split("-");
//     return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
//   };

//   // Custom sorting for numeric fields in text
//   $.fn.dataTable.ext.type.order["dom-text-numeric-pre"] = function (data) {
//     const num = parseFloat(data) || 0;
//     return num;
//   };
// }

// // Setup event listeners
// function setupEventListeners() {
//   // Sidebar toggle
//   const toggleSidebar = () => {
//     const sidebar = document.getElementById("sidebar");
//     const sidebarArrow = document.getElementById("sidebar-arrow");
//     sidebar.classList.toggle("-translate-x-full");
//     sidebarArrow.classList.toggle("rotate-180");
//   };

//   document
//     .getElementById("toggle-sidebar-mobile")
//     .addEventListener("click", toggleSidebar);
//   document
//     .getElementById("toggle-sidebar-logo")
//     .addEventListener("click", toggleSidebar);
//   document
//     .getElementById("close-sidebar")
//     .addEventListener("click", toggleSidebar);

//   // Modal close buttons
//   document.getElementById("closeDetailModal").addEventListener("click", () => {
//     productDetailModal.style.display = "none";
//   });
//   document.getElementById("closeEditModal").addEventListener("click", () => {
//     editProductModal.style.display = "none";
//     editProductForm.reset();
//   });
//   document.getElementById("cancelEdit").addEventListener("click", () => {
//     editProductModal.style.display = "none";
//     editProductForm.reset();
//   });
//   document
//     .getElementById("closeAddCategoryModal")
//     .addEventListener("click", () => {
//       addCategoryModal.style.display = "none";
//       resetAddCategoryForm();
//     });
//   document.getElementById("cancelAddCategory").addEventListener("click", () => {
//     addCategoryModal.style.display = "none";
//     resetAddCategoryForm();
//   });
//   document.getElementById("closeSuccessPopup").addEventListener("click", () => {
//     successPopup.style.display = "none";
//   });

//   // Add product button
//   document.getElementById("addProductBtn").addEventListener("click", () => {
//     editModalTitle.textContent = "Add New Product";
//     editProductForm.reset();
//     updateTypeOptions();
//     setImageFieldsRequired(true);
//     currentProductId = null;
//     editProductModal.style.display = "flex";
//   });

//   // Add category button
//   document.getElementById("addCategoryBtn").addEventListener("click", () => {
//     resetAddCategoryForm();
//     addCategoryModal.style.display = "flex";
//   });

//   // Add subcategory button
//   document
//     .getElementById("addSubcategoryBtn")
//     .addEventListener("click", () => addSubcategoryInput());

//   // Category change for type update
//   document
//     .getElementById("edit-category")
//     .addEventListener("change", updateTypeOptions);

//   // Export CSV button
//   document.getElementById("exportBtn").addEventListener("click", exportToCSV);

//   // Form submissions
//   editProductForm.addEventListener("submit", handleFormSubmit);
//   document
//     .getElementById("addCategoryForm")
//     .addEventListener("submit", handleAddCategorySubmit);

//   // Product table button clicks
//   productTableBody.addEventListener("click", async (e) => {
//     const target = e.target.closest("button");
//     if (!target) return;
//     const id = target.dataset.id;
//     const product = products.find((p) => p.id == id);

//     if (target.classList.contains("view-btn")) {
//       await showProductDetails(product);
//     } else if (target.classList.contains("edit-btn")) {
//       await openEditModal(product);
//     } else if (target.classList.contains("delete-btn")) {
//       await deleteProduct(id);
//     }
//   });

//   // Filters with debounce
//   const debounce = (func, delay) => {
//     let timeout;
//     return (...args) => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => func(...args), delay);
//     };
//   };

//   const applyFiltersDebounced = debounce(applyFilters, 300);
//   document.getElementById("categoryFilter").addEventListener("change", () => {
//     populateSubcategoryFilter();
//     applyFiltersDebounced();
//   });
//   document
//     .getElementById("subcategoryFilter")
//     .addEventListener("change", applyFiltersDebounced);
//   document
//     .getElementById("prescriptionFilter")
//     .addEventListener("change", applyFiltersDebounced);
//   document
//     .getElementById("stockFilter")
//     .addEventListener("change", applyFiltersDebounced);
//   document
//     .getElementById("searchInput")
//     .addEventListener("input", applyFiltersDebounced);
// }

// // Set image fields required attribute
// function setImageFieldsRequired(required) {
//   document.getElementById("edit-image1").required = required;
//   document.getElementById("edit-image2").required = required;
//   document.getElementById("edit-image3").required = required;
//   document.getElementById("edit-image4").required = required;
// }

// // Reset add category form
// function resetAddCategoryForm() {
//   document.getElementById("new-category-name").value = "";
//   const container = document.getElementById("subcategories-container");
//   container.innerHTML = "";
//   addSubcategoryInput();
// }

// // Add subcategory input field
// function addSubcategoryInput(value = "") {
//   const div = document.createElement("div");
//   div.classList.add("subcategory-input", "flex", "mb-2");

//   const input = document.createElement("input");
//   input.type = "text";
//   input.classList.add("flex-1", "mr-2");
//   input.placeholder = "Subcategory name";
//   input.value = value;
//   input.required = true;

//   const removeBtn = document.createElement("button");
//   removeBtn.type = "button";
//   removeBtn.classList.add(
//     "remove-sub-btn",
//     "bg-red-500",
//     "text-white",
//     "py-1",
//     "px-2",
//     "rounded"
//   );
//   removeBtn.textContent = "-";
//   removeBtn.addEventListener("click", () => {
//     if (
//       document.querySelectorAll("#subcategories-container .subcategory-input")
//         .length > 1
//     ) {
//       div.remove();
//     } else {
//       showToast("At least one subcategory is required.", "error");
//     }
//   });

//   div.appendChild(input);
//   div.appendChild(removeBtn);
//   document.getElementById("subcategories-container").appendChild(div);
// }

// // Handle add category submit
// function handleAddCategorySubmit(e) {
//   e.preventDefault();
//   const name = document.getElementById("new-category-name").value.trim();
//   if (!name) {
//     showToast("Category name is required.", "error");
//     return;
//   }

//   if (categories.some((cat) => cat.name.toLowerCase() === name.toLowerCase())) {
//     showToast("Category already exists.", "error");
//     return;
//   }

//   const subs = Array.from(
//     document.querySelectorAll("#subcategories-container input")
//   )
//     .map((input) => input.value.trim())
//     .filter((v) => v);

//   if (subs.length === 0) {
//     showToast("At least one subcategory is required.", "error");
//     return;
//   }

//   categories.push({ name, subcategories: subs });
//   populateCategorySelects();
//   populateSubcategoryFilter();
//   addCategoryModal.style.display = "none";
//   resetAddCategoryForm();
//   showToast("Category added successfully!");
// }

// // Show product details in modal
// async function showProductDetails(product) {
//   if (!product) return;

//   // Fetch fresh product data to ensure we have the latest
//   const freshProduct = await apiService.getProductById(product.id);
//   if (!freshProduct) return;

//   const specs = JSON.parse(freshProduct.specifications);

//   document.getElementById("detail-id").textContent = freshProduct.id;
//   document.getElementById("detail-sku").textContent = freshProduct.id;
//   document.getElementById("detail-name").textContent = freshProduct.title;
//   document.getElementById("detail-category").textContent =
//     freshProduct.category;
//   document.getElementById("detail-type").textContent =
//     freshProduct.sizes && freshProduct.sizes.length > 0
//       ? freshProduct.sizes[0]
//       : "N/A";
//   document.getElementById("detail-brand").textContent = freshProduct.brand;
//   document.getElementById("detail-prescription").textContent =
//     specs.prescriptionRequired ? "Yes" : "No";
//   document.getElementById("detail-quantity").textContent = `${
//     freshProduct.stockQuantity
//   } ${
//     freshProduct.sizes && freshProduct.sizes.length > 0
//       ? freshProduct.sizes[0]
//       : "Unit"
//   }`;
//   document.getElementById("detail-unit").textContent =
//     freshProduct.sizes && freshProduct.sizes.length > 0
//       ? freshProduct.sizes[0]
//       : "N/A";
//   document.getElementById(
//     "detail-mrp"
//   ).textContent = `₹${freshProduct.originalPrice.toFixed(2)}`;
//   document.getElementById(
//     "detail-price"
//   ).textContent = `₹${freshProduct.price.toFixed(2)}`;
//   document.getElementById("detail-batch").textContent =
//     specs.batchNumber || "N/A";
//   document.getElementById("detail-expiry").textContent = formatDate(
//     specs.expiryDate
//   );
//   document.getElementById("detail-description").textContent =
//     freshProduct.description && freshProduct.description.length > 0
//       ? freshProduct.description[0]
//       : "N/A";
//   document.getElementById("detail-storage").textContent =
//     freshProduct.features && freshProduct.features.length > 0
//       ? freshProduct.features[0]
//       : "N/A";

//   const stockStatus = getStockStatus(freshProduct.stockQuantity);
//   const stockStatusElement = document.getElementById("detail-stock-status");
//   stockStatusElement.textContent = stockStatus;
//   stockStatusElement.className =
//     "info-value status-badge " +
//     (stockStatus === "In Stock"
//       ? "status-in-stock"
//       : stockStatus === "Low Stock"
//       ? "status-low-stock"
//       : "status-out-of-stock");

//   // Display images - Note: Backend returns images as byte arrays, would need additional endpoint to display
//   const detailImages = document.getElementById("detail-images");
//   detailImages.innerHTML = "";
//   detailImages.textContent = "Images stored in database (byte arrays)";

//   document.getElementById("editProductBtn").onclick = () =>
//     openEditModal(freshProduct);
//   productDetailModal.style.display = "flex";
// }

// // Open edit modal with product data
// async function openEditModal(product) {
//   // Fetch fresh product data
//   const freshProduct = await apiService.getProductById(product.id);
//   if (!freshProduct) return;

//   const specs = JSON.parse(freshProduct.specifications);

//   editModalTitle.textContent = "Edit Product";
//   currentProductId = freshProduct.id;
//   document.getElementById("edit-sku").value = freshProduct.id;
//   document.getElementById("edit-name").value = freshProduct.title;
//   document.getElementById("edit-category").value = freshProduct.category;
//   updateTypeOptions();
//   document.getElementById("edit-type").value =
//     freshProduct.sizes && freshProduct.sizes.length > 0
//       ? freshProduct.sizes[0]
//       : "";
//   document.getElementById("edit-brand").value = freshProduct.brand;
//   document.getElementById("edit-prescription").value =
//     specs.prescriptionRequired ? "Yes" : "No";
//   document.getElementById("edit-quantity").value = freshProduct.stockQuantity;
//   document.getElementById("edit-unit").value =
//     freshProduct.sizes && freshProduct.sizes.length > 0
//       ? freshProduct.sizes[0]
//       : "";
//   document.getElementById("edit-mrp").value = freshProduct.originalPrice;
//   document.getElementById("edit-price").value = freshProduct.price;
//   document.getElementById("edit-batch").value = specs.batchNumber || "";
//   document.getElementById("edit-expiry").value = specs.expiryDate
//     ? new Date(specs.expiryDate).toISOString().split("T")[0]
//     : "";
//   document.getElementById("edit-description").value =
//     freshProduct.description && freshProduct.description.length > 0
//       ? freshProduct.description[0]
//       : "";
//   document.getElementById("edit-storage").value =
//     freshProduct.features && freshProduct.features.length > 0
//       ? freshProduct.features[0]
//       : "";
//   setImageFieldsRequired(false); // Images optional for editing
//   editProductModal.style.display = "flex";
// }

// // Handle form submission
// async function handleFormSubmit(e) {
//   e.preventDefault();

//   const sku = document.getElementById("edit-sku").value.trim();
//   const name = document.getElementById("edit-name").value.trim();
//   const category = document.getElementById("edit-category").value;
//   const type = document.getElementById("edit-type").value;
//   const brand = document.getElementById("edit-brand").value.trim();
//   const prescription = document.getElementById("edit-prescription").value;
//   const quantity = parseInt(document.getElementById("edit-quantity").value);
//   const unit = document.getElementById("edit-unit").value;
//   const mrp = parseFloat(document.getElementById("edit-mrp").value);
//   const price = parseFloat(document.getElementById("edit-price").value);
//   const batch = document.getElementById("edit-batch").value.trim();
//   const expiry = document.getElementById("edit-expiry").value;
//   const description = document.getElementById("edit-description").value.trim();
//   const storage = document.getElementById("edit-storage").value.trim();

//   // Validate inputs
//   if (
//     !sku ||
//     !name ||
//     !category ||
//     !type ||
//     !brand ||
//     !prescription ||
//     !unit ||
//     !batch ||
//     !expiry
//   ) {
//     showToast("All required fields must be filled.", "error");
//     return;
//   }
//   if (isNaN(quantity) || quantity < 0) {
//     showToast("Quantity must be a non-negative number.", "error");
//     return;
//   }
//   if (isNaN(mrp) || mrp < 0 || isNaN(price) || price < 0) {
//     showToast("MRP and Price must be non-negative numbers.", "error");
//     return;
//   }
//   if (new Date(expiry) <= today) {
//     showToast("Expiry date must be in the future.", "error");
//     return;
//   }

//   try {
//     // Prepare image files
//     const mainImageFile = document.getElementById("edit-image1").files[0];
//     const subImageFiles = [
//       document.getElementById("edit-image2").files[0],
//       document.getElementById("edit-image3").files[0],
//       document.getElementById("edit-image4").files[0],
//     ].filter((file) => file);

//     const productData = {
//       name,
//       category,
//       type,
//       brand,
//       prescription,
//       quantity,
//       unit,
//       mrp,
//       price,
//       batch,
//       expiry,
//       description,
//       storage,
//       mainImage: mainImageFile,
//       subImages: subImageFiles,
//     };

//     if (currentProductId) {
//       // Update existing product
//       await apiService.updateProduct(currentProductId, productData);
//       showToast("Product updated successfully!");
//     } else {
//       // Create new product
//       if (!mainImageFile || subImageFiles.length < 3) {
//         showToast("Please upload all 4 images for new products.", "error");
//         return;
//       }
//       await apiService.createProduct(productData);
//       showToast("Product added successfully!");
//     }

//     editProductModal.style.display = "none";
//     editProductForm.reset();
//     await loadProductsFromBackend();
//     updateStats();
//     applyFilters();
//   } catch (error) {
//     showToast(
//       `Failed to ${currentProductId ? "update" : "create"} product`,
//       "error"
//     );
//   }
// }

// // Delete product
// async function deleteProduct(id) {
//   if (!confirm("Are you sure you want to delete this product?")) {
//     return;
//   }

//   try {
//     await apiService.deleteProduct(id);
//     showToast("Product deleted successfully!");
//     await loadProductsFromBackend();
//     updateStats();
//   } catch (error) {
//     showToast("Failed to delete product", "error");
//   }
// }

// // Apply filters
// function applyFilters() {
//   const category = document.getElementById("categoryFilter").value;
//   const subcategory = document.getElementById("subcategoryFilter").value;
//   const prescription = document.getElementById("prescriptionFilter").value;
//   const stock = document.getElementById("stockFilter").value;
//   const search = document
//     .getElementById("searchInput")
//     .value.trim()
//     .toLowerCase();

//   let filteredProducts = [...products];

//   if (category) {
//     filteredProducts = filteredProducts.filter((p) => p.category === category);
//   }
//   if (subcategory) {
//     filteredProducts = filteredProducts.filter(
//       (p) => p.sizes && p.sizes.length > 0 && p.sizes[0] === subcategory
//     );
//   }
//   if (prescription) {
//     filteredProducts = filteredProducts.filter((p) => {
//       const specs = JSON.parse(p.specifications);
//       return (
//         (prescription === "Yes" && specs.prescriptionRequired) ||
//         (prescription === "No" && !specs.prescriptionRequired)
//       );
//     });
//   }
//   if (stock) {
//     filteredProducts = filteredProducts.filter((p) => {
//       const stockStatus = getStockStatus(p.stockQuantity);
//       if (stock === "in-stock") return stockStatus === "In Stock";
//       if (stock === "low-stock") return stockStatus === "Low Stock";
//       if (stock === "out-of-stock") return stockStatus === "Out of Stock";
//     });
//   }
//   if (search) {
//     filteredProducts = filteredProducts.filter(
//       (p) =>
//         p.title.toLowerCase().includes(search) ||
//         p.brand.toLowerCase().includes(search) ||
//         (p.description &&
//           p.description.some((desc) => desc.toLowerCase().includes(search)))
//     );
//   }

//   loadProducts(filteredProducts);
// }

// // Export to CSV with proper escaping
// function exportToCSV() {
//   const headers = [
//     "ID",
//     "Name",
//     "Category",
//     "Brand",
//     "Prescription Required",
//     "Quantity",
//     "Unit",
//     "MRP",
//     "Selling Price",
//     "Batch Number",
//     "Expiry Date",
//     "Description",
//     "Storage",
//     "Stock Status",
//   ];

//   const escapeCSV = (str) => {
//     if (!str) return "";
//     return `"${str.replace(/"/g, '""')}"`;
//   };

//   const rows = products.map((p) => {
//     const specs = JSON.parse(p.specifications);
//     return [
//       p.id,
//       escapeCSV(p.title),
//       escapeCSV(p.category),
//       escapeCSV(p.brand),
//       specs.prescriptionRequired ? "Yes" : "No",
//       p.stockQuantity,
//       escapeCSV(p.sizes && p.sizes.length > 0 ? p.sizes[0] : ""),
//       p.originalPrice.toFixed(2),
//       p.price.toFixed(2),
//       escapeCSV(specs.batchNumber),
//       escapeCSV(specs.expiryDate),
//       escapeCSV(
//         p.description && p.description.length > 0 ? p.description[0] : ""
//       ),
//       escapeCSV(p.features && p.features.length > 0 ? p.features[0] : ""),
//       getStockStatus(p.stockQuantity),
//     ];
//   });

//   let csvContent =
//     "data:text/csv;charset=utf-8," +
//     headers.join(",") +
//     "\n" +
//     rows.map((row) => row.join(",")).join("\n");

//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   link.setAttribute("download", "mother_baby_products_export.csv");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   showToast("CSV exported successfully!");
// }

// // Close modals when clicking outside
// window.addEventListener("click", (e) => {
//   if (e.target === productDetailModal) {
//     productDetailModal.style.display = "none";
//   }
//   if (e.target === editProductModal) {
//     editProductModal.style.display = "none";
//     editProductForm.reset();
//   }
//   if (e.target === addCategoryModal) {
//     addCategoryModal.style.display = "none";
//     resetAddCategoryForm();
//   }
//   if (e.target === successPopup) {
//     successPopup.style.display = "none";
//   }
// });

// // Sidebar toggle functionality
// const toggleSidebarLogo = document.getElementById("toggle-sidebar-logo");
// const sidebarArrow = document.getElementById("sidebar-arrow");
// const sidebar = document.getElementById("sidebar");
// const sidebarTitle = document.getElementById("sidebar-title");
// const sidebarLogo = document.getElementById("sidebar-logo");
// const toggleSidebarMobile = document.getElementById("toggle-sidebar-mobile");
// const closeSidebar = document.getElementById("close-sidebar");

// toggleSidebarLogo.addEventListener("click", () => {
//   sidebar.classList.toggle("w-58");
//   sidebar.classList.toggle("w-14");
//   sidebar.classList.toggle("sidebar-collapsed");
//   sidebarArrow.classList.toggle("fa-chevron-right");
//   sidebarArrow.classList.toggle("fa-chevron-left");
//   sidebarTitle.classList.toggle("hidden");
//   sidebarLogo.classList.toggle("mr-2");
//   sidebarLogo.classList.toggle("mx-auto");
// });

// toggleSidebarMobile.addEventListener("click", () => {
//   sidebar.classList.add("translate-x-0");
// });

// closeSidebar.addEventListener("click", () => {
//   sidebar.classList.remove("translate-x-0");
// });

// // ---------------------------------------------------------------------
// // LOGOUT FUNCTIONALITY – EXACTLY LIKE SCREENSHOT
// // ---------------------------------------------------------------------
// $('#logoutBtn').on('click', function () {
//   $('#logoutConfirmModal').show();
// });

// $(document).on('click', '#confirmLogout', function () {
//   $('#logoutConfirmModal').hide();
//   showToast("Successfully logged out.", "success");
//   setTimeout(() => {
//     window.location.href = '../Login/login.html';
//   }, 800);
// });

// $(document).on('click', '#cancelLogout, #closeLogoutModal, #logoutConfirmModal', function (e) {
//   if (e.target.id === 'cancelLogout' || 
//       e.target.id === 'closeLogoutModal' || 
//       e.target.id === 'logoutConfirmModal') {
//     $('#logoutConfirmModal').hide();
//   }
// });