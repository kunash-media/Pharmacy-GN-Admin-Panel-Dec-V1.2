// dashboard.js - Fully Dynamic Dashboard with Real API Data


const API_BASE_URL = 'http://localhost:8083'

// USER PROFILE - Keep existing
function displayUserProfile() {
  const admin = Auth.getCurrentAdmin();
  const userInitials = document.getElementById('user-initials');
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');

  if (!admin || !admin.firstName) {
    userName.textContent = "Guest";
    userRole.textContent = "Unknown";
    userInitials.textContent = "??";
    return;
  }

  const fullName = `${admin.firstName} ${admin.lastName || ''}`.trim();
  const nameParts = fullName.trim().split(' ');
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : (nameParts[0]?.[0] || '?');

  userInitials.textContent = initials.toUpperCase();
  userName.textContent = fullName;
  userRole.textContent = "Admin";
}

document.addEventListener("DOMContentLoaded", () => {
  displayUserProfile();
  initializeSidebar();
  loadAllDashboardData(); // Main function to load everything
});

// SIDEBAR TOGGLE - FULLY FIXED: Smooth, Perfect Alignment, No Misalignment Ever

const toggleSidebarLogo = document.getElementById('toggle-sidebar-logo');
const sidebar = document.getElementById('sidebar');
const sidebarArrow = document.getElementById('sidebar-arrow');
const toggleSidebarMobile = document.getElementById('toggle-sidebar-mobile');
const closeSidebar = document.getElementById('close-sidebar');

// Remove any previous listeners to avoid duplicates
toggleSidebarLogo?.removeEventListener('click', toggleSidebar);
toggleSidebarLogo?.addEventListener('click', toggleSidebar);

function toggleSidebar() {
  if (window.innerWidth < 768) {
    // Mobile: slide in/out
    sidebar.classList.toggle('-translate-x-full');
  } else {
    // Desktop: collapse / expand
    sidebar.classList.toggle('collapsed');

    if (sidebar.classList.contains('collapsed')) {
      // COLLAPSED
      sidebarArrow.classList.remove('fa-chevron-left');
      sidebarArrow.classList.add('fa-chevron-right');

      // Hide text smoothly
      document.querySelectorAll('.nav-text').forEach((text, index) => {
        text.classList.add('opacity-0', 'w-0');
        text.style.transitionDelay = `${index * 20}ms`;
      });

      // Center icons using flex
      document.querySelectorAll('.nav-icon').forEach(icon => {
        icon.classList.remove('mr-3');
        icon.classList.add('mx-auto');
      });

    } else {
      // EXPANDED
      sidebarArrow.classList.remove('fa-chevron-right');
      sidebarArrow.classList.add('fa-chevron-left');

      // Show text smoothly
      document.querySelectorAll('.nav-text').forEach((text, index) => {
        text.classList.remove('opacity-0', 'w-0');
        text.style.transitionDelay = `${index * 20}ms`;
      });

      // Align icons to left
      document.querySelectorAll('.nav-icon').forEach(icon => {
        icon.classList.remove('mx-auto');
        icon.classList.add('mr-3');
      });
    }
  }
}

function initializeSidebar() {
  if (window.innerWidth >= 768) {
    sidebar.classList.remove('collapsed');
    sidebarArrow.classList.remove('fa-chevron-right');
    sidebarArrow.classList.add('fa-chevron-left');

    // Ensure text is visible and icons aligned on load
    document.querySelectorAll('.nav-text').forEach(text => {
      text.classList.remove('opacity-0', 'w-0');
    });
    document.querySelectorAll('.nav-icon').forEach(icon => {
      icon.classList.add('mr-3');
      icon.classList.remove('mx-auto');
    });
  } else {
    sidebar.classList.add('-translate-x-full');
  }
}

// Mobile controls
toggleSidebarMobile?.addEventListener('click', () => {
  sidebar.classList.remove('-translate-x-full');
});

closeSidebar?.addEventListener('click', () => {
  sidebar.classList.add('-translate-x-full');
});

// Close on outside click (mobile)
document.addEventListener('click', (e) => {
  if (window.innerWidth < 768 &&
      !sidebar.classList.contains('-translate-x-full') &&
      !sidebar.contains(e.target) &&
      !toggleSidebarLogo?.contains(e.target) &&
      !toggleSidebarMobile?.contains(e.target)) {
    sidebar.classList.add('-translate-x-full');
  }
});



