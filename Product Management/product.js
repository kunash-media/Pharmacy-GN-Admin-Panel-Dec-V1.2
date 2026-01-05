// ============================================
// FIXED PRODUCT MANAGEMENT CODE - VANILLA JS VERSION WITH PAGINATION
// ============================================

// API Base URL
const API_BASE_URL = 'http://localhost:8083/api/products';

// Comprehensive Category Structure with Subcategories
const categoryStructure = {
    "Prescription Medicines (Upload Prescription)": [
        "Allergy and Fever",
        "Antibiotics",
        "Liver & Kidney Care",
        "Stomach Care & Digestion",
        "Skin Medicines",
        "Other"
        ],
        
    "Wellness": [
        "Vitamins & Supplements",
        "Skin & Hair Care",
        "Fitness & Weight",
        "Immunity Boosters",
        "Senior Care",
        "Oral Care",
        "Menstrual Care",
    ],
    
    "Over-the-Counter (OTC) Medicines": [
        "Ayurvedic Medicines",
        "Allergy",
        "Fever & Flu",
        "Pain Relief",
        "Ointments",
        "Health Supplements",

    ],
    
    "LifeStyle Disorder": [
        "Diabetes Care",
        "Heart & Blood Pressure",
        "Thyroid Support",
        "Vitamins & Supplements",
        "Nutritional Support",
        "General Wellness",
        
    ],
    
    "Fertility Essentials" : [
        "Male Infertility",
        "Female Infertility",
        "Ayurvedic Supplements",
        "Vitamins & Minerals",
        "Herbal Teas & Powders",
      
    ],
    
    "Monitoring Devices (BP Monitors, Glucometers)" : [
        "Blood Pressure Monitors",
        "Glucometers & Test Strips",
        "Thermometers",
        "Pulse Oximeters"
    ],
    
    "Mobility Aids (Walkers, Wheelchairs)" : [
        "Wheelchair",
        "Walkers & Walking Sticks",
        "Crutches",
        "Support Belts & Braces"
    ],
    
    "Respiratory Care (Nebulizers, Oxygen)" : [
        "Nebulizers & Accessories",
        "Vaporizers & Steam Inhalers",
        "Oxygen Cylinders & Concentrators",
        "CPAP/BIPAP Machines"
    ],
    
    "Surgical Items" : [
            
        "Dressings & Bandages",
        "Surgical Consumables",
        "IV & Infusion Items",
        "Catheters & Tubes",
        "Wound Care",
        "Orthopedic Support",
        "IV Fluids",
        "Surgical Kits",
     
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

// Price Management variable
let priceItemsCount = 0;

// ============================================
// PRICE MANAGEMENT FUNCTIONS
// ============================================

function setupPriceManagement() {
    console.log('Setting up price management...');
    
    // Only run if edit modal is visible
    const modal = document.getElementById('editProductModal');
    if (!modal || modal.style.display !== 'flex') {
        console.warn('Edit modal not visible, skipping price management setup');
        return;
    }
    
    // Find elements
    const addButton = document.querySelector('.add-price-btn');
    const priceTypeSelect = document.getElementById('edit-price-type');
    const singlePriceSection = document.getElementById('single-price-section');
    const multiplePriceSection = document.getElementById('multiple-price-section');
    const singlePriceInputs = document.querySelectorAll('#single-price-section input[type="number"]');
    
    if (!addButton || !priceTypeSelect || !singlePriceSection || !multiplePriceSection) {
        console.warn('Price management elements not found in modal');
        return;
    }
    
    console.log('Setting up price management for visible modal');
    
    // Function to toggle required attributes for single price inputs
    function toggleSinglePriceRequired(isRequired) {
        singlePriceInputs.forEach(input => {
            if (isRequired) {
                input.setAttribute('required', 'required');
            } else {
                input.removeAttribute('required');
            }
        });
    }
    
    // Function to setup remove button event listener
    function setupRemoveButton(removeButton) {
        if (!removeButton) return;
        
        removeButton.addEventListener('click', function(e) {
            e.preventDefault();
            const row = this.closest('.price-item-row');
            if (row) {
                // Add fade out animation
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                row.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    row.remove();
                    console.log('Price item removed');
                }, 300);
            }
        });
    }
    
    // Function to setup all remove buttons
    function setupPriceItemEventListeners() {
        const removeButtons = document.querySelectorAll('.remove-price-btn');
        console.log('Setting up remove buttons:', removeButtons.length);
        
        removeButtons.forEach(button => {
            setupRemoveButton(button);
        });
    }
    
    // Set initial state - single price is visible by default
    toggleSinglePriceRequired(true);
    
    // Price type toggle
    priceTypeSelect.addEventListener('change', function() {
        console.log('Price type changed to:', this.value);
        
        if (this.value === 'multiple') {
            // Show multiple price section, hide single price
            singlePriceSection.style.display = 'none';
            multiplePriceSection.classList.remove('hidden');
            
            // Remove required from single price inputs (they're hidden)
            toggleSinglePriceRequired(false);
            
            // Setup event listeners for price items
            setTimeout(() => {
                setupPriceItemEventListeners();
            }, 50);
            
        } else {
            // Show single price section, hide multiple price
            singlePriceSection.style.display = 'block';
            multiplePriceSection.classList.add('hidden');
            
            // Add required to single price inputs (they're visible)
            toggleSinglePriceRequired(true);
        }
    });
    
    // Setup add button - clone to remove existing listeners
    const newAddButton = addButton.cloneNode(true);
    addButton.parentNode.replaceChild(newAddButton, addButton);
    
    // Add price item functionality
    newAddButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Add price button clicked');
        
        const container = document.querySelector('.price-items-container');
        if (!container) {
            console.error('Price items container not found');
            return;
        }
        
        // Create new price item row
        const newRow = document.createElement('div');
        newRow.className = 'price-item-row grid grid-cols-4 gap-4 items-center p-3 border border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors';
        newRow.innerHTML = `
            <input type="text" placeholder="e.g., 500ml, 100 tablets" 
                   class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
            <input type="number" placeholder="0.00" step="0.01" min="0"
                   class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
            <input type="number" placeholder="0.00" step="0.01" min="0"
                   class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
            <button type="button" class="remove-price-btn flex justify-center">
                <i class="fas fa-times-circle text-red-500 text-lg hover:text-red-700 transition-colors"></i>
            </button>
        `;
        
        // Add fade-in animation
        newRow.style.opacity = '0';
        newRow.style.transform = 'translateY(-10px)';
        
        container.appendChild(newRow);
        
        // Trigger animation after DOM insertion
        setTimeout(() => {
            newRow.style.opacity = '1';
            newRow.style.transform = 'translateY(0)';
            newRow.style.transition = 'all 0.3s ease';
        }, 10);
        
        // Add event listener to the new remove button
        const removeBtn = newRow.querySelector('.remove-price-btn');
        setupRemoveButton(removeBtn);
        
        console.log('New price item added');
    });
    
    // Setup initial remove buttons
    setupPriceItemEventListeners();
    
    console.log('Price management setup complete');
}

// Function to setup add button
function setupAddPriceButton(addButton) {
    // Clone button to remove existing listeners
    const newAddButton = addButton.cloneNode(true);
    addButton.parentNode.replaceChild(newAddButton, addButton);
    
    // Add price item functionality
    newAddButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Add price button clicked');
        
        const container = document.querySelector('.price-items-container');
        if (!container) {
            console.error('Price items container not found');
            return;
        }
        
        const newRow = document.createElement('div');
        newRow.className = 'price-item-row';
        newRow.innerHTML = `
            <input type="text" placeholder="e.g., 500ml, 100 tablets" />
            <input type="number" placeholder="0.00" step="0.01" />
            <input type="number" placeholder="0.00" step="0.01" />
            <button type="button" class="remove-price-btn">
                <i class="fas fa-times-circle text-red-500"></i>
            </button>
        `;
        container.appendChild(newRow);
        
        // Add event listener to the new remove button
        setupRemoveButton(newRow.querySelector('.remove-price-btn'));
    });
}

// Function to setup remove button event listener
function setupRemoveButton(removeButton) {
    if (!removeButton) return;
    
    removeButton.addEventListener('click', function() {
        const row = this.closest('.price-item-row');
        if (row) {
            // Add fade out animation
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            row.style.transition = 'all 0.3s';
            
            setTimeout(() => {
                row.remove();
                console.log('Price item removed');
            }, 300);
        }
    });
}

