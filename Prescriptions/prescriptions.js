// User profile functionality
// const user = {
//   name: "Shreya Kamble",
//   role: "Admin",
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

// displayUserProfile();

// Updated: Expanded prescriptionsData with 35 entries
const prescriptionsData = [];

// Updated: Notifications data
const notificationsData = [
  {
    title: "Expiring Soon",
    message: "Prescription RX-1018 for David Wilson expires in 2 days.",
    time: "2 hours ago",
  },
  {
    title: "Clarification Needed",
    message: "Dr. Martinez needs clarification on prescription RX-1023.",
    time: "5 hours ago",
  },
  {
    title: "Ready for Pickup",
    message: "3 prescriptions are ready for patient pickup.",
    time: "Yesterday",
  },
];

// DOM Ready
$(document).ready(function () {
  // Initialize Flatpickr for date filters
  flatpickr("#date-from", { dateFormat: "Y-m-d" });
  flatpickr("#date-to", { dateFormat: "Y-m-d" });
  flatpickr("#history-date-from", { dateFormat: "Y-m-d" });
  flatpickr("#history-date-to", { dateFormat: "Y-m-d" });

  // Initialize DataTables
  const table = $("#prescriptionsTable").DataTable({
    responsive: false,
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50],
    order: [[0, "desc"]],
    dom: '<"top-controls mb-4"lf>rt<"bottom-controls mt-4"ip>',
    scrollX: true,
    scrollY: '400px',
    scrollCollapse: true,
    paging: true,
    drawCallback: function () {
      this.api().columns.adjust();
    },
  });

  const historyTable = $("#historyTable").DataTable({
    responsive: false,
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50],
    order: [[4, "desc"]],
    dom: '<"top-controls mb-4"lf>rt<"bottom-controls mt-4"ip>',
    scrollX: true,
    scrollY: '400px',
    scrollCollapse: true,
    paging: true,
    drawCallback: function () {
      this.api().columns.adjust();
    },
  });

  const notificationsTable = $("#notificationsTable").DataTable({
    responsive: false,
    searching: false,
    paging: false,
    info: false,
    order: [[2, "desc"]],
    scrollY: '200px',
    scrollCollapse: true,
    drawCallback: function () {
      this.api().columns.adjust();
    },
  });

  // Sidebar functionality
  $("#toggle-sidebar-mobile, #close-sidebar").on("click", function () {
    $("#sidebar").toggleClass("-translate-x-full");
  });

  $("#toggle-sidebar-logo").on("click", function () {
    $("#sidebar").toggleClass("w-64 w-20");
    $("#sidebar-title, .nav-text").toggleClass("hidden");
    $("#sidebar-arrow").toggleClass("fa-chevron-right fa-chevron-left");
    $("#sidebar-logo").toggleClass("mr-2 mx-auto");
    $(".nav-icon").toggleClass("mr-3 mx-auto");
  });

  // Modal functionality
  function openModal(modalId) {
    $("#" + modalId).css("display", "flex").removeClass("hidden");
  }

  window.closeModal = function (modalId) {
    $("#" + modalId).css("display", "none").addClass("hidden");
  };

  $("#toggle-notifications").on("click", function () {
    openModal("notificationModal");
  });

  $("#closeNotifications").on("click", function () {
    closeModal("notificationModal");
  });

  // Updated: Image overlay close
  $("#closeImageOverlay").on("click", function () {
    closeModal("imageOverlay");
  });

  // Add medicine entry
  $("#addMedicine").on("click", function () {
    $("#medicineList").append(`
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 medicine-entry">
        <input type="text" placeholder="Drug Name" class="w-full" required />
        <input type="text" placeholder="Dosage" class="w-full" required />
        <input type="number" placeholder="Quantity" min="1" class="w-full" required />
        <input type="text" placeholder="Duration" class="w-full" required />
        <button type="button" class="text-red-500 delete-medicine md:col-span-4 text-right"><i class="fas fa-trash"></i> Remove</button>
      </div>
    `);
  });

  // Remove medicine entry
  $(document).on("click", ".delete-medicine", function () {
    $(this).closest(".medicine-entry").remove();
  });

  // Form submission
  $("#prescriptionForm").on("submit", function (e) {
    e.preventDefault();
    alert("Prescription saved successfully!");
    closeModal("prescriptionModal");
  });

  $("#add-prescription").on("click", function () {
    $("#modalTitle").text("Add Prescription");
    $("#prescriptionForm")[0].reset();
    $("#medicineList").html(`
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 medicine-entry">
        <input type="text" placeholder="Drug Name" class="w-full" required />
        <input type="text" placeholder="Dosage" class="w-full" required />
        <input type="number" placeholder="Quantity" min="1" class="w-full" required />
        <input type="text" placeholder="Duration" class="w-full" required />
      </div>
    `);
    openModal("prescriptionModal");
  });

  $("#export-reports").on("click", function () {
    alert("Export functionality would be implemented here.");
  });

  // View prescription details
  $(document).on("click", ".view-btn", function () {
    const prescriptionId = $(this).data("id");
    const prescription = prescriptionsData.find((p) => p.id === prescriptionId);

    if (prescription) {
      $("#verificationDetails").html(`
        <p><strong>Prescription ID:</strong> ${prescription.id}</p>
        <p><strong>Patient:</strong> ${prescription.patient}</p>
        <p><strong>Doctor:</strong> ${prescription.doctor}</p>
        <p><strong>Date:</strong> ${prescription.date}</p>
        <p><strong>Medicines:</strong> ${prescription.medicines
          .map(
            (m) => `${m.name} ${m.dosage}, ${m.quantity} for ${m.duration}`
          )
          .join("; ")}</p>
        <p><strong>Notes:</strong> ${prescription.notes}</p>
      `);
      // Updated: Store prescription ID for image overlay
      $("#view-prescription-images").data("id", prescriptionId);
      openModal("verificationModal");
    }
  });

  // Updated: View prescription images
  $(document).on("click", "#view-prescription-images", function () {
    const prescriptionId = $(this).data("id");
    const prescription = prescriptionsData.find((p) => p.id === prescriptionId);

    if (prescription) {
      $("#prescriptionImages").html(
        prescription.images.length > 0
          ? prescription.images
              .map(
                (img) =>
                  `<img src="${img}" alt="Prescription Scan" class="rounded-lg border border-gray-200 shadow-sm max-w-full h-auto">`
              )
              .join("")
          : `<p class="text-gray-500">No images available.</p>`
      );
      openModal("imageOverlay");
    }
  });

  // Updated: Status change handlers with console logs for testing
  $(document).on("click", ".pending-btn", function () {
    const prescriptionId = $(this).data("id");
    console.log(`[TEST] Clicking Pending button for ${prescriptionId}`);
    updatePrescriptionStatus(prescriptionId, "Pending", table, historyTable);
  });

  $(document).on("click", ".approve-btn", function () {
    const prescriptionId = $(this).data("id");
    console.log(`[TEST] Clicking Approve button for ${prescriptionId}`);
    updatePrescriptionStatus(prescriptionId, "Approved", table, historyTable);
  });

  $(document).on("click", ".reject-btn", function () {
    const prescriptionId = $(this).data("id");
    console.log(`[TEST] Clicking Reject button for ${prescriptionId}`);
    updatePrescriptionStatus(prescriptionId, "Rejected", table, historyTable);
  });

  // Date filter for prescriptions table
  $("#date-from, #date-to").on("change", function () {
    const fromDate = $("#date-from").val();
    const toDate = $("#date-to").val();
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
      const date = data[4];
      if (!fromDate && !toDate) return true;
      if (fromDate && !toDate && date >= fromDate) return true;
      if (!fromDate && toDate && date <= toDate) return true;
      if (fromDate && toDate && date >= fromDate && date <= toDate) return true;
      return false;
    });
    table.draw();
    $.fn.dataTable.ext.search.pop();
  });

  // History table quick filters
  $("#filter-this-week").on("click", function () {
    const today = new Date("2023-11-15");
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    applyHistoryDateFilter(
      weekStart.toISOString().split("T")[0],
      weekEnd.toISOString().split("T")[0],
      historyTable
    );
  });

  $("#filter-last-week").on("click", function () {
    const today = new Date("2023-11-15");
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    applyHistoryDateFilter(
      weekStart.toISOString().split("T")[0],
      weekEnd.toISOString().split("T")[0],
      historyTable
    );
  });

  $("#filter-this-month").on("click", function () {
    const today = new Date("2023-11-15");
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    applyHistoryDateFilter(
      monthStart.toISOString().split("T")[0],
      monthEnd.toISOString().split("T")[0],
      historyTable
    );
  });

  $("#history-date-from, #history-date-to").on("change", function () {
    const fromDate = $("#history-date-from").val();
    const toDate = $("#history-date-to").val();
    applyHistoryDateFilter(fromDate, toDate, historyTable);
  });

  function applyHistoryDateFilter(fromDate, toDate, table) {
    $("#history-date-from").val(fromDate);
    $("#history-date-to").val(toDate);
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
      const date = data[4];
      if (!fromDate && !toDate) return true;
      if (fromDate && !toDate && date >= fromDate) return true;
      if (!fromDate && toDate && date <= toDate) return true;
      if (fromDate && toDate && date >= fromDate && date <= toDate) return true;
      return false;
    });
    table.draw();
    $.fn.dataTable.ext.search.pop();
  }

  // Updated: Status update with mock API response
  function updatePrescriptionStatus(prescriptionId, status, mainTable, historyTable) {
    const prescription = prescriptionsData.find((p) => p.id === prescriptionId);
    if (prescription) {
      console.log(`[TEST] Updating ${prescriptionId} to ${status}`);
      // Mock API response for testing
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true }),
      };
      Promise.resolve(mockResponse)
        .then((response) => {
          if (!response.ok) throw new Error(`Mock HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          console.log(`[TEST] Success: Prescription ${prescriptionId} updated to ${status}`);
          alert(`Prescription ${status.toLowerCase()} successfully!`);
          prescription.status = status;
          updateTableAndCounts(mainTable, historyTable);
        })
        .catch((error) => {
          console.error(`[TEST] Error updating ${prescriptionId} to ${status}:`, error);
          alert(`Failed to update prescription: ${error.message}`);
        });
    } else {
      console.error(`[TEST] Prescription ${prescriptionId} not found`);
    }
  }

  // Close modals
  $("#closeModal, #closeVerification, #closePatient, #closeDoctor").on("click", function () {
    $(this).closest(".modal").css("display", "none").addClass("hidden");
  });

  $(window).on("click", function (e) {
    if ($(e.target).hasClass("modal")) {
      $(e.target).css("display", "none").addClass("hidden");
    }
  });

  // Status filter
  $("#filter-status").on("change", function () {
    const status = $(this).val();
    table.column(5).search(status).draw();
  });

  // Search functionality
  $("#search").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Update tables and counts
  function updateTableAndCounts(mainTable, historyTable) {
    mainTable.clear();
    prescriptionsData.forEach((prescription, index) => {
      mainTable.row.add([
        index + 1,
        prescription.id,
        prescription.patient,
        prescription.doctor,
        prescription.date,
        `<span class="status-badge status-${prescription.status.toLowerCase()}">${prescription.status}</span>`,
        `
          <button class="action-btn bg-blue-100 text-blue-700 view-btn" data-id="${prescription.id}"><i class="fas fa-eye"></i></button>
          <button class="action-btn bg-yellow-100 text-yellow-700 pending-btn" data-id="${prescription.id}"><i class="fas fa-clock"></i></button>
          <button class="action-btn bg-green-100 text-green-700 approve-btn" data-id="${prescription.id}"><i class="fas fa-check"></i></button>
          <button class="action-btn bg-red-100 text-red-700 reject-btn" data-id="${prescription.id}"><i class="fas fa-times"></i></button>
        `,
      ]);
    });
    mainTable.draw();

    historyTable.clear();
    prescriptionsData.forEach((prescription, index) => {
      historyTable.row.add([
        index + 1,
        prescription.id,
        prescription.patient,
        prescription.doctor,
        prescription.date,
        `<span class="status-badge status-${prescription.status.toLowerCase()}">${prescription.status}</span>`,
      ]);
    });
    historyTable.draw();

    const totalOrders = prescriptionsData.length;
    const todaysOrders = prescriptionsData.filter((p) => p.date === "2023-11-15").length;
    const approvedOrders = prescriptionsData.filter((p) => p.status === "Approved" || p.status === "Dispensed").length;
    const rejectedOrders = prescriptionsData.filter((p) => p.status === "Rejected").length;

    $("#total-orders").text(totalOrders);
    $("#todays-orders").text(todaysOrders);
    $("#approved-orders").text(approvedOrders);
    $("#rejected-orders").text(rejectedOrders);
  }

  // Populate tables and notifications
  updateTableAndCounts(table, historyTable);

  notificationsTable.clear();
  notificationsData.forEach((notification) => {
    notificationsTable.row.add([notification.title, notification.message, notification.time]);
  });
  notificationsTable.draw();
});

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