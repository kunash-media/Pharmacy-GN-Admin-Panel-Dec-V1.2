// User profile data
// const user = {
//   name: "Shreya Kamble",
//   role: "Admin"
// };

function displayUserProfile() {
  const admin = Auth.getCurrentAdmin(); // This returns the admin object like { id: 4, firstName: "Sumer", lastName: "Khan", ... }

  const userInitials = document.getElementById('user-initials');
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');

  if (!admin || !admin.firstName) {
    // Fallback if no admin is logged in (shouldn't happen due to Auth.requireAuth())
    userName.textContent = "Guest";
    userRole.textContent = "Unknown";
    userInitials.textContent = "??";
    return;
  }

  // Full name
  const fullName = `${admin.firstName} ${admin.lastName || ''}`.trim();

  // Generate initials (e.g., "SK" for Sumer Khan)
  const nameParts = fullName.trim().split(' ');
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : (nameParts[0]?.[0] || '?');

  // Update DOM
  userInitials.textContent = initials.toUpperCase();
  userName.textContent = fullName;
  userRole.textContent = "Admin"; // You can make this dynamic later if needed
}

// Call it when page loads
document.addEventListener("DOMContentLoaded", displayUserProfile);



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

// Display user profile in the UI
// function displayUserProfile() {
//   const userInitials = document.getElementById('user-initials');
//   const userName = document.getElementById('user-name');
//   const userRole = document.getElementById('user-role');

//   const nameParts = user.name.trim().split(' ');
//   const initials = nameParts.length > 1
//     ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
//     : nameParts[0][0];
//   userInitials.textContent = initials.toUpperCase();

//   userName.textContent = user.name;
//   userRole.textContent = user.role;
// }

// displayUserProfile();

// Global variables
let inventory = [];
let dataTable;
let isEditMode = false;
let currentEditId = null;

// Debounce function to prevent rapid sidebar toggling
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

