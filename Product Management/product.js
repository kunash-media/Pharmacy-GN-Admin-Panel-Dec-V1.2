// API Base URL - Update this to your backend URL
    const API_BASE_URL = 'http://localhost:8083/api/products';

    // Comprehensive Category Structure with Subcategories
    const categoryStructure = {
        "Medicines & Healthcare": [
            "Prescription Medicines (Upload Prescription)",
            "Over-the-Counter (OTC) Medicines",
            "Chronic Care",
            "First Aid & Emergency",
            "Pain Relief & Fever",
            "Allergy & Cold Care",
            "Digestive Health",
            "Eye Care",
            "Skin Care",
            "Cough & Cold",
            "Anti-infectives",
            "Cardiac Care",
            "Diabetes Care",
            "Neurological",
            "Other"
        ],
        "Mother Care & Maternity": [
            "Maternity Wear",
            "Pregnancy Nutrition",
            "Skincare for Moms",
            "Postpartum Recovery",
            "Breastfeeding Essentials",
            "Pregnancy Tests & Kits",
            "Maternity Supplements",
            "Other"
        ],
        "Baby Care": [
            "Diapers & Wipes",
            "Baby Skin & Hair Care",
            "Feeding & Nursing",
            "Baby Health & Safety",
            "Baby Food & Formula",
            "Baby Bath & Hygiene",
            "Baby Medicines",
            "Baby Accessories",
            "Other"
        ],
        "Wellness & Personal Care": [
            "Vitamins & Supplements",
            "Skin & Hair Care",
            "Oral Care",
            "Menstrual & Intimate Care",
            "Personal Hygiene",
            "Sexual Wellness",
            "Diet & Nutrition",
            "Fitness & Sports",
            "Other"
        ],
        "Medical Devices & Equipment": [
            "Monitoring Devices",
            "Mobility Aids",
            "Respiratory Care",
            "Therapeutic Devices",
            "Diagnostic Equipment",
            "Surgical Supplies",
            "Home Care Equipment",
            "Other"
        ],
        "Speciality Care": [
            "Women's Health",
            "Men's Health",
            "Senior Care",
            "Ayurveda & Herbal Products",
            "Homeopathy",
            "Orthopedic",
            "Diabetic Care",
            "Other"
        ],
        "COVID-19 Essentials": [
            "Masks & PPE",
            "Sanitizers & Disinfectants",
            "Immunity Boosters",
            "Testing Kits",
            "Thermometers",
            "Oxygen Equipment",
            "Other"
        ],
        "Health Foods & Drinks": [
            "Protein Supplements",
            "Health Drinks",
            "Diet Foods",
            "Organic Products",
            "Weight Management",
            "Energy & Sports Drinks",
            "Herbal Teas",
            "Other"
        ]
    };

    // Global Variables
    let currentProductId = null;
    let dataTableInstance = null;
    let allCategories = [];
    let allSubcategories = [];
    const today = new Date();

    // ============================================
    // SIDEBAR FUNCTIONS - WORKING VERSION
    // ============================================
    
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

    function handleResponsiveSidebar() {
        const sidebar = document.getElementById('sidebar');
        
        if (window.innerWidth >= 768) {
            // Desktop: Ensure sidebar is visible
            sidebar.classList.remove('translate-x-0');
            
            // Reset to expanded state on desktop if it was collapsed
            if (!sidebar.classList.contains('collapsed')) {
                sidebar.classList.remove('collapsed');
                const sidebarArrow = document.getElementById('sidebar-arrow');
                sidebarArrow.classList.remove('fa-chevron-right');
                sidebarArrow.classList.add('fa-chevron-left');
            }
        } else {
            // Mobile: Ensure sidebar is hidden by default
            sidebar.classList.remove('translate-x-0');
        }
    }

    // ============================================
    // REST OF YOUR EXISTING CODE (UNCHANGED)
    // ============================================

    // Product Service Class
    class ProductService {
        async getAllProducts(page = 0, size = 1000) {
            try {
                const response = await fetch(`${API_BASE_URL}/get-all-product?page=${page}&size=${size}`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                return data.content || data;
            } catch (error) {
                console.error('Error fetching products:', error);
                return [];
            }
        }

        async getProductById(productId) {
            try {
                const response = await fetch(`${API_BASE_URL}/${productId}`);
                if (!response.ok) throw new Error('Failed to fetch product');
                return await response.json();
            } catch (error) {
                console.error('Error fetching product:', error);
                throw error;
            }
        }

        async createProduct(productData, mainImage, subImages = []) {
            try {
                const formData = new FormData();
                
                const productJson = {
                    sku: productData.sku,
                    productName: productData.name,
                    productCategory: productData.category,
                    productSubCategory: productData.type,
                    productPrice: productData.price,
                    productOldPrice: productData.oldPrice || null,
                    productStock: getStockStatus(productData.quantity),
                    productStatus: productData.status,
                    productDescription: productData.description,
                    productQuantity: productData.quantity,
                    prescriptionRequired: productData.prescription === 'Yes',
                    brandName: productData.brand,
                    mfgDate: productData.mfgDate,
                    expDate: productData.expiry,
                    batchNo: productData.batch,
                    rating: productData.rating,
                    benefitsList: productData.benefits || [],
                    ingredientsList: productData.ingredients || [],
                    directionsList: productData.directions || [],
                    productSizes: productData.sizes || [],
                    productDynamicFields: {
                        strength: productData.strength || '',
                        form: productData.form || '',
                        dosage: productData.dosage || ''
                    }
                };

                formData.append('productData', JSON.stringify(productJson));
                
                if (mainImage) {
                    formData.append('productMainImage', mainImage);
                }
                
                if (subImages && subImages.length > 0) {
                    subImages.forEach((image) => {
                        formData.append('productSubImages', image);
                    });
                }

                const response = await fetch(`${API_BASE_URL}/create-product`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to create product: ${errorText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error creating product:', error);
                throw error;
            }
        }

        async updateProduct(productId, productData, mainImage = null, subImages = []) {
            try {
                const formData = new FormData();
                
                const productJson = {
                    sku: productData.sku,
                    productName: productData.name,
                    productCategory: productData.category,
                    productSubCategory: productData.type,
                    productPrice: productData.price,
                    productOldPrice: productData.oldPrice || null,
                    productStock: getStockStatus(productData.quantity),
                    productStatus: productData.status,
                    productDescription: productData.description,
                    productQuantity: productData.quantity,
                    prescriptionRequired: productData.prescription === 'Yes',
                    brandName: productData.brand,
                    mfgDate: productData.mfgDate,
                    expDate: productData.expiry,
                    batchNo: productData.batch,
                    rating: productData.rating,
                    benefitsList: productData.benefits || [],
                    ingredientsList: productData.ingredients || [],
                    directionsList: productData.directions || [],
                    productSizes: productData.sizes || [],
                    productDynamicFields: {
                        strength: productData.strength || '',
                        form: productData.form || '',
                        dosage: productData.dosage || ''
                    }
                };

                formData.append('productData', JSON.stringify(productJson));
                
                if (mainImage) {
                    formData.append('productMainImage', mainImage);
                }
                
                if (subImages && subImages.length > 0) {
                    subImages.forEach((image) => {
                        formData.append('productSubImages', image);
                    });
                }

                const response = await fetch(`${API_BASE_URL}/update-product/${productId}`, {
                    method: 'PUT',
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

        async deleteProduct(productId) {
            try {
                const response = await fetch(`${API_BASE_URL}/delete-product/${productId}`, {
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
    }

    // Initialize product service
    const productService = new ProductService();

    // Utility Functions
    function getStockStatus(quantity) {
        if (quantity === 0 || quantity === null) return 'Out of Stock';
        if (quantity < 10) return 'Low Stock';
        return 'In Stock';
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

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        if (dateString.includes('T')) {
            dateString = dateString.split('T')[0];
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function formatDateForExcel(dateString) {
        if (!dateString) return '';
        try {
            if (dateString.includes('T')) {
                dateString = dateString.split('T')[0];
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            return dateString;
        }
    }

    function isExpiringSoon(expiryDate) {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffTime > 0 && diffDays <= 30;
    }

    function getRowClass(product) {
        const stockStatus = getStockStatus(product.productQuantity);
        const expiring = isExpiringSoon(product.expDate);
        
        if (stockStatus === 'Low Stock') return 'status-low-stock-row';
        if (expiring) return 'status-expiring-row';
        if (stockStatus === 'In Stock') return 'status-in-stock-row';
        return '';
    }

    // Category Management Functions
    async function initializeCategories() {
        // Start with static categories
        allCategories = Object.keys(categoryStructure);
        
        // Extract all subcategories
        allSubcategories = [];
        Object.values(categoryStructure).forEach(subs => {
            subs.forEach(sub => {
                if (!allSubcategories.includes(sub)) {
                    allSubcategories.push(sub);
                }
            });
        });
        
        // Try to fetch categories from backend
        try {
            const products = await productService.getAllProducts(0, 1000);
            
            // Extract unique categories from products
            const productCategories = [...new Set(products
                .map(p => p.productCategory)
                .filter(cat => cat && cat.trim() !== '')
            )];
            
            // Merge categories
            productCategories.forEach(cat => {
                if (!allCategories.includes(cat)) {
                    allCategories.push(cat);
                }
            });
            
            // Extract unique subcategories from products
            const productSubcategories = [...new Set(products
                .map(p => p.productSubCategory)
                .filter(sub => sub && sub.trim() !== '')
            )];
            
            // Merge subcategories
            productSubcategories.forEach(sub => {
                if (!allSubcategories.includes(sub)) {
                    allSubcategories.push(sub);
                }
            });
            
        } catch (error) {
            console.error('Error loading categories from backend:', error);
        }
        
        // Sort alphabetically
        allCategories.sort();
        allSubcategories.sort();
        
        // Populate dropdowns
        populateCategoryDropdowns();
    }

    function populateCategoryDropdowns() {
        const categoryFilter = document.getElementById('categoryFilter');
        const editCategory = document.getElementById('edit-category');
        
        // Clear existing options
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        editCategory.innerHTML = '<option value="">Select Category</option>';
        
        // Add categories
        allCategories.forEach(category => {
            const option1 = document.createElement('option');
            option1.value = category;
            option1.textContent = category;
            categoryFilter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = category;
            option2.textContent = category;
            editCategory.appendChild(option2);
        });
        
        // Add "Other" option
        const otherOption = document.createElement('option');
        otherOption.value = 'Other';
        otherOption.textContent = 'Other (Specify)';
        categoryFilter.appendChild(otherOption.cloneNode(true));
        editCategory.appendChild(otherOption);
    }

    function populateSubcategoryDropdown(category = null) {
        const subcategoryFilter = document.getElementById('subcategoryFilter');
        const editType = document.getElementById('edit-type');
        
        // Clear existing options
        subcategoryFilter.innerHTML = '<option value="">All Subcategories</option>';
        editType.innerHTML = '<option value="">Select Subcategory</option>';
        
        let subcategories = [];
        
        if (category && category !== 'Other') {
            // Get subcategories for selected category
            if (categoryStructure[category]) {
                subcategories = categoryStructure[category];
            } else {
                // For custom categories, show all subcategories
                subcategories = allSubcategories;
            }
        } else {
            // Show all subcategories
            subcategories = allSubcategories;
        }
        
        // Add subcategories
        subcategories.forEach(sub => {
            const option1 = document.createElement('option');
            option1.value = sub;
            option1.textContent = sub;
            subcategoryFilter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = sub;
            option2.textContent = sub;
            editType.appendChild(option2);
        });
        
        // Add "Other" option
        const otherOption = document.createElement('option');
        otherOption.value = 'Other';
        otherOption.textContent = 'Other (Specify)';
        subcategoryFilter.appendChild(otherOption.cloneNode(true));
        editType.appendChild(otherOption);
        
        // Enable dropdowns
        subcategoryFilter.disabled = false;
        editType.disabled = false;
    }

    // Data Loading Functions
    async function loadProducts(filteredProducts = null) {
        try {
            let productsData;
            
            if (filteredProducts) {
                productsData = filteredProducts;
            } else {
                productsData = await productService.getAllProducts(0, 100);
            }

            // Destroy existing DataTable if exists
            if ($.fn.DataTable.isDataTable('#productTable')) {
                dataTableInstance.destroy();
            }

            // Create DataTable
            dataTableInstance = $('#productTable').DataTable({
                data: productsData.map(product => [
                    product.productId,
                    product.productMainImage 
                        ? `<img src="${API_BASE_URL}/${product.productId}/image" alt="${product.productName}" class="product-thumbnail" onerror="this.src='https://via.placeholder.com/40?text=No+Image'">`
                        : `<img src="https://via.placeholder.com/40?text=No+Image" alt="No Image" class="product-thumbnail">`,
                    product.sku || 'N/A',
                    product.productName,
                    product.productCategory || 'N/A',
                    product.productSubCategory || 'N/A',
                    product.brandName || 'N/A',
                    `<span class="${getStockStatus(product.productQuantity) === 'Low Stock' ? 'low-stock' : getStockStatus(product.productQuantity) === 'Out of Stock' ? 'status-out-of-stock' : ''}">${product.productQuantity || 0} ${product.unit || 'unit'}</span>`,
                    `<div class="font-semibold">₹${product.productPrice ? Number(product.productPrice).toFixed(2) : '0.00'}</div>
                     ${product.productOldPrice ? `<div class="old-price">₹${Number(product.productOldPrice).toFixed(2)}</div>` : ''}`,
                    `<div class="flex items-center">
                        <span class="rating-stars mr-1">${getStarRating(product.rating || 0)}</span>
                        <span>${(product.rating || 0).toFixed(1)}</span>
                     </div>`,
                    `<span class="${isExpiringSoon(product.expDate) ? 'expiring-soon' : 'nonExpiringDate'}">${formatDate(product.expDate)}</span>`,
                    `<span class="status-badge ${product.productStatus === 'Available' ? 'status-available' : product.productStatus === 'Unavailable' ? 'status-unavailable' : 'status-discontinued'}">${product.productStatus || 'N/A'}</span>`,
                    `<div class="action-buttons">
                        <button class="view-btn" data-id="${product.productId}" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="edit-btn" data-id="${product.productId}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" data-id="${product.productId}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                     </div>`
                ]),
                columns: [
                    { title: 'ID', className: 'text-center' },
                    { title: 'Image', className: 'text-center' },
                    { title: 'SKU' },
                    { title: 'Product Name' },
                    { title: 'Category' },
                    { title: 'Subcategory' },
                    { title: 'Brand' },
                    { title: 'Stock' },
                    { title: 'Price (₹)' },
                    { title: 'Rating' },
                    { title: 'Expiry Date' },
                    { title: 'Status' },
                    { 
                        title: 'Actions', 
                        className: 'text-center',
                        orderable: false
                    }
                ],
                scrollY: '400px',
                scrollX: true,
                scrollCollapse: true,
                fixedColumns: {
                    right: 1
                },
                paging: true,
                pageLength: 10,
                lengthMenu: [5, 10, 25, 50],
                searching: true,
                ordering: true,
                order: [[0, 'asc']],
                language: {
                    emptyTable: "No products available"
                },
                createdRow: function(row, data, dataIndex) {
                    const product = productsData[dataIndex];
                    $(row).addClass(getRowClass(product));
                    
                    $(row).find('.view-btn').on('click', function() {
                        showProductDetails(product);
                    });
                    $(row).find('.edit-btn').on('click', function() {
                        openEditModal(product);
                    });
                    $(row).find('.delete-btn').on('click', function() {
                        deleteProduct(product);
                    });
                },
                drawCallback: function(settings) {
                    updateStats();
                }
            });
        } catch (error) {
            console.error('Error loading products:', error);
            showSuccessPopup('Error loading products. Please try again.', 'error');
        }
    }

    async function updateStats() {
        try {
            const products = await productService.getAllProducts(0, 1000);
            
            const total = products.length;
            const lowStock = products.filter(p => getStockStatus(p.productQuantity) === 'Low Stock').length;
            const inStock = products.filter(p => getStockStatus(p.productQuantity) === 'In Stock').length;
            const expiring = products.filter(p => isExpiringSoon(p.expDate)).length;

            document.getElementById('totalProducts').textContent = total;
            document.getElementById('lowStockItems').textContent = lowStock;
            document.getElementById('inStockProducts').textContent = inStock;
            document.getElementById('expiringSoon').textContent = expiring;
        } catch (error) {
            console.error('Error updating stats:', error);
            document.getElementById('totalProducts').textContent = '0';
            document.getElementById('lowStockItems').textContent = '0';
            document.getElementById('inStockProducts').textContent = '0';
            document.getElementById('expiringSoon').textContent = '0';
        }
    }

    // Modal Functions
    async function showProductDetails(product) {
        try {
            const productDetails = await productService.getProductById(product.productId);
            
            const productDetailModal = document.getElementById('productDetailModal');
            
            // Set basic information
            document.getElementById('detail-id').textContent = productDetails.productId;
            document.getElementById('detail-sku').textContent = productDetails.sku || 'N/A';
            document.getElementById('detail-name').textContent = productDetails.productName;
            document.getElementById('detail-category').textContent = productDetails.productCategory || 'N/A';
            document.getElementById('detail-type').textContent = productDetails.productSubCategory || 'N/A';
            document.getElementById('detail-brand').textContent = productDetails.brandName || 'N/A';
            document.getElementById('detail-prescription').textContent = productDetails.prescriptionRequired ? 'Yes' : 'No';
            document.getElementById('detail-status').innerHTML = `<span class="status-badge ${productDetails.productStatus === 'Available' ? 'status-available' : productDetails.productStatus === 'Unavailable' ? 'status-unavailable' : 'status-discontinued'}">${productDetails.productStatus || 'N/A'}</span>`;
            document.getElementById('detail-quantity').textContent = `${productDetails.productQuantity || 0} ${productDetails.unit || 'unit'}`;
            document.getElementById('detail-unit').textContent = productDetails.unit || 'N/A';
            document.getElementById('detail-mrp').textContent = `₹${(productDetails.productPrice || 0).toFixed(2)}`;
            document.getElementById('detail-price').textContent = `₹${(productDetails.productPrice || 0).toFixed(2)}`;
            document.getElementById('detail-old-price').textContent = productDetails.productOldPrice ? `₹${Number(productDetails.productOldPrice).toFixed(2)}` : 'N/A';
            document.getElementById('detail-rating').innerHTML = `${getStarRating(productDetails.rating || 0)} ${(productDetails.rating || 0).toFixed(1)}`;
            document.getElementById('detail-batch').textContent = productDetails.batchNo || 'N/A';
            document.getElementById('detail-mfg-date').textContent = formatDate(productDetails.mfgDate);
            document.getElementById('detail-expiry').textContent = formatDate(productDetails.expDate);
            document.getElementById('detail-description').textContent = productDetails.productDescription || 'N/A';
            
            // Benefits
            const benefitsList = document.getElementById('detail-benefits');
            benefitsList.innerHTML = '';
            if (productDetails.benefitsList && productDetails.benefitsList.length > 0) {
                productDetails.benefitsList.forEach(benefit => {
                    const li = document.createElement('li');
                    li.textContent = `• ${benefit}`;
                    benefitsList.appendChild(li);
                });
            } else {
                benefitsList.textContent = 'N/A';
            }
            
            // Directions
            const directionsList = document.getElementById('detail-directions');
            directionsList.innerHTML = '';
            if (productDetails.directionsList && productDetails.directionsList.length > 0) {
                productDetails.directionsList.forEach(direction => {
                    const li = document.createElement('li');
                    li.textContent = `• ${direction}`;
                    directionsList.appendChild(li);
                });
            } else {
                directionsList.textContent = 'N/A';
            }
            
            // Ingredients
            const ingredientsList = document.getElementById('detail-ingredients');
            ingredientsList.innerHTML = '';
            if (productDetails.ingredientsList && productDetails.ingredientsList.length > 0) {
                productDetails.ingredientsList.forEach(ingredient => {
                    const li = document.createElement('li');
                    li.textContent = `• ${ingredient}`;
                    ingredientsList.appendChild(li);
                });
            } else {
                ingredientsList.textContent = 'N/A';
            }
            
            // Sizes
            const sizesContainer = document.getElementById('detail-sizes');
            sizesContainer.innerHTML = '';
            if (productDetails.productSizes && productDetails.productSizes.length > 0) {
                productDetails.productSizes.forEach(size => {
                    const span = document.createElement('span');
                    span.className = 'inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2';
                    span.textContent = size;
                    sizesContainer.appendChild(span);
                });
            } else {
                sizesContainer.textContent = 'N/A';
            }
            
            // Dynamic Fields
            const dynamicFields = document.getElementById('detail-dynamic-fields');
            dynamicFields.innerHTML = '';
            if (productDetails.productDynamicFields) {
                Object.entries(productDetails.productDynamicFields).forEach(([key, value]) => {
                    if (value) {
                        const div = document.createElement('div');
                        div.className = 'mb-1';
                        div.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
                        dynamicFields.appendChild(div);
                    }
                });
            }
            if (!dynamicFields.innerHTML) dynamicFields.textContent = 'N/A';
            
            const stockStatus = getStockStatus(productDetails.productQuantity);
            const stockStatusElement = document.getElementById('detail-stock-status');
            stockStatusElement.textContent = stockStatus;
            stockStatusElement.className = `status-badge ${stockStatus === 'In Stock' ? 'status-in-stock' : stockStatus === 'Low Stock' ? 'status-low-stock' : 'status-out-of-stock'}`;

            document.getElementById('detail-added').textContent = formatDate(productDetails.createdAt);
            document.getElementById('detail-updated').textContent = formatDate(productDetails.createdAt);

            // Images
            const mainImageContainer = document.getElementById('detail-main-image');
            mainImageContainer.innerHTML = '';
            if (productDetails.productMainImage) {
                const mainImg = document.createElement('img');
                mainImg.src = productDetails.productMainImage.includes('http') 
                    ? productDetails.productMainImage 
                    : `${API_BASE_URL}/${productDetails.productId}/image`;
                mainImg.alt = 'Main Product Image';
                mainImg.className = 'product-image rounded-lg shadow-md max-w-full h-auto';
                mainImg.onerror = function() {
                    this.src = 'https://via.placeholder.com/150?text=No+Image';
                };
                mainImageContainer.appendChild(mainImg);
            } else {
                mainImageContainer.textContent = 'No main image';
            }

            const detailImages = document.getElementById('detail-images');
            detailImages.innerHTML = '';
            if (productDetails.productSubImages && productDetails.productSubImages.length > 0) {
                productDetails.productSubImages.forEach((img, index) => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'relative';
                    
                    const imgElement = document.createElement('img');
                    imgElement.src = img.includes('http') 
                        ? img 
                        : `${API_BASE_URL}/${productDetails.productId}/subimage/${index}`;
                    imgElement.alt = `Product Image ${index + 1}`;
                    imgElement.className = 'w-full h-32 object-cover rounded-lg shadow-sm';
                    imgElement.onerror = function() {
                        this.src = 'https://via.placeholder.com/150?text=No+Image';
                    };
                    imgContainer.appendChild(imgElement);
                    
                    if (index === 0) {
                        const badge = document.createElement('span');
                        badge.className = 'absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded';
                        badge.textContent = 'Main';
                        imgContainer.appendChild(badge);
                    }
                    
                    detailImages.appendChild(imgContainer);
                });
            } else {
                detailImages.textContent = 'No images available';
            }

            document.getElementById('editProductBtn').onclick = () => openEditModal(productDetails);
            productDetailModal.style.display = 'flex';
        } catch (error) {
            console.error('Error showing product details:', error);
            showSuccessPopup('Error loading product details', 'error');
        }
    }

    function openEditModal(product) {
        const editProductModal = document.getElementById('editProductModal');
        document.getElementById('editModalTitle').textContent = 'Edit Product';
        currentProductId = product.productId;
        
        // Fill form fields
        document.getElementById('edit-sku').value = product.sku || '';
        document.getElementById('edit-name').value = product.productName || '';
        document.getElementById('edit-brand').value = product.brandName || '';
        document.getElementById('edit-prescription').value = product.prescriptionRequired ? 'Yes' : 'No';
        document.getElementById('edit-status').value = product.productStatus || 'Available';
        document.getElementById('edit-quantity').value = product.productQuantity || 0;
        document.getElementById('edit-unit').value = product.unit || 'Tablet Strip';
        document.getElementById('edit-mrp').value = product.productPrice || 0;
        document.getElementById('edit-price').value = product.productPrice || 0;
        document.getElementById('edit-old-price').value = product.productOldPrice || '';
        document.getElementById('edit-rating').value = product.rating || 0;
        document.getElementById('edit-batch').value = product.batchNo || '';
        document.getElementById('edit-mfg-date').value = product.mfgDate || '';
        document.getElementById('edit-expiry').value = product.expDate || '';
        document.getElementById('edit-description').value = product.productDescription || '';
        document.getElementById('edit-benefits').value = (product.benefitsList || []).join('\n');
        document.getElementById('edit-directions').value = (product.directionsList || []).join('\n');
        document.getElementById('edit-ingredients').value = (product.ingredientsList || []).join(', ');
        document.getElementById('edit-sizes').value = (product.productSizes || []).join(', ');
        document.getElementById('edit-strength').value = product.productDynamicFields?.strength || '';
        document.getElementById('edit-form').value = product.productDynamicFields?.form || '';
        document.getElementById('edit-dosage').value = product.productDynamicFields?.dosage || '';
        
        // Handle category
        const categorySelect = document.getElementById('edit-category');
        const categoryOtherContainer = document.getElementById('category-other-container');
        const categoryOtherInput = document.getElementById('edit-category-other');
        
        if (product.productCategory && allCategories.includes(product.productCategory)) {
            categorySelect.value = product.productCategory;
            categoryOtherContainer.classList.add('hidden');
            categoryOtherInput.value = '';
        } else if (product.productCategory) {
            categorySelect.value = 'Other';
            categoryOtherContainer.classList.remove('hidden');
            categoryOtherInput.value = product.productCategory;
            categoryOtherInput.required = true;
        }
        
        // Enable subcategory dropdown and populate
        populateSubcategoryDropdown(categorySelect.value);
        
        // Handle subcategory
        const typeSelect = document.getElementById('edit-type');
        const typeOtherContainer = document.getElementById('type-other-container');
        const typeOtherInput = document.getElementById('edit-type-other');
        
        if (product.productSubCategory && allSubcategories.includes(product.productSubCategory)) {
            typeSelect.value = product.productSubCategory;
            typeOtherContainer.classList.add('hidden');
            typeOtherInput.value = '';
        } else if (product.productSubCategory) {
            typeSelect.value = 'Other';
            typeOtherContainer.classList.remove('hidden');
            typeOtherInput.value = product.productSubCategory;
            typeOtherInput.required = true;
        }
        
        // Clear image inputs
        document.getElementById('edit-main-image').value = '';
        document.getElementById('edit-image1').value = '';
        document.getElementById('edit-image2').value = '';
        document.getElementById('edit-image3').value = '';
        document.getElementById('edit-image4').value = '';
        
        editProductModal.style.display = 'flex';
    }

    // Excel Export Functions
    async function exportToExcel(type = 'csv') {
        try {
            // Show loading message
            const loadingMessages = {
                'csv': 'Exporting CSV file...',
                'excel': 'Generating Excel file...',
                'detailed': 'Creating detailed report...'
            };
            showSuccessPopup(loadingMessages[type] || 'Exporting data...', 'info');
            
            // Fetch all products
            const products = await productService.getAllProducts(0, 10000);
            
            if (!products || products.length === 0) {
                showSuccessPopup('No data to export', 'error');
                return;
            }
            
            let content, filename;
            
            switch(type) {
                case 'csv':
                    ({ content, filename } = await generateCSVExport(products));
                    break;
                case 'excel':
                    ({ content, filename } = await generateExcelExport(products));
                    break;
                case 'detailed':
                    ({ content, filename } = await generateDetailedExport(products));
                    break;
                default:
                    ({ content, filename } = await generateCSVExport(products));
            }
            
            // Download the file
            const blob = new Blob([content], { 
                type: type === 'excel' || type === 'detailed' 
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                    : 'text/csv;charset=utf-8;' 
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            showSuccessPopup(`Exported ${products.length} products successfully!`);
            
        } catch (error) {
            console.error('Export error:', error);
            showSuccessPopup('Error exporting data: ' + error.message, 'error');
        }
    }

    async function generateCSVExport(products) {
        const headers = [
            'Product ID', 'SKU', 'Product Name', 'Category', 'Subcategory', 'Brand',
            'Prescription Required', 'Status', 'Quantity', 'Unit', 'MRP (₹)', 
            'Selling Price (₹)', 'Old Price (₹)', 'Rating', 'Batch Number',
            'Manufacturing Date', 'Expiry Date', 'Description', 'Benefits',
            'Directions', 'Ingredients', 'Available Sizes', 'Stock Status'
        ];
        
        const rows = products.map(product => [
            product.productId || '',
            product.sku || '',
            escapeCSV(product.productName || ''),
            escapeCSV(product.productCategory || ''),
            escapeCSV(product.productSubCategory || ''),
            escapeCSV(product.brandName || ''),
            product.prescriptionRequired ? 'Yes' : 'No',
            product.productStatus || '',
            product.productQuantity || 0,
            product.unit || '',
            product.productPrice ? Number(product.productPrice).toFixed(2) : '0.00',
            product.productPrice ? Number(product.productPrice).toFixed(2) : '0.00',
            product.productOldPrice ? Number(product.productOldPrice).toFixed(2) : '',
            product.rating ? Number(product.rating).toFixed(1) : '0.0',
            escapeCSV(product.batchNo || ''),
            formatDateForExcel(product.mfgDate),
            formatDateForExcel(product.expDate),
            escapeCSV(product.productDescription || ''),
            escapeCSV((product.benefitsList || []).join('; ')),
            escapeCSV((product.directionsList || []).join('; ')),
            escapeCSV((product.ingredientsList || []).join('; ')),
            escapeCSV((product.productSizes || []).join('; ')),
            getStockStatus(product.productQuantity)
        ]);
        
        const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(row => row.join(',')).join('\n');
        
        return {
            content: csvContent,
            filename: `products_export_${new Date().toISOString().split('T')[0]}.csv`
        };
    }

    async function generateExcelExport(products) {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create Products sheet
        const productsData = [
            ['PharmaCare Product Management System - Export', '', '', '', '', '', '', ''],
            ['Generated On:', new Date().toLocaleDateString(), '', '', '', '', '', ''],
            ['Total Products:', products.length, '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            [
                'Product ID', 'SKU', 'Product Name', 'Category', 'Subcategory', 'Brand',
                'Prescription', 'Status', 'Quantity', 'Unit', 'MRP (₹)', 'Price (₹)',
                'Old Price (₹)', 'Rating', 'Batch No', 'MFG Date', 'Expiry Date', 'Stock Status'
            ]
        ];
        
        products.forEach(product => {
            productsData.push([
                product.productId || '',
                product.sku || '',
                product.productName || '',
                product.productCategory || '',
                product.productSubCategory || '',
                product.brandName || '',
                product.prescriptionRequired ? 'Yes' : 'No',
                product.productStatus || '',
                product.productQuantity || 0,
                product.unit || '',
                product.productPrice ? Number(product.productPrice).toFixed(2) : '0.00',
                product.productPrice ? Number(product.productPrice).toFixed(2) : '0.00',
                product.productOldPrice ? Number(product.productOldPrice).toFixed(2) : '',
                product.rating ? Number(product.rating).toFixed(1) : '0.0',
                product.batchNo || '',
                formatDateForExcel(product.mfgDate),
                formatDateForExcel(product.expDate),
                getStockStatus(product.productQuantity)
            ]);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(productsData);
        
        // Set column widths
        const wscols = [
            {wch: 10}, {wch: 15}, {wch: 30}, {wch: 20}, {wch: 20}, {wch: 20},
            {wch: 12}, {wch: 12}, {wch: 10}, {wch: 12}, {wch: 12}, {wch: 12},
            {wch: 12}, {wch: 8}, {wch: 15}, {wch: 12}, {wch: 12}, {wch: 12}
        ];
        ws['!cols'] = wscols;
        
        XLSX.utils.book_append_sheet(wb, ws, 'Products');
        
        // Generate Excel file
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        
        return {
            content: excelBuffer,
            filename: `products_export_${new Date().toISOString().split('T')[0]}.xlsx`
        };
    }

    async function generateDetailedExport(products) {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Summary sheet
        const summaryData = [
            ['PHARMACARE PRODUCT MANAGEMENT SYSTEM - DETAILED REPORT', '', '', '', ''],
            ['Report Generated:', new Date().toLocaleString(), '', '', ''],
            ['', '', '', '', ''],
            ['SUMMARY STATISTICS', '', '', '', ''],
            ['Total Products:', products.length, '', '', ''],
            ['In Stock:', products.filter(p => getStockStatus(p.productQuantity) === 'In Stock').length, '', '', ''],
            ['Low Stock:', products.filter(p => getStockStatus(p.productQuantity) === 'Low Stock').length, '', '', ''],
            ['Out of Stock:', products.filter(p => getStockStatus(p.productQuantity) === 'Out of Stock').length, '', '', ''],
            ['Expiring Soon:', products.filter(p => isExpiringSoon(p.expDate)).length, '', '', ''],
            ['', '', '', '', ''],
            ['Category Distribution', '', '', '', ''],
        ];
        
        // Add category distribution
        const categoryCount = {};
        products.forEach(p => {
            const cat = p.productCategory || 'Uncategorized';
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        
        Object.entries(categoryCount).forEach(([category, count]) => {
            summaryData.push([category, count, '', '', '']);
        });
        
        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        ws1['!cols'] = [{wch: 30}, {wch: 15}, {wch: 10}, {wch: 10}, {wch: 10}];
        XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
        
        // Products sheet
        const productsData = [
            [
                'Product ID', 'SKU', 'Product Name', 'Category', 'Subcategory', 'Brand',
                'Prescription', 'Status', 'Quantity', 'Unit', 'MRP (₹)', 'Price (₹)',
                'Old Price (₹)', 'Rating', 'Batch No', 'MFG Date', 'Expiry Date',
                'Description', 'Benefits', 'Directions', 'Ingredients', 'Sizes',
                'Strength', 'Form', 'Dosage', 'Stock Status'
            ]
        ];
        
        products.forEach(product => {
            productsData.push([
                product.productId || '',
                product.sku || '',
                product.productName || '',
                product.productCategory || '',
                product.productSubCategory || '',
                product.brandName || '',
                product.prescriptionRequired ? 'Yes' : 'No',
                product.productStatus || '',
                product.productQuantity || 0,
                product.unit || '',
                product.productPrice ? Number(product.productPrice).toFixed(2) : '0.00',
                product.productPrice ? Number(product.productPrice).toFixed(2) : '0.00',
                product.productOldPrice ? Number(product.productOldPrice).toFixed(2) : '',
                product.rating ? Number(product.rating).toFixed(1) : '0.0',
                product.batchNo || '',
                formatDateForExcel(product.mfgDate),
                formatDateForExcel(product.expDate),
                (product.productDescription || '').substring(0, 100),
                (product.benefitsList || []).join('; ').substring(0, 100),
                (product.directionsList || []).join('; ').substring(0, 100),
                (product.ingredientsList || []).join('; ').substring(0, 100),
                (product.productSizes || []).join('; '),
                product.productDynamicFields?.strength || '',
                product.productDynamicFields?.form || '',
                product.productDynamicFields?.dosage || '',
                getStockStatus(product.productQuantity)
            ]);
        });
        
        const ws2 = XLSX.utils.aoa_to_sheet(productsData);
        ws2['!cols'] = [
            {wch: 10}, {wch: 15}, {wch: 30}, {wch: 20}, {wch: 20}, {wch: 20},
            {wch: 12}, {wch: 12}, {wch: 10}, {wch: 12}, {wch: 12}, {wch: 12},
            {wch: 12}, {wch: 8}, {wch: 15}, {wch: 12}, {wch: 12}, {wch: 40},
            {wch: 40}, {wch: 40}, {wch: 40}, {wch: 20}, {wch: 15}, {wch: 15},
            {wch: 15}, {wch: 12}
        ];
        XLSX.utils.book_append_sheet(wb, ws2, 'Products');
        
        // Generate Excel file
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        
        return {
            content: excelBuffer,
            filename: `products_detailed_report_${new Date().toISOString().split('T')[0]}.xlsx`
        };
    }

    function escapeCSV(text) {
        if (typeof text !== 'string') text = String(text || '');
        if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
            return '"' + text.replace(/"/g, '""') + '"';
        }
        return text;
    }

    // Event Handlers
    function setupEventListeners() {
        // Sidebar toggle buttons
        document.getElementById('toggle-sidebar-logo').addEventListener('click', toggleSidebar);
        
        // Close sidebar on mobile when clicking close button
        document.getElementById('close-sidebar').addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('translate-x-0');
        });

        // Toggle sidebar for mobile menu button
        document.getElementById('toggle-sidebar-mobile').addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('translate-x-0');
        });

        // Toggle sidebar for desktop
        // document.getElementById('toggle-sidebar-desktop').addEventListener('click', toggleSidebar);
        
        // Modal close buttons
        document.getElementById('closeDetailModal').addEventListener('click', () => {
            document.getElementById('productDetailModal').style.display = 'none';
        });
        document.getElementById('closeEditModal').addEventListener('click', () => {
            document.getElementById('editProductModal').style.display = 'none';
            document.getElementById('editProductForm').reset();
        });
        document.getElementById('cancelEdit').addEventListener('click', () => {
            document.getElementById('editProductModal').style.display = 'none';
            document.getElementById('editProductForm').reset();
        });
        document.getElementById('closeSuccessPopup').addEventListener('click', () => {
            document.getElementById('successPopup').style.display = 'none';
        });

        // Add product button
        document.getElementById('addProductBtn').addEventListener('click', () => {
            document.getElementById('editModalTitle').textContent = 'Add New Product';
            document.getElementById('editProductForm').reset();
            currentProductId = null;
            
            // Reset category/subcategory
            document.getElementById('edit-category').value = '';
            document.getElementById('edit-type').value = '';
            document.getElementById('category-other-container').classList.add('hidden');
            document.getElementById('type-other-container').classList.add('hidden');
            document.getElementById('edit-type').disabled = true;
            
            document.getElementById('editProductModal').style.display = 'flex';
        });

        // Form submissions
        document.getElementById('editProductForm').addEventListener('submit', handleFormSubmit);

        // Category change handlers
        document.getElementById('categoryFilter').addEventListener('change', function() {
            populateSubcategoryDropdown(this.value);
            applyFilters();
        });

        document.getElementById('edit-category').addEventListener('change', function() {
            const otherContainer = document.getElementById('category-other-container');
            const otherInput = document.getElementById('edit-category-other');
            
            if (this.value === 'Other') {
                otherContainer.classList.remove('hidden');
                otherInput.required = true;
            } else {
                otherContainer.classList.add('hidden');
                otherInput.required = false;
                otherInput.value = '';
            }
            
            populateSubcategoryDropdown(this.value);
        });

        document.getElementById('edit-type').addEventListener('change', function() {
            const otherContainer = document.getElementById('type-other-container');
            const otherInput = document.getElementById('edit-type-other');
            
            if (this.value === 'Other') {
                otherContainer.classList.remove('hidden');
                otherInput.required = true;
            } else {
                otherContainer.classList.add('hidden');
                otherInput.required = false;
                otherInput.value = '';
            }
        });

        // Filters
        document.getElementById('subcategoryFilter').addEventListener('change', applyFilters);
        document.getElementById('prescriptionFilter').addEventListener('change', applyFilters);
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
                    if (modalId === 'editProductModal') {
                        document.getElementById('editProductForm').reset();
                    }
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
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        try {
            // Get form data
            const formData = {
                sku: document.getElementById('edit-sku').value.trim(),
                name: document.getElementById('edit-name').value.trim(),
                category: document.getElementById('edit-category').value === 'Other' 
                    ? document.getElementById('edit-category-other').value.trim()
                    : document.getElementById('edit-category').value,
                type: document.getElementById('edit-type').value === 'Other'
                    ? document.getElementById('edit-type-other').value.trim()
                    : document.getElementById('edit-type').value,
                brand: document.getElementById('edit-brand').value.trim(),
                prescription: document.getElementById('edit-prescription').value,
                status: document.getElementById('edit-status').value,
                quantity: parseInt(document.getElementById('edit-quantity').value),
                unit: document.getElementById('edit-unit').value,
                mrp: parseFloat(document.getElementById('edit-mrp').value),
                price: parseFloat(document.getElementById('edit-price').value),
                oldPrice: document.getElementById('edit-old-price').value ? parseFloat(document.getElementById('edit-old-price').value) : null,
                rating: parseFloat(document.getElementById('edit-rating').value),
                batch: document.getElementById('edit-batch').value.trim(),
                mfgDate: document.getElementById('edit-mfg-date').value,
                expiry: document.getElementById('edit-expiry').value,
                description: document.getElementById('edit-description').value.trim(),
                benefits: document.getElementById('edit-benefits').value.split('\n').filter(b => b.trim()),
                directions: document.getElementById('edit-directions').value.split('\n').filter(d => d.trim()),
                ingredients: document.getElementById('edit-ingredients').value.split(',').map(i => i.trim()).filter(i => i),
                sizes: document.getElementById('edit-sizes').value.split(',').map(s => s.trim()).filter(s => s),
                strength: document.getElementById('edit-strength').value.trim(),
                form: document.getElementById('edit-form').value.trim(),
                dosage: document.getElementById('edit-dosage').value.trim()
            };

            // Validation
            if (!validateProductForm(formData)) return;

            // Get image files
            const mainImageInput = document.getElementById('edit-main-image');
            const mainImage = mainImageInput.files[0];
            
            const subImages = [];
            for (let i = 1; i <= 4; i++) {
                const subImageInput = document.getElementById(`edit-image${i}`);
                if (subImageInput && subImageInput.files[0]) {
                    subImages.push(subImageInput.files[0]);
                }
            }

            if (currentProductId) {
                // Update existing product
                await productService.updateProduct(currentProductId, formData, mainImage, subImages);
                showSuccessPopup('Product updated successfully!');
            } else {
                // Create new product
                await productService.createProduct(formData, mainImage, subImages);
                showSuccessPopup('Product added successfully!');
            }

            const editProductModal = document.getElementById('editProductModal');
            editProductModal.style.display = 'none';
            document.getElementById('editProductForm').reset();
            
            // Reload products
            await loadProducts();
            
        } catch (error) {
            console.error('Error saving product:', error);
            showSuccessPopup(error.message || 'Error saving product', 'error');
        }
    }

    function validateProductForm(formData) {
        if (!formData.sku || !formData.name || !formData.category || !formData.type || !formData.brand) {
            showSuccessPopup('All required fields must be filled.', 'error');
            return false;
        }
        if (isNaN(formData.quantity) || formData.quantity < 0) {
            showSuccessPopup('Quantity must be a non-negative number.', 'error');
            return false;
        }
        if (isNaN(formData.mrp) || formData.mrp < 0 || isNaN(formData.price) || formData.price < 0) {
            showSuccessPopup('MRP and Price must be non-negative numbers.', 'error');
            return false;
        }
        if (formData.expiry && formData.mfgDate && new Date(formData.expiry) <= new Date(formData.mfgDate)) {
            showSuccessPopup('Expiry date must be after manufacturing date.', 'error');
            return false;
        }
        if (formData.rating < 0 || formData.rating > 5) {
            showSuccessPopup('Rating must be between 0 and 5.', 'error');
            return false;
        }
        return true;
    }

    async function deleteProduct(product) {
        if (confirm(`Are you sure you want to delete "${product.productName}"?`)) {
            try {
                await productService.deleteProduct(product.productId);
                showSuccessPopup('Product deleted successfully!');
                await loadProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                showSuccessPopup('Error deleting product', 'error');
            }
        }
    }

    async function applyFilters() {
        const category = document.getElementById('categoryFilter').value;
        const subcategory = document.getElementById('subcategoryFilter').value;
        const prescription = document.getElementById('prescriptionFilter').value;
        const stock = document.getElementById('stockFilter').value;
        const search = document.getElementById('searchInput').value.trim().toLowerCase();

        try {
            let products = await productService.getAllProducts(0, 1000);
            
            let filteredProducts = products;

            if (search) {
                filteredProducts = filteredProducts.filter(p => 
                    (p.sku && p.sku.toLowerCase().includes(search)) ||
                    (p.productName && p.productName.toLowerCase().includes(search)) ||
                    (p.brandName && p.brandName.toLowerCase().includes(search)) ||
                    (p.productDescription && p.productDescription.toLowerCase().includes(search))
                );
            }
            
            if (category) {
                filteredProducts = filteredProducts.filter(p => p.productCategory === category);
            }
            
            if (subcategory) {
                filteredProducts = filteredProducts.filter(p => p.productSubCategory === subcategory);
            }
            
            if (prescription) {
                const prescriptionBool = prescription === 'Yes';
                filteredProducts = filteredProducts.filter(p => p.prescriptionRequired === prescriptionBool);
            }
            
            if (stock) {
                filteredProducts = filteredProducts.filter(p => {
                    const stockStatus = getStockStatus(p.productQuantity);
                    if (stock === 'in-stock') return stockStatus === 'In Stock';
                    if (stock === 'low-stock') return stockStatus === 'Low Stock';
                    if (stock === 'out-of-stock') return stockStatus === 'Out of Stock';
                    return true;
                });
            }

            loadProducts(filteredProducts);
        } catch (error) {
            console.error('Error applying filters:', error);
            showSuccessPopup('Error applying filters', 'error');
        }
    }

    function showSuccessPopup(message, type = 'success') {
        const successPopup = document.getElementById('successPopup');
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = message;
        const icon = document.getElementById('popupIcon');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        icon.style.color = type === 'success' ? '#10b981' : '#dc2626';
        successPopup.style.display = 'flex';
        setTimeout(() => {
            successPopup.style.display = 'none';
        }, 3000);
    }

    // User Profile
    function displayUserProfile() {
        const user = {
            name: "Shreya Kamble",
            role: "Admin",
        };
        
        const userInitials = document.getElementById('user-initials');
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');

        const nameParts = user.name.trim().split(' ');
        const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}` : nameParts[0][0];
        userInitials.textContent = initials.toUpperCase();
        userName.textContent = user.name;
        userRole.textContent = user.role;
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', async function() {
        // Initialize sidebar
        initializeSidebar();
        
        // Handle window resize for responsive sidebar
        window.addEventListener('resize', handleResponsiveSidebar);
        
        displayUserProfile();
        setupEventListeners();
        
        try {
            await initializeCategories();
            await loadProducts();
            await updateStats();
        } catch (error) {
            console.error('Error initializing page:', error);
            showSuccessPopup('Error loading data from server. Please check your connection.', 'error');
        }
    });