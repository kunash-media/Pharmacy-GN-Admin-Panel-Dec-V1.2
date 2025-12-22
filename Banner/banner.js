const user = { name: "", role: "Admin" };

function displayUserProfile() {
  const initialsEl = document.getElementById('user-initials');
  const nameEl = document.getElementById('user-name');
  const roleEl = document.getElementById('user-role');
  const parts = user.name.trim().split(' ');
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length-1][0]}` : parts[0][0];
  initialsEl.textContent = initials.toUpperCase();
  nameEl.textContent = user.name;
  roleEl.textContent = user.role;
}

function showToast(message, type = 'success') {
  Toastify({
    text: message,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    backgroundColor: type === 'success' ? '#34a853' : '#ea4335',
    stopOnFocus: true,
    style: { borderRadius: '8px', fontSize: '14px', padding: '10px 20px' }
  }).showToast();
}

displayUserProfile();

// API Configuration
const API_BASE_URL = 'http://localhost:8083/api/banners';

// Store banners in memory
let banners = [];

// DOM Elements
const tableView = document.getElementById('tableView');
const gridView = document.getElementById('gridView');
const tableViewBtn = document.getElementById('tableViewBtn');
const gridViewBtn = document.getElementById('gridViewBtn');
const addBannerBtn = document.getElementById('addBannerBtn');
const bannerModal = document.getElementById('bannerModal');
const viewBannerModal = document.getElementById('viewBannerModal');
const deleteModal = document.getElementById('deleteModal');
const logoutModal = document.getElementById('logoutModal');
const saveBannerBtn = document.getElementById('saveBannerBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
const bannersTableBody = document.getElementById('bannersTableBody');
const bannerImage1 = document.getElementById('bannerImage1');
const bannerImage2 = document.getElementById('bannerImage2');
const bannerImage3 = document.getElementById('bannerImage3');
const bannerImage4 = document.getElementById('bannerImage4');
const imagePreview = document.getElementById('imagePreview');
const thumbnailContainer = document.getElementById('thumbnailContainer');
const bannerStatus = document.getElementById('bannerStatus');
const statusLabel = document.getElementById('statusLabel');
const bannerSearch = document.getElementById('banner-search');
const statusFilter = document.getElementById('status-filter');
const logoutBtn = document.getElementById('logout-btn');

let currentBannerId = null;
let isEditMode = false;
let currentMainImageIndex = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadBanners();

  // View toggle
  tableViewBtn.addEventListener('click', () => { 
    tableView.style.display = 'block'; 
    gridView.style.display = 'none'; 
    tableViewBtn.classList.add('active'); 
    gridViewBtn.classList.remove('active'); 
  });
  gridViewBtn.addEventListener('click', () => { 
    tableView.style.display = 'none'; 
    gridView.style.display = 'grid'; 
    gridViewBtn.classList.add('active'); 
    tableViewBtn.classList.remove('active'); 
  });

  // Modals
  addBannerBtn.addEventListener('click', () => openBannerModal());
  document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => bannerModal.style.display = 'none'));
  document.querySelectorAll('.close-view-modal').forEach(btn => btn.addEventListener('click', () => viewBannerModal.style.display = 'none'));
  document.querySelectorAll('.close-delete-modal').forEach(btn => btn.addEventListener('click', () => deleteModal.style.display = 'none'));
  document.querySelectorAll('.close-logout-modal').forEach(btn => btn.addEventListener('click', () => logoutModal.style.display = 'none'));

  saveBannerBtn.addEventListener('click', saveBanner);
  confirmDeleteBtn.addEventListener('click', deleteBanner);
  confirmLogoutBtn.addEventListener('click', () => { window.location.href = '../Login/login.html'; });
  logoutBtn.addEventListener('click', () => logoutModal.style.display = 'flex');

  // Image preview
  [bannerImage1, bannerImage2, bannerImage3, bannerImage4].forEach((input, idx) => {
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => {
          if (idx === 0) {
            imagePreview.src = ev.target.result;
            imagePreview.style.display = 'block';
            document.getElementById('previewImage').src = ev.target.result;
          }
          updateThumbnails(idx, ev.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  });

  bannerStatus.addEventListener('change', () => statusLabel.textContent = bannerStatus.checked ? 'Active' : 'Inactive');

  document.getElementById('bannerTitle').addEventListener('input', () => document.getElementById('previewTitle').textContent = document.getElementById('bannerTitle').value || 'Banner Title');
  document.getElementById('bannerDescription').addEventListener('input', () => document.getElementById('previewDescription').textContent = document.getElementById('bannerDescription').value || 'Banner description will appear here');

  bannerSearch.addEventListener('input', loadBanners);
  statusFilter.addEventListener('change', loadBanners);
});

// API Functions
async function loadBanners() {
  try {
    const response = await fetch(`${API_BASE_URL}/get-all-banners`);
    if (!response.ok) throw new Error('Failed to fetch banners');
    
    const data = await response.json();
    banners = data;
    
    filterAndDisplayBanners();
  } catch (error) {
    console.error('Error loading banners:', error);
    showToast('Failed to load banners', 'error');
  }
}

function filterAndDisplayBanners() {
  const term = bannerSearch.value.toLowerCase();
  const status = statusFilter.value;
  
  const filtered = banners.filter(b => {
    const titleMatch = b.header?.toLowerCase().includes(term) || false;
    const textMatch = b.text?.toLowerCase().includes(term) || false;
    const pageMatch = b.pageName?.toLowerCase().includes(term) || false;
    const statusMatch = !status || (b.status === status);
    
    return (titleMatch || textMatch || pageMatch) && statusMatch;
  });

  bannersTableBody.innerHTML = '';
  gridView.innerHTML = '';

  filtered.forEach(b => {
    const row = document.createElement('tr');
    const hasImage = b.hasBannerFileOne || b.hasBannerFileTwo || b.hasBannerFileThree || b.hasBannerFileFour;
    const imageSrc = hasImage ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="50"%3E%3Crect width="80" height="50" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E' : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="50"%3E%3Crect width="80" height="50" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
    
    row.innerHTML = `
      <td><img src="${imageSrc}" alt="${b.header || 'No Title'}" style="width:80px;height:50px;object-fit:cover;border-radius:4px;"></td>
      <td>${b.header || 'No Title'}</td>
      <td>${b.pageName || 'No Page'}</td>
      <td><span class="badge ${b.status==='active'?'badge-active':'badge-inactive'}">${b.status==='active'?'Active':'Inactive'}</span></td>
      <td>${b.createdDate ? formatDate(b.createdDate) : 'N/A'}</td>
      <td>
        <button class="action-btn view" onclick="viewBanner(${b.bannerId})"><i class="fas fa-eye"></i></button>
        <button class="action-btn edit" onclick="editBanner(${b.bannerId})"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" onclick="confirmDelete(${b.bannerId})"><i class="fas fa-trash"></i></button>
        <label class="switch ml-2"><input type="checkbox" ${b.status==='active'?'checked':''} onchange="toggleStatus(${b.bannerId})"><span class="slider"></span></label>
      </td>`;
    bannersTableBody.appendChild(row);

    const card = document.createElement('div');
    card.className = 'banner-card';
    card.innerHTML = `
      <img src="${imageSrc}" alt="${b.header || 'No Title'}">
      <div class="banner-card-body">
        <div class="banner-card-title">${b.header || 'No Title'}</div>
        <div class="banner-card-desc">${b.text || 'No description'}</div>
        <div class="banner-card-desc">Page: ${b.pageName || 'No page'}</div>
      </div>
      <div class="banner-card-footer">
        <span class="badge ${b.status==='active'?'badge-active':'badge-inactive'}">${b.status==='active'?'Active':'Inactive'}</span>
        <div>
          <button class="action-btn view" onclick="viewBanner(${b.bannerId})"><i class="fas fa-eye"></i></button>
          <button class="action-btn edit" onclick="editBanner(${b.bannerId})"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="confirmDelete(${b.bannerId})"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
    gridView.appendChild(card);
  });
}