// Update sidebar arrow icon based on state
function updateSidebarArrow(isHidden, isCollapsed, isMobileView) {
  const arrow = $('#sidebar-arrow');
  if (isMobileView) {
    arrow.removeClass('fa-chevron-right fa-chevron-left')
         .addClass(isHidden ? 'fa-chevron-right' : 'fa-chevron-left');
  } else {
    arrow.removeClass('fa-chevron-right fa-chevron-left')
         .addClass(isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left');
  }
}

// Function to handle table responsiveness
function handleTableResponsiveness() {
  if (dataTable) {
    // Trigger DataTable to recalculate dimensions
    // dataTable.columns.adjust().responsive.recalc();
    
    // Add horizontal scroll if needed
    const tableContainer = $('.table-container');
    const table = $('#inventoryTable');
    
    if (table.width() > tableContainer.width()) {
      tableContainer.addClass('overflow-x-auto');
    } else {
      tableContainer.removeClass('overflow-x-auto');
    }
  }
}

// Handle window resize
// $(window).on('resize', debounce(function() {
//   handleTableResponsiveness();
// }, 250));

$(document).ready(function() {
  // Initialize DataTable with proper configuration
  initializeDataTable();

  flatpickr(".flatpickr", {
    dateFormat: "Y-m-d"
  });

  let isSidebarHidden = true;
  let isSidebarCollapsed = false;

  const toggleSidebarMobile = debounce(function() {
    const sidebar = $('#sidebar');
    const isMobileView = window.matchMedia('(max-width: 768px)').matches;
    isSidebarHidden = !isSidebarHidden;
    sidebar.toggleClass('-translate-x-full');
    if (!isSidebarHidden) {
      sidebar.removeClass('w-20').addClass('w-64');
      $('#sidebar-title, .nav-text').removeClass('hidden');
    }
    updateSidebarArrow(isSidebarHidden, isSidebarCollapsed, isMobileView);
    
    // Handle table responsiveness after sidebar animation
    setTimeout(handleTableResponsiveness, 300);
  }, 100);

  const toggleSidebarLogo = debounce(function() {
    const sidebar = $('#sidebar');
    const isMobileView = window.matchMedia('(max-width: 768px)').matches;

    if (isMobileView) {
      isSidebarHidden = !isSidebarHidden;
      sidebar.toggleClass('-translate-x-full');
      if (!isSidebarHidden) {
        sidebar.removeClass('w-20').addClass('w-64');
        $('#sidebar-title, .nav-text').removeClass('hidden');
      }
    } else {
      isSidebarCollapsed = !isSidebarCollapsed;
      sidebar.toggleClass('w-64 w-20');
      $('#sidebar-title, .nav-text').toggleClass('hidden');
      $('#sidebar-logo').toggleClass('mr-2 mx-auto');
      $('.nav-icon').toggleClass('mr-3 mx-auto');
    }
    updateSidebarArrow(isSidebarHidden, isSidebarCollapsed, isMobileView);
    
    // Handle table responsiveness after sidebar animation
    setTimeout(handleTableResponsiveness, 300);
  }, 100);

  $('#toggle-sidebar-mobile, #close-sidebar').on('click', toggleSidebarMobile);
  $('#toggle-sidebar-logo').on('click', toggleSidebarLogo);

  // Logout button functionality
  $('#logout-btn').on('click', function() {
    $('#logoutModal').show();
  });

  $('#confirmLogout').on('click', function() {
    // Show success message
    Toastify({
      text: "Successfully logged out.",
      duration: 3000,
      style: { background: 'linear-gradient(to right, #00b09b, #96c93d)' }
    }).showToast();
    
    // Redirect to login page after a short delay
    setTimeout(function() {
      window.location.href = '../Login/login.html';
    }, 1500);
  });

  $('#add-medicine').click(function() {
    isEditMode = false;
    currentEditId = null;
    $('#modalTitle').text('Add Medicine');
    $('#medicineForm')[0].reset();
    $('#mainImagePreview').attr('src', '').addClass('hidden');
    $('#subImagesPreview').empty();
    $('#custom-fields').addClass('hidden');
    $('#custom-fields-container').empty();
    $('#mainImageRequired').removeClass('hidden');
    $('#mainImage').prop('required', true);
    $('#medicineForm').removeData('editId');
    $('#medicineModal').show();
  });

  $('.close').click(function() {
    closeModal($(this).closest('.modal').attr('id'));
  });

  $('#mainImage').change(function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        $('#mainImagePreview').attr('src', e.target.result).removeClass('hidden');
      };
      reader.readAsDataURL(file);
    } else {
      $('#mainImagePreview').attr('src', '').addClass('hidden');
    }
  });

  $('#subImages').change(function(event) {
    const files = event.target.files;
    $('#subImagesPreview').empty();
    if (files.length > 4) {
      alert('You can upload up to 4 sub-images.');
      $(this).val('');
      return;
    }
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        $('#subImagesPreview').append(
          `<img src="${e.target.result}" alt="Sub Image Preview ${index + 1}" class="image-preview w-24 h-24 object-cover rounded" />`
        );
      };
      reader.readAsDataURL(file);
    });
  });

  $('#toggle-custom-fields').click(function() {
    $('#custom-fields').toggleClass('hidden');
  });

  $('#add-custom-field').click(function() {
    const fieldId = `custom-field-${Date.now()}`;
    $('#custom-fields-container').append(`
      <div id="${fieldId}" class="flex gap-2 items-center">
        <input type="text" class="custom-field-name w-1/2 border rounded-lg p-2" placeholder="Field Name" required />
        <input type="text" class="custom-field-value w-1/2 border rounded-lg p-2" placeholder="Field Value" required />
        <button type="button" class="delete-custom-field bg-red-500 text-white py-1 px-2 rounded-lg hover:bg-red-600">Delete</button>
      </div>
    `);
    $('.delete-custom-field').off('click').on('click', function() {
      $(this).parent().remove();
    });
  });

  $('#medicineForm').submit(function(e) {
    e.preventDefault();
    const formData = new FormData();
    const customFields = {};
    $('#custom-fields-container .custom-field-name').each(function(index) {
      const name = $(this).val();
      const value = $(this).siblings('.custom-field-value').val();
      if (name && value) {
        customFields[name] = value;
      }
    });
    const productData = {
      productName: $('#name').val() || '',
      productCategory: $('#category').val() || '',
      productSubCategory: $('#subCategory').val() || '',
      productPrice: parseFloat($('#sellingPrice').val()) || 0,
      productOldPrice: parseFloat($('#costPrice').val()) || 0,
      productStock: $('#productStock').val() || '',
      productStatus: $('#productStatus').val() || '',
      productDescription: $('#description').val() || '',
      productQuantity: parseInt($('#quantity').val()) || 0,
      prescriptionRequired: $('#prescriptionRequired').val() === 'Yes',
      brandName: $('#brand').val() || '',
      mfgDate: $('#mfgDate').val() || '',
      expDate: $('#expDate').val() || '',
      batchNo: $('#batchNumber').val() || '',
      benefitsList: $('#benefits').val().split('\n').filter(line => line.trim()) || [],
      directionsList: $('#directions').val().split('\n').filter(line => line.trim()) || [],
      productDynamicFields: customFields,
      productSizes: $('#productSizes').val().split('\n').filter(line => line.trim()) || []
    };

    formData.append('productData', JSON.stringify(productData));
    
    // For edit mode, only append images if new ones are selected
    if (isEditMode) {
      if ($('#mainImage').prop('files')[0]) {
        formData.append('productMainImage', $('#mainImage').prop('files')[0]);
      }
      const subImages = $('#subImages').prop('files');
      Array.from(subImages).slice(0, 4).forEach(file => {
        formData.append('productSubImages', file);
      });
    } else {
      // For add mode, main image is required
      if ($('#mainImage').prop('files')[0]) {
        formData.append('productMainImage', $('#mainImage').prop('files')[0]);
      }
      const subImages = $('#subImages').prop('files');
      Array.from(subImages).slice(0, 4).forEach(file => {
        formData.append('productSubImages', file);
      });
    }

    const url = isEditMode 
      ? `http://localhost:8083/api/products/patch-product/${currentEditId}`
      : 'http://localhost:8083/api/products/create-product';
    const method = isEditMode ? 'PATCH' : 'POST';

    fetch(url, {
      method: method,
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} product: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        fetchAllProducts();
        closeModal('medicineModal');
        Toastify({
          text: isEditMode ? 'Product updated successfully!' : 'Product added successfully!',
          duration: 3000,
          style: { background: 'linear-gradient(to right, #00b09b, #96c93d)' }
        }).showToast();
        isEditMode = false;
        currentEditId = null;
      })
      .catch(error => {
        console.error('Error saving product:', error);
        Toastify({
          text: `Error: ${error.message}`,
          duration: 3000,
          style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
        }).showToast();
      });
  });

  // Simple Client-side Category Filter
  $('#filter-category').change(function() {
    const category = $(this).val();
    
    if (category && category !== '') {
      // Client-side filtering only
      const filteredProducts = inventory.filter(item => 
        item.productCategory === category
      );
      updateDataTable(filteredProducts);
      updateOverviewCards(filteredProducts);
      
      if (filteredProducts.length === 0) {
        Toastify({
          text: `No products found for category: ${category}`,
          duration: 3000,
          style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
        }).showToast();
      }
    } else {
      // Show all products
      updateDataTable(inventory);
      updateOverviewCards(inventory);
    }
  });

  $('#bulk-upload').click(function() {
    $('#bulkUploadModal').show();
    $('#bulkUploadForm')[0].reset();
    $('#bulkUploadOverlay').addClass('hidden');
    $('#bulkUploadLoader').removeClass('hidden');
    $('#bulkUploadAcknowledgment').addClass('hidden');
    $('#bulkSkippedReasonsContainer').addClass('hidden');
    $('#bulkSkippedReasonsList').empty();
  });

  $('#bulkUploadForm').submit(function(e) {
    e.preventDefault();
    const formData = new FormData();
    const excelFile = $('#bulkExcelInput').prop('files')[0];
    const images = $('#bulkImagesInput').prop('files');

    if (excelFile) {
      formData.append('excelFile', excelFile);
      Array.from(images).forEach(file => {
        formData.append('productImages', file);
      });

      $('#bulkUploadOverlay').removeClass('hidden');
      $('#bulkUploadLoader').removeClass('hidden');
      $('#bulkUploadAcknowledgment').addClass('hidden');

      fetch('http://localhost:8083/api/products/bulk-upload', {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Bulk upload failed: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setTimeout(() => {
            $('#bulkUploadLoader').addClass('hidden');
            $('#bulkUploadedCount').text(data.uploadedCount || 0);
            $('#bulkSkippedCount').text(data.skippedCount || 0);

            if (data.skippedReasons && data.skippedReasons.length > 0) {
              $('#bulkSkippedReasonsContainer').removeClass('hidden');
              const list = $('#bulkSkippedReasonsList');
              list.empty();
              data.skippedReasons.forEach((reason) => {
                const li = $('<li>').text(reason).addClass('ml-4');
                list.append(li);
              });
            } else {
              $('#bulkSkippedReasonsContainer').addClass('hidden');
            }

            $('#bulkUploadAcknowledgment').removeClass('hidden');
            fetchAllProducts();
            Toastify({
              text: `Successfully imported ${data.uploadedCount || 'multiple'} items`,
              duration: 3000,
              style: { background: 'linear-gradient(to right, #00b09b, #96c93d)' }
            }).showToast();
          }, 1500);
        })
        .catch(error => {
          console.error('Error during bulk upload:', error);
          $('#bulkUploadLoader').addClass('hidden');
          $('#bulkUploadAcknowledgment').addClass('hidden');
          $('#bulkUploadOverlay').addClass('hidden');
          Toastify({
            text: `Error during bulk upload: ${error.message}`,
            duration: 3000,
            style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
          }).showToast();
        });
    } else {
      Toastify({
        text: 'Please upload an Excel file.',
        duration: 3000,
        style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
      }).showToast();
    }
  });

  window.resetBulkUpload = function() {
    $('#bulkUploadAcknowledgment').addClass('hidden');
    $('#bulkUploadOverlay').addClass('hidden');
    $('#bulkUploadForm')[0].reset();
    $('#bulkSkippedReasonsContainer').addClass('hidden');
    $('#bulkSkippedReasonsList').empty();
    closeModal('bulkUploadModal');
  };

  $('#export-csv').click(function() {
    fetch(`http://localhost:8083/api/products/get-all-products?page=0&size=1000`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch products for export: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const products = data.content || [];
        const wsData = [
          ['Sr. No.', 'Product Name', 'Category', 'Sub Category', 'Brand', 'Batch No.', 'Quantity', 'Cost Price', 'Selling Price', 'Expiry Date', 'Supplier Name', 'Prescription', 'Description', 'Images'],
          ...products.map((item, index) => [
            index + 1,
            item.productName || '',
            item.productCategory || '',
            item.productSubCategory || '',
            item.brandName || '',
            item.batchNo || '',
            item.productQuantity || 0,
            item.productOldPrice || 0,
            item.productPrice || 0,
            item.expDate || '',
            item.brandName || '',
            item.prescriptionRequired ? 'Yes' : 'No',
            item.productDescription || '',
            [item.productMainImage, ...(item.productSubImages || [])].filter(img => img).join(';')
          ])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
        XLSX.writeFile(wb, 'inventory_export.xlsx');
      })
      .catch(error => {
        console.error('Error exporting Excel:', error);
        Toastify({
          text: `Failed to export Excel: ${error.message}`,
          duration: 3000,
          style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
        }).showToast();
      });
  });

  $('#confirmDelete').click(function() {
    deleteItem();
  });

  // Load initial data
  fetchAllProducts();
});

