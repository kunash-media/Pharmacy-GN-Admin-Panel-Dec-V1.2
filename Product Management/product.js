// ============================================
// FIXED PRODUCT MANAGEMENT CODE - VANILLA JS VERSION WITH PAGINATION
// ============================================

// API Base URL
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
let allCategories = [];
let allSubcategories = [];
const today = new Date();

// Pagination variables
let currentPage = 1;
let pageSize = 10; // Default to 10 entries
let totalProducts = 0;
let filteredProducts = [];
let allProducts = []; // Store ALL products from API
let searchTerm = ''; // Store current search term

// ============================================
// SIDEBAR FUNCTIONS
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    if (window.innerWidth < 768) {
        // Mobile: Just toggle visibility
        sidebar.classList.toggle('translate-x-0');
    } else {
        // Desktop: Toggle between collapsed and expanded
        sidebar.classList.toggle('collapsed');
        
        // Update arrow icon
        const sidebarArrow = document.getElementById('sidebar-arrow');
        if (sidebar.classList.contains('collapsed')) {
            sidebarArrow.classList.remove('fa-chevron-left');
            sidebarArrow.classList.add('fa-chevron-right');
        } else {
            sidebarArrow.classList.remove('fa-chevron-right');
            sidebarArrow.classList.add('fa-chevron-left');
        }
    }
}

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
// PRODUCT AND VERIFICATION SERVICES
// ============================================

// Product Service Class
class ProductService {
    async getProductById(productId) {
        try {
            console.log(`Fetching product by ID: ${productId}`);
            const response = await fetch(`${API_BASE_URL}/${productId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch product: ${response.status}`);
            }
            
            const product = await response.json();
            console.log('Product fetched:', product);
            
            // Add missing fields with defaults
            return {
                ...product,
                unit: product.unit || 'Tablet Strip',
                rating: product.rating || 0,
                sku: product.sku || `SKU-${product.productId}`,
                verificationStatus: product.approved === true ? 'APPROVED' : 
                                  product.approved === false ? 'REJECTED' : 'PENDING'
            };
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            throw error;
        }
    }

    async getAllProducts(page = 0, size = 1000) {
        try {
            console.log(`Fetching products from: ${API_BASE_URL}/get-all-products?page=${page}&size=${size}`);
            
            const response = await fetch(`${API_BASE_URL}/get-all-products?page=${page}&size=${size}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API Response received:', data);
            
            // Extract products from content array (Spring Data Page structure)
            if (data && data.content && Array.isArray(data.content)) {
                console.log(`Found ${data.content.length} products in content array`);
                
                // Process each product to add missing fields
                const processedProducts = data.content.map(product => {
                    return {
                        ...product,
                        // Add missing fields with default values
                        unit: 'Tablet Strip', // Default unit
                        rating: product.rating || 0,
                        sku: product.sku || `SKU-${product.productId}`,
                        // Map approved field to verificationStatus
                        verificationStatus: product.approved === true ? 'APPROVED' : 
                                          product.approved === false ? 'REJECTED' : 'PENDING'
                    };
                });
                
                console.log('First processed product:', processedProducts[0]);
                return processedProducts;
            } else {
                console.warn('No content array found in response:', data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            return [];
        }
    }

    async createProduct(productData, mainImage, subImages = []) {
        try {
            const formData = new FormData();
            
            // Process sizes and prices for dynamic fields
            const sizes = productData.sizes || [];
            const prices = productData.prices || [];
            const oldPrices = productData.oldPrices || [];
            
            // Extract individual size prices
            const sizePriceMap = {};
            sizes.forEach((size, index) => {
                if (prices[index] !== undefined) {
                    sizePriceMap[size] = {
                        price: prices[index],
                        oldPrice: oldPrices[index] || null
                    };
                }
            });
            
            // Use exact field names expected by your backend
            const productJson = {
                sku: productData.sku,
                productName: productData.name,
                productCategory: productData.category,
                productSubCategory: productData.type,
                productPrice: prices, // Keep as array
                productOldPrice: oldPrices, // Keep as array
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
                productSizes: sizes,
                productDynamicFields: {
                    strength: productData.strength || '',
                    form: productData.form || '',
                    dosage: productData.dosage || '',
                    sizePriceMap: JSON.stringify(sizePriceMap),
                    ...productData.additionalFields || {}
                }
            };

            // Use 'productData' as key (backend expects this)
            formData.append('productData', JSON.stringify(productJson));
            
            if (mainImage) {
                formData.append('productMainImage', mainImage);
            }
            
            if (subImages && subImages.length > 0) {
                subImages.forEach((image, index) => {
                    if (image) {
                        formData.append('productSubImages', image);
                    }
                });
            }

            console.log('=== CREATE PRODUCT REQUEST ===');
            console.log('FormData content:');
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}:`, pair[1]);
            }

            const response = await fetch(`${API_BASE_URL}/create-product`, {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorText = 'Unknown error';
                try {
                    errorText = await response.text();
                    console.log('Error response:', errorText);
                } catch (e) {
                    console.log('Could not read error response:', e);
                    errorText = `Status: ${response.status} ${response.statusText}`;
                }
                throw new Error(`Failed to create product: ${errorText}`);
            }

            try {
                const responseText = await response.text();
                console.log('Success response:', responseText);
                return responseText ? JSON.parse(responseText) : {};
            } catch (e) {
                console.error('Error parsing response:', e);
                return {};
            }
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(productId, productData, mainImage = null, subImages = []) {
        try {
            const formData = new FormData();
            
            // Process sizes and prices for dynamic fields
            const sizes = productData.sizes || [];
            const prices = productData.prices || [];
            const oldPrices = productData.oldPrices || [];
            
            // Extract individual size prices
            const sizePriceMap = {};
            sizes.forEach((size, index) => {
                if (prices[index] !== undefined) {
                    sizePriceMap[size] = {
                        price: prices[index],
                        oldPrice: oldPrices[index] || null
                    };
                }
            });
            
            // Use exact field names expected by your backend
            const productJson = {
                sku: productData.sku,
                productName: productData.name,
                productCategory: productData.category,
                productSubCategory: productData.type,
                productPrice: prices, // Keep as array
                productOldPrice: oldPrices, // Keep as array
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
                productSizes: sizes,
                productDynamicFields: {
                    strength: productData.strength || '',
                    form: productData.form || '',
                    dosage: productData.dosage || '',
                    sizePriceMap: JSON.stringify(sizePriceMap),
                    ...productData.additionalFields || {}
                }
            };

            // Use 'productData' as key (backend expects this)
            formData.append('productData', JSON.stringify(productJson));
            
            if (mainImage) {
                formData.append('productMainImage', mainImage);
            }
            
            if (subImages && subImages.length > 0) {
                subImages.forEach((image, index) => {
                    if (image) {
                        formData.append('productSubImages', image);
                    }
                });
            }

            console.log('=== UPDATE PRODUCT REQUEST ===');
            console.log('Product ID:', productId);
            console.log('Using PATCH method for update');
            console.log('FormData content:');
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}:`, pair[0] === 'productData' ? JSON.parse(pair[1]) : pair[1]);
            }

            const response = await fetch(`${API_BASE_URL}/patch-product/${productId}`, {
                method: 'PATCH',
                body: formData
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorText = 'Unknown error';
                try {
                    errorText = await response.text();
                    console.log('Error response:', errorText);
                } catch (e) {
                    console.log('Could not read error response:', e);
                    errorText = `Status: ${response.status} ${response.statusText}`;
                }
                throw new Error(`Failed to update product: ${errorText}`);
            }

            try {
                const responseText = await response.text();
                console.log('Success response:', responseText);
                return responseText ? JSON.parse(responseText) : {};
            } catch (e) {
                console.error('Error parsing response:', e);
                return {};
            }
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }
}

class VerificationService {
    async verifyProduct(productId, action) {
        try {
            const approved = action === 'APPROVE';
            
            console.log(`=== VERIFICATION REQUEST ===`);
            console.log(`Endpoint: ${API_BASE_URL}/patch-product/${productId}`);
            console.log(`Action: ${action} (approved: ${approved})`);
            
            const formData = new FormData();
            
            const productData = {
                approved: approved
            };
            
            formData.append('productData', JSON.stringify(productData));
            
            console.log('FormData contents:');
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }
            
            const response = await fetch(`${API_BASE_URL}/patch-product/${productId}`, {
                method: 'PATCH',
                body: formData
            });
            
            console.log('Response Status:', response.status);
            console.log('Response OK:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error Response:', errorText);
                throw new Error(`Verification failed (${response.status}): ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Success Response:', result);
            return result;
            
        } catch (error) {
            console.error('Verification error details:', error);
            throw error;
        }
    }
}