async function openBannerModal(banner = null) {
  isEditMode = !!banner;
  currentBannerId = banner?.bannerId || null;
  currentMainImageIndex = 0;
  document.getElementById('modalTitle').textContent = isEditMode ? 'Edit Banner' : 'Add New Banner';

  if (isEditMode) {
    // Load banner details for editing
    await loadBannerDetails(banner.bannerId);
  } else {
    // Reset form for new banner
    document.getElementById('bannerForm').reset();
    imagePreview.style.display = 'none'; 
    thumbnailContainer.innerHTML = '';
    document.getElementById('previewImage').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='150'%3E%3Crect width='400' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3EBanner Preview%3C/text%3E%3C/svg%3E";
    document.getElementById('previewTitle').textContent = 'Banner Title';
    document.getElementById('previewDescription').textContent = 'Banner description will appear here';
    bannerStatus.checked = true; 
    statusLabel.textContent = 'Active';
  }
  bannerModal.style.display = 'flex';
}

async function loadBannerDetails(bannerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/get-banner-by-Id/${bannerId}`);
    if (!response.ok) throw new Error('Failed to fetch banner details');
    
    const b = await response.json();
    
    document.getElementById('bannerTitle').value = b.header || '';
    document.getElementById('bannerDescription').value = b.text || '';
    document.getElementById('pageName').value = b.pageName || '';
    bannerStatus.checked = b.status === 'active';
    statusLabel.textContent = b.status === 'active' ? 'Active' : 'Inactive';
    
    // Show placeholder for images since we can't display uploaded files
    imagePreview.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='150'%3E%3Crect width='400' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3EImage Uploaded%3C/text%3E%3C/svg%3E";
    imagePreview.style.display = 'block';
    document.getElementById('previewImage').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='150'%3E%3Crect width='400' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3EImage Uploaded%3C/text%3E%3C/svg%3E";
    document.getElementById('previewTitle').textContent = b.header || 'Banner Title';
    document.getElementById('previewDescription').textContent = b.text || 'Banner description will appear here';
    
    // Create thumbnails based on available files
    thumbnailContainer.innerHTML = '';
    const fileInputs = [
      { hasFile: b.hasBannerFileOne, input: bannerImage1 },
      { hasFile: b.hasBannerFileTwo, input: bannerImage2 },
      { hasFile: b.hasBannerFileThree, input: bannerImage3 },
      { hasFile: b.hasBannerFileFour, input: bannerImage4 }
    ];
    
    let imageIndex = 0;
    fileInputs.forEach((fileObj, idx) => {
      if (fileObj.hasFile) {
        const img = document.createElement('img');
        img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50'%3E%3Crect width='100' height='50' fill='%23e0f2ff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%23999'%3EImage ${idx + 1}%3C/text%3E%3C/svg%3E";
        img.className = `thumbnail ${imageIndex === 0 ? 'active' : ''}`;
        img.onclick = () => {
          currentMainImageIndex = imageIndex;
          document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
          img.classList.add('active');
        };
        thumbnailContainer.appendChild(img);
        imageIndex++;
      }
    });
    
  } catch (error) {
    console.error('Error loading banner details:', error);
    showToast('Failed to load banner details', 'error');
  }
}

async function saveBanner() {
  const title = document.getElementById('bannerTitle').value.trim();
  const desc = document.getElementById('bannerDescription').value.trim();
  const page = document.getElementById('pageName').value.trim();
  const status = bannerStatus.checked ? 'active' : 'inactive';

  if (!title || !page) {
    showToast('Title and page name are required', 'error');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('pageName', page);
    formData.append('header', title);
    formData.append('text', desc);
    formData.append('bannerFileOne', bannerImage1.files[0] || '');
    formData.append('bannerFileTwo', bannerImage2.files[0] || '');
    formData.append('bannerFileThree', bannerImage3.files[0] || '');
    formData.append('bannerFileFour', bannerImage4.files[0] || '');

    let response;
    if (isEditMode) {
      response = await fetch(`${API_BASE_URL}/update-banner-by-bannerId/${currentBannerId}`, {
        method: 'PATCH',
        body: formData
      });
    } else {
      response = await fetch(`${API_BASE_URL}/create-banner`, {
        method: 'POST',
        body: formData
      });
    }

    if (!response.ok) throw new Error('Failed to save banner');

    const result = await response.json();
    
    bannerModal.style.display = 'none';
    await loadBanners();
    showToast(`Banner ${isEditMode ? 'updated' : 'added'} successfully!`, 'success');
    
  } catch (error) {
    console.error('Error saving banner:', error);
    showToast('Failed to save banner', 'error');
  }
}

async function editBanner(bannerId) {
  const banner = banners.find(b => b.bannerId === bannerId);
  if (banner) {
    await openBannerModal(banner);
  }
}

async function viewBanner(bannerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/get-banner-by-Id/${bannerId}`);
    if (!response.ok) throw new Error('Failed to fetch banner details');
    
    const b = await response.json();
    
    // Since we can't display uploaded images directly, show placeholder
    document.getElementById('viewBannerImage').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3EBanner Image%3C/text%3E%3C/svg%3E";
    document.getElementById('viewBannerTitle').textContent = b.header || 'No Title';
    document.getElementById('viewBannerDescription').textContent = b.text || 'No description';
    document.getElementById('viewBannerPage').textContent = b.pageName || 'No page';
    document.getElementById('viewBannerStatus').innerHTML = `<span class="badge ${b.status==='active'?'badge-active':'badge-inactive'}">${b.status==='active'?'Active':'Inactive'}</span>`;
    document.getElementById('viewBannerDate').textContent = b.createdDate ? formatDate(b.createdDate) : 'N/A';
    
    const cont = document.getElementById('viewThumbnailContainer');
    cont.innerHTML = '';
    
    // Show thumbnails for available images
    const fileInputs = [
      { hasFile: b.hasBannerFileOne, label: 'Image 1' },
      { hasFile: b.hasBannerFileTwo, label: 'Image 2' },
      { hasFile: b.hasBannerFileThree, label: 'Image 3' },
      { hasFile: b.hasBannerFileFour, label: 'Image 4' }
    ];
    
    fileInputs.forEach((fileObj, idx) => {
      if (fileObj.hasFile) {
        const img = document.createElement('img');
        img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50'%3E%3Crect width='100' height='50' fill='%23e0f2ff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%23999'%3E${fileObj.label}%3C/text%3E%3C/svg%3E";
        img.className = `thumbnail ${idx === 0 ? 'active' : ''}`;
        img.onclick = () => {
          document.getElementById('viewBannerImage').src = img.src;
          cont.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
          img.classList.add('active');
        };
        cont.appendChild(img);
      }
    });
    
    viewBannerModal.style.display = 'flex';
    
  } catch (error) {
    console.error('Error viewing banner:', error);
    showToast('Failed to load banner details', 'error');
  }
}

