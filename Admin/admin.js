toastr.options = { closeButton: true, progressBar: true, positionClass: "toast-top-right", timeOut: 3000 };

/* ----------  API ENDPOINTS  ---------- */
const API = {
    BASE: "http://localhost:8083/api/admins",
    CREATE: () => `${API.BASE}/create-admin`,
    ALL: () => `${API.BASE}/get-all-admins`,
    BY_ID: id => `${API.BASE}/get-admin-by-id/${id}`,
    BY_EMAIL: email => `${API.BASE}/get-by-email/${encodeURIComponent(email)}`,
    BY_PHONE: phone => `${API.BASE}/get-by-phone/${encodeURIComponent(phone)}`,
    PUT: id => `${API.BASE}/put-admin-by-id/${id}`,
    PATCH: id => `${API.BASE}/patch-admin-by-id/${id}`,
    DELETE: id => `${API.BASE}/delete-admin-by-id/${id}`,
    RESET_PASSWORD: id => `${API.BASE}/reset-password/${encodeURIComponent(id)}`};

let admins = [];
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const adminTableBody = document.getElementById('adminTableBody');
const adminTable = $('#adminTable');
const selectAll = document.getElementById('selectAll');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
const selectedAdmins = new Set();
let dataTable;

document.addEventListener('DOMContentLoaded', () => {
    loadAdmins();
    initializeDataTable();
    setupEventListeners();
});

function initializeDataTable() {
    dataTable = adminTable.DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        responsive: true,
        columnDefs: [{ targets: 0, orderable: false, width: "50px" }]
    });
}

// function setupEventListeners() {
//     $('#toggle-sidebar-logo').on('click', toggleSidebar);
//     $('#toggle-sidebar-mobile').on('click', () => sidebar.classList.toggle('sidebar-open'));
//     $('#close-sidebar').on('click', () => sidebar.classList.remove('sidebar-open'));

//     selectAll.addEventListener('change', toggleSelectAll);
//     deleteSelectedBtn.addEventListener('click', deleteSelectedAdmins);

//     $('#editAdminForm').on('submit', handleEditAdmin);
//     $('#resetPasswordForm').on('submit', handleResetPassword);
//     $('#logoutBtn').on('click', () => openOverlay('logoutConfirmModal'));
//     $('#logoutConfirmYes').on('click', () => {
//         toastr.info('Logging out...');
//         setTimeout(() => location.href = '../Login/login.html', 1500);
//     });
//     $('#logoutConfirmNo').on('click', () => closeOverlay('logoutConfirmModal'));

//     $(window).on('click', e => {
//         if ($(e.target).hasClass('overlay')) closeOverlay(e.target.id);
//     });
// }

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




async function loadAdmins() {
    try {
        const response = await fetch(API.ALL());
        if (!response.ok) throw new Error('Failed to fetch admins');
        admins = await response.json();
        renderAdmins();
    } catch (error) {
        console.error('Error loading admins:', error);
        toastr.error('Failed to load admins from server');
        // Fallback to empty array
        admins = [];
        renderAdmins();
    }
}