// Function to setup all remove buttons
function setupPriceItemEventListeners() {
    const removeButtons = document.querySelectorAll('.remove-price-btn');
    console.log('Found remove buttons:', removeButtons.length);
    
    removeButtons.forEach(button => {
        setupRemoveButton(button);
    });
}
function addPriceItem(variant = '', price = '', originalPrice = '') {
    const priceListItems = document.getElementById('price-list-items');
    const priceItemId = `price-item-${priceItemsCount++}`;
    
    const priceItem = document.createElement('div');
    priceItem.className = 'price-item';
    priceItem.id = priceItemId;
    
    priceItem.innerHTML = `
        <input type="text" class="price-variant" placeholder="e.g., S, 500ml" value="${variant}">
        <input type="number" class="price-current" min="0" step="0.01" placeholder="0.00" value="${price}">
        <input type="number" class="price-original" min="0" step="0.01" placeholder="0.00" value="${originalPrice}">
        <button type="button" class="remove-price-btn" onclick="removePriceItem('${priceItemId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    priceListItems.appendChild(priceItem);
}

function removePriceItem(itemId) {
    const item = document.getElementById(itemId);
    if (item && document.querySelectorAll('.price-item').length > 1) {
        item.remove();
    }
}

function getPriceData() {
    const priceType = document.getElementById('edit-price-type').value;
    
    if (priceType === 'single') {
        console.log('Using single price type');
        
        const price = document.getElementById('edit-price').value;
        const oldPrice = document.getElementById('edit-old-price').value;
        
        const priceValue = price ? parseFloat(price) : 0;
        const oldPriceValue = oldPrice ? parseFloat(oldPrice) : null;
        
        return {
            prices: [priceValue],
            oldPrices: oldPriceValue !== null ? [oldPriceValue] : [],
            variants: []
        };
    } else {
        console.log('Using multiple price type');
        
        const priceItems = document.querySelectorAll('.price-item-row');
        console.log('Found price items:', priceItems.length);
        
        const prices = [];
        const oldPrices = [];
        const variants = [];
        
        priceItems.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            
            if (inputs.length >= 3) {
                const variantInput = inputs[0];
                const priceInput = inputs[1];
                const oldPriceInput = inputs[2];
                
                const variant = variantInput.value.trim();
                const price = priceInput.value.trim();
                const oldPrice = oldPriceInput.value.trim();
                
                if (price && !isNaN(parseFloat(price))) {
                    const priceNum = parseFloat(price);
                    if (priceNum >= 0) {
                        prices.push(priceNum);
                        variants.push(variant || `Variant ${index + 1}`);
                        
                        if (oldPrice && !isNaN(parseFloat(oldPrice))) {
                            oldPrices.push(parseFloat(oldPrice));
                        } else {
                            oldPrices.push(null);
                        }
                    }
                }
            }
        });
        
        console.log('Collected data:', { prices, oldPrices, variants });
        
        // Fallback if no prices collected
        if (prices.length === 0) {
            console.log('No prices collected, falling back to single price');
            const fallbackPrice = document.getElementById('edit-price').value;
            const fallbackOldPrice = document.getElementById('edit-old-price').value;
            
            const priceValue = fallbackPrice ? parseFloat(fallbackPrice) : 0;
            const oldPriceValue = fallbackOldPrice ? parseFloat(fallbackOldPrice) : null;
            
            return {
                prices: [priceValue],
                oldPrices: oldPriceValue !== null ? [oldPriceValue] : [],
                variants: []
            };
        }
        
        return {
            prices: prices,
            oldPrices: oldPrices,
            variants: variants
        };
    }
}



// Update your populatePriceData function (around line 258)
function populatePriceData(priceList, mrp, oldPrice) {
    console.log('populatePriceData called with:', { priceList, mrp, oldPrice });
    
    // Initialize price management first
    setupPriceManagement();
    
    // Wait a moment for DOM to be ready
    setTimeout(() => {
        const priceListItems = document.querySelector('.price-items-container');
        console.log('Price items container found:', priceListItems);
        
        if (!priceListItems) {
            console.error('Price items container not found!');
            return;
        }
        
        // Clear existing items
        priceListItems.innerHTML = '';
        priceItemsCount = 0;
        
        if (priceList && Array.isArray(priceList) && priceList.length > 0) {
            console.log('Setting up multiple price type with', priceList.length, 'items');
            
            // Set to multiple price type
            const priceTypeSelect = document.getElementById('edit-price-type');
            if (priceTypeSelect) {
                priceTypeSelect.value = 'multiple';
                priceTypeSelect.dispatchEvent(new Event('change'));
            }
            
            // Add price items after the DOM has been updated
            setTimeout(() => {
                priceList.forEach(item => {
                    addPriceItemToContainer(item.variant || item.size || '', item.price, item.originalPrice);
                });
            }, 100);
            
            // Clear single price fields
            const priceInput = document.getElementById('edit-price');
            const oldPriceInput = document.getElementById('edit-old-price');
            
            if (priceInput) priceInput.value = '';
            if (oldPriceInput) oldPriceInput.value = '';
        } else {
            console.log('Setting up single price type');
            
            // Set to single price type
            const priceTypeSelect = document.getElementById('edit-price-type');
            if (priceTypeSelect) {
                priceTypeSelect.value = 'single';
                priceTypeSelect.dispatchEvent(new Event('change'));
            }
            
            // Set single price fields
            const priceInput = document.getElementById('edit-price');
            const oldPriceInput = document.getElementById('edit-old-price');
            
            if (priceInput) priceInput.value = mrp || '';
            if (oldPriceInput) oldPriceInput.value = oldPrice || '';
        }
    }, 100);
}

// New helper function to add price items to the container
function addPriceItemToContainer(variant = '', price = '', originalPrice = '') {
    const container = document.querySelector('.price-items-container');
    if (!container) {
        console.error('Cannot find price items container');
        return;
    }
    
    console.log('Adding price item:', { variant, price, originalPrice });
    
    // Create new row
    const newRow = document.createElement('div');
    newRow.className = 'price-item-row grid grid-cols-4 gap-4 items-center p-3 border border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors';
    newRow.innerHTML = `
        <input type="text" placeholder="e.g., 500ml, 100 tablets" 
               value="${variant || ''}"
               class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
        <input type="number" placeholder="0.00" step="0.01" min="0"
               value="${price || ''}"
               class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
        <input type="number" placeholder="0.00" step="0.01" min="0"
               value="${originalPrice || ''}"
               class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
        <button type="button" class="remove-price-btn flex justify-center">
            <i class="fas fa-times-circle text-red-500 text-lg hover:text-red-700 transition-colors"></i>
        </button>
    `;
    
    // Add fade-in animation
    newRow.style.opacity = '0';
    newRow.style.transform = 'translateY(-10px)';
    container.appendChild(newRow);
    
    // Trigger animation
    setTimeout(() => {
        newRow.style.opacity = '1';
        newRow.style.transform = 'translateY(0)';
        newRow.style.transition = 'all 0.3s ease';
    }, 10);
    
    // Add event listener to remove button
    const removeBtn = newRow.querySelector('.remove-price-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const row = this.closest('.price-item-row');
            if (row) {
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                row.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    row.remove();
                    console.log('Price item removed');
                }, 300);
            }
        });
    }
    
    priceItemsCount++;
}

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

        // Basic fields (send as individual fields for better binding)
        formData.append('sku', productData.sku || '');
        formData.append('productName', productData.name || '');
        formData.append('productCategory', productData.category || '');
        formData.append('productSubCategory', productData.type || '');
        formData.append('productStock', getStockStatus(productData.quantity));
        formData.append('productStatus', productData.status || 'Available');
        formData.append('productDescription', productData.description || '');
        formData.append('productQuantity', productData.quantity || 0);
        formData.append('prescriptionRequired', productData.prescription === 'Yes');
        formData.append('brandName', productData.brand || '');
        formData.append('mfgDate', productData.mfgDate || '');
        formData.append('expDate', productData.expiry || '');
        formData.append('batchNo', productData.batch || '');
        formData.append('rating', productData.rating || 0);

        // === SEND ARRAYS INDIVIDUALLY ===
        const sizes = productData.sizes || [];
        const prices = productData.prices || [];
        const oldPrices = productData.oldPrices || [];
        const benefits = productData.benefits || [];
        const ingredients = productData.ingredients || [];
        const directions = productData.directions || [];

        // Append sizes
        sizes.forEach(size => formData.append('productSizes', size.trim()));

        // Append prices and old prices (must match array length)
        prices.forEach(price => formData.append('productPrice', price));
        oldPrices.forEach(price => formData.append('productOldPrice', price || ''));

        // Append lists
        benefits.forEach(b => formData.append('benefitsList', b.trim()));
        ingredients.forEach(i => formData.append('ingredientsList', i.trim()));
        directions.forEach(d => formData.append('directionsList', d.trim()));

        // Dynamic fields (send as JSON string or individual — here as JSON)
        const dynamicFields = {
            strength: productData.strength || '',
            form: productData.form || '',
            dosage: productData.dosage || '',
            ...productData.additionalFields || {}
        };
        formData.append('productDynamicFields', JSON.stringify(dynamicFields));

        // Images
        if (mainImage) {
            formData.append('productMainImage', mainImage);
        }

        if (subImages && subImages.length > 0) {
            subImages.forEach((image) => {
                if (image) formData.append('productSubImages', image);
            });
        }

        console.log('=== FINAL FORM DATA ===');
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        const response = await fetch(`${API_BASE_URL}/create-product`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Product created successfully:', result);
        return result;

    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}



  async updateProduct(productId, productData, mainImage = null, subImages = []) {
    try {
        const formData = new FormData();

        // === Build the exact same JSON structure as create ===
        const sizes = productData.sizes || [];
        const prices = productData.prices || [];
        const oldPrices = productData.oldPrices || [];

        const sizePriceMap = {};
        sizes.forEach((size, index) => {
            if (prices[index] !== undefined) {
                sizePriceMap[size] = {
                    price: prices[index],
                    oldPrice: oldPrices[index] || null
                };
            }
        });

        const productJson = {
            sku: productData.sku || null,
            productName: productData.name || null,
            productCategory: productData.category || null,
            productSubCategory: productData.type || null,
            productPrice: prices.length > 0 ? prices : null,
            productOldPrice: oldPrices.length > 0 ? oldPrices : null,
            productStock: getStockStatus(productData.quantity),
            productStatus: productData.status || null,
            productDescription: productData.description || null,
            productQuantity: productData.quantity || 0,
            prescriptionRequired: productData.prescription === 'Yes',
            brandName: productData.brand || null,
            mfgDate: productData.mfgDate || null,
            expDate: productData.expiry || null,
            batchNo: productData.batch || null,
            rating: productData.rating || 0,
            benefitsList: productData.benefits || [],
            ingredientsList: productData.ingredients || [],
            directionsList: productData.directions || [],
            productSizes: sizes.length > 0 ? sizes : null,
            productDynamicFields: {
                strength: productData.strength || '',
                form: productData.form || '',
                dosage: productData.dosage || '',
                sizePriceMap: JSON.stringify(sizePriceMap),
                ...productData.additionalFields || {}
            }
        };

        // === CRITICAL: Send as 'productData' JSON string ===
        formData.append('productData', JSON.stringify(productJson));

        // === Images (optional) ===
        if (mainImage) {
            formData.append('productMainImage', mainImage);
        }

        if (subImages && subImages.length > 0) {
            subImages.forEach((image) => {
                if (image) {
                    formData.append('productSubImages', image);
                }
            });
        }

        // === Debug: Check what is actually sent ===
        console.log('=== PATCH REQUEST TO /patch-product/' + productId + ' ===');
        for (let pair of formData.entries()) {
            if (pair[0] === 'productData') {
                console.log('productData (JSON):', JSON.parse(pair[1]));
            } else {
                console.log(pair[0] + ':', pair[1]);
            }
        }

        const response = await fetch(`${API_BASE_URL}/patch-product/${productId}`, {
            method: 'PATCH',
            body: formData
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Patch failed:', errorText);
            throw new Error(`Update failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Product updated successfully:', result);
        return result;

    } catch (error) {
        console.error('Error in updateProduct:', error);
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

function openEditModal(product = null) {
    console.log('Opening edit modal...');
    
    const editProductModal = document.getElementById('editProductModal');
    const modalTitle = document.getElementById('editModalTitle');
    
    // Check if modal exists
    if (!editProductModal) {
        console.error('Edit modal not found in DOM!');
        showSuccessPopup('Error: Edit form not available', 'error');
        return;
    }
    
    if (product && product.productId) {
        // EDIT MODE
        modalTitle.textContent = 'Edit Product';
        currentProductId = product.productId;
        
        console.log('Loading product data for editing:', product.productName);
        console.log('Product ID:', product.productId);
        
        // RESET FORM FIRST
        resetEditForm();
        
        // Wait a moment for reset to complete, then populate data
        setTimeout(() => {
            // Fill form with product data using safe element checking
            const fields = [
                { id: 'edit-sku', value: product.sku || '' },
                { id: 'edit-name', value: product.productName || '' },
                { id: 'edit-brand', value: product.brandName || '' },
                { id: 'edit-prescription', value: product.prescriptionRequired ? 'Yes' : 'No' },
                { id: 'edit-status', value: product.productStatus || 'Available' },
                { id: 'edit-quantity', value: product.productQuantity || 0 },
                { id: 'edit-rating', value: product.rating || 0 },
                { id: 'edit-batch', value: product.batchNo || '' },
                { id: 'edit-mfg-date', value: product.mfgDate ? product.mfgDate.split('T')[0] : '' },
                { id: 'edit-expiry', value: product.expDate ? product.expDate.split('T')[0] : '' },
                { id: 'edit-description', value: product.productDescription || '' },
                { id: 'edit-benefits', value: (product.benefitsList || []).join('\n') },
                { id: 'edit-ingredients', value: (product.ingredientsList || []).join(', ') }
            ];
            
            // Safely set values only if elements exist
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element) {
                    element.value = field.value;
                    console.log(`Set ${field.id}: ${field.value}`);
                } else {
                    console.warn(`Element not found: ${field.id}`);
                }
            });
            
            // Check and set directions field if it exists
            const directionsElement = document.getElementById('edit-directions');
            if (directionsElement) {
                directionsElement.value = (product.directionsList || []).join('\n');
                console.log(`Set edit-directions`);
            }
            
            // Handle dynamic fields safely
            if (product.productDynamicFields) {
                const dynamicFields = [
                    { id: 'edit-strength', value: product.productDynamicFields.strength || '' },
                    { id: 'edit-form', value: product.productDynamicFields.form || '' },
                    { id: 'edit-dosage', value: product.productDynamicFields.dosage || '' }
                ];
                
                dynamicFields.forEach(field => {
                    const element = document.getElementById(field.id);
                    if (element) {
                        element.value = field.value;
                        console.log(`Set ${field.id}: ${field.value}`);
                    }
                });
            }
            
            // Handle pricing data
            const sizes = product.productSizes || [];
            const prices = product.productPrice || [];
            const oldPrices = product.productOldPrice || [];
            
            console.log('Pricing data:', { sizes, prices, oldPrices });
            
            // IMPORTANT: Check if we have multiple prices vs single price
            if (prices && Array.isArray(prices) && prices.length > 1) {
                console.log('Setting up multiple price type with', prices.length, 'variants');
                
                const priceList = sizes.map((size, index) => ({
                    variant: size,
                    price: prices[index] || 0,
                    originalPrice: oldPrices[index] || 0
                }));
                
                const mrp = prices.length > 0 ? prices[0] : '';
                const oldPrice = oldPrices.length > 0 ? oldPrices[0] : '';
                
                // Use setTimeout to ensure modal is fully rendered
                setTimeout(() => {
                    populatePriceData(priceList, mrp, oldPrice);
                }, 200);
                
            } else {
                console.log('Setting up single price type');
                // Set single price fields safely
                const priceElement = document.getElementById('edit-price');
                const mrpElement = document.getElementById('edit-mrp');
                const oldPriceElement = document.getElementById('edit-old-price');
                
                if (priceElement) {
                    priceElement.value = prices && prices.length > 0 ? prices[0] : '';
                    console.log(`Set edit-price: ${priceElement.value}`);
                }
                if (mrpElement) {
                    mrpElement.value = prices && prices.length > 0 ? prices[0] : '';
                    console.log(`Set edit-mrp: ${mrpElement.value}`);
                }
                if (oldPriceElement) {
                    oldPriceElement.value = oldPrices && oldPrices.length > 0 ? oldPrices[0] : '';
                    console.log(`Set edit-old-price: ${oldPriceElement.value}`);
                }
                
                // Ensure price type is set to single
                const priceTypeSelect = document.getElementById('edit-price-type');
                if (priceTypeSelect) {
                    priceTypeSelect.value = 'single';
                    // Trigger change event to show single price section
                    setTimeout(() => {
                        priceTypeSelect.dispatchEvent(new Event('change'));
                    }, 100);
                }
            }
            
            // Handle sizes safely
            const sizesElement = document.getElementById('edit-sizes');
            if (sizesElement) {
                sizesElement.value = sizes.join(', ');
                console.log(`Set edit-sizes: ${sizesElement.value}`);
            }
            
            // Handle category selection safely
            const categorySelect = document.getElementById('edit-category');
            const categoryOtherContainer = document.getElementById('category-other-container');
            const categoryOtherInput = document.getElementById('edit-category-other');
            
            if (categorySelect && categoryOtherContainer && categoryOtherInput) {
                if (product.productCategory && allCategories.includes(product.productCategory)) {
                    categorySelect.value = product.productCategory;
                    categoryOtherContainer.classList.add('hidden');
                    categoryOtherInput.value = '';
                    categoryOtherInput.required = false;
                    console.log(`Set edit-category: ${product.productCategory}`);
                } else if (product.productCategory) {
                    categorySelect.value = 'Other';
                    categoryOtherContainer.classList.remove('hidden');
                    categoryOtherInput.value = product.productCategory;
                    categoryOtherInput.required = true;
                    console.log(`Set edit-category to Other: ${product.productCategory}`);
                }
                
                // Enable subcategory dropdown and populate
                populateSubcategoryDropdown(categorySelect.value);
            } else {
                console.warn('Category elements not found');
            }
            
            // Handle subcategory selection safely
            const typeSelect = document.getElementById('edit-type');
            const typeOtherContainer = document.getElementById('type-other-container');
            const typeOtherInput = document.getElementById('edit-type-other');
            
            if (typeSelect && typeOtherContainer && typeOtherInput) {
                if (product.productSubCategory && allSubcategories.includes(product.productSubCategory)) {
                    typeSelect.value = product.productSubCategory;
                    typeOtherContainer.classList.add('hidden');
                    typeOtherInput.value = '';
                    typeOtherInput.required = false;
                    console.log(`Set edit-type: ${product.productSubCategory}`);
                } else if (product.productSubCategory) {
                    typeSelect.value = 'Other';
                    typeOtherContainer.classList.remove('hidden');
                    typeOtherInput.value = product.productSubCategory;
                    typeOtherInput.required = true;
                    console.log(`Set edit-type to Other: ${product.productSubCategory}`);
                }
            } else {
                console.warn('Type elements not found');
            }
            
            // Show verification status for existing products safely
            const verificationStatusContainer = document.getElementById('verification-status-container');
            const verificationStatusSelect = document.getElementById('edit-verification-status');
            
            if (verificationStatusContainer && verificationStatusSelect) {
                verificationStatusContainer.classList.remove('hidden');
                verificationStatusSelect.value = product.verificationStatus || 'PENDING';
                console.log(`Set verification status: ${verificationStatusSelect.value}`);
            }
            
            // Update the file input placeholder if main image exists
            const mainImageInput = document.getElementById('edit-main-image');
            if (mainImageInput && product.productMainImage) {
                mainImageInput.placeholder = 'Current image exists. Upload new to replace.';
            }
            
        }, 100); // Wait for reset to complete
        
    } else {
        // ADD NEW PRODUCT MODE
        modalTitle.textContent = 'Add New Product';
        currentProductId = null;
        
        // Reset form for new product
        resetEditForm();
        
        // Hide verification status for new products
        const verificationContainer = document.getElementById('verification-status-container');
        if (verificationContainer) {
            verificationContainer.classList.add('hidden');
        }
    }
    
    // Show the modal
    editProductModal.style.display = 'flex';
    
    // Setup price management AFTER modal is visible
    setTimeout(() => {
        setupPriceManagement();
    }, 300);
}