// MAIN: Load all dashboard data from backend
async function loadAllDashboardData() {
  try {
    // Parallel fetch all data
    const [
      summaryRes,
      revenueRes,
      categoryRes,
      recentPrescriptionsRes,
      lowStockRes,
      topSellingRes,
      expiryRes
    ] = await Promise.all([
      fetch(`${API_BASE_URL}/api/dashboard/summary`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/dashboard/revenue-monthly?year=2026`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/dashboard/category-distribution`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/dashboard/prescriptions/recent?limit=10`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/dashboard/inventory/low-stock?limit=10`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/dashboard/sales/top-selling?limit=10&months=3`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/dashboard/inventory/expiry-summary`).then(r => r.json())
    ]);

    if (summaryRes.success) updateSummaryCards(summaryRes.data);
    if (revenueRes.success) updateRevenueChart(revenueRes.data);
    if (categoryRes.success) updateCategoryChart(categoryRes.data);
    if (recentPrescriptionsRes.success) populateTable('prescriptionsTable', recentPrescriptionsRes.data, ['patientName', 'prescriptionId', 'date', 'status']);
    if (lowStockRes.success) populateLowStockTable(lowStockRes.data);
    if (topSellingRes.success) populateTopSellingTable(topSellingRes.data);
    if (expiryRes.success) {
      updateExpiryChart(expiryRes.data);
      populateTable('expiryTable', expiryRes.data.items, ['productName', 'expiryDate', 'period']);
    }
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
    alert("Failed to load dashboard. Please check if backend is running.");
  }
}

// Update Top 4 Cards
function updateSummaryCards(data) {
  document.querySelectorAll('.stats-card')[0].querySelector('h2').textContent = `₹${data.totalProfit?.toLocaleString() || 0}`;
  document.querySelectorAll('.stats-card')[1].querySelector('h2').textContent = data.totalPrescriptions || 0;
  document.querySelectorAll('.stats-card')[2].querySelector('h2').textContent = data.totalInventoryItems || 0;
  document.querySelectorAll('.stats-card')[3].querySelector('h2').textContent = data.lowStockItems || 0;

  // Trend indicator
  const profitCard = document.querySelectorAll('.stats-card')[0];
  const trendText = profitCard.querySelector('p.text-sm');
  trendText.innerHTML = data.profitTrend === 'up'
    ? '<i class="fas fa-arrow-up text-green-600"></i> Increased this month'
    : '<i class="fas fa-arrow-down text-red-600"></i> Decreased this month';
}

// Charts
let revenueChart, categoryChart, expiryChart;

function updateRevenueChart(data) {
  const ctx = document.getElementById('revenueChart').getContext('2d');
  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.months,
      datasets: [{
        label: 'Revenue',
        data: data.revenues,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { datalabels: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: v => '₹' + v }
        }
      }
    }
  });
}