function initializeDataTable() {
  dataTable = $('#inventoryTable').DataTable({
    scrollX: true,
    scrollCollapse: true,
    fixedHeader: true,
    autoWidth: false,
    searching: true,
    paging: true,
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    processing: true,
    serverSide: false,
    responsive: true,
    columns: [
      { 
        data: null, 
        render: (data, type, row, meta) => meta.row + 1,
        className: "text-center",
        orderable: false,
        width: "60px"
      },
      { 
        data: 'productName', 
        className: "text-left",
        width: "150px"
      },
      { 
        data: 'productCategory', 
        className: "text-left",
        width: "120px"
      },
      { 
        data: 'productSubCategory', 
        className: "text-left",
        width: "120px"
      },
      { 
        data: 'batchNo', 
        className: "text-left",
        width: "100px"
      },
      { 
        data: 'productQuantity', 
        className: "text-center",
        width: "80px"
      },
      { 
        data: 'productOldPrice', 
        render: $.fn.dataTable.render.number(',', '.', 2, '₹'),
        className: "text-right",
        width: "100px"
      },
      { 
        data: 'productPrice', 
        render: $.fn.dataTable.render.number(',', '.', 2, '₹'),
        className: "text-right",
        width: "100px"
      },
      { 
        data: 'expDate', 
        className: "text-left",
        width: "100px"
      },
      { 
        data: 'brandName', 
        className: "text-left",
        width: "120px"
      },
      { 
        data: 'prescriptionRequired',
        render: data => data ? 'Yes' : 'No',
        className: "text-center",
        width: "80px"
      },
      {
        data: null,
        render: (data) => `
          <div class="flex justify-center space-x-2">
            <button onclick="showViewModal(${data.productId})" class="action-btn bg-blue-100 text-blue-600" title="View"><i class="fas fa-eye"></i></button>
            <button onclick="showEditModal(${data.productId})" class="action-btn bg-green-100 text-green-600" title="Edit"><i class="fas fa-edit"></i></button>
            <button onclick="showDeleteConfirm(${data.productId})" class="action-btn bg-red-100 text-red-600" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        `,
        orderable: false,
        width: "120px"
      }
    ],
    createdRow: function(row, data, dataIndex) {
      const quantity = parseInt(data.productQuantity) || 0;
      const expDate = new Date(data.expDate);
      const today = new Date('2025-10-08');
      const daysToExpiry = (expDate - today) / (1000 * 60 * 60 * 24);
      
      $(row).removeClass('alert-medium alert-low alert-expired');
      if (isNaN(daysToExpiry) || daysToExpiry <= 30) {
        $(row).addClass('alert-expired');
      } else if (quantity <= 10) {
        $(row).addClass('alert-low');
      } else if (quantity <= 25) {
        $(row).addClass('alert-medium');
      }
    },
    language: {
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "Showing 0 to 0 of 0 entries",
      infoFiltered: "(filtered from _MAX_ total entries)",
      emptyTable: "No products available in the inventory.",
      paginate: {
        previous: "<i class='fas fa-chevron-left'></i>",
        next: "<i class='fas fa-chevron-right'></i>"
      }
    },
    dom: '<"flex justify-between items-center mb-4"lf>rt<"flex justify-between items-center mt-4"ip>',
    initComplete: function() {
      // Handle table responsiveness after initialization
      setTimeout(handleTableResponsiveness, 100);
    }
  });
}