// Helper function to safely reset the form
function resetEditForm() {
    console.log('Resetting edit form...');
    
    const editForm = document.getElementById('editProductForm');
    if (editForm) {
        editForm.reset();
        console.log('Form reset complete');
    }
    
    // Reset category dropdowns
    const editCategory = document.getElementById('edit-category');
    const editType = document.getElementById('edit-type');
    
    if (editCategory) editCategory.value = '';
    if (editType) {
        editType.value = '';
        editType.disabled = true;
    }
    
    // Reset other containers
    const categoryOtherContainer = document.getElementById('category-other-container');
    const typeOtherContainer = document.getElementById('type-other-container');
    
    if (categoryOtherContainer) {
        categoryOtherContainer.classList.add('hidden');
        const categoryOtherInput = document.getElementById('edit-category-other');
        if (categoryOtherInput) {
            categoryOtherInput.value = '';
            categoryOtherInput.required = false;
        }
    }
    
    if (typeOtherContainer) {
        typeOtherContainer.classList.add('hidden');
        const typeOtherInput = document.getElementById('edit-type-other');
        if (typeOtherInput) {
            typeOtherInput.value = '';
            typeOtherInput.required = false;
        }
    }
    
    // Reset price type to single
    const priceTypeSelect = document.getElementById('edit-price-type');
    if (priceTypeSelect) {
        priceTypeSelect.value = 'single';
        // Trigger the change event to update UI
        setTimeout(() => {
            priceTypeSelect.dispatchEvent(new Event('change'));
        }, 50);
    }
    
    // Clear single price fields
    const priceFields = ['edit-price', 'edit-mrp', 'edit-old-price'];
    priceFields.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Clear dynamic fields
    const dynamicFields = ['edit-strength', 'edit-form', 'edit-dosage', 'edit-directions', 'edit-sizes'];
    dynamicFields.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Clear image inputs
    const imageInputs = ['edit-main-image', 'edit-image1', 'edit-image2', 'edit-image3', 'edit-image4'];
    imageInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = '';
            input.placeholder = '';
        }
    });
    
    // Clear price items container
    const priceItemsContainer = document.querySelector('.price-items-container');
    if (priceItemsContainer) {
        // Keep only the first row (template row)
        const rows = priceItemsContainer.querySelectorAll('.price-item-row');
        rows.forEach((row, index) => {
            if (index > 0) {
                row.remove();
            }
        });
        
        // Clear inputs in the first row
        const firstRow = priceItemsContainer.querySelector('.price-item-row');
        if (firstRow) {
            const inputs = firstRow.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = '';
            });
        }
    }
    
    // Reset verification status if it exists
    const verificationStatusSelect = document.getElementById('edit-verification-status');
    if (verificationStatusSelect) {
        verificationStatusSelect.value = 'PENDING';
    }
    
    // Hide verification container
    const verificationContainer = document.getElementById('verification-status-container');
    if (verificationContainer) {
        verificationContainer.classList.add('hidden');
    }
    
    console.log('Form reset completed successfully');
}