function confirmDelete(bannerId) {
  currentBannerId = bannerId;
  deleteModal.style.display = 'flex';
}

async function deleteBanner() {
  try {
    const response = await fetch(`${API_BASE_URL}/delete-banner-by-bannerId/${currentBannerId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete banner');
    
    const result = await response.text();
    
    deleteModal.style.display = 'none';
    await loadBanners();
    showToast('Banner deleted successfully!', 'success');
    
  } catch (error) {
    console.error('Error deleting banner:', error);
    showToast('Failed to delete banner', 'error');
  }
}

async function toggleStatus(bannerId) {
  try {
    const banner = banners.find(b => b.bannerId === bannerId);
    if (!banner) return;
    
    const newStatus = banner.status === 'active' ? 'inactive' : 'active';
    
    const formData = new FormData();
    formData.append('pageName', banner.pageName);
    formData.append('header', banner.header);
    formData.append('text', banner.text);
    
    const response = await fetch(`${API_BASE_URL}/patch-banner-by-bannerId/${bannerId}`, {
      method: 'PATCH',
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to update banner status');
    
    await loadBanners();
    showToast(`Status changed to ${newStatus}`, 'success');
    
  } catch (error) {
    console.error('Error updating status:', error);
    showToast('Failed to update status', 'error');
    // Reload to reset the toggle
    loadBanners();
  }
}

function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function updateThumbnails(activeIdx, newSrc) {
  const srcs = [bannerImage1.files[0], bannerImage2.files[0], bannerImage3.files[0], bannerImage4.files[0]]
    .map(f => f ? URL.createObjectURL(f) : null).filter(Boolean);
  if (newSrc) srcs[activeIdx] = newSrc;
  thumbnailContainer.innerHTML = '';
  srcs.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src; 
    img.className = `thumbnail ${i===currentMainImageIndex?'active':''}`;
    img.onclick = () => { 
      currentMainImageIndex = i; 
      imagePreview.src = src; 
      document.getElementById('previewImage').src = src; 
      updateThumbnails(); 
    };
    thumbnailContainer.appendChild(img);
  });
}

// Sidebar toggle
document.getElementById('toggle-sidebar-logo').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('w-64'); 
  sidebar.classList.toggle('w-20');
  document.querySelectorAll('.nav-text').forEach(t => t.classList.toggle('hidden'));
  document.getElementById('sidebar-arrow').classList.toggle('rotate-180');
});
document.getElementById('close-sidebar').addEventListener('click', () => document.getElementById('sidebar').classList.add('-translate-x-full'));
document.getElementById('toggle-sidebar-mobile').addEventListener('click', () => document.getElementById('sidebar').classList.remove('-translate-x-full'));