// Initialize services
const productService = new ProductService();
const verificationService = new VerificationService();

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getStockStatus(quantity) {
    if (quantity === 0 || quantity === null || quantity === undefined) return 'Out of Stock';
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

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
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
    
    // Map approved to verification status for row highlighting
    const verificationStatus = product.approved === true ? 'APPROVED' : 
                              product.approved === false ? 'REJECTED' : 'PENDING';
    
    if (verificationStatus === 'PENDING') return 'verification-pending-row';
    if (verificationStatus === 'REJECTED') return 'verification-rejected-row';
    if (stockStatus === 'Low Stock') return 'status-low-stock-row';
    if (expiring) return 'status-expiring-row';
    if (stockStatus === 'In Stock' || product.productStock === 'In-Stock') return 'status-in-stock-row';
    return '';
}

// ============================================
// CATEGORY MANAGEMENT FUNCTIONS
// ============================================

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

// ============================================
// FORM HANDLING FUNCTIONS
// ============================================

function openEditModal(product) {
    const editProductModal = document.getElementById('editProductModal');
    document.getElementById('editModalTitle').textContent = product.productId ? 'Edit Product' : 'Add New Product';
    currentProductId = product.productId;
    
    // Fill basic form fields
    document.getElementById('edit-sku').value = product.sku || '';
    document.getElementById('edit-name').value = product.productName || '';
    document.getElementById('edit-brand').value = product.brandName || '';
    document.getElementById('edit-prescription').value = product.prescriptionRequired ? 'Yes' : 'No';
    document.getElementById('edit-status').value = product.productStatus || 'Available';
    document.getElementById('edit-quantity').value = product.productQuantity || 0;
    document.getElementById('edit-unit').value = 'Tablet Strip';
    document.getElementById('edit-rating').value = product.rating || 0;
    document.getElementById('edit-batch').value = product.batchNo || '';
    document.getElementById('edit-mfg-date').value = product.mfgDate ? product.mfgDate.split('T')[0] : '';
    document.getElementById('edit-expiry').value = product.expDate ? product.expDate.split('T')[0] : '';
    document.getElementById('edit-description').value = product.productDescription || '';
    document.getElementById('edit-benefits').value = (product.benefitsList || []).join('\n');
    document.getElementById('edit-directions').value = (product.directionsList || []).join('\n');
    document.getElementById('edit-ingredients').value = (product.ingredientsList || []).join(', ');
    
    // Handle dynamic fields
    if (product.productDynamicFields) {
        document.getElementById('edit-strength').value = product.productDynamicFields.strength || '';
        document.getElementById('edit-form').value = product.productDynamicFields.form || '';
        document.getElementById('edit-dosage').value = product.productDynamicFields.dosage || '';
    }
    
    // Handle MRP and Price - take first price if array exists
    if (product.productPrice && Array.isArray(product.productPrice) && product.productPrice.length > 0) {
        document.getElementById('edit-mrp').value = product.productPrice[0] || '';
        document.getElementById('edit-price').value = product.productPrice[0] || '';
    } else if (product.productPrice) {
        document.getElementById('edit-mrp').value = product.productPrice || '';
        document.getElementById('edit-price').value = product.productPrice || '';
    } else {
        document.getElementById('edit-mrp').value = '';
        document.getElementById('edit-price').value = '';
    }
    
    // Handle old price
    if (product.productOldPrice && Array.isArray(product.productOldPrice) && product.productOldPrice.length > 0) {
        document.getElementById('edit-old-price').value = product.productOldPrice[0] || '';
    } else if (product.productOldPrice) {
        document.getElementById('edit-old-price').value = product.productOldPrice || '';
    } else {
        document.getElementById('edit-old-price').value = '';
    }
    
    // Handle sizes
    const sizes = product.productSizes || [];
    document.getElementById('edit-sizes').value = sizes.join(', ');
    
    // Handle category
    const categorySelect = document.getElementById('edit-category');
    const categoryOtherContainer = document.getElementById('category-other-container');
    const categoryOtherInput = document.getElementById('edit-category-other');
    
    if (product.productCategory && allCategories.includes(product.productCategory)) {
        categorySelect.value = product.productCategory;
        categoryOtherContainer.classList.add('hidden');
        categoryOtherInput.value = '';
        categoryOtherInput.required = false;
    } else if (product.productCategory) {
        categorySelect.value = 'Other';
        categoryOtherContainer.classList.remove('hidden');
        categoryOtherInput.value = product.productCategory;
        categoryOtherInput.required = true;
    } else {
        categorySelect.value = '';
        categoryOtherContainer.classList.add('hidden');
        categoryOtherInput.value = '';
        categoryOtherInput.required = false;
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
        typeOtherInput.required = false;
    } else if (product.productSubCategory) {
        typeSelect.value = 'Other';
        typeOtherContainer.classList.remove('hidden');
        typeOtherInput.value = product.productSubCategory;
        typeOtherInput.required = true;
    } else {
        typeSelect.value = '';
        typeOtherContainer.classList.add('hidden');
        typeOtherInput.value = '';
        typeOtherInput.required = false;
    }
    
    // Show verification status for existing products
    const verificationStatusContainer = document.getElementById('verification-status-container');
    const verificationStatusSelect = document.getElementById('edit-verification-status');
    
    if (product.productId) {
        verificationStatusContainer.classList.remove('hidden');
        verificationStatusSelect.value = product.verificationStatus || 'PENDING';
    } else {
        verificationStatusContainer.classList.add('hidden');
    }
    
    // Clear image inputs
    document.getElementById('edit-main-image').value = '';
    document.getElementById('edit-image1').value = '';
    document.getElementById('edit-image2').value = '';
    document.getElementById('edit-image3').value = '';
    document.getElementById('edit-image4').value = '';
    
    editProductModal.style.display = 'flex';
}