// Helper function to safely set value only if element exists
function setValueIfElementExists(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value;
    }
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
            // color: #374151;
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
        
        // Update the action buttons section in the renderTable() function (around line 1400-1440)
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
        <!-- APPROVAL STATUS BASED ACTION BUTTONS -->
        ${verificationStatus === 'PENDING' ? 
            `<button class="verify-btn" data-id="${product.productId}" title="Approve">
                <i class="fas fa-check-circle text-green-500"></i>
            </button>
            <button class="reject-btn" data-id="${product.productId}" title="Reject">
                <i class="fas fa-times-circle text-red-500"></i>
            </button>` : 
        verificationStatus === 'APPROVED' ? 
            `<button class="unapprove-btn" data-id="${product.productId}" title="Reject (Unapprove)">
                <i class="fas fa-times-circle text-red-500"></i>
            </button>` : 
        verificationStatus === 'REJECTED' ? 
            `<button class="reapprove-btn" data-id="${product.productId}" title="Re-approve">
                <i class="fas fa-check-circle text-green-500"></i>
            </button>` : ''}
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

// Update the attachTableEventListeners() function (around line 1875-1935)
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Sidebar toggle buttons
    const toggleSidebarLogo = document.getElementById('toggle-sidebar-logo');
    const closeSidebar = document.getElementById('close-sidebar');
    const toggleSidebarMobile = document.getElementById('toggle-sidebar-mobile');
    const toggleSidebarDesktop = document.getElementById('toggle-sidebar-desktop');
    
    if (toggleSidebarLogo) toggleSidebarLogo.addEventListener('click', toggleSidebar);
    if (closeSidebar) closeSidebar.addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('translate-x-0');
    });
    if (toggleSidebarMobile) toggleSidebarMobile.addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('translate-x-0');
    });
    if (toggleSidebarDesktop) toggleSidebarDesktop.addEventListener('click', toggleSidebar);
    
    // Modal close buttons
    const closeDetailModal = document.getElementById('closeDetailModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const closeSuccessPopup = document.getElementById('closeSuccessPopup');
    
    if (closeDetailModal) closeDetailModal.addEventListener('click', () => {
        const modal = document.getElementById('productDetailModal');
        if (modal) modal.style.display = 'none';
    });
    
    if (closeEditModal) closeEditModal.addEventListener('click', () => {
        const modal = document.getElementById('editProductModal');
        if (modal) {
            modal.style.display = 'none';
            resetEditForm();
        }
    });
    
    if (cancelEdit) cancelEdit.addEventListener('click', () => {
        const modal = document.getElementById('editProductModal');
        if (modal) {
            modal.style.display = 'none';
            resetEditForm();
        }
    });
    
    if (closeSuccessPopup) closeSuccessPopup.addEventListener('click', () => {
        const popup = document.getElementById('successPopup');
        if (popup) popup.style.display = 'none';
    });
    
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openEditModal();  // No parameter for new product
        });
    }
    
    // Form submissions
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Category change handlers
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            populateSubcategoryDropdown(this.value);
            applyFilters();
        });
    }
    
    const editCategory = document.getElementById('edit-category');
    if (editCategory) {
        editCategory.addEventListener('change', function() {
            const otherContainer = document.getElementById('category-other-container');
            const otherInput = document.getElementById('edit-category-other');
            
            if (this.value === 'Other') {
                if (otherContainer) otherContainer.classList.remove('hidden');
                if (otherInput) otherInput.required = true;
            } else {
                if (otherContainer) otherContainer.classList.add('hidden');
                if (otherInput) {
                    otherInput.required = false;
                    otherInput.value = '';
                }
            }
            
            populateSubcategoryDropdown(this.value);
        });
    }
    
    const editType = document.getElementById('edit-type');
    if (editType) {
        editType.addEventListener('change', function() {
            const otherContainer = document.getElementById('type-other-container');
            const otherInput = document.getElementById('edit-type-other');
            
            if (this.value === 'Other') {
                if (otherContainer) otherContainer.classList.remove('hidden');
                if (otherInput) otherInput.required = true;
            } else {
                if (otherContainer) otherContainer.classList.add('hidden');
                if (otherInput) {
                    otherInput.required = false;
                    otherInput.value = '';
                }
            }
        });
    }
    
    // Filters
    const subcategoryFilter = document.getElementById('subcategoryFilter');
    const prescriptionFilter = document.getElementById('prescriptionFilter');
    const stockFilter = document.getElementById('stockFilter');
    const verificationFilter = document.getElementById('verificationFilter');
    
    if (subcategoryFilter) subcategoryFilter.addEventListener('change', applyFilters);
    if (prescriptionFilter) prescriptionFilter.addEventListener('change', applyFilters);
    if (stockFilter) stockFilter.addEventListener('change', applyFilters);
    if (verificationFilter) verificationFilter.addEventListener('change', applyFilters);
    
    // Search functionality
    let searchTimeout;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchTerm = this.value;
                console.log('Search term updated:', searchTerm);
                applyAllFilters();
            }, 500);
        });
        
        // Add clear search button
        const searchClearBtn = document.createElement('button');
        searchClearBtn.innerHTML = '<i class="fas fa-times"></i>';
        searchClearBtn.className = 'absolute right-10 top-3 text-gray-400 hover:text-gray-600 cursor-pointer';
        searchClearBtn.title = 'Clear search';
        searchClearBtn.onclick = function() {
            document.getElementById('searchInput').value = '';
            searchTerm = '';
            applyAllFilters();
        };
        searchInput.parentNode.appendChild(searchClearBtn);
    }
    
    // ============================================
    // VERIFICATION MODAL EVENT LISTENERS
    // ============================================
    
    const verificationModal = document.getElementById('verificationModal');
    const cancelVerificationBtn = document.getElementById('cancelVerification');
    const submitVerificationBtn = document.getElementById('submitVerification');
    const actionRadios = document.querySelectorAll('input[name="verificationAction"]');
    
    // Close verification modal when clicking outside
    if (verificationModal) {
        verificationModal.addEventListener('click', function(e) {
            if (e.target === verificationModal) {
                closeVerificationModal();
            }
        });
    }
    
    // Cancel verification button
    if (cancelVerificationBtn) {
        cancelVerificationBtn.addEventListener('click', closeVerificationModal);
    }
    
    // Submit verification button
    if (submitVerificationBtn) {
        submitVerificationBtn.addEventListener('click', submitVerification);
    }
    
    // Radio button changes - enable/disable submit button
    if (actionRadios.length > 0) {
        actionRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                updateVerificationSubmitButton();
            });
        });
    }
    
    // Close modals when clicking outside (updated with verification modal)
    window.addEventListener('click', (e) => {
        const modals = ['productDetailModal', 'editProductModal', 'successPopup', 'verificationModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && e.target === modal) {
                if (modalId === 'verificationModal') {
                    closeVerificationModal();
                } else if (modalId === 'editProductModal') {
                    modal.style.display = 'none';
                    resetEditForm();
                } else {
                    modal.style.display = 'none';
                }
            }
        });
    });
    
    // Keyboard shortcuts for verification modal
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('verificationModal');
        if (modal && !modal.classList.contains('hidden')) {
            if (e.key === 'Enter') {
                const submitBtn = document.getElementById('submitVerification');
                if (submitBtn && !submitBtn.disabled) {
                    submitVerification();
                }
            } else if (e.key === 'Escape') {
                closeVerificationModal();
            }
        }
    });
    
    // ============================================
    // LOGOUT MODAL EVENT LISTENERS
    // ============================================
    
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');
    const closeLogoutModal = document.getElementById('closeLogoutModal');
    
    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutModal.classList.remove('hidden');
        });
    }
    
    function closeLogout() {
        if (logoutModal) logoutModal.classList.add('hidden');
    }
    
    if (cancelLogout) cancelLogout.addEventListener('click', closeLogout);
    if (closeLogoutModal) closeLogoutModal.addEventListener('click', closeLogout);
    if (logoutModal) {
        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) closeLogout();
        });
    }
    
    if (confirmLogout) {
        confirmLogout.addEventListener('click', () => {
            window.location.href = '../Login/login.html';
        });
    }
    
    console.log('Event listeners setup complete including verification modal');
}

// ============================================
// VERIFICATION MODAL FUNCTIONS (Add these to your file)
// ============================================

let currentVerificationProduct = null;