function updateDataTable(data) {
  if (dataTable) {
    dataTable.clear();
    dataTable.rows.add(data);
    dataTable.draw();
  }
}

function fetchAllProducts() {
  fetch('http://localhost:8083/api/products/get-all-products?page=0&size=1000')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const products = data.content || [];
      inventory = products;
      updateDataTable(products);
      updateOverviewCards(products);
      
      if (products.length === 0) {
        Toastify({
          text: 'No products found in the inventory.',
          duration: 3000,
          style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
        }).showToast();
      }
    })
    .catch(error => {
      console.error('Error fetching products:', error);
      Toastify({
        text: `Failed to load products: ${error.message}`,
        duration: 5000,
        style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
      }).showToast();
    });
}

function updateOverviewCards(data) {
  const today = new Date('2025-10-08');
  $('#total-items').text(data.length || 0);
  $('#medium-stock').text(data.filter(item => {
    const quantity = parseInt(item.productQuantity) || 0;
    return quantity <= 25 && quantity > 10;
  }).length);
  $('#low-stock').text(data.filter(item => {
    const quantity = parseInt(item.productQuantity) || 0;
    return quantity <= 10;
  }).length);
  $('#expired').text(data.filter(item => {
    const expDate = new Date(item.expDate);
    return isNaN(expDate.getTime()) || (expDate - today) / (1000 * 60 * 60 * 24) <= 30;
  }).length);
}