// ============================================
// PAGINATION FUNCTIONS
// ============================================

function setupPaginationControls() {
    const paginationControls = document.createElement('div');
    paginationControls.className = 'flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-200';
    paginationControls.innerHTML = `
        <div class="flex items-center mb-4 sm:mb-0">
            <span class="text-sm text-gray-700 mr-3">Show:</span>
            <select id="pageSizeSelect" class="border rounded-lg py-1 px-3 bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="25">25</option>
            </select>
            <span class="text-sm text-gray-700 ml-3">entries</span>
        </div>
        
        <div class="flex items-center">
            <span id="paginationInfo" class="text-sm text-gray-700 mr-4"></span>
            
            <nav class="flex space-x-1">
                <button id="firstPageBtn" class="pagination-btn pagination-nav" title="First Page">
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button id="prevPageBtn" class="pagination-btn pagination-nav" title="Previous Page">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <div id="pageNumbers" class="flex space-x-1"></div>
                
                <button id="nextPageBtn" class="pagination-btn pagination-nav" title="Next Page">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button id="lastPageBtn" class="pagination-btn pagination-nav" title="Last Page">
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </nav>
        </div>
    `;
    
    // Find the product table container and add pagination controls after it
    const productTableContainer = document.querySelector('.product-table-container');
    productTableContainer.parentNode.insertBefore(paginationControls, productTableContainer.nextSibling);
    
    // Add event listeners for pagination controls
    document.getElementById('pageSizeSelect').addEventListener('change', function() {
        pageSize = parseInt(this.value);
        currentPage = 1; // Reset to first page when page size changes
        renderTable();
    });
    
    document.getElementById('firstPageBtn').addEventListener('click', () => {
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    
    document.getElementById('nextPageBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredProducts.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
    
    document.getElementById('lastPageBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredProducts.length / pageSize);
        currentPage = totalPages;
        renderTable();
    });
    
    // Add CSS for pagination
    const style = document.createElement('style');
    style.textContent = `
        .pagination-btn {
            min-width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background-color: white;
            color: #374151;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .pagination-btn:hover:not(:disabled) {
            background-color: #f3f4f6;
            border-color: #9ca3af;
        }
        
        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .pagination-nav {
            padding: 0 8px;
        }
        
        .pagination-nav i {
            font-size: 12px;
        }
        
        .page-number-btn {
            min-width: 32px;
            padding: 0 8px;
        }
        
        .page-number-btn.active {
            background-color: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        .page-number-btn.active:hover {
            background-color: #2563eb;
        }
    `;
    document.head.appendChild(style);
}

function updatePaginationControls() {
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / pageSize);
    
    // Update pagination info
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalProducts);
    document.getElementById('paginationInfo').textContent = 
        `Showing ${startIndex} to ${endIndex} of ${totalProducts} entries`;
    
    // Update page numbers
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';
    
    // Show max 5 page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Adjust if we're near the beginning
    if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
    }
    
    // Adjust if we're near the end
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn page-number-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });
        pageNumbersContainer.appendChild(pageBtn);
    }
    
    // Update navigation buttons state
    document.getElementById('firstPageBtn').disabled = currentPage === 1;
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage === totalPages || totalPages === 0;
    document.getElementById('lastPageBtn').disabled = currentPage === totalPages || totalPages === 0;
}

// ============================================
// TABLE RENDERING FUNCTIONS
// ============================================