function showVerificationModal(product, action = null) {
    console.log('Showing verification modal for:', product.productName);
    
    currentVerificationProduct = product;
    
    const modal = document.getElementById('verificationModal');
    const productName = document.getElementById('verificationProductName');
    const sku = document.getElementById('verificationSku');
    const category = document.getElementById('verificationCategory');
    const brand = document.getElementById('verificationBrand');
    const status = document.getElementById('verificationStatus');
    const actionRadios = document.querySelectorAll('input[name="verificationAction"]');
    const submitBtn = document.getElementById('submitVerification');
        // const notes = document.getElementById('verificationNotes');
    const modalTitle = document.getElementById('verificationModalTitle');
    
    if (!modal) {
        console.error('Verification modal not found!');
        return;
    }
    
    // Update product info
    productName.textContent = product.productName || 'N/A';
    sku.textContent = product.sku || 'N/A';
    category.textContent = product.productCategory || 'N/A';
    brand.textContent = product.brandName || 'N/A';
    
    // Update status badge
    const verificationStatus = product.approved === true ? 'APPROVED' : 
                               product.approved === false ? 'REJECTED' : 'PENDING';
    status.innerHTML = `<span class="px-2 py-1 rounded-full text-xs font-medium ${
        verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
        verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
    }">${verificationStatus}</span>`;
    
    // Reset form
    actionRadios.forEach(radio => {
        radio.checked = false;
    });
    
    // notes.value = '';
    submitBtn.disabled = true;
    
    // Set modal title
    if (action === 'APPROVE') {
        modalTitle.textContent = 'Approve Product';
    } else if (action === 'REJECT') {
        modalTitle.textContent = 'Reject Product';
    } else {
        modalTitle.textContent = 'Verify Product';
    }
    
    // If a specific action is passed (from clicking approve/reject buttons), pre-select it
    if (action === 'APPROVE') {
        const approveRadio = document.querySelector('input[value="APPROVE"]');
        if (approveRadio) {
            approveRadio.checked = true;
            updateVerificationSubmitButton();
        }
    } else if (action === 'REJECT') {
        const rejectRadio = document.querySelector('input[value="REJECT"]');
        if (rejectRadio) {
            rejectRadio.checked = true;
            updateVerificationSubmitButton();
        }
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Focus on first radio button
    setTimeout(() => {
        if (actionRadios.length > 0) {
            actionRadios[0].focus();
        }
    }, 100);
}

function updateVerificationSubmitButton() {
    const actionRadios = document.querySelectorAll('input[name="verificationAction"]');
    const submitBtn = document.getElementById('submitVerification');
    
    if (!submitBtn) return;
    
    const hasSelection = Array.from(actionRadios).some(radio => radio.checked);
    submitBtn.disabled = !hasSelection;
    
    // Update button text and color based on selected action
    const selectedAction = Array.from(actionRadios).find(radio => radio.checked);
    if (selectedAction) {
        if (selectedAction.value === 'APPROVE') {
            submitBtn.textContent = 'Approve Product';
            submitBtn.className = 'flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
        } else {
            submitBtn.textContent = 'Reject Product';
            submitBtn.className = 'flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
        }
    }
}

function closeVerificationModal() {
    const modal = document.getElementById('verificationModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentVerificationProduct = null;
}

async function submitVerification() {
    if (!currentVerificationProduct) {
        showSuccessPopup('No product selected for verification', 'error');
        return;
    }
    
    const actionRadios = document.querySelectorAll('input[name="verificationAction"]');
    const selectedAction = Array.from(actionRadios).find(radio => radio.checked);
    
    if (!selectedAction) {
        showSuccessPopup('Please select an action', 'error');
        return;
    }
    
    const action = selectedAction.value;
    // const notes = document.getElementById('verificationNotes')?.value.trim() || '';
    const productId = currentVerificationProduct.productId;
    const productName = currentVerificationProduct.productName;
    
    console.log(`Submitting verification for product ${productId} (${productName}): ${action}`);
    // console.log('Notes:', notes);
    
    try {
        // Show loading state
        const submitBtn = document.getElementById('submitVerification');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        submitBtn.disabled = true;
        
        // Call verification API
        await verificationService.verifyProduct(productId, action);
        
        // Show success message
        const actionText = action === 'APPROVE' ? 'approved' : 'rejected';
        showSuccessPopup(`"${productName}" ${actionText} successfully!`);
        
        // Close modal
        closeVerificationModal();
        
        // Reload products to reflect changes
        await loadProducts();
        
    } catch (error) {
        console.error(`Error ${action.toLowerCase()}ing product:`, error);
        showSuccessPopup(`Error: ${error.message}`, 'error');
        
        // Reset button
        const submitBtn = document.getElementById('submitVerification');
        if (submitBtn) {
            submitBtn.textContent = action === 'APPROVE' ? 'Approve Product' : 'Reject Product';
            submitBtn.disabled = false;
        }
    }
}

// ============================================
// UPDATE TABLE ROW EVENT LISTENERS
// ============================================

// Update the attachTableEventListeners() function to use the new modal
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
    
   // Verify/Approve buttons (for pending products)
    document.querySelectorAll('.verify-btn').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            console.log('Verify/Approve button clicked for product ID:', productId);
            const product = filteredProducts.find(p => p.productId == productId);
            if (product) {
                showVerificationModal(product, 'APPROVE');
            }
        });
    });
    
    // Reject buttons (for pending products)
    document.querySelectorAll('.reject-btn').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            console.log('Reject button clicked for product ID:', productId);
            const product = filteredProducts.find(p => p.productId == productId);
            if (product) {
                showVerificationModal(product, 'REJECT');
            }
        });
    });
    
    // Unapprove buttons (for approved products)
    document.querySelectorAll('.unapprove-btn').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            console.log('Unapprove button clicked for product ID:', productId);
            const product = filteredProducts.find(p => p.productId == productId);
            if (product) {
                showVerificationModal(product, 'REJECT');
            }
        });
    });
    
    // Re-approve buttons (for rejected products) - UPDATED to use modal
    document.querySelectorAll('.reapprove-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            const product = filteredProducts.find(p => p.productId == productId);
            if (product) {
                console.log('Re-approve button clicked for product:', product.productName);
                showVerificationModal(product, 'APPROVE');
            }
        });
    });
}

// ============================================
// VERIFICATION FUNCTIONS
// ============================================