let currentImageIndex = 0;

function showViewModal(id) {
  fetch(`http://localhost:8083/api/products/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch product details: ${response.status}`);
      }
      return response.json();
    })
    .then(item => {
      if (!item) {
        Toastify({
          text: 'Product not found',
          duration: 3000,
          style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
        }).showToast();
        return;
      }
      const detailsHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><strong>Product Name:</strong> ${item.productName || 'N/A'}</div>
          <div><strong>Category:</strong> ${item.productCategory || 'N/A'}</div>
          <div><strong>Sub Category:</strong> ${item.productSubCategory || 'N/A'}</div>
          <div><strong>Brand:</strong> ${item.brandName || 'N/A'}</div>
          <div><strong>Batch Number:</strong> ${item.batchNo || 'N/A'}</div>
          <div><strong>Quantity:</strong> ${item.productQuantity || 0}</div>
          <div><strong>Cost Price:</strong> ₹${(item.productOldPrice || 0).toFixed(2)}</div>
          <div><strong>Selling Price:</strong> ₹${(item.productPrice || 0).toFixed(2)}</div>
          <div><strong>Expiry Date:</strong> ${item.expDate || 'N/A'}</div>
          <div><strong>Prescription Required:</strong> ${item.prescriptionRequired ? 'Yes' : 'No'}</div>
          <div class="md:col-span-2"><strong>Description:</strong> ${item.productDescription || 'None'}</div>
          <div class="md:col-span-2"><strong>Benefits:</strong> ${(item.benefitsList || []).join(', ') || 'None'}</div>
          <div class="md:col-span-2"><strong>Directions:</strong> ${(item.directionsList || []).join(', ') || 'None'}</div>
          <div class="md:col-span-2"><strong>Sizes:</strong> ${(item.productSizes || []).join(', ') || 'None'}</div>
          <div class="md:col-span-2"><strong>Custom Fields:</strong> ${
            Object.entries(item.productDynamicFields || {})
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ') || 'None'
          }</div>
        </div>
      `;
      $('#detailsContent').html(detailsHtml);

      const mainImage = $('#detailsMainImage');
      const gallery = $('#detailsImageGallery');
      const navLeft = $('#galleryNavLeft');
      const navRight = $('#galleryNavRight');
      gallery.empty();
      currentImageIndex = 0;

      const images = [item.productMainImage, ...(item.productSubImages || [])].filter(img => img && typeof img === 'string' && img.trim() !== '');
      if (images.length > 0) {
        const validImages = images.map(img => img.startsWith('http') ? img : `http://localhost:8083${img}`);
        mainImage.attr('src', validImages[0]).removeClass('hidden');
        validImages.forEach((imgSrc, index) => {
          gallery.append(`<img src="${imgSrc}" alt="Product Image ${index + 1}" class="image-gallery-img ${index === 0 ? 'active' : ''}" onclick="updateMainImage('${imgSrc}', ${index})"/>`);
        });
        navLeft.toggleClass('hidden', validImages.length <= 1);
        navRight.toggleClass('hidden', validImages.length <= 1);
      } else {
        mainImage.attr('src', 'https://via.placeholder.com/400?text=No+Image').removeClass('hidden');
        gallery.append('<p class="text-gray-500 text-center">No images available</p>');
        navLeft.addClass('hidden');
        navRight.addClass('hidden');
      }

      navLeft.off('click').on('click', () => {
        if (currentImageIndex > 0) {
          currentImageIndex--;
          updateMainImage(validImages[currentImageIndex], currentImageIndex);
        }
      });

      navRight.off('click').on('click', () => {
        if (currentImageIndex < validImages.length - 1) {
          currentImageIndex++;
          updateMainImage(validImages[currentImageIndex], currentImageIndex);
        }
      });

      $('#detailsModal').show();
    })
    .catch(error => {
      console.error('Error fetching product details:', error);
      Toastify({
        text: `Failed to load product details: ${error.message}`,
        duration: 3000,
        style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
      }).showToast();
    });
}