function updateCategoryChart(data) {
  const ctx = document.getElementById('categoriesChart').getContext('2d');
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.categories,
      datasets: [{
        data: data.counts,
        backgroundColor: ['#06b6d4', '#34d399', '#fb923c', '#a855f7', '#8b5cf6', '#f59e0b'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        datalabels: {
          color: '#fff',
          font: { weight: 'bold' },
          formatter: (val, ctx) => {
            const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
            return Math.round(val / sum * 100) + '%';
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function updateExpiryChart(data) {
  const ctx = document.getElementById('expiryChart').getContext('2d');
  if (expiryChart) expiryChart.destroy();
  expiryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Within 30 Days', 'Within 60 Days', 'Within 90 Days'],
      datasets: [{
        label: 'Medications Expiring',
        data: [data.within30Days, data.within60Days, data.within90Days],
        backgroundColor: ['#ef4444', '#f97316', '#06b6d4']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        datalabels: {
          color: '#fff',
          font: { weight: 'bold', size: 14 },
          formatter: v => v || ''
        }
      },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    },
    plugins: [ChartDataLabels]
  });
}

// Table Population
function populateTable(tableId, data, columns) {
  const tbody = document.getElementById(tableId);
  tbody.innerHTML = '';
  data.forEach(item => {
    const row = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      td.classList.add('py-2', 'border-b', 'border-gray-200');

      if (col === 'status') {
        const status = item.status || item.orderStatus;
        const colors = {
          'APPROVED': 'bg-green-200 text-green-800',
          'PENDING': 'bg-yellow-200 text-yellow-800',
          'REJECTED': 'bg-red-200 text-red-800'
        };
        td.innerHTML = `<span class="px-2 py-1 rounded ${colors[status?.toUpperCase()] || 'bg-gray-200 text-gray-800'}">${status}</span>`;
      } else if (col === 'period') {
        const colors = {
          'Within 30 Days': 'bg-red-200 text-red-800',
          'Within 60 Days': 'bg-orange-200 text-orange-800',
          'Within 90 Days': 'bg-cyan-200 text-cyan-800'
        };
        td.innerHTML = `<span class="px-2 py-1 rounded ${colors[item[col]]}">${item[col]}</span>`;
      } else if (col === 'revenue') {
        td.textContent = `₹${item[col]}`;
      } else if (col === 'date' || col === 'expiryDate') {
        td.textContent = new Date(item[col]).toLocaleDateString();
      } else {
        td.textContent = item[col] || '';
      }
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
}

function populateLowStockTable(data) {
  const tbody = document.getElementById('lowStockTable');
  tbody.innerHTML = '';
  data.forEach(item => {
    const row = document.createElement('tr');
    ['productName', 'sku', 'currentStock', 'alertLevel'].forEach(col => {
      const td = document.createElement('td');
      td.classList.add('py-2', 'border-b', 'border-gray-200');
      if (col === 'currentStock') td.textContent = item.currentStock;
      else if (col === 'alertLevel') {
        const color = item.alertLevel === 'Out' ? 'bg-red-500' : item.alertLevel === 'Critical' ? 'bg-orange-500' : 'bg-yellow-400';
        td.innerHTML = `<button class="text-white py-1 px-2 rounded ${color}">${item.alertLevel}</button>`;
      } else td.textContent = item[col] || '';
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
}

function populateTopSellingTable(data) {
  populateTable('topSellingTable', data, ['productName', 'unitsSold', 'revenue']);
}

// Keep your existing sorting, filtering, export functions (unchanged)
function sortTable(table, col, isNumeric = false, isDate = false) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.rows);
  const header = table.querySelector(`th[data-sort="${col}"]`);
  const dir = header.dataset.dir = header.dataset.dir === 'asc' ? 'desc' : 'asc';

  rows.sort((a, b) => {
    let A = a.cells[[...table.querySelectorAll('th')].findIndex(th => th.dataset.sort === col)].textContent.trim();
    let B = b.cells[[...table.querySelectorAll('th')].findIndex(th => th.dataset.sort === col)].textContent.trim();

    if (isNumeric) { A = parseFloat(A.replace('₹', '')); B = parseFloat(B.replace('₹', '')); }
    if (isDate) { A = new Date(A).getTime(); B = new Date(B).getTime(); }

    return dir === 'asc' ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
  });

  rows.forEach(r => tbody.appendChild(r));
}

// Attach sorting (keep existing)
document.querySelectorAll('#prescriptions-table th[data-sort]').forEach(th => th.addEventListener('click', () => sortTable(document.getElementById('prescriptions-table'), th.dataset.sort)));
document.querySelectorAll('#lowstock-table th[data-sort]').forEach(th => th.addEventListener('click', () => sortTable(document.getElementById('lowstock-table'), th.dataset.sort, th.dataset.sort === 'currentStock')));
document.querySelectorAll('#topselling-table th[data-sort]').forEach(th => th.addEventListener('click', () => sortTable(document.getElementById('topselling-table'), th.dataset.sort, true)));
document.querySelectorAll('#expiry-table th[data-sort]').forEach(th => th.addEventListener('click', () => sortTable(document.getElementById('expiry-table'), th.dataset.sort, false, true)));

// Filtering
function filterTable(tableId, query, filterCol = null, filterValue = null) {
  const rows = document.querySelectorAll(`#${tableId} tr`);
  rows.forEach(row => {
    const textMatch = query ? [...row.cells].some(cell => cell.textContent.toLowerCase().includes(query.toLowerCase())) : true;
    const filterMatch = filterCol ? row.cells[filterCol].textContent === filterValue : true;
    row.style.display = textMatch && filterMatch ? '' : 'none';
  });
}

document.getElementById('lowstock-search')?.addEventListener('input', e => {
  const filter = document.getElementById('lowstock-filter').value;
  const val = filter === 'low' ? 'Low' : filter === 'finished' ? 'Out' : filter === 'critical' ? 'Critical' : null;
  filterTable('lowStockTable', e.target.value, 3, val);
});

document.getElementById('topselling-search')?.addEventListener('input', e => filterTable('topSellingTable', e.target.value));

// Export Top Selling
document.getElementById('export-topselling')?.addEventListener('click', async () => {
  const res = await fetch('/api/dashboard/sales/top-selling?limit=1000&months=12');
  const json = await res.json();
  if (json.success) {
    const csv = json.data.map(r => `${r.productName},${r.unitsSold},₹${r.revenue}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top_selling_medications.csv';
    a.click();
  }
});

// Logout Modal - Keep existing
const logoutBtn = document.getElementById('logoutBtn');
const logoutModal = document.getElementById('logoutModal');
const confirmLogout = document.getElementById('confirmLogout');
const cancelLogout = document.getElementById('cancelLogout');
const closeLogoutModal = document.getElementById('closeLogoutModal');

logoutBtn?.addEventListener('click', e => {
  e.preventDefault();
  logoutModal.classList.remove('hidden');
});

function closeModal() {
  logoutModal.classList.add('hidden');
}

cancelLogout?.addEventListener('click', closeModal);
closeLogoutModal?.addEventListener('click', closeModal);
logoutModal?.addEventListener('click', e => { if (e.target === logoutModal) closeModal(); });
confirmLogout?.addEventListener('click', () => { window.location.href = '../Login/login.html'; });