function showVerificationModal(product, action = null) {
    console.log('Showing verification modal for:', product.productName);
    
    currentVerificationProduct = product;
    
    const modal = document.getElementById('verificationModal');
    const productName = document.getElementById('verificationProductName');
    const sku = document.getElementById('verificationSku');
    const category = document.getElementById('verificationCategory');
    const brand = document.getElementById('verificationBrand');
    const status = document.getElementById('verificationStatus');
    const actionRadios = document.querySelectorAll('input[name="verificationAction"]');
    const submitBtn = document.getElementById('submitVerification');
    // const notes = document.getElementById('verificationNotes');
    const modalTitle = document.getElementById('verificationModalTitle');
    
    if (!modal) {
        console.error('Verification modal not found!');
        return;
    }
    
    // Update product info
    productName.textContent = product.productName || 'N/A';
    sku.textContent = product.sku || 'N/A';
    category.textContent = product.productCategory || 'N/A';
    brand.textContent = product.brandName || 'N/A';
    
    // Update status badge
    const verificationStatus = product.approved === true ? 'APPROVED' : 
                               product.approved === false ? 'REJECTED' : 'PENDING';
    status.innerHTML = `<span class="px-2 py-1 rounded-full text-xs font-medium ${
        verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
        verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
    }">${verificationStatus}</span>`;
    
    // Reset form
    actionRadios.forEach(radio => {
        radio.checked = false;
    });
    
    // notes.value = '';
    submitBtn.disabled = true;
    
    // Set modal title
    if (action === 'APPROVE') {
        modalTitle.textContent = 'Approve Product';
    } else if (action === 'REJECT') {
        modalTitle.textContent = 'Reject Product';
    } else {
        modalTitle.textContent = 'Verify Product';
    }
    
    // If a specific action is passed (from clicking approve/reject buttons), pre-select it
    if (action === 'APPROVE') {
        const approveRadio = document.querySelector('input[value="APPROVE"]');
        if (approveRadio) {
            approveRadio.checked = true;
            updateVerificationSubmitButton();
        }
    } else if (action === 'REJECT') {
        const rejectRadio = document.querySelector('input[value="REJECT"]');
        if (rejectRadio) {
            rejectRadio.checked = true;
            updateVerificationSubmitButton();
        }
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Focus on first radio button
    setTimeout(() => {
        if (actionRadios.length > 0) {
            actionRadios[0].focus();
        }
    }, 100);
}

function updateSubmitButton() {
    const actionRadios = document.querySelectorAll('input[name="verificationAction"]');
    const submitBtn = document.getElementById('submitVerification');
    const hasSelection = Array.from(actionRadios).some(radio => radio.checked);
    
    submitBtn.disabled = !hasSelection;
    
    // Update button text based on selected action
    const selectedAction = Array.from(actionRadios).find(radio => radio.checked);
    if (selectedAction) {
        submitBtn.textContent = selectedAction.value === 'APPROVE' ? 'Approve Product' : 'Reject Product';
        submitBtn.className = submitBtn.className.replace(/bg-(blue|red|green)-\d+/, 
            selectedAction.value === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700');
    }
}

function updateVerificationSubmitButton() {
    const actionRadios = document.querySelectorAll('input[name="verificationAction"]');
    const submitBtn = document.getElementById('submitVerification');
    
    if (!submitBtn) return;
    
    const hasSelection = Array.from(actionRadios).some(radio => radio.checked);
    submitBtn.disabled = !hasSelection;
    
    // Update button text and color based on selected action
    const selectedAction = Array.from(actionRadios).find(radio => radio.checked);
    if (selectedAction) {
        if (selectedAction.value === 'APPROVE') {
            submitBtn.textContent = 'Approve Product';
            submitBtn.className = 'flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
        } else {
            submitBtn.textContent = 'Reject Product';
            submitBtn.className = 'flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
        }
    }
}

function closeVerificationModal() {
    const modal = document.getElementById('verificationModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentVerificationProduct = null;
}

async function submitVerification() {
    if (!currentVerificationProduct) {
        showSuccessPopup('No product selected for verification', 'error');
        return;
    }
    
    const actionRadios = document.querySelectorAll('input[name="verificationAction"]');
    const selectedAction = Array.from(actionRadios).find(radio => radio.checked);
    
    if (!selectedAction) {
        showSuccessPopup('Please select an action', 'error');
        return;
    }
    
    const action = selectedAction.value;
    // const notes = document.getElementById('verificationNotes')?.value.trim() || '';
    const productId = currentVerificationProduct.productId;
    const productName = currentVerificationProduct.productName;
    
    console.log(`Submitting verification for product ${productId} (${productName}): ${action}`);
    console.log('Notes:');
    
    try {
        // Show loading state
        const submitBtn = document.getElementById('submitVerification');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        submitBtn.disabled = true;
        
        // Call verification API
        await verificationService.verifyProduct(productId, action);
        
        // Show success message
        const actionText = action === 'APPROVE' ? 'approved' : 'rejected';
        showSuccessPopup(`"${productName}" ${actionText} successfully!`);
        
        // Close modal
        closeVerificationModal();
        
        // Reload products to reflect changes
        await loadProducts();
        
    } catch (error) {
        console.error(`Error ${action.toLowerCase()}ing product:`, error);
        showSuccessPopup(`Error: ${error.message}`, 'error');
        
        // Reset button
        const submitBtn = document.getElementById('submitVerification');
        if (submitBtn) {
            submitBtn.textContent = action === 'APPROVE' ? 'Approve Product' : 'Reject Product';
            submitBtn.disabled = false;
        }
    }
}



async function submitVerification() {
    if (!currentVerificationProduct) {
        showSuccessPopup('No product selected for verification', 'error');
        return;
    }
    
    const actionRadios = document.querySelectorAll('input[name="verificationAction"]');
    const selectedAction = Array.from(actionRadios).find(radio => radio.checked);
    
    if (!selectedAction) {
        showSuccessPopup('Please select an action', 'error');
        return;
    }
    
    const action = selectedAction.value;
    // const notes = document.getElementById('verificationNotes').value.trim();
    const productId = currentVerificationProduct.productId;
    
    console.log(`Submitting verification for product ${productId}: ${action}`);
    console.log('Notes:');
    
    try {
        // Show loading state
        const submitBtn = document.getElementById('submitVerification');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        submitBtn.disabled = true;
        
        // Call verification API
        await verificationService.verifyProduct(productId, action);
        
        // Show success message
        const actionText = action === 'APPROVE' ? 'approved' : 'rejected';
        showSuccessPopup(`Product ${actionText} successfully!`);
        
        // Close modal
        closeVerificationModal();
        
        // Reload products to reflect changes
        await loadProducts();
        
    } catch (error) {
        console.error(`Error ${action.toLowerCase()}ing product:`, error);
        showSuccessPopup(`Error: ${error.message}`, 'error');
        
        // Reset button
        const submitBtn = document.getElementById('submitVerification');
        submitBtn.textContent = action === 'APPROVE' ? 'Approve Product' : 'Reject Product';
        submitBtn.disabled = false;
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
                : `http://localhost:8083${productDetails.productMainImage}`;
        }
        
        if (productDetails.productSubImages && Array.isArray(productDetails.productSubImages)) {
            productDetails.productSubImages = productDetails.productSubImages.map(img => {
                if (!img) return null;
                return img.startsWith('http') ? img : 
                       (img.startsWith('/') ? `http://localhost:8083${img}` : `http://localhost:8083${img}`);
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
// In showProductDetails() function (around line 2192)
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
        console.log('=== FORM SUBMISSION STARTED ===');
        
        // Get price data
        const priceData = getPriceData();
        
        // Get sizes
        const sizesInput = document.getElementById('edit-sizes').value.trim();
        const sizes = sizesInput ? sizesInput.split(',').map(s => s.trim()).filter(s => s) : [];
        
        // Get benefits, directions, ingredients
        const benefits = document.getElementById('edit-benefits').value
            .split('\n')
            .filter(b => b.trim())
            .map(b => b.trim());
            
        // Directions is optional
        const directionsInput = document.getElementById('edit-directions');
        const directions = directionsInput ? directionsInput.value
            .split('\n')
            .filter(d => d.trim())
            .map(d => d.trim()) : [];
            
        const ingredients = document.getElementById('edit-ingredients').value
            .split(',')
            .filter(i => i.trim())
            .map(i => i.trim());

        // Prepare product data - EXACTLY matching backend ProductRequestDto
        const productData = {
            // Basic information
            sku: document.getElementById('edit-sku').value.trim(),
            productName: document.getElementById('edit-name').value.trim(),
            productCategory: document.getElementById('edit-category').value === 'Other' 
                ? document.getElementById('edit-category-other').value.trim()
                : document.getElementById('edit-category').value,
            productSubCategory: document.getElementById('edit-type').value === 'Other'
                ? document.getElementById('edit-type-other').value.trim()
                : document.getElementById('edit-type').value,
            brandName: document.getElementById('edit-brand').value.trim(),
            productDescription: document.getElementById('edit-description').value.trim(),
            
            // Stock & pricing
            productPrice: priceData.prices.map(price => price.toString()), // Convert to string for BigDecimal
            productOldPrice: priceData.oldPrices ? 
                priceData.oldPrices.map(price => price ? price.toString() : null) : [],
            productQuantity: parseInt(document.getElementById('edit-quantity').value) || 0,
            
            // Status & requirements
            productStatus: document.getElementById('edit-status').value,
            prescriptionRequired: document.getElementById('edit-prescription').value === 'Yes',
            
            // Dates & batch
            mfgDate: document.getElementById('edit-mfg-date').value,
            expDate: document.getElementById('edit-expiry').value,
            batchNo: document.getElementById('edit-batch').value.trim(),
            
            // Rating
            rating: parseFloat(document.getElementById('edit-rating').value) || 0,
            
            // Lists
            benefitsList: benefits,
            ingredientsList: ingredients,
            directionsList: directions,
            productSizes: sizes,
            
            // Dynamic fields
            productDynamicFields: {
                strength: document.getElementById('edit-strength').value.trim() || '',
                form: document.getElementById('edit-form').value.trim() || '',
                dosage: document.getElementById('edit-dosage').value.trim() || '',
                unit: 'Tablet Strip' // Default value
            }
        };

        console.log('Product data to be sent:', JSON.stringify(productData, null, 2));
        
        // Validation (matches backend validation)
        if (!productData.sku || !productData.productName) {
            showSuccessPopup('SKU and Product Name are required', 'error');
            return;
        }
        
        if (!productData.productCategory || !productData.productSubCategory) {
            showSuccessPopup('Category and Subcategory are required', 'error');
            return;
        }
        
        if (productData.productPrice.length === 0) {
            showSuccessPopup('At least one price is required', 'error');
            return;
        }
        
        // Check for negative prices
        if (productData.productPrice.some(price => parseFloat(price) <= 0)) {
            showSuccessPopup('All prices must be greater than zero', 'error');
            return;
        }
        
        // Check quantity
        if (productData.productQuantity < 0) {
            showSuccessPopup('Quantity must be non-negative', 'error');
            return;
        }

        // Create FormData
        const formData = new FormData();
        
        // IMPORTANT: Convert productData to JSON string with the key 'productData'
        formData.append('productData', JSON.stringify(productData));
        
        // Get and validate main image (REQUIRED for new products)
        const mainImageInput = document.getElementById('edit-main-image');
        if (mainImageInput && mainImageInput.files && mainImageInput.files[0]) {
            formData.append('productMainImage', mainImageInput.files[0]);
            console.log('Main image attached:', mainImageInput.files[0].name);
        } else if (!currentProductId) {
            // Only require image for new products (backend requires it for create)
            showSuccessPopup('Main product image is required for new products', 'error');
            return;
        } else {
            // For updates, you might want to handle this differently
            console.log('No new main image provided for update');
        }
        
        // Get sub images (optional)
        for (let i = 1; i <= 4; i++) {
            const subImageInput = document.getElementById(`edit-image${i}`);
            if (subImageInput && subImageInput.files && subImageInput.files[0]) {
                formData.append('productSubImages', subImageInput.files[0]);
                console.log(`Sub image ${i} attached:`, subImageInput.files[0].name);
            }
        }

        // Log form data for debugging
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
            if (key === 'productData') {
                console.log('productData (JSON):', JSON.parse(value));
            } else {
                console.log(`${key}:`, value.name || value);
            }
        }

        // Make API call
        let response;
        const url = currentProductId 
            ? `${API_BASE_URL}/patch-product/${currentProductId}`
            : `${API_BASE_URL}/create-product`;
        
        const method = currentProductId ? 'PATCH' : 'POST';
        
        console.log(`${method} request to: ${url}`);
        
        response = await fetch(url, {
            method: method,
            body: formData
        });

        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);

        if (!response.ok) {
            let errorText = 'Unknown error';
            try {
                errorText = await response.text();
                console.error('Error response body:', errorText);
                
                // Try to parse as JSON for structured error
                try {
                    const errorJson = JSON.parse(errorText);
                    errorText = errorJson.message || JSON.stringify(errorJson);
                } catch (e) {
                    // Not JSON, keep as text
                }
            } catch (e) {
                console.log('Could not read error response:', e);
                errorText = `Status: ${response.status} ${response.statusText}`;
            }
            throw new Error(`Failed to ${currentProductId ? 'update' : 'create'} product: ${errorText}`);
        }

        // Handle success
        const responseText = await response.text();
        console.log('Success response:', responseText);
        
        let result = {};
        if (responseText) {
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.log('Response is not JSON:', responseText);
                // Even if not JSON, it might be success
                result = { success: true, message: responseText };
            }
        }

        showSuccessPopup(currentProductId ? 
            'Product updated successfully!' : 
            'Product added successfully! It is now pending verification.');

        // Close modal and reset
        const editProductModal = document.getElementById('editProductModal');
        if (editProductModal) editProductModal.style.display = 'none';
        
        resetEditForm();
        
        // Reload products
        await loadProducts();
        
    } catch (error) {
        console.error('Error in handleFormSubmit:', error);
        console.error('Error stack:', error.stack);
        showSuccessPopup(error.message || 'Error saving product. Check console for details.', 'error');
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
    if (formData.prices.length === 0) {
        showSuccessPopup('At least one price must be specified.', 'error');
        return false;
    }
    
    for (let i = 0; i < formData.prices.length; i++) {
        if (isNaN(formData.prices[i]) || formData.prices[i] < 0) {
            showSuccessPopup('All prices must be valid non-negative numbers.', 'error');
            return false;
        }
    }
    
    return true;
}

// ============================================
// EVENT HANDLERS - UPDATED FOR SEARCH AND FILTERS
// ============================================

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Sidebar toggle buttons
    const toggleSidebarLogo = document.getElementById('toggle-sidebar-logo');
    const closeSidebar = document.getElementById('close-sidebar');
    const toggleSidebarMobile = document.getElementById('toggle-sidebar-mobile');
    const toggleSidebarDesktop = document.getElementById('toggle-sidebar-desktop');
    
    if (toggleSidebarLogo) toggleSidebarLogo.addEventListener('click', toggleSidebar);
    if (closeSidebar) closeSidebar.addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('translate-x-0');
    });
    if (toggleSidebarMobile) toggleSidebarMobile.addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('translate-x-0');
    });
    if (toggleSidebarDesktop) toggleSidebarDesktop.addEventListener('click', toggleSidebar);
    
    // Modal close buttons
    const closeDetailModal = document.getElementById('closeDetailModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const closeSuccessPopup = document.getElementById('closeSuccessPopup');
    
    if (closeDetailModal) closeDetailModal.addEventListener('click', () => {
        const modal = document.getElementById('productDetailModal');
        if (modal) modal.style.display = 'none';
    });
    
    if (closeEditModal) closeEditModal.addEventListener('click', () => {
        const modal = document.getElementById('editProductModal');
        if (modal) {
            modal.style.display = 'none';
            resetEditForm();
        }
    });
    
    if (cancelEdit) cancelEdit.addEventListener('click', () => {
        const modal = document.getElementById('editProductModal');
        if (modal) {
            modal.style.display = 'none';
            resetEditForm();
        }
    });
    
    if (closeSuccessPopup) closeSuccessPopup.addEventListener('click', () => {
        const popup = document.getElementById('successPopup');
        if (popup) popup.style.display = 'none';
    });
    
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openEditModal();  // No parameter for new product
        });
    }
    
    // Form submissions
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Category change handlers
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            populateSubcategoryDropdown(this.value);
            applyFilters();
        });
    }
    
    const editCategory = document.getElementById('edit-category');
    if (editCategory) {
        editCategory.addEventListener('change', function() {
            const otherContainer = document.getElementById('category-other-container');
            const otherInput = document.getElementById('edit-category-other');
            
            if (this.value === 'Other') {
                if (otherContainer) otherContainer.classList.remove('hidden');
                if (otherInput) otherInput.required = true;
            } else {
                if (otherContainer) otherContainer.classList.add('hidden');
                if (otherInput) {
                    otherInput.required = false;
                    otherInput.value = '';
                }
            }
            
            populateSubcategoryDropdown(this.value);
        });
    }
    
    const editType = document.getElementById('edit-type');
    if (editType) {
        editType.addEventListener('change', function() {
            const otherContainer = document.getElementById('type-other-container');
            const otherInput = document.getElementById('edit-type-other');
            
            if (this.value === 'Other') {
                if (otherContainer) otherContainer.classList.remove('hidden');
                if (otherInput) otherInput.required = true;
            } else {
                if (otherContainer) otherContainer.classList.add('hidden');
                if (otherInput) {
                    otherInput.required = false;
                    otherInput.value = '';
                }
            }
        });
    }
    
    // Filters
    const subcategoryFilter = document.getElementById('subcategoryFilter');
    const prescriptionFilter = document.getElementById('prescriptionFilter');
    const stockFilter = document.getElementById('stockFilter');
    const verificationFilter = document.getElementById('verificationFilter');
    
    if (subcategoryFilter) subcategoryFilter.addEventListener('change', applyFilters);
    if (prescriptionFilter) prescriptionFilter.addEventListener('change', applyFilters);
    if (stockFilter) stockFilter.addEventListener('change', applyFilters);
    if (verificationFilter) verificationFilter.addEventListener('change', applyFilters);
    
    // Search functionality
    let searchTimeout;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchTerm = this.value;
                console.log('Search term updated:', searchTerm);
                applyAllFilters();
            }, 500);
        });
        
        // Add clear search button
        const searchClearBtn = document.createElement('button');
        searchClearBtn.innerHTML = '<i class="fas fa-times"></i>';
        searchClearBtn.className = 'absolute right-10 top-3 text-gray-400 hover:text-gray-600 cursor-pointer';
        searchClearBtn.title = 'Clear search';
        searchClearBtn.onclick = function() {
            document.getElementById('searchInput').value = '';
            searchTerm = '';
            applyAllFilters();
        };
        searchInput.parentNode.appendChild(searchClearBtn);
    }
    
    // ============================================
    // VERIFICATION MODAL EVENT LISTENERS
    // ============================================
    
    const verificationModal = document.getElementById('verificationModal');
    const cancelVerificationBtn = document.getElementById('cancelVerification');
    const submitVerificationBtn = document.getElementById('submitVerification');
    const actionRadios = document.querySelectorAll('input[name="verificationAction"]');
    
    // Close verification modal when clicking outside
    if (verificationModal) {
        verificationModal.addEventListener('click', function(e) {
            if (e.target === verificationModal) {
                closeVerificationModal();
            }
        });
    }
    
    // Cancel verification button
    if (cancelVerificationBtn) {
        cancelVerificationBtn.addEventListener('click', closeVerificationModal);
    }
    
    // Submit verification button
    if (submitVerificationBtn) {
        submitVerificationBtn.addEventListener('click', submitVerification);
    }
    
    // Radio button changes - enable/disable submit button
    if (actionRadios.length > 0) {
        actionRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                updateVerificationSubmitButton();
            });
        });
    }
    
    // Close modals when clicking outside (updated with verification modal)
    window.addEventListener('click', (e) => {
        const modals = ['productDetailModal', 'editProductModal', 'successPopup', 'verificationModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && e.target === modal) {
                if (modalId === 'verificationModal') {
                    closeVerificationModal();
                } else if (modalId === 'editProductModal') {
                    modal.style.display = 'none';
                    resetEditForm();
                } else {
                    modal.style.display = 'none';
                }
            }
        });
    });
    
    // Keyboard shortcuts for verification modal
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('verificationModal');
        if (modal && !modal.classList.contains('hidden')) {
            if (e.key === 'Enter') {
                const submitBtn = document.getElementById('submitVerification');
                if (submitBtn && !submitBtn.disabled) {
                    submitVerification();
                }
            } else if (e.key === 'Escape') {
                closeVerificationModal();
            }
        }
    });
    
    // ============================================
    // LOGOUT MODAL EVENT LISTENERS
    // ============================================
    
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');
    const closeLogoutModal = document.getElementById('closeLogoutModal');
    
    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutModal.classList.remove('hidden');
        });
    }
    
    function closeLogout() {
        if (logoutModal) logoutModal.classList.add('hidden');
    }
    
    if (cancelLogout) cancelLogout.addEventListener('click', closeLogout);
    if (closeLogoutModal) closeLogoutModal.addEventListener('click', closeLogout);
    if (logoutModal) {
        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) closeLogout();
        });
    }
    
    if (confirmLogout) {
        confirmLogout.addEventListener('click', () => {
            window.location.href = '../Login/login.html';
        });
    }
    
    console.log('Event listeners setup complete including verification modal');
}