function updateMainImage(src, index) {
  $('#detailsMainImage').attr('src', src);
  $('.image-gallery-img').removeClass('active').eq(index).addClass('active');
  currentImageIndex = index;
}

function showEditModal(id) {
  isEditMode = true;
  currentEditId = id;
  
  fetch(`http://localhost:8083/api/products/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch product for edit: ${response.status}`);
      }
      return response.json();
    })
    .then(item => {
      if (!item) {
        Toastify({
          text: 'Product not found',
          duration: 3000,
          style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
        }).showToast();
        return;
      }

      $('#modalTitle').text('Edit Medicine');
      $('#medicineForm')[0].reset();
      $('#name').val(item.productName || '');
      $('#category').val(item.productCategory || '');
      $('#subCategory').val(item.productSubCategory || '');
      $('#sellingPrice').val(item.productPrice ? item.productPrice.toFixed(2) : '');
      $('#costPrice').val(item.productOldPrice ? item.productOldPrice.toFixed(2) : '');
      $('#productStock').val(item.productStock || '');
      $('#productStatus').val(item.productStatus || '');
      $('#description').val(item.productDescription || '');
      $('#quantity').val(item.productQuantity || 0);
      $('#prescriptionRequired').val(item.prescriptionRequired ? 'Yes' : 'No');
      $('#brand').val(item.brandName || '');
      $('#mfgDate').val(item.mfgDate || '');
      $('#expDate').val(item.expDate || '');
      $('#batchNumber').val(item.batchNo || '');
      $('#benefits').val((item.benefitsList || []).join('\n'));
      $('#directions').val((item.directionsList || []).join('\n'));
      $('#productSizes').val((item.productSizes || []).join('\n'));

      // Make main image not required in edit mode
      $('#mainImageRequired').addClass('hidden');
      $('#mainImage').prop('required', false);

      $('#mainImagePreview').attr('src', item.productMainImage ? 
        (item.productMainImage.startsWith('http') ? item.productMainImage : `http://localhost:8083${item.productMainImage}`) : '')
        .toggleClass('hidden', !item.productMainImage);
      $('#subImagesPreview').empty();
      (item.productSubImages || []).forEach((imgSrc, index) => {
        if (imgSrc) {
          const validImgSrc = imgSrc.startsWith('http') ? imgSrc : `http://localhost:8083${imgSrc}`;
          $('#subImagesPreview').append(
            `<img src="${validImgSrc}" alt="Sub Image Preview ${index + 1}" class="image-preview w-24 h-24 object-cover rounded" />`
          );
        }
      });

      $('#custom-fields').removeClass('hidden');
      $('#custom-fields-container').empty();
      Object.entries(item.productDynamicFields || {}).forEach(([key, value]) => {
        const fieldId = `custom-field-${Date.now()}-${key}`;
        $('#custom-fields-container').append(`
          <div id="${fieldId}" class="flex gap-2 items-center">
            <input type="text" class="custom-field-name w-1/2 border rounded-lg p-2" value="${key}" placeholder="Field Name" required />
            <input type="text" class="custom-field-value w-1/2 border rounded-lg p-2" value="${value}" placeholder="Field Value" required />
            <button type="button" class="delete-custom-field bg-red-500 text-white py-1 px-2 rounded-lg hover:bg-red-600">Delete</button>
          </div>
        `);
      });
      $('.delete-custom-field').off('click').on('click', function() {
        $(this).parent().remove();
      });

      $('#medicineModal').show();
    })
    .catch(error => {
      console.error('Error fetching product for edit:', error);
      Toastify({
        text: `Failed to load product for edit: ${error.message}`,
        duration: 3000,
        style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
      }).showToast();
    });
}