function renderTable() {
    const tableBody = document.querySelector('#productTable tbody');
    tableBody.innerHTML = '';
    
    if (!filteredProducts || filteredProducts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="14" class="text-center py-8 text-gray-500">No products found</td>';
        tableBody.appendChild(row);
        updatePaginationControls();
        return;
    }
    
    // Calculate pagination slice
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    // Create table rows
    productsToShow.forEach((product, index) => {
        console.log(`Processing product ${startIndex + index + 1}:`, product.productName);
        
        // Handle pricing display
        let pricingDisplay = 'N/A';
        let pricingDetails = '';
        if (product.productPrice && Array.isArray(product.productPrice) && product.productPrice.length > 0) {
            pricingDisplay = `₹${Number(product.productPrice[0]).toFixed(2)}`;
            if (product.productPrice.length > 1) {
                pricingDetails = `(+${product.productPrice.length - 1} more)`;
            }
        }
        
        // Show sizes count
        const sizesCount = product.productSizes ? product.productSizes.length : 0;
        
        // Fix image URL
        const mainImageUrl = product.productMainImage 
            ? (product.productMainImage.startsWith('http') 
                ? product.productMainImage 
                : `http://localhost:8083${product.productMainImage}`)
            : 'https://via.placeholder.com/40?text=No+Image';
        
        // Determine verification status from approved field
        const verificationStatus = product.approved === true ? 'APPROVED' : 
                                 product.approved === false ? 'REJECTED' : 'PENDING';
        
        // Create table row
        const row = document.createElement('tr');
        row.className = getRowClass(product);
        
        row.innerHTML = `
            <td class="text-center">${product.productId || `N/A-${startIndex + index}`}</td>
            <td class="text-center">
                <img src="${mainImageUrl}" alt="${product.productName}" class="product-thumbnail" onerror="this.src='https://via.placeholder.com/40?text=No+Image'">
            </td>
            <td>${product.sku || `SKU-${product.productId}`}</td>
            <td>${product.productName || `Product ${startIndex + index}`}</td>
            <td>${product.productCategory || 'N/A'}</td>
            <td>${product.productSubCategory || 'N/A'}</td>
            <td>${product.brandName || 'N/A'}</td>
            <td>
                <span class="${getStockStatus(product.productQuantity) === 'Low Stock' ? 'low-stock' : getStockStatus(product.productQuantity) === 'Out of Stock' ? 'status-out-of-stock' : ''}">
                    ${product.productQuantity || 0} ${product.unit || 'unit'}
                </span>
            </td>
            <td>
                <div class="font-semibold">${pricingDisplay}</div>
                ${product.productOldPrice && product.productOldPrice.length > 0 ? 
                    `<div class="old-price">${sizesCount} variant${sizesCount > 1 ? 's' : ''}</div>` : ''}
                ${pricingDetails ? `<div class="text-xs text-gray-500">${pricingDetails}</div>` : ''}
            </td>
            <td class="text-center">
                <div class="flex items-center justify-center">
                    <span class="rating-stars mr-1">${getStarRating(product.rating || 0)}</span>
                    <span>${(product.rating || 0).toFixed(1)}</span>
                </div>
            </td>
            <td class="text-center">
                <span class="${isExpiringSoon(product.expDate) ? 'expiring-soon' : ''}">${formatDate(product.expDate)}</span>
            </td>
            <td class="text-center">
                <span class="status-badge ${product.productStatus === 'Available' ? 'status-available' : product.productStatus === 'Unavailable' ? 'status-unavailable' : 'status-discontinued'}">
                    ${product.productStatus || 'N/A'}
                </span>
            </td>
            <td class="text-center">
                <span class="verification-badge status-badge ${verificationStatus === 'APPROVED' ? 'status-approved' : verificationStatus === 'REJECTED' ? 'status-rejected' : 'status-pending'}">
                    ${verificationStatus}
                </span>
            </td>
            <td class="text-center">
                <div class="action-buttons">
                    <button class="view-btn" data-id="${product.productId}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="edit-btn" data-id="${product.productId}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" data-id="${product.productId}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${(product.approved === null || product.approved === false) ? 
                        `${product.approved === null ? 
                            `<button class="verify-btn" data-id="${product.productId}" title="Approve">
                                <i class="fas fa-check-circle"></i>
                            </button>
                            <button class="reject-btn" data-id="${product.productId}" title="Reject">
                                <i class="fas fa-times-circle"></i>
                            </button>` : 
                            `<button class="verify-btn" data-id="${product.productId}" title="Approve">
                                <i class="fas fa-check-circle"></i>
                            </button>`}` : ''}
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Attach event listeners to the new buttons
    attachTableEventListeners();
    
    // Update pagination controls
    updatePaginationControls();
}

// ============================================
// DATA LOADING AND FILTER FUNCTIONS
// ============================================

async function loadProducts(productsFromAPI = null) {
    try {
        console.log('loadProducts called');
        
        let productsData;
        
        if (productsFromAPI) {
            productsData = productsFromAPI;
            console.log('Using provided products:', productsData.length);
        } else {
            console.log('Fetching products from API...');
            productsData = await productService.getAllProducts(0, 1000);
            console.log('Products fetched:', productsData);
            console.log('Number of products:', productsData.length);
        }

        // Store ALL products
        allProducts = productsData;
        
        // Apply current filters and search to all products
        applyAllFilters();
        
        console.log('Table populated with', filteredProducts.length, 'products');
        
    } catch (error) {
        console.error('Error loading products:', error);
        console.error('Error stack:', error.stack);
        showSuccessPopup('Error loading products. Please check console for details.', 'error');
        
        // Show error in table
        const tableBody = document.querySelector('#productTable tbody');
        tableBody.innerHTML = '<tr><td colspan="14" class="text-center py-8 text-red-500">Error loading products. Please try again.</td></tr>';
        
        // Reset filtered products
        filteredProducts = [];
        allProducts = [];
        updatePaginationControls();
    }
}

// Main filter function that combines all filters
function applyAllFilters() {
    console.log('applyAllFilters called');
    
    if (!allProducts || allProducts.length === 0) {
        filteredProducts = [];
        renderTable();
        return;
    }
    
    // Start with all products
    let filtered = [...allProducts];
    
    // Get current filter values
    const category = document.getElementById('categoryFilter').value;
    const subcategory = document.getElementById('subcategoryFilter').value;
    const prescription = document.getElementById('prescriptionFilter').value;
    const stock = document.getElementById('stockFilter').value;
    const verification = document.getElementById('verificationFilter').value;
    
    console.log('Current filters:', { category, subcategory, prescription, stock, verification, searchTerm });
    
    // Apply category filter
    if (category) {
        filtered = filtered.filter(p => p.productCategory === category);
        console.log(`After category filter (${category}):`, filtered.length);
    }
    
    // Apply subcategory filter
    if (subcategory) {
        filtered = filtered.filter(p => p.productSubCategory === subcategory);
        console.log(`After subcategory filter (${subcategory}):`, filtered.length);
    }
    
    // Apply prescription filter
    if (prescription) {
        if (prescription === 'Yes') {
            filtered = filtered.filter(p => {
                // Handle boolean, string, or number values
                const val = p.prescriptionRequired;
                return val === true || val === 'true' || val === 'Yes' || val === 'yes' || val === 1 || val === '1';
            });
        } else if (prescription === 'No') {
            filtered = filtered.filter(p => {
                // Handle boolean, string, or number values
                const val = p.prescriptionRequired;
                return val === false || val === 'false' || val === 'No' || val === 'no' || val === 0 || val === '0' || 
                       val === null || val === undefined || val === '';
            });
        }
        console.log(`After prescription filter (${prescription}):`, filtered.length);
    }
    
    // FIXED: Apply stock filter - check both stock status methods
    if (stock) {
        filtered = filtered.filter(p => {
            // Check productQuantity for stock status
            const quantity = p.productQuantity || 0;
            const hasStockField = p.productStock !== undefined;
            const stockStatusFromField = p.productStock || '';
            
            let stockStatus;
            
            // First try to get stock status from productStock field
            if (hasStockField) {
                stockStatus = stockStatusFromField;
                console.log(`Product ${p.productId}: Using productStock field: "${stockStatus}"`);
            } else {
                // Otherwise calculate from quantity
                stockStatus = getStockStatus(quantity);
                console.log(`Product ${p.productId}: Calculated from quantity ${quantity}: "${stockStatus}"`);
            }
            
            // Normalize stock status for comparison
            const normalizedStatus = stockStatus.toLowerCase().replace(/\s+/g, '-');
            console.log(`Product ${p.productId}: Normalized status: "${normalizedStatus}" vs filter: "${stock}"`);
            
            if (stock === 'in-stock') {
                return normalizedStatus === 'in-stock' || normalizedStatus === 'in-stock' || normalizedStatus.includes('in');
            }
            if (stock === 'low-stock') {
                return normalizedStatus === 'low-stock' || normalizedStatus.includes('low');
            }
            if (stock === 'out-of-stock') {
                return normalizedStatus === 'out-of-stock' || normalizedStatus.includes('out') || normalizedStatus === 'no-stock';
            }
            return true;
        });
        console.log(`After stock filter (${stock}):`, filtered.length);
        
        // Debug: Show what products passed the filter
        filtered.slice(0, 3).forEach((p, i) => {
            const quantity = p.productQuantity || 0;
            const stockField = p.productStock || 'N/A';
            console.log(`  Sample filtered product ${i+1}: ID=${p.productId}, Quantity=${quantity}, productStock="${stockField}"`);
        });
    }
    
    // Apply verification filter
    if (verification) {
        filtered = filtered.filter(p => {
            const status = p.approved === true ? 'APPROVED' : 
                          p.approved === false ? 'REJECTED' : 'PENDING';
            return status === verification;
        });
        console.log(`After verification filter (${verification}):`, filtered.length);
    }
    
    // Apply search filter
    if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(p => {
            // Search in multiple fields
            return (
                (p.productName && p.productName.toLowerCase().includes(term)) ||
                (p.sku && p.sku.toLowerCase().includes(term)) ||
                (p.productCategory && p.productCategory.toLowerCase().includes(term)) ||
                (p.productSubCategory && p.productSubCategory.toLowerCase().includes(term)) ||
                (p.brandName && p.brandName.toLowerCase().includes(term)) ||
                (p.batchNo && p.batchNo.toLowerCase().includes(term))
            );
        });
        console.log(`After search filter (${searchTerm}):`, filtered.length);
    }
    
    // Update filtered products and reset to first page
    filteredProducts = filtered;
    currentPage = 1;
    
    // Initialize pagination if not already done
    if (!document.getElementById('pageSizeSelect')) {
        setupPaginationControls();
    }
    
    // Render the table with filtered results
    renderTable();
    
    // Update stats based on filtered results
    updateStatsWithFilteredData(filtered);
}

// Function to attach event listeners to table buttons
function attachTableEventListeners() {
    // View buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            const product = filteredProducts.find(p => p.productId == productId);
            if (product) {
                console.log('View button clicked for product:', product.productName);
                await showProductDetails(product);
            }
        });
    });
    
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            const product = filteredProducts.find(p => p.productId == productId);
            if (product) {
                console.log('Edit button clicked for product:', product.productName);
                openEditModal(product);
            }
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            const product = filteredProducts.find(p => p.productId == productId);
            if (product) {
                console.log('Delete button clicked for product:', product.productName);
                await deleteProduct(product);
            }
        });
    });
    
    // Verify/Approve buttons
    document.querySelectorAll('.verify-btn').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            const product = filteredProducts.find(p => p.productId == productId);
            if (product) {
                console.log('Approve button clicked for product:', product.productName);
                showVerificationModal(product, 'APPROVE');
            }
        });
    });
    
    // Reject buttons
    document.querySelectorAll('.reject-btn').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            const product = filteredProducts.find(p => p.productId == productId);
            if (product) {
                console.log('Reject button clicked for product:', product.productName);
                showVerificationModal(product, 'REJECT');
            }
        });
    });
}

// ============================================
// VERIFICATION FUNCTIONS
// ============================================

function showVerificationModal(product, action) {
    const productName = product.productName || 'Product';
    
    // Simple confirmation
    const message = action === 'APPROVE' 
        ? `Are you sure you want to APPROVE "${productName}"?`
        : `Are you sure you want to REJECT "${productName}"?`;
    
    if (confirm(message)) {
        // Directly call verification API
        handleVerification(product.productId, action);
    }
}

async function handleVerification(productId, action) {
    try {
        showSuccessPopup(`Processing ${action.toLowerCase()}...`, 'info');
        
        await verificationService.verifyProduct(productId, action);
        
        // Show success message
        const actionText = action === 'APPROVE' ? 'approved' : 'rejected';
        showSuccessPopup(`Product ${actionText} successfully!`);
        
        // Reload products to reflect changes
        await loadProducts();
        
    } catch (error) {
        console.error(`Error ${action.toLowerCase()}ing product:`, error);
        showSuccessPopup(`Error: ${error.message}`, 'error');
    }
}

// ============================================
// STATS AND FILTER FUNCTIONS
// ============================================

async function updateStats() {
    try {
        const products = await productService.getAllProducts(0, 1000);
        
        const total = products.length;
        const lowStock = products.filter(p => getStockStatus(p.productQuantity) === 'Low Stock').length;
        const inStock = products.filter(p => getStockStatus(p.productQuantity) === 'In Stock').length;
        const expiring = products.filter(p => isExpiringSoon(p.expDate)).length;
        const pendingVerification = products.filter(p => p.approved === null || p.approved === false).length;

        document.getElementById('totalProducts').textContent = total;
        document.getElementById('lowStockItems').textContent = lowStock;
        document.getElementById('inStockProducts').textContent = inStock;
        document.getElementById('expiringSoon').textContent = expiring;
        document.getElementById('pendingVerification').textContent = pendingVerification;
    } catch (error) {
        console.error('Error updating stats:', error);
        document.getElementById('totalProducts').textContent = '0';
        document.getElementById('lowStockItems').textContent = '0';
        document.getElementById('inStockProducts').textContent = '0';
        document.getElementById('expiringSoon').textContent = '0';
        document.getElementById('pendingVerification').textContent = '0';
    }
}

// Individual filter handlers
async function applyFilters() {
    console.log('applyFilters called - refreshing all filters');
    applyAllFilters();
}

function updateStatsWithFilteredData(filtered) {
    const total = filtered.length;
    const lowStock = filtered.filter(p => getStockStatus(p.productQuantity) === 'Low Stock').length;
    const inStock = filtered.filter(p => getStockStatus(p.productQuantity) === 'In Stock').length;
    const expiring = filtered.filter(p => isExpiringSoon(p.expDate)).length;
    const pendingVerification = filtered.filter(p => p.approved === null || p.approved === false).length;

    // Update stats display
    document.getElementById('totalProducts').textContent = total;
    document.getElementById('lowStockItems').textContent = lowStock;
    document.getElementById('inStockProducts').textContent = inStock;
    document.getElementById('expiringSoon').textContent = expiring;
    document.getElementById('pendingVerification').textContent = pendingVerification;
}

// ============================================
// PRODUCT DETAILS MODAL
// ============================================

async function showProductDetails(product) {
    try {
        const productDetails = await productService.getProductById(product.productId);
        console.log('Product details fetched:', productDetails);
        
        const productDetailModal = document.getElementById('productDetailModal');
        
        // Fix image URLs in the product details
        if (productDetails.productMainImage && !productDetails.productMainImage.startsWith('http')) {
            productDetails.productMainImage = productDetails.productMainImage.startsWith('/') 
                ? `http://localhost:8083${productDetails.productMainImage}`
                : `http://localhost:8083/${productDetails.productMainImage}`;
        }
        
        if (productDetails.productSubImages && Array.isArray(productDetails.productSubImages)) {
            productDetails.productSubImages = productDetails.productSubImages.map(img => {
                if (!img) return null;
                return img.startsWith('http') ? img : 
                       (img.startsWith('/') ? `http://localhost:8083${img}` : `http://localhost:8083/${img}`);
            }).filter(img => img !== null);
        }
        
        // Set basic information
        document.getElementById('detail-id').textContent = productDetails.productId || 'N/A';
        document.getElementById('detail-sku').textContent = productDetails.sku || 'N/A';
        document.getElementById('detail-name').textContent = productDetails.productName || 'N/A';
        document.getElementById('detail-category').textContent = productDetails.productCategory || 'N/A';
        document.getElementById('detail-type').textContent = productDetails.productSubCategory || 'N/A';
        document.getElementById('detail-brand').textContent = productDetails.brandName || 'N/A';
        document.getElementById('detail-prescription').textContent = productDetails.prescriptionRequired ? 'Yes' : 'No';
        document.getElementById('detail-status').innerHTML = `<span class="status-badge ${productDetails.productStatus === 'Available' ? 'status-available' : productDetails.productStatus === 'Unavailable' ? 'status-unavailable' : 'status-discontinued'}">${productDetails.productStatus || 'N/A'}</span>`;
        document.getElementById('detail-quantity').textContent = `${productDetails.productQuantity || 0} ${productDetails.unit || 'unit'}`;
        document.getElementById('detail-unit').textContent = productDetails.unit || 'N/A';
        
        // Handle dynamic pricing display
        const sizes = productDetails.productSizes || [];
        const prices = productDetails.productPrice || [];
        const oldPrices = productDetails.productOldPrice || [];
        
        let pricingHtml = '';
        if (sizes.length > 0) {
            sizes.forEach((size, index) => {
                const price = prices[index] || 'N/A';
                const oldPrice = oldPrices[index];
                
                pricingHtml += `
                    <div class="mb-2 p-2 bg-gray-50 rounded">
                        <strong>${size}:</strong> 
                        <span class="font-semibold text-green-600">₹${Number(price).toFixed(2)}</span>
                        ${oldPrice ? `<span class="ml-2 text-sm text-gray-500 line-through">₹${Number(oldPrice).toFixed(2)}</span>` : ''}
                    </div>
                `;
            });
        } else if (prices.length > 0) {
            prices.forEach((price, index) => {
                const oldPrice = oldPrices[index];
                pricingHtml += `
                    <div class="mb-2 p-2 bg-gray-50 rounded">
                        <strong>Variant ${index + 1}:</strong> 
                        <span class="font-semibold text-green-600">₹${Number(price).toFixed(2)}</span>
                        ${oldPrice ? `<span class="ml-2 text-sm text-gray-500 line-through">₹${Number(oldPrice).toFixed(2)}</span>` : ''}
                    </div>
                `;
            });
        } else {
            pricingHtml = 'N/A';
        }
        
        document.getElementById('detail-mrp').innerHTML = pricingHtml;
        document.getElementById('detail-price').innerHTML = pricingHtml;
        document.getElementById('detail-old-price').innerHTML = oldPrices.length > 0 ? 'See pricing above' : 'N/A';
        
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
        if (sizes.length > 0) {
            sizes.forEach(size => {
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
        
        // Your API returns productDynamicFields as an object
        if (productDetails.productDynamicFields && typeof productDetails.productDynamicFields === 'object') {
            Object.entries(productDetails.productDynamicFields).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    const div = document.createElement('div');
                    div.className = 'mb-1';
                    // Format key: convert camelCase to Title Case
                    const formattedKey = key.replace(/([A-Z])/g, ' $1')
                                           .replace(/^./, str => str.toUpperCase())
                                           .trim();
                    div.textContent = `${formattedKey}: ${value}`;
                    dynamicFields.appendChild(div);
                }
            });
        }
        
        if (!dynamicFields.innerHTML) dynamicFields.textContent = 'N/A';
        
        const stockStatus = getStockStatus(productDetails.productQuantity);
        const stockStatusElement = document.getElementById('detail-stock-status');
        stockStatusElement.textContent = stockStatus;
        stockStatusElement.className = `status-badge ${stockStatus === 'In Stock' ? 'status-in-stock' : stockStatus === 'Low Stock' ? 'status-low-stock' : 'status-out-of-stock'}`;

        // Verification Details
        const verificationStatus = productDetails.approved === true ? 'APPROVED' : 
                                 productDetails.approved === false ? 'REJECTED' : 'PENDING';
        const verificationElement = document.getElementById('detail-verification-status');
        verificationElement.innerHTML = `<span class="status-badge ${verificationStatus === 'APPROVED' ? 'status-approved' : verificationStatus === 'REJECTED' ? 'status-rejected' : 'status-pending'}">${verificationStatus}</span>`;
        
        // Hide verification details sections since API doesn't have these fields
        document.getElementById('detail-verified-by-container').style.display = 'none';
        document.getElementById('detail-verified-at-container').style.display = 'none';
        document.getElementById('detail-rejection-reason-container').style.display = 'none';

        document.getElementById('detail-added').textContent = formatDate(productDetails.createdAt);
        document.getElementById('detail-updated').textContent = formatDate(productDetails.createdAt);

        // Images
        const mainImageContainer = document.getElementById('detail-main-image');
        mainImageContainer.innerHTML = '';
        if (productDetails.productMainImage) {
            const mainImg = document.createElement('img');
            mainImg.src = productDetails.productMainImage;
            mainImg.alt = 'Main Product Image';
            mainImg.className = 'product-image rounded-lg shadow-md max-w-full h-auto';
            mainImg.onerror = function() {
                this.src = 'https://via.placeholder.com/150?text=No+Image';
                console.error('Failed to load main image:', productDetails.productMainImage);
            };
            mainImageContainer.appendChild(mainImg);
        } else {
            mainImageContainer.textContent = 'No main image';
        }

        const detailImages = document.getElementById('detail-images');
        detailImages.innerHTML = '';
        if (productDetails.productSubImages && productDetails.productSubImages.length > 0) {
            productDetails.productSubImages.forEach((img, index) => {
                if (!img) return;
                
                const imgContainer = document.createElement('div');
                imgContainer.className = 'relative';
                
                const imgElement = document.createElement('img');
                imgElement.src = img;
                imgElement.alt = `Product Image ${index + 1}`;
                imgElement.className = 'w-full h-32 object-cover rounded-lg shadow-sm';
                imgElement.onerror = function() {
                    this.src = 'https://via.placeholder.com/150?text=No+Image';
                    console.error('Failed to load sub image:', img);
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
            detailImages.textContent = 'No additional images available';
        }

        // Update edit button to use the productDetails with fixed image URLs
        document.getElementById('editProductBtn').onclick = () => openEditModal(productDetails);
        productDetailModal.style.display = 'flex';
        
        console.log('Product details modal displayed');
    } catch (error) {
        console.error('Error showing product details:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        showSuccessPopup('Error loading product details: ' + error.message, 'error');
    }
}

// ============================================
// FORM SUBMISSION AND VALIDATION
// ============================================

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
            quantity: parseInt(document.getElementById('edit-quantity').value) || 0,
            unit: document.getElementById('edit-unit').value,
            mrp: document.getElementById('edit-mrp').value ? parseFloat(document.getElementById('edit-mrp').value) : null,
            price: document.getElementById('edit-price').value ? parseFloat(document.getElementById('edit-price').value) : null,
            oldPrice: document.getElementById('edit-old-price').value ? parseFloat(document.getElementById('edit-old-price').value) : null,
            rating: parseFloat(document.getElementById('edit-rating').value) || 0,
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

        // If no sizes but we have single price, use that
        if (formData.sizes.length === 0 && formData.price) {
            formData.prices = [formData.price];
            if (formData.oldPrice) {
                formData.oldPrices = [formData.oldPrice];
            }
        } else if (formData.sizes.length > 0) {
            // If we have sizes, create price arrays matching the sizes
            formData.prices = formData.sizes.map(() => formData.price || 0);
            formData.oldPrices = formData.sizes.map(() => formData.oldPrice || null);
        } else {
            // Default case
            formData.prices = [];
            formData.oldPrices = [];
        }
        
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
            showSuccessPopup('Product added successfully! It is now pending verification.');
        }

        const editProductModal = document.getElementById('editProductModal');
        editProductModal.style.display = 'none';
        document.getElementById('editProductForm').reset();
        
        // Reset category/subcategory
        document.getElementById('edit-category').value = '';
        document.getElementById('edit-type').value = '';
        document.getElementById('edit-type').disabled = true;
        
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
    if (formData.expiry && formData.mfgDate && new Date(formData.expiry) <= new Date(formData.mfgDate)) {
        showSuccessPopup('Expiry date must be after manufacturing date.', 'error');
        return false;
    }
    if (formData.rating < 0 || formData.rating > 5) {
        showSuccessPopup('Rating must be between 0 and 5.', 'error');
        return false;
    }
    
    // Validate prices
    if (formData.price !== null && (isNaN(formData.price) || formData.price < 0)) {
        showSuccessPopup('Price must be a valid non-negative number.', 'error');
        return false;
    }
    
    return true;
}

// ============================================
// EVENT HANDLERS - UPDATED FOR SEARCH AND FILTERS
// ============================================

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
    document.getElementById('toggle-sidebar-desktop').addEventListener('click', toggleSidebar);
    
    // Modal close buttons
    document.getElementById('closeDetailModal').addEventListener('click', () => {
        document.getElementById('productDetailModal').style.display = 'none';
    });
    
    document.getElementById('closeEditModal').addEventListener('click', () => {
        document.getElementById('editProductModal').style.display = 'none';
        document.getElementById('editProductForm').reset();
        document.getElementById('edit-category').value = '';
        document.getElementById('edit-type').value = '';
        document.getElementById('edit-type').disabled = true;
    });
    
    document.getElementById('cancelEdit').addEventListener('click', () => {
        document.getElementById('editProductModal').style.display = 'none';
        document.getElementById('editProductForm').reset();
        document.getElementById('edit-category').value = '';
        document.getElementById('edit-type').value = '';
        document.getElementById('edit-type').disabled = true;
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
        
        // Set default unit
        document.getElementById('edit-unit').value = 'Tablet Strip';
        
        // Hide verification status for new products
        document.getElementById('verification-status-container').classList.add('hidden');
        
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

    // Filters - FIXED: All filters use the same function
    document.getElementById('subcategoryFilter').addEventListener('change', applyFilters);
    document.getElementById('prescriptionFilter').addEventListener('change', applyFilters);
    // document.getElementById('stockFilter').addEventListener('change', applyFilters);

    // Add debugging for stock filter
document.getElementById('stockFilter').addEventListener('change', function() {
    console.log('Stock filter changed to:', this.value);
    console.log('Options:', Array.from(this.options).map(opt => ({value: opt.value, text: opt.text})));
    applyFilters();
});
    document.getElementById('verificationFilter').addEventListener('change', applyFilters);
    
    // Search functionality - FIXED
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchTerm = this.value;
            console.log('Search term updated:', searchTerm);
            applyAllFilters(); // This will apply all filters including search
        }, 500);
    });

    // Clear search button (optional - add if you want)
    const searchClearBtn = document.createElement('button');
    searchClearBtn.innerHTML = '<i class="fas fa-times"></i>';
    searchClearBtn.className = 'absolute right-10 top-3 text-gray-400 hover:text-gray-600 cursor-pointer';
    searchClearBtn.title = 'Clear search';
    searchClearBtn.onclick = function() {
        document.getElementById('searchInput').value = '';
        searchTerm = '';
        applyAllFilters();
    };
    document.querySelector('#searchInput').parentNode.appendChild(searchClearBtn);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const modals = ['productDetailModal', 'editProductModal', 'successPopup'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (e.target === modal) {
                modal.style.display = 'none';
                if (modalId === 'editProductModal') {
                    document.getElementById('editProductForm').reset();
                    document.getElementById('edit-category').value = '';
                    document.getElementById('edit-type').value = '';
                    document.getElementById('edit-type').disabled = true;
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

// ============================================
// HELPER FUNCTIONS
// ============================================

async function deleteProduct(product) {
    if (confirm(`Are you sure you want to delete "${product.productName}"?`)) {
        try {
            console.log(`=== DELETE REQUEST ===`);
            console.log(`Endpoint: ${API_BASE_URL}/delete-product/${product.productId}`);
            console.log(`Product: ${product.productName} (ID: ${product.productId})`);
            
            const response = await fetch(`${API_BASE_URL}/delete-product/${product.productId}`, {
                method: 'DELETE'
            });
            
            console.log('Delete Response Status:', response.status);
            console.log('Delete Response OK:', response.ok);
            
            if (response.ok) {
                console.log('Delete successful on server');
                showSuccessPopup('Product deleted successfully!');
                
                // Refresh the table
                await loadProducts();
                await updateStats();
            } else {
                const errorText = await response.text();
                console.error('Delete failed:', errorText);
                showSuccessPopup(`Delete failed: ${response.status} - ${errorText.substring(0, 100)}`, 'error');
            }
            
        } catch (error) {
            console.error('Delete error:', error);
            showSuccessPopup('Error deleting product. Check console.', 'error');
        }
    }
}

function showSuccessPopup(message, type = 'success') {
    const successPopup = document.getElementById('successPopup');
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    const icon = document.getElementById('popupIcon');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 
                     type === 'error' ? 'fas fa-exclamation-circle' : 
                     'fas fa-info-circle';
    icon.style.color = type === 'success' ? '#10b981' : 
                       type === 'error' ? '#dc2626' : 
                       '#3b82f6';
    successPopup.style.display = 'flex';
    setTimeout(() => {
        successPopup.style.display = 'none';
    }, 3000);
}

// ============================================
// EXPORT FUNCTIONS (Simple Excel Export)
// ============================================

function exportToExcel(format = 'csv') {
    try {
        const products = allProducts || [];
        
        if (products.length === 0) {
            showSuccessPopup('No data to export', 'error');
            return;
        }

        let csvContent = '';
        
        // CSV Header
        const headers = [
            'ID', 'SKU', 'Product Name', 'Category', 'Subcategory', 'Brand',
            'Quantity', 'Unit', 'Price (₹)', 'Old Price (₹)', 'Rating',
            'Batch No', 'Manufacturing Date', 'Expiry Date', 'Status',
            'Verification Status', 'Prescription Required', 'Description'
        ];
        csvContent += headers.join(',') + '\n';
        
        // CSV Rows
        products.forEach(product => {
            const row = [
                product.productId || '',
                product.sku || '',
                `"${(product.productName || '').replace(/"/g, '""')}"`,
                product.productCategory || '',
                product.productSubCategory || '',
                product.brandName || '',
                product.productQuantity || 0,
                product.unit || '',
                product.productPrice && product.productPrice.length > 0 ? product.productPrice[0] : '',
                product.productOldPrice && product.productOldPrice.length > 0 ? product.productOldPrice[0] : '',
                product.rating || 0,
                product.batchNo || '',
                formatDateForExcel(product.mfgDate),
                formatDateForExcel(product.expDate),
                product.productStatus || '',
                product.approved === true ? 'APPROVED' : product.approved === false ? 'REJECTED' : 'PENDING',
                product.prescriptionRequired ? 'Yes' : 'No',
                `"${(product.productDescription || '').replace(/"/g, '""')}"`
            ];
            csvContent += row.join(',') + '\n';
        });
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessPopup(`Exported ${products.length} products successfully!`);
        
    } catch (error) {
        console.error('Export error:', error);
        showSuccessPopup('Error exporting data: ' + error.message, 'error');
    }
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

// ============================================
// INITIALIZATION
// ============================================

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize sidebar
    initializeSidebar();
    
    // Handle window resize for responsive sidebar
    window.addEventListener('resize', handleResponsiveSidebar);
    
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