// Helper function to reset edit form
function resetEditForm() {
    const editForm = document.getElementById('editProductForm');
    if (editForm) editForm.reset();
    
    const editCategory = document.getElementById('edit-category');
    const editType = document.getElementById('edit-type');
    
    if (editCategory) editCategory.value = '';
    if (editType) {
        editType.value = '';
        editType.disabled = true;
    }
    
    // Reset other containers
    const categoryOtherContainer = document.getElementById('category-other-container');
    const typeOtherContainer = document.getElementById('type-other-container');
    
    if (categoryOtherContainer) categoryOtherContainer.classList.add('hidden');
    if (typeOtherContainer) typeOtherContainer.classList.add('hidden');
    
    // Reset price type to single
    const priceTypeSelect = document.getElementById('edit-price-type');
    if (priceTypeSelect) {
        priceTypeSelect.value = 'single';
        // Trigger the change event to update UI
        priceTypeSelect.dispatchEvent(new Event('change'));
    }
    
    // Clear dynamic fields safely
    const dynamicFields = ['edit-strength', 'edit-form', 'edit-dosage', 'edit-directions', 'edit-sizes'];
    dynamicFields.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Clear image inputs safely
    const imageInputs = ['edit-main-image', 'edit-image1', 'edit-image2', 'edit-image3', 'edit-image4'];
    imageInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
    
    // Clear price items container safely
    const priceItemsContainer = document.querySelector('.price-items-container');
    if (priceItemsContainer) {
        // Keep only the first row (template row)
        const rows = priceItemsContainer.querySelectorAll('.price-item-row');
        rows.forEach((row, index) => {
            if (index > 0) {
                row.remove();
            }
        });
        
        // Clear inputs in the first row
        const firstRow = priceItemsContainer.querySelector('.price-item-row');
        if (firstRow) {
            const inputs = firstRow.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = '';
            });
        }
    }
    
    // Clear optional single price fields
    const priceFields = ['edit-price', 'edit-mrp', 'edit-old-price'];
    priceFields.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
}