function showDeleteConfirm(id) {
  $('#confirmDelete').data('deleteId', id);
  $('#deleteModal').show();
}

function deleteItem() {
  const id = $('#confirmDelete').data('deleteId');
  fetch(`http://localhost:8083/api/products/delete-product/${id}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`);
      }
      return response.text();
    })
    .then(message => {
      fetchAllProducts();
      closeModal('deleteModal');
      Toastify({
        text: message || 'Product deleted successfully!',
        duration: 3000,
        style: { background: 'linear-gradient(to right, #00b09b, #96c93d)' }
      }).showToast();
    })
    .catch(error => {
      console.error('Error deleting product:', error);
      Toastify({
        text: `Failed to delete product: ${error.message}`,
        duration: 3000,
        style: { background: 'linear-gradient(to right, #ff5e62, #f09819)' }
      }).showToast();
    });
}

function closeModal(modalId) {
  $(`#${modalId}`).hide();
  if (modalId === 'medicineModal') {
    isEditMode = false;
    currentEditId = null;
    $('#medicineForm')[0].reset();
    $('#mainImagePreview').attr('src', '').addClass('hidden');
    $('#subImagesPreview').empty();
    $('#custom-fields').addClass('hidden');
    $('#custom-fields-container').empty();
    // Reset main image to required for next add operation
    $('#mainImageRequired').removeClass('hidden');
    $('#mainImage').prop('required', true);
  }
  if (modalId === 'bulkUploadModal') {
    $('#bulkUploadForm')[0].reset();
    $('#bulkUploadOverlay').addClass('hidden');
    $('#bulkUploadLoader').removeClass('hidden');
    $('#bulkUploadAcknowledgment').addClass('hidden');
    $('#bulkSkippedReasonsContainer').addClass('hidden');
    $('#bulkSkippedReasonsList').empty();
  }
}