function renderAdmins() {
    adminTableBody.innerHTML = '';
    admins.forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
<td class="text-center"><input type="checkbox" class="admin-checkbox w-4 h-4" data-id="${admin.id}"></td>
<td>${admin.id}</td>
<td>${admin.firstName}</td>
<td>${admin.lastName}</td>
<td>${admin.email}</td>
<td>${admin.phoneNumber}</td>
<td class="text-center space-x-1">
<button class="tooltip action-btn text-blue-600 view-admin" data-id="${admin.id}">
<i class="fas fa-eye"></i><span class="tooltiptext">View</span>
</button>
<button class="tooltip action-btn text-yellow-600 edit-admin" data-id="${admin.id}">
<i class="fas fa-edit"></i><span class="tooltiptext">Edit</span>
</button>
<button class="tooltip action-btn text-green-600 reset-admin" data-id="${admin.id}" data-name="${admin.firstName} ${admin.lastName}">
<i class="fas fa-key"></i><span class="tooltiptext">Reset Password</span>
</button>
</td>
        `;
        adminTableBody.appendChild(row);
    });

    $('.view-admin').off().on('click', e => showViewAdmin($(e.currentTarget).data('id')));
    $('.edit-admin').off().on('click', e => showEditAdmin($(e.currentTarget).data('id')));
    $('.reset-admin').off().on('click', e => showResetPassword($(e.currentTarget).data('id'), $(e.currentTarget).data('name')));
    $('.admin-checkbox').off().on('change', function() {
        const id = $(this).data('id');
        this.checked ? selectedAdmins.add(id) : selectedAdmins.delete(id);
        updateDeleteBtn();
    });

    if (dataTable) {
        dataTable.clear().rows.add($(adminTableBody).children()).draw();
    }
}

async function showViewAdmin(id) {
    try {
        const response = await fetch(API.BY_ID(id));
        if (!response.ok) throw new Error('Failed to fetch admin details');
        const admin = await response.json();
        
        $('#view-id').text(admin.id);
        $('#view-name').text(`${admin.firstName} ${admin.lastName}`);
        $('#view-initials').text(`${admin.firstName.charAt(0)}${admin.lastName.charAt(0)}`);
        $('#view-email').text(admin.email);
        $('#view-email-text').text(admin.email);
        $('#view-phone').text(admin.phoneNumber);
        $('#view-password').val('********');
        $('#view-created').text('—');
        const statusElement = $('#view-status');
        statusElement.removeClass('status-active status-deactivated');
        statusElement.text('Active');
        statusElement.addClass('status-active');
        openOverlay('viewAdminOverlay');
    } catch (error) {
        console.error('Error loading admin details:', error);
        toastr.error('Failed to load admin details');
    }
}

function showEditAdmin(id) {
    const admin = admins.find(a => a.id === id);
    if (!admin) {
        toastr.error('Admin not found');
        return;
    }
    
    $('#edit-id').val(admin.id);
    $('#edit-password').val('********');
    $('#edit-firstname').val(admin.firstName);
    $('#edit-lastname').val(admin.lastName);
    $('#edit-email').val(admin.email);
    $('#edit-phone').val(admin.phoneNumber);
    openOverlay('editAdminOverlay');
}

function showResetPassword(id, name) {
    $('#reset-admin-id').val(id);
    $('#reset-admin-name').text(name);
    $('#old-password').val('');
    $('#new-password').val('');
    $('#confirm-password').val('');
    openOverlay('resetPasswordOverlay');
}

async function handleEditAdmin(e) {
    e.preventDefault();
    const id = parseInt($('#edit-id').val());
    const email = $('#edit-email').val().trim();
    
    if (!email) {
        toastr.error('Email is required');
        return;
    }

    try {
        const payload = {
            firstName: $('#edit-firstname').val().trim(),
            lastName: $('#edit-lastname').val().trim(),
            email: email,
            phoneNumber: $('#edit-phone').val().trim()
        };

        const response = await fetch(API.PATCH(id), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to update admin');

        const updatedAdmin = await response.json();
        
        // Update local array
        const idx = admins.findIndex(a => a.id === id);
        if (idx !== -1) {
            admins[idx] = updatedAdmin;
        }
        
        renderAdmins();
        closeOverlay('editAdminOverlay');
        toastr.success('Admin updated successfully');
    } catch (error) {
        console.error('Error updating admin:', error);
        toastr.error('Failed to update admin');
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    const oldPass = $('#old-password').val();
    const newPass = $('#new-password').val();
    const confirmPass = $('#confirm-password').val();
    const id = $('#reset-admin-id').val(); // Remove parseInt if ID is not numeric

    console.log('Reset password attempt:', { id, oldPass, newPass, confirmPass });

    if (newPass !== confirmPass) {
        toastr.error('Passwords do not match');
        return;
    }
    
    if (newPass.length < 8) {
        toastr.error('Password must be at least 8 characters');
        return;
    }

    try {
        const passwordData = {
            oldPassword: oldPass,
            newPassword: newPass
        };

        console.log('Sending request to:', API.RESET_PASSWORD(id));
        console.log('Request payload:', passwordData);

        const response = await fetch(API.RESET_PASSWORD(id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(passwordData)
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            const result = await response.text();
            console.log('Reset successful:', result);
            toastr.success('Password reset successfully');
            closeOverlay('resetPasswordOverlay');
            // Clear form
            $('#resetPasswordForm')[0].reset();
        } else {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            
            if (response.status === 400) {
                if (errorText.includes('Incorrect old password')) {
                    toastr.error('Incorrect old password');
                } else if (errorText.includes('validation') || errorText.includes('Validation')) {
                    toastr.error('Password validation failed');
                } else {
                    toastr.error(`Bad request: ${errorText}`);
                }
            } else if (response.status === 404) {
                toastr.error('Admin not found');
            } else {
                toastr.error(`Password reset failed: ${response.status} ${errorText}`);
            }
        }
    } catch (error) {
        console.error('Network error resetting password:', error);
        toastr.error('Network error: Failed to reset password');
    }
}

async function deleteSelectedAdmins() {
    if (selectedAdmins.size === 0) return;
    
    if (!confirm(`Delete ${selectedAdmins.size} admin(s)?`)) return;

    try {
        const deletePromises = Array.from(selectedAdmins).map(id => 
            fetch(API.DELETE(id), { method: 'DELETE' })
        );

        await Promise.all(deletePromises);
        
        // Refresh the admin list
        await loadAdmins();
        selectedAdmins.clear();
        selectAll.checked = false;
        updateDeleteBtn();
        toastr.success('Admins deleted successfully');
    } catch (error) {
        console.error('Error deleting admins:', error);
        toastr.error('Failed to delete admins');
    }
}

function toggleSelectAll() {
    $('.admin-checkbox').prop('checked', selectAll.checked);
    selectedAdmins.clear();
    if (selectAll.checked) admins.forEach(a => selectedAdmins.add(a.id));
    updateDeleteBtn();
}

function updateDeleteBtn() {
    deleteSelectedBtn.style.display = selectedAdmins.size > 0 ? 'flex' : 'none';
}

function toggleSidebar() {
    sidebar.classList.toggle('sidebar-collapsed');
    mainContent.classList.toggle('main-content-collapsed');
}

function openOverlay(id) { 
    $(`#${id}`).fadeIn(200); 
}

function closeOverlay(id) { 
    $(`#${id}`).fadeOut(200); 
}

function togglePasswordVisibility(inputId, toggleIconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(toggleIconId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}