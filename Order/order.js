
// User profile
const user = {
    name: "Shreya Kamble",
    role: "Admin",
};
function displayUserProfile() {
    const userInitials = document.getElementById("user-initials");
    const userName = document.getElementById("user-name");
    const userRole = document.getElementById("user-role");
    const nameParts = user.name.trim().split(" ");
    const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}` : nameParts[0][0];
    userInitials.textContent = initials.toUpperCase();
    userName.textContent = user.name;
    userRole.textContent = user.role;
}
displayUserProfile();

// ---------------------------------------------------------------------
// API BASE URL
// ---------------------------------------------------------------------
const API_BASE = 'http://localhost:8083/api/orders';

// ---------------------------------------------------------------------
// Global variables
// ---------------------------------------------------------------------
let table;
let currentOrderId = null;
let orders = [];
let allOrdersData = [];

// ---------------------------------------------------------------------
// Helper: Show success popup
// ---------------------------------------------------------------------
function showSuccessPopup(message) {
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successPopup').style.display = 'flex';
}

// ---------------------------------------------------------------------
// 1. FETCH ALL ORDERS (with pagination)
// ---------------------------------------------------------------------
async function fetchAllOrders(page = 0, size = 10, sort = 'orderDate,desc') {
    try {
        const res = await fetch(`${API_BASE}/get-all-orders?page=${page}&size=${size}&sort=${sort}`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
        alert('Error loading orders');
        return { content: [], totalElements: 0, totalPages: 0 };
    }
}

// ---------------------------------------------------------------------
// 2. GET ORDER BY ID
// ---------------------------------------------------------------------
async function getOrderById(orderId) {
    try {
        const res = await fetch(`${API_BASE}/get-by-order-id/${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        return await res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// ---------------------------------------------------------------------
// 3. CREATE ORDER
// ---------------------------------------------------------------------
async function createOrder(payload) {
    try {
        const res = await fetch(`${API_BASE}/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Create failed');
        return await res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// ---------------------------------------------------------------------
// 4. UPDATE ORDER (PATCH - partial update)
// ---------------------------------------------------------------------
async function patchOrder(orderId, payload) {
    try {
        const res = await fetch(`${API_BASE}/patch-by-order-id/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Update failed');
        return await res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// ---------------------------------------------------------------------
// 5. UPDATE ORDER (FULL UPDATE)
// ---------------------------------------------------------------------
async function updateOrder(orderId, payload) {
    try {
        const res = await fetch(`${API_BASE}/update-by-order-id/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        return await res.json();
    } catch (err) {
        console.error('Update error:', err);
        throw err;
    }
}

// ---------------------------------------------------------------------
// 6. CANCEL ORDER
// ---------------------------------------------------------------------
async function cancelOrder(orderId) {
    try {
        const res = await fetch(`${API_BASE}/cancel-order/${orderId}`, {
            method: 'PATCH'
        });
        if (!res.ok) throw new Error('Cancel failed');
        return await res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// ---------------------------------------------------------------------
// 7. DELETE ORDER
// ---------------------------------------------------------------------
async function deleteOrder(orderId) {
    try {
        const res = await fetch(`${API_BASE}/delete-by-order-id/${orderId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Delete failed');
        return await res.text();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// ---------------------------------------------------------------------
// INITIALIZE DATATABLE
// ---------------------------------------------------------------------
$(document).ready(async function () {
    // Load data from API
    const data = await fetchAllOrders(0, 100); // Load first 100 orders for demo
    allOrdersData = data.content || [];
    orders = [...allOrdersData];
    
    updateStats();
    populateTable();

    // -----------------------------------------------------------------
    // Bulk Delete Functionality
    // -----------------------------------------------------------------
    // Select all checkbox
    $('#selectAll').on('click', function() {
        $('.row-checkbox').prop('checked', this.checked);
        toggleDeleteSelectedButton();
    });

    // Individual row checkbox
    $(document).on('click', '.row-checkbox', function() {
        const totalCheckboxes = $('.row-checkbox').length;
        const checkedCheckboxes = $('.row-checkbox:checked').length;
        
        $('#selectAll').prop('checked', totalCheckboxes === checkedCheckboxes);
        $('#selectAll').prop('indeterminate', checkedCheckboxes > 0 && checkedCheckboxes < totalCheckboxes);
        
        toggleDeleteSelectedButton();
    });

    // Delete Selected button
    $('#deleteSelectedBtn').on('click', async function() {
        const selectedIds = [];
        $('.row-checkbox:checked').each(function() {
            selectedIds.push($(this).data('id'));
        });

        if (selectedIds.length === 0) {
            alert('Please select at least one order to delete.');
            return;
        }

        if (confirm(`Are you sure you want to delete ${selectedIds.length} order(s)?`)) {
            try {
                for (const orderId of selectedIds) {
                    await deleteOrder(orderId);
                }
                showSuccessPopup(`${selectedIds.length} order(s) deleted successfully`);
                await refreshOrders();
                $('#selectAll').prop('checked', false);
                toggleDeleteSelectedButton();
            } catch (e) {
                alert('Delete failed');
            }
        }
    });

    // -----------------------------------------------------------------
    // Action button listeners
    // -----------------------------------------------------------------
    $(document).on('click', '.view-btn', async function () {
        const orderId = $(this).data('id');
        await viewOrder(orderId);
    });

    $(document).on('click', '.edit-btn', async function () {
        const orderId = $(this).data('id');
        await editOrder(orderId);
    });

    $(document).on('click', '.delete-btn', async function () {
        const orderId = $(this).data('id');
        if (confirm('Are you sure you want to delete this order?')) {
            try {
                const msg = await deleteOrder(orderId);
                showSuccessPopup(msg);
                await refreshOrders();
            } catch (e) {
                alert('Delete failed');
            }
        }
    });
});

// ---------------------------------------------------------------------
// Toggle Delete Selected Button
// ---------------------------------------------------------------------
function toggleDeleteSelectedButton() {
    const checkedCount = $('.row-checkbox:checked').length;
    const deleteBtn = $('#deleteSelectedBtn');
    
    if (checkedCount > 0) {
        deleteBtn.show();
    } else {
        deleteBtn.hide();
    }
}

// ---------------------------------------------------------------------
// POPULATE TABLE
// ---------------------------------------------------------------------
function populateTable(filteredOrders = orders) {
    $('#orderTableBody').empty();
    filteredOrders.forEach((order, index) => {
        const statusClass = `status-${order.orderStatus ? order.orderStatus.toLowerCase() : 'pending'}`;
        const productsText = order.orderItems && order.orderItems.length > 0 
            ? order.orderItems.map(item => `${item.itemName} (${item.quantity})`).join(', ')
            : 'No items';
        
        $('#orderTableBody').append(`
            <tr>
                <td class="px-4 py-4 whitespace-nowrap text-center">
                    <input type="checkbox" class="row-checkbox w-4 h-4 cursor-pointer" data-id="${order.orderId}">
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.orderId}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${order.customerFirstName || ''} ${order.customerLastName || ''}</td>
                <td class="px-4 py-4 text-sm text-gray-900">${productsText}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${order.orderDate || '-'}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${order.deliveryDate || '-'}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${order.paymentMethod || '-'}</td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <span class="status-badge ${statusClass}">${order.orderStatus || 'PENDING'}</span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹${order.totalAmount || 0}</td>
                <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-weight-500">
                    <div class="action-column">
                        <button class="view-btn action-btn" data-id="${order.orderId}" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="edit-btn action-btn bg-yellow-500 text-white" data-id="${order.orderId}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn action-btn bg-red-500 text-white" data-id="${order.orderId}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `);
    });
    
    if (table) table.destroy();
    table = $('#orderTable').DataTable({
        paging: true,
        searching: false,
        ordering: true,
        info: true,
        responsive: true,
        lengthMenu: [[5, 10, 50, 100], [5, 10, 50, 100]],
        pageLength: 10,
        columnDefs: [
            { orderable: false, targets: [0, -1] }
        ],
        language: {
            search: "Search orders:"
        },
        drawCallback: function () {
            this.api().columns.adjust();
        }
    });
    
    // Update checkbox states after table redraw
    $('#selectAll').prop('checked', false);
    toggleDeleteSelectedButton();
}

// ---------------------------------------------------------------------
// UPDATE STATS
// ---------------------------------------------------------------------
function updateStats(filteredOrders = orders) {
    $('#totalOrders').text(filteredOrders.length);
    $('#pendingOrders').text(filteredOrders.filter(o => o.orderStatus === 'PENDING').length);
    $('#deliveredOrders').text(filteredOrders.filter(o => o.orderStatus === 'DELIVERED').length);
    
    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = filteredOrders
        .filter(o => o.orderDate && o.orderDate.startsWith(today))
        .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
    $('#revenueToday').text('₹' + todayRevenue.toFixed(2));
}

// ---------------------------------------------------------------------
// FILTER FUNCTIONALITY
// ---------------------------------------------------------------------
function applyFilters() {
    let filtered = [...allOrdersData];
    const status = $('#statusFilter').val();
    const payment = $('#paymentFilter').val();
    const date = $('#dateFilter').val();

    if (status) {
        filtered = filtered.filter(o => o.orderStatus === status);
    }
    if (payment) {
        filtered = filtered.filter(o => o.paymentMethod === payment);
    }
    if (date) {
        // Enhanced date filter - handle different date formats
        filtered = filtered.filter(o => {
            if (!o.orderDate) return false;
            // Extract date part from various formats (YYYY-MM-DD, YYYY-MM-DDTHH:MM:SS, etc.)
            const orderDate = o.orderDate.split('T')[0];
            return orderDate === date;
        });
    }

    orders = filtered;
    populateTable(orders);
    updateStats(orders);
}

// Apply filters on change
document.getElementById('statusFilter').addEventListener('change', applyFilters);
document.getElementById('paymentFilter').addEventListener('change', applyFilters);
document.getElementById('dateFilter').addEventListener('change', applyFilters);

// ---------------------------------------------------------------------
// VIEW ORDER (Now opens editable form)
// ---------------------------------------------------------------------
async function viewOrder(orderId) {
    // Redirect to edit functionality as per user requirement
    await editOrder(orderId);
}

// ---------------------------------------------------------------------
// EDIT ORDER
// ---------------------------------------------------------------------
async function editOrder(orderId) {
    try {
        const order = await getOrderById(orderId);
        currentOrderId = order.orderId;
        
        // Fix: Use correct element IDs and properties
        document.getElementById('edit-order-id').value = order.orderId || '';
        document.getElementById('edit-user-id').value = order.userId || '';
        document.getElementById('edit-payment-method').value = order.paymentMethod || 'COD';
        document.getElementById('edit-total-amount').value = order.totalAmount || 0;
        document.getElementById('edit-tax').value = order.tax || 0;
        document.getElementById('edit-order-status').value = order.orderStatus || 'PENDING';
        document.getElementById('edit-shipping-address').value = order.shippingAddress || '';
        document.getElementById('edit-shipping-address2').value = order.shippingAddress2 || '';
        document.getElementById('edit-shipping-city').value = order.shippingCity || '';
        document.getElementById('edit-shipping-state').value = order.shippingState || '';
        document.getElementById('edit-shipping-pincode').value = order.shippingPincode || '';
        document.getElementById('edit-shipping-country').value = order.shippingCountry || 'USA';
        document.getElementById('edit-delivery-date').value = order.deliveryDate || '';

        document.getElementById('editOrderModal').style.display = 'flex';
    } catch (e) {
        console.error('Error fetching order:', e);
        alert('Order not found');
    }
}

// ---------------------------------------------------------------------
// CREATE ORDER
// ---------------------------------------------------------------------
// Note: Create Order button was removed from header as per requirements
// But keeping the modal functionality in case it's needed later

// ---------------------------------------------------------------------
// SAVE EDITED ORDER
// ---------------------------------------------------------------------
document.getElementById('editOrderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const orderId = document.getElementById('edit-order-id').value;
    
    if (!orderId) {
        alert('Order ID is required');
        return;
    }
    
    const payload = {
        userId: document.getElementById('edit-user-id').value,
        paymentMethod: document.getElementById('edit-payment-method').value,
        totalAmount: parseFloat(document.getElementById('edit-total-amount').value),
        tax: parseFloat(document.getElementById('edit-tax').value),
        orderStatus: document.getElementById('edit-order-status').value,
        shippingAddress: document.getElementById('edit-shipping-address').value,
        shippingAddress2: document.getElementById('edit-shipping-address2').value,
        shippingCity: document.getElementById('edit-shipping-city').value,
        shippingState: document.getElementById('edit-shipping-state').value,
        shippingPincode: document.getElementById('edit-shipping-pincode').value,
        shippingCountry: document.getElementById('edit-shipping-country').value,
        deliveryDate: document.getElementById('edit-delivery-date').value
    };

    try {
        await updateOrder(orderId, payload);
        document.getElementById('editOrderModal').style.display = 'none';
        await refreshOrders();
        showSuccessPopup('Order updated successfully');
    } catch (err) {
        console.error('Update error:', err);
        alert('Update failed: ' + err.message);
    }
});

// ---------------------------------------------------------------------
// CREATE ORDER SUBMIT
// ---------------------------------------------------------------------
document.getElementById('createOrderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        userId: document.getElementById('create-user-id').value,
        customerFirstName: document.getElementById('create-customer-firstname').value,
        customerLastName: document.getElementById('create-customer-lastname').value,
        customerPhone: document.getElementById('create-customer-phone').value,
        customerEmail: document.getElementById('create-customer-email').value,
        shippingFirstName: document.getElementById('create-shipping-firstname').value,
        shippingLastName: document.getElementById('create-shipping-lastname').value,
        shippingAddress: document.getElementById('create-shipping-address').value,
        shippingAddress2: document.getElementById('create-shipping-address2').value,
        shippingCity: document.getElementById('create-shipping-city').value,
        shippingState: document.getElementById('create-shipping-state').value,
        shippingPincode: document.getElementById('create-shipping-pincode').value,
        shippingCountry: document.getElementById('create-shipping-country').value,
        shippingPhone: document.getElementById('create-shipping-phone').value,
        shippingEmail: document.getElementById('create-shipping-email').value,
        paymentMethod: document.getElementById('create-payment-method').value,
        totalAmount: parseFloat(document.getElementById('create-total-amount').value),
        tax: parseFloat(document.getElementById('create-tax').value),
        couponApplied: parseFloat(document.getElementById('create-coupon').value) || 0,
        convenienceFee: parseFloat(document.getElementById('create-convenience-fee').value) || 0,
        discountPercent: parseFloat(document.getElementById('create-discount-percent').value) || 0,
        discountAmount: parseFloat(document.getElementById('create-discount-amount').value) || 0,
        orderStatus: document.getElementById('create-order-status').value,
        orderDate: document.getElementById('create-order-date').value,
        deliveryDate: document.getElementById('create-delivery-date').value,
        orderItems: [] // Empty for now - would need product selection UI
    };

    try {
        await createOrder(payload);
        document.getElementById('createOrderModal').style.display = 'none';
        await refreshOrders();
        showSuccessPopup('Order created successfully');
    } catch (err) {
        console.error('Create error:', err);
        alert('Create failed: ' + err.message);
    }
});

// ---------------------------------------------------------------------
// UPDATE ORDER STATUS
// ---------------------------------------------------------------------
document.getElementById('saveStatus').addEventListener('click', async () => {
    const newStatus = document.getElementById('updateStatus').value;
    
    if (!currentOrderId) {
        alert('No order selected');
        return;
    }
    
    try {
        await patchOrder(currentOrderId, { 
            orderStatus: newStatus,
            deliveryDate: newStatus === 'DELIVERED' ? new Date().toISOString().split('T')[0] : undefined
        });
        
        await refreshOrders();
        showSuccessPopup('Order status updated successfully');
        document.getElementById('orderDetailsModal').style.display = 'none';
    } catch (err) {
        console.error('Status update error:', err);
        alert('Status update failed: ' + err.message);
    }
});

// ---------------------------------------------------------------------
// CANCEL ORDER
// ---------------------------------------------------------------------
document.getElementById('cancelOrder').addEventListener('click', async () => {
    if (!currentOrderId) {
        alert('No order selected');
        return;
    }
    
    if (confirm('Are you sure you want to cancel this order?')) {
        try {
            await cancelOrder(currentOrderId);
            await refreshOrders();
            showSuccessPopup('Order cancelled successfully');
            document.getElementById('orderDetailsModal').style.display = 'none';
        } catch (err) {
            console.error('Cancel error:', err);
            alert('Cancel failed: ' + err.message);
        }
    }
});

// ---------------------------------------------------------------------
// PRINT INVOICE
// ---------------------------------------------------------------------
document.getElementById('printInvoice').addEventListener('click', async () => {
    if (!currentOrderId) {
        alert('No order selected');
        return;
    }
    
    try {
        const order = await getOrderById(currentOrderId);
        
        $('#inv-customer-name').text(`${order.customerFirstName || ''} ${order.customerLastName || ''}`);
        $('#inv-customer-phone').text(order.customerPhone || '-');
        $('#inv-customer-email').text(order.customerEmail || '-');
        $('#inv-customer-address').text(`${order.shippingAddress || ''} ${order.shippingAddress2 || ''}`.trim() || '-');
        $('#inv-payment-status').text(order.orderStatus === 'DELIVERED' ? 'Paid' : 'Pending');
        $('#inv-payment-mode').text(order.paymentMethod || '-');

        let invProductsHtml = '';
        let subtotal = 0;
        if (order.orderItems && order.orderItems.length > 0) {
            order.orderItems.forEach(item => {
                invProductsHtml += `
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">${item.itemName || '-'}</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.quantity || 0}</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">₹${item.itemPrice || 0}</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">₹${item.subtotal || 0}</td>
                    </tr>
                `;
                subtotal += parseFloat(item.subtotal || 0);
            });
        } else {
            invProductsHtml = '<tr><td colspan="4" style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">No items</td></tr>';
        }
        $('#inv-products').html(invProductsHtml);

        $('#inv-subtotal').text('₹' + subtotal.toFixed(2));
        $('#inv-tax').text('₹' + (order.tax || 0));
        $('#inv-coupon').text('₹' + (order.couponApplied || 0));
        $('#inv-convenience').text('₹' + (order.convenienceFee || 0));
        $('#inv-discount').text('₹' + (order.discountAmount || 0));
        $('#inv-grand-total').text('₹' + (order.totalAmount || 0));

        $('#invoiceModal').style.display = 'flex';
    } catch (err) {
        console.error('Invoice error:', err);
        alert('Failed to load invoice data: ' + err.message);
    }
});

// ---------------------------------------------------------------------
// EXPORT TO CSV
// ---------------------------------------------------------------------
document.getElementById('exportBtn').addEventListener('click', () => {
    let csv = 'Order ID,Customer Name,Products,Order Date,Delivery Date,Payment Mode,Status,Total Amount\n';
    orders.forEach((order) => {
        const productsText = order.orderItems && order.orderItems.length > 0 
            ? order.orderItems.map(item => `${item.itemName} (${item.quantity})`).join(', ')
            : 'No items';
        csv += `"${order.orderId}","${order.customerFirstName || ''} ${order.customerLastName || ''}","${productsText}","${order.orderDate || ''}","${order.deliveryDate || ''}","${order.paymentMethod || ''}","${order.orderStatus || ''}","₹${order.totalAmount || 0}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
});

// ---------------------------------------------------------------------
// REFRESH ORDERS
// ---------------------------------------------------------------------
async function refreshOrders() {
    const data = await fetchAllOrders(0, 100);
    allOrdersData = data.content || [];
    applyFilters(); // This will repopulate with current filters
}

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



// document.getElementById('toggle-sidebar-mobile').addEventListener('click', () => {
//     const sidebar = document.getElementById('sidebar');
//     sidebar.classList.toggle('-translate-x-full');
// });

// document.getElementById('close-sidebar').addEventListener('click', () => {
//     const sidebar = document.getElementById('sidebar');
//     sidebar.classList.add('-translate-x-full');
// });

// document.getElementById('toggle-sidebar-logo').addEventListener('click', () => {
//     const sidebar = document.getElementById('sidebar');
//     sidebar.classList.toggle('w-64');
//     sidebar.classList.toggle('w-20');
//     document.querySelectorAll('.nav-text').forEach(el => el.classList.toggle('hidden'));
//     document.getElementById('sidebar-arrow').classList.toggle('fa-chevron-right');
//     document.getElementById('sidebar-arrow').classList.toggle('fa-chevron-left');
//     document.querySelectorAll('.nav-icon').forEach(el => {
//         el.classList.toggle('mr-3');
//         el.classList.toggle('mx-auto');
//     });
    
//     // Redraw table to fix alignment after sidebar toggle
//     setTimeout(() => {
//         if ($.fn.DataTable.isDataTable('#orderTable')) {
//             $('#orderTable').DataTable().columns.adjust();
//         }
//     }, 300);
// });

// Logout Modal Logic
const logoutBtn = document.getElementById('logoutBtn');
const modal = document.getElementById('logoutConfirmModal');
const yesBtn = document.getElementById('logoutConfirmYes');
const noBtn = document.getElementById('logoutConfirmNo');
const closeBtn = document.getElementById('closeLogoutModal');

// Open modal
logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  modal.classList.remove('hidden');
});

// Close modal
function closeModal() {
  modal.classList.add('hidden');
}

noBtn.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);

// Close on outside click
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Confirm logout
yesBtn.addEventListener('click', () => {
  window.location.href = '../Login/login.html';
});