// Update your existing openEditModal function (around line 408)
function openEditModal(product = null) {
    console.log('Opening edit modal...');
    
    try {
        const editProductModal = document.getElementById('editProductModal');
        const modalTitle = document.getElementById('editModalTitle');
        
        // CRITICAL: Check if modal exists
        if (!editProductModal) {
            console.error('❌ Edit modal not found in DOM!');
            showSuccessPopup('Error: Edit form not available', 'error');
            return;
        }
        
        if (!modalTitle) {
            console.error('❌ Modal title not found!');
        }
        
        // Show modal FIRST so elements are in DOM
        editProductModal.style.display = 'flex';
        
        if (product && product.productId) {
            // EDIT MODE
            modalTitle.textContent = 'Edit Product';
            currentProductId = product.productId;
            
            console.log('✅ Loading product data for editing:', product.productName);
            console.log('📊 Product data:', product);
            
            // Reset form
            resetEditForm();
            
            // Wait for modal to be fully rendered and form reset
            setTimeout(() => {
                try {
                    // SAFE: Function to set value only if element exists
                    function safeSetValue(elementId, value) {
                        try {
                            const element = document.getElementById(elementId);
                            if (element) {
                                element.value = value;
                                console.log(`✅ Set ${elementId} = "${value}"`);
                                return true;
                            } else {
                                console.warn(`⚠️ Element "${elementId}" not found in DOM`);
                                return false;
                            }
                        } catch (error) {
                            console.error(`❌ Error setting ${elementId}:`, error);
                            return false;
                        }
                    }
                    
                    // BASIC FIELDS - Only set what definitely exists
                    const basicFields = [
                        { id: 'edit-sku', value: product.sku || '' },
                        { id: 'edit-name', value: product.productName || '' },
                        { id: 'edit-brand', value: product.brandName || '' },
                        { id: 'edit-prescription', value: product.prescriptionRequired ? 'Yes' : 'No' },
                        { id: 'edit-status', value: product.productStatus || 'Available' },
                        { id: 'edit-quantity', value: product.productQuantity || 0 },
                        { id: 'edit-rating', value: product.rating || 0 },
                        { id: 'edit-batch', value: product.batchNo || '' }
                    ];
                    
                    // Set basic fields
                    basicFields.forEach(field => safeSetValue(field.id, field.value));
                    
                    // Handle dates
                    const mfgDate = product.mfgDate ? product.mfgDate.split('T')[0] : '';
                    const expDate = product.expDate ? product.expDate.split('T')[0] : '';
                    safeSetValue('edit-mfg-date', mfgDate);
                    safeSetValue('edit-expiry', expDate);
                    
                    // Text areas and optional fields
                    safeSetValue('edit-description', product.productDescription || '');
                    safeSetValue('edit-benefits', (product.benefitsList || []).join('\n'));
                    safeSetValue('edit-ingredients', (product.ingredientsList || []).join(', '));
                    
                    // Optional: directions field
                    const directionsElement = document.getElementById('edit-directions');
                    if (directionsElement) {
                        directionsElement.value = (product.directionsList || []).join('\n');
                    }
                    
                    // Dynamic fields
                    if (product.productDynamicFields) {
                        safeSetValue('edit-strength', product.productDynamicFields.strength || '');
                        safeSetValue('edit-form', product.productDynamicFields.form || '');
                        safeSetValue('edit-dosage', product.productDynamicFields.dosage || '');
                    }
                    
                    // Handle category
                    const categorySelect = document.getElementById('edit-category');
                    if (categorySelect) {
                        if (product.productCategory && allCategories.includes(product.productCategory)) {
                            categorySelect.value = product.productCategory;
                            console.log(`✅ Set category: ${product.productCategory}`);
                        } else if (product.productCategory) {
                            categorySelect.value = 'Other';
                            const categoryOtherInput = document.getElementById('edit-category-other');
                            if (categoryOtherInput) {
                                categoryOtherInput.value = product.productCategory;
                                categoryOtherInput.required = true;
                                const categoryOtherContainer = document.getElementById('category-other-container');
                                if (categoryOtherContainer) {
                                    categoryOtherContainer.classList.remove('hidden');
                                }
                            }
                        }
                        
                        // Enable subcategory dropdown
                        populateSubcategoryDropdown(categorySelect.value);
                    }
                    
                    // Handle subcategory
                    const typeSelect = document.getElementById('edit-type');
                    if (typeSelect && product.productSubCategory) {
                        if (allSubcategories.includes(product.productSubCategory)) {
                            typeSelect.value = product.productSubCategory;
                            console.log(`✅ Set subcategory: ${product.productSubCategory}`);
                        } else {
                            typeSelect.value = 'Other';
                            const typeOtherInput = document.getElementById('edit-type-other');
                            if (typeOtherInput) {
                                typeOtherInput.value = product.productSubCategory;
                                typeOtherInput.required = true;
                                const typeOtherContainer = document.getElementById('type-other-container');
                                if (typeOtherContainer) {
                                    typeOtherContainer.classList.remove('hidden');
                                }
                            }
                        }
                    }
                    
                    // Handle pricing - SIMPLIFIED
                    const sizes = product.productSizes || [];
                    const prices = product.productPrice || [];
                    const oldPrices = product.productOldPrice || [];
                    
                    console.log('💰 Pricing data:', { sizes, prices, oldPrices });
                    
                    // Check if we should use multiple prices
                    const shouldUseMultiplePrices = 
                        (prices && Array.isArray(prices) && prices.length > 1) ||
                        (sizes && sizes.length > 1);
                    
                    const priceTypeSelect = document.getElementById('edit-price-type');
                    if (priceTypeSelect) {
                        if (shouldUseMultiplePrices) {
                            priceTypeSelect.value = 'multiple';
                            console.log('💰 Using multiple price mode');
                            
                            // Wait for UI to update, then populate price data
                            setTimeout(() => {
                                const priceList = sizes.map((size, index) => ({
                                    variant: size,
                                    price: prices[index] || 0,
                                    originalPrice: oldPrices[index] || 0
                                }));
                                
                                populatePriceData(priceList, prices[0], oldPrices[0]);
                            }, 200);
                        } else {
                            priceTypeSelect.value = 'single';
                            console.log('💰 Using single price mode');
                            
                            // Set single price
                            safeSetValue('edit-price', prices && prices.length > 0 ? prices[0] : '');
                            safeSetValue('edit-old-price', oldPrices && oldPrices.length > 0 ? oldPrices[0] : '');
                        }
                        
                        // Trigger change event
                        setTimeout(() => {
                            priceTypeSelect.dispatchEvent(new Event('change'));
                        }, 100);
                    }
                    
                    // Handle sizes
                    const sizesElement = document.getElementById('edit-sizes');
                    if (sizesElement) {
                        sizesElement.value = sizes.join(', ');
                    }
                    
                    // Verification status
                    const verificationStatusSelect = document.getElementById('edit-verification-status');
                    if (verificationStatusSelect) {
                        verificationStatusSelect.value = product.verificationStatus || 'PENDING';
                        const verificationContainer = document.getElementById('verification-status-container');
                        if (verificationContainer) {
                            verificationContainer.classList.remove('hidden');
                        }
                    }
                    
                    // Clear image placeholders
                    const mainImageInput = document.getElementById('edit-main-image');
                    if (mainImageInput && product.productMainImage) {
                        mainImageInput.placeholder = 'Current image exists. Click to replace';
                    }
                    
                    console.log('✅ Product data loaded into form successfully');
                    
                } catch (innerError) {
                    console.error('❌ Error loading product data:', innerError);
                    showSuccessPopup('Error loading product data: ' + innerError.message, 'error');
                }
            }, 300); // Wait for modal animation
        } else {
            // ADD NEW PRODUCT MODE
            modalTitle.textContent = 'Add New Product';
            currentProductId = null;
            
            // Reset form
            setTimeout(() => {
                resetEditForm();
                
                // Hide verification status for new products
                const verificationContainer = document.getElementById('verification-status-container');
                if (verificationContainer) {
                    verificationContainer.classList.add('hidden');
                }
            }, 100);
        }
        
        // Setup price management
        setTimeout(() => {
            try {
                setupPriceManagement();
            } catch (priceError) {
                console.warn('Price management setup had issues:', priceError);
            }
        }, 400);
        
    } catch (outerError) {
        console.error('❌ CRITICAL ERROR in openEditModal:', outerError);
        console.error('Error stack:', outerError.stack);
        showSuccessPopup('Critical error opening edit form. Please refresh page.', 'error');
    }
}

// SIMPLIFIED resetEditForm - Remove all problematic references
function resetEditForm() {
    console.log('🔄 Resetting edit form...');
    
    try {
        // Get the form
        const editForm = document.getElementById('editProductForm');
        if (editForm) {
            editForm.reset();
        }
        
        // Reset category dropdowns safely
        const categorySelect = document.getElementById('edit-category');
        const typeSelect = document.getElementById('edit-type');
        
        if (categorySelect) categorySelect.value = '';
        if (typeSelect) {
            typeSelect.value = '';
            typeSelect.disabled = true;
        }
        
        // Hide "other" containers
        const containers = ['category-other-container', 'type-other-container'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.classList.add('hidden');
            }
        });
        
        // Clear "other" inputs
        const otherInputs = ['edit-category-other', 'edit-type-other'];
        otherInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = '';
                input.required = false;
            }
        });
        
        // Reset price type
        const priceTypeSelect = document.getElementById('edit-price-type');
        if (priceTypeSelect) {
            priceTypeSelect.value = 'single';
        }
        
        // Clear single price fields
        const priceFields = ['edit-price', 'edit-old-price'];
        priceFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        
        // Clear text areas
        const textAreas = [
            'edit-description', 'edit-benefits', 'edit-ingredients', 
            'edit-directions', 'edit-strength', 'edit-form', 'edit-dosage', 'edit-sizes'
        ];
        
        textAreas.forEach(textAreaId => {
            const textArea = document.getElementById(textAreaId);
            if (textArea) textArea.value = '';
        });
        
        // Clear image inputs
        for (let i = 1; i <= 4; i++) {
            const imageInput = document.getElementById(`edit-image${i}`);
            if (imageInput) imageInput.value = '';
        }
        
        const mainImageInput = document.getElementById('edit-main-image');
        if (mainImageInput) {
            mainImageInput.value = '';
            mainImageInput.placeholder = '';
        }
        
        console.log('✅ Form reset complete');
        
    } catch (error) {
        console.error('❌ Error resetting form:', error);
    }
}
    
    // Show the modal
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Setup price management AFTER modal is visible
        setTimeout(() => {
            setupPriceManagement();
            
            // Also populate categories and subcategories
            // loadCategories();
            // loadSubcategories('edit-category', 'edit-type');
              allCategories();
            allSubcategories('edit-category', 'edit-type');
        }, 100);
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

// Make removePriceItem globally available for inline onclick
window.removePriceItem = removePriceItem;