window.onclick = function(event) {
  const modals = document.getElementsByClassName('modal');
  for (let i = 0; i < modals.length; i++) {
    if (event.target === modals[i]) {
      closeModal(modals[i].id);
    }
  }
}

//logout functionality 
// ----- LOGOUT BUTTON -------------------------------------------------
$('#logoutBtn').on('click', function () {
  const modalHTML = `
    <div id="logoutModal" class="modal">
      <div class="modal-content max-w-md mx-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Confirm Logout</h2>
          <span class="close cursor-pointer text-gray-500 hover:text-red-500 text-2xl" id="closeLogoutModal">&times;</span>
        </div>
        <p class="text-gray-700 mb-6">Are you sure you want to logout?</p>
        <div class="flex justify-end gap-3">
          <button id="confirmLogout" class="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition shadow-sm">
            Yes
          </button>
          <button id="cancelLogout" class="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition shadow-sm">
            No
          </button>
        </div>
      </div>
    </div>`;

  $('body').append(modalHTML);
  $('#logoutModal').show();
});

// ----- CONFIRM LOGOUT ------------------------------------------------
$(document).on('click', '#confirmLogout', function () {
  $('#logoutModal').remove();

  Toastify({
    text: "Successfully logged out.",
    duration: 3000,
    style: { background: 'linear-gradient(to right, #00b09b, #96c93d)' }
  }).showToast();

  setTimeout(() => {
    window.location.href = '../Login/login.html';
  }, 1500);
});

// ----- CANCEL / CLOSE LOGOUT -----------------------------------------
$(document).on('click', '#cancelLogout, #closeLogoutModal, #logoutModal', function (e) {
  if (e.target.id === 'cancelLogout' || 
      e.target.id === 'closeLogoutModal' || 
      e.target.id === 'logoutModal') {
    $('#logoutModal').remove();
  }
});