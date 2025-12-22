
    // User profile functionality
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

    // Category and Subcategory data
    const categorySubcategories = {
      "Medicines & Healthcare": [
        "Prescription Medicines",
        "Over-the-Counter (OTC) Medicines",
        "Chronic Care",
        "First Aid & Emergency",
        "Pain Relief & Fever",
        "Allergy & Cold Care",
        "Digestive Health",
      ],
      "Mother Care & Maternity": [
        "Maternity Wear",
        "Pregnancy Nutrition",
        "Skincare for Moms",
        "Trimester Kits",
        "Postpartum Recovery",
        "Breastfeeding Essentials",
      ],
      "Baby Care": [
        "Diapers & Wipes",
        "Baby Skin & Hair Care",
        "Feeding & Nursing",
        "Baby Health & Safety",
        "Toys & Learning",
        "Baby Clothing & Accessories",
      ],
      "Wellness & Personal Care": [
        "Vitamins & Supplements",
        "Skin & Hair Care",
        "Oral Care",
        "Menstrual & Intimate Care",
        "Fitness & Weight Management",
      ],
      "Medical Devices & Equipment": [
        "Monitoring Devices",
        "Mobility Aids",
        "Respiratory Care",
      ],
      "Speciality Care": [
        "Women’s Health",
        "Men’s Health",
        "Senior Care",
        "Immunity Boosters",
        "Ayurveda & Herbal Products",
      ],
    };

    // Sample data for demonstration (expanded)
    const sampleData = {
      sales: [
        { id: 1, product: "Paracetamol", category: "Medicines & Healthcare", subcategory: "Pain Relief & Fever", qty: 40, revenue: 4000, date: "2025-09-18" },
        { id: 2, product: "Amoxicillin", category: "Medicines & Healthcare", subcategory: "Prescription Medicines", qty: 25, revenue: 7500, date: "2025-09-18" },
        { id: 3, product: "Prenatal Vitamins", category: "Mother Care & Maternity", subcategory: "Pregnancy Nutrition", qty: 15, revenue: 3000, date: "2025-09-18" },
        { id: 4, product: "Diapers Pack", category: "Baby Care", subcategory: "Diapers & Wipes", qty: 50, revenue: 5000, date: "2025-09-17" },
        { id: 5, product: "Vitamin C Supplements", category: "Wellness & Personal Care", subcategory: "Vitamins & Supplements", qty: 30, revenue: 1800, date: "2025-09-16" },
        { id: 6, product: "BP Monitor", category: "Medical Devices & Equipment", subcategory: "Monitoring Devices", qty: 10, revenue: 10000, date: "2025-09-15" },
        { id: 7, product: "Ayurveda Oil", category: "Speciality Care", subcategory: "Ayurveda & Herbal Products", qty: 20, revenue: 2400, date: "2025-09-14" },
        { id: 8, product: "Ibuprofen", category: "Medicines & Healthcare", subcategory: "Pain Relief & Fever", qty: 35, revenue: 3500, date: "2025-09-13" },
        { id: 9, product: "Baby Shampoo", category: "Baby Care", subcategory: "Baby Skin & Hair Care", qty: 45, revenue: 2250, date: "2025-09-12" },
        { id: 10, product: "Stretch Mark Cream", category: "Mother Care & Maternity", subcategory: "Skincare for Moms", qty: 25, revenue: 3750, date: "2025-09-11" },
        { id: 11, product: "Antacid Syrup", category: "Medicines & Healthcare", subcategory: "Digestive Health", qty: 20, revenue: 1600, date: "2025-09-10" },
        { id: 12, product: "Nebulizer", category: "Medical Devices & Equipment", subcategory: "Respiratory Care", qty: 5, revenue: 7500, date: "2025-09-09" },
        { id: 13, product: "Nursing Pads", category: "Mother Care & Maternity", subcategory: "Breastfeeding Essentials", qty: 30, revenue: 900, date: "2025-09-08" },
        { id: 14, product: "Toothpaste", category: "Wellness & Personal Care", subcategory: "Oral Care", qty: 50, revenue: 2500, date: "2025-09-07" },
        { id: 15, product: "Immunity Booster", category: "Speciality Care", subcategory: "Immunity Boosters", qty: 15, revenue: 2250, date: "2025-09-06" }
      ],
      inventory: [
        { id: 1, product: "Paracetamol", category: "Medicines & Healthcare", subcategory: "Pain Relief & Fever", qty: 100, stockValue: 10000, expiryDate: "2026-03-15" },
        { id: 2, product: "Ibuprofen", category: "Medicines & Healthcare", subcategory: "Pain Relief & Fever", qty: 50, stockValue: 7500, expiryDate: "2026-05-20" },
        { id: 3, product: "Diapers", category: "Baby Care", subcategory: "Diapers & Wipes", qty: 200, stockValue: 15000, expiryDate: "2027-01-10" },
        { id: 4, product: "Prenatal Vitamins", category: "Mother Care & Maternity", subcategory: "Pregnancy Nutrition", qty: 5, stockValue: 2500, expiryDate: "2025-10-05" },
        { id: 5, product: "Vitamin C Supplements", category: "Wellness & Personal Care", subcategory: "Vitamins & Supplements", qty: 150, stockValue: 9000, expiryDate: "2026-02-28" },
        { id: 6, product: "BP Monitor", category: "Medical Devices & Equipment", subcategory: "Monitoring Devices", qty: 20, stockValue: 20000, expiryDate: "2028-12-31" },
        { id: 7, product: "Ayurveda Oil", category: "Speciality Care", subcategory: "Ayurveda & Herbal Products", qty: 8, stockValue: 960, expiryDate: "2025-09-30" },
        { id: 8, product: "Amoxicillin", category: "Medicines & Healthcare", subcategory: "Prescription Medicines", qty: 75, stockValue: 11250, expiryDate: "2026-04-10" },
        { id: 9, product: "Baby Shampoo", category: "Baby Care", subcategory: "Baby Skin & Hair Care", qty: 3, stockValue: 450, expiryDate: "2025-10-15" },
        { id: 10, product: "Stretch Mark Cream", category: "Mother Care & Maternity", subcategory: "Skincare for Moms", qty: 40, stockValue: 6000, expiryDate: "2026-06-30" },
        { id: 11, product: "Antacid Syrup", category: "Medicines & Healthcare", subcategory: "Digestive Health", qty: 60, stockValue: 4800, expiryDate: "2026-01-20" },
        { id: 12, product: "Nebulizer", category: "Medical Devices & Equipment", subcategory: "Respiratory Care", qty: 10, stockValue: 15000, expiryDate: "2029-03-31" },
        { id: 13, product: "Nursing Pads", category: "Mother Care & Maternity", subcategory: "Breastfeeding Essentials", qty: 100, stockValue: 3000, expiryDate: "2026-08-15" },
        { id: 14, product: "Toothpaste", category: "Wellness & Personal Care", subcategory: "Oral Care", qty: 200, stockValue: 10000, expiryDate: "2026-11-30" },
        { id: 15, product: "Immunity Booster", category: "Speciality Care", subcategory: "Immunity Boosters", qty: 25, stockValue: 3750, expiryDate: "2026-07-10" }
      ],
      customers: [
        { id: 1, customer: "Shreya Kamble", category: "Medicines & Healthcare", subcategory: "Pain Relief & Fever", qty: 10, revenue: 1000, date: "2025-09-18" },
        { id: 2, customer: "John Doe", category: "Medicines & Healthcare", subcategory: "Prescription Medicines", qty: 5, revenue: 2500, date: "2025-09-18" },
        { id: 3, customer: "Jane Smith", category: "Baby Care", subcategory: "Diapers & Wipes", qty: 20, revenue: 4000, date: "2025-09-18" },
        { id: 4, customer: "Alice Johnson", category: "Mother Care & Maternity", subcategory: "Pregnancy Nutrition", qty: 8, revenue: 1600, date: "2025-09-17" },
        { id: 5, customer: "Bob Brown", category: "Wellness & Personal Care", subcategory: "Vitamins & Supplements", qty: 12, revenue: 720, date: "2025-09-16" },
        { id: 6, customer: "Charlie Davis", category: "Medical Devices & Equipment", subcategory: "Monitoring Devices", qty: 2, revenue: 2000, date: "2025-09-15" },
        { id: 7, customer: "Diana Evans", category: "Speciality Care", subcategory: "Ayurveda & Herbal Products", qty: 15, revenue: 1800, date: "2025-09-14" },
        { id: 8, customer: "Eve Foster", category: "Medicines & Healthcare", subcategory: "Pain Relief & Fever", qty: 7, revenue: 700, date: "2025-09-13" },
        { id: 9, customer: "Frank Green", category: "Baby Care", subcategory: "Baby Skin & Hair Care", qty: 25, revenue: 1250, date: "2025-09-12" },
        { id: 10, customer: "Grace Harris", category: "Mother Care & Maternity", subcategory: "Skincare for Moms", qty: 10, revenue: 1500, date: "2025-09-11" },
        { id: 11, customer: "Henry Wilson", category: "Medicines & Healthcare", subcategory: "Digestive Health", qty: 15, revenue: 1200, date: "2025-09-10" },
        { id: 12, customer: "Isabella Lee", category: "Medical Devices & Equipment", subcategory: "Respiratory Care", qty: 3, revenue: 4500, date: "2025-09-09" },
        { id: 13, customer: "James Brown", category: "Mother Care & Maternity", subcategory: "Breastfeeding Essentials", qty: 20, revenue: 600, date: "2025-09-08" },
        { id: 14, customer: "Kelly Adams", category: "Wellness & Personal Care", subcategory: "Oral Care", qty: 30, revenue: 1500, date: "2025-09-07" },
        { id: 15, customer: "Liam Turner", category: "Speciality Care", subcategory: "Immunity Boosters", qty: 10, revenue: 1500, date: "2025-09-06" }
      ],
      financial: [
        { id: 1, item: "Total Revenue", category: "Revenue", subcategory: "", amount: 85000, date: "2025-09-18", notes: "Sales Revenue" },
        { id: 2, item: "Total Expenses", category: "Expenses", subcategory: "", amount: 64600, date: "2025-09-18", notes: "Cost of Goods" },
        { id: 3, item: "Marketing Expenses", category: "Expenses", subcategory: "", amount: 5000, date: "2025-09-17", notes: "Advertising" },
        { id: 4, item: "Service Revenue", category: "Revenue", subcategory: "", amount: 12000, date: "2025-09-16", notes: "Consultations" },
        { id: 5, item: "Utility Expenses", category: "Expenses", subcategory: "", amount: 2000, date: "2025-09-15", notes: "Bills" },
        { id: 6, item: "Product Returns", category: "Expenses", subcategory: "", amount: -1500, date: "2025-09-14", notes: "Refunds" },
        { id: 7, item: "Other Income", category: "Revenue", subcategory: "", amount: 3000, date: "2025-09-13", notes: "Miscellaneous" },
        { id: 8, item: "Shipping Costs", category: "Expenses", subcategory: "", amount: 2500, date: "2025-09-12", notes: "Delivery" },
        { id: 9, item: "Membership Revenue", category: "Revenue", subcategory: "", amount: 5000, date: "2025-09-11", notes: "Subscriptions" },
        { id: 10, item: "Maintenance Expenses", category: "Expenses", subcategory: "", amount: 1500, date: "2025-09-10", notes: "Equipment" }
      ]
    };

    // Tab configurations
    const tabConfigs = {
      sales: {
        cardLabels: ["Total Sales", "Top Product", "Orders", "Profit"],
        tableHeaders: ["Sr.No", "Product", "Category", "Subcategory", "Qty", "Revenue", "Date"],
        tableFields: ["id", "product", "category", "subcategory", "qty", "revenue", "date"]
      },
      inventory: {
        cardLabels: ["Total Stock Value", "Low Stock Items", "Total Products", "Expiring Soon"],
        tableHeaders: ["Sr.No", "Product", "Category", "Subcategory", "Qty", "Stock Value", "Expiry Date"],
        tableFields: ["id", "product", "category", "subcategory", "qty", "stockValue", "expiryDate"]
      },
      customers: {
        cardLabels: ["Total Customers", "Top Customer", "Total Orders", "Average Order Value"],
        tableHeaders: ["Sr.No", "Customer", "Category", "Subcategory", "Qty", "Revenue", "Date"],
        tableFields: ["id", "customer", "category", "subcategory", "qty", "revenue", "date"]
      },
      financial: {
        cardLabels: ["Total Revenue", "Total Expenses", "Net Profit", "Profit Margin"],
        tableHeaders: ["Sr.No", "Item", "Category", "Subcategory", "Amount", "Date", "Notes"],
        tableFields: ["id", "item", "category", "subcategory", "amount", "date", "notes"]
      }
    };

    // Pagination state
    let currentPage = 1;
    let entriesPerPage = 10;

    // Populate subcategory dropdown based on category selection
    document.getElementById("categoryFilter").addEventListener("change", () => {
      const category = document.getElementById("categoryFilter").value;
      const subcategorySelect = document.getElementById("subcategoryFilter");
      subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
      if (category && categorySubcategories[category]) {
        categorySubcategories[category].forEach(sub => {
          const option = document.createElement("option");
          option.value = sub;
          option.textContent = sub;
          subcategorySelect.appendChild(option);
        });
      }
      currentPage = 1; // Reset to first page on filter change
      updateReport(document.querySelector(".tab-btn.bg-blue-600").dataset.tab);
    });

    // Tab Switcher Logic
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(btn => {
          btn.classList.remove("bg-blue-600", "text-white");
          btn.classList.add("bg-gray-200", "text-gray-700");
        });
        tab.classList.remove("bg-gray-200", "text-gray-700");
        tab.classList.add("bg-blue-600", "text-white");
        currentPage = 1; // Reset to first page on tab change
        updateReport(tab.dataset.tab);
      });
    });

    // Entries Per Page Logic
    document.getElementById("entriesPerPage").addEventListener("change", () => {
      entriesPerPage = parseInt(document.getElementById("entriesPerPage").value);
      currentPage = 1; // Reset to first page
      updateReport(document.querySelector(".tab-btn.bg-blue-600").dataset.tab);
    });

    // Pagination Button Logic
    document.getElementById("prevPage").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        updateReport(document.querySelector(".tab-btn.bg-blue-600").dataset.tab);
      }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
      const activeTab = document.querySelector(".tab-btn.bg-blue-600").dataset.tab;
      const filteredData = getFilteredData(activeTab);
      const totalPages = Math.ceil(filteredData.length / entriesPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        updateReport(activeTab);
      }
    });

    // Generate Report Logic
    document.getElementById("generateBtn").addEventListener("click", () => {
      currentPage = 1; // Reset to first page on generate
      updateReport(document.querySelector(".tab-btn.bg-blue-600").dataset.tab);
    });

    // Get Filtered Data
    function getFilteredData(tab) {
      const fromDate = document.getElementById("fromDate").value;
      const toDate = document.getElementById("toDate").value;
      const category = document.getElementById("categoryFilter").value;
      const subcategory = document.getElementById("subcategoryFilter").value;

      return sampleData[tab].filter(item => {
        const itemDate = new Date(item.date || item.expiryDate);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        return (
          (!from || itemDate >= from) &&
          (!to || itemDate <= to) &&
          (!category || item.category === category) &&
          (!subcategory || item.subcategory === subcategory)
        );
      });
    }

    // Update Report Table
    function updateReportTable(tab, data) {
      const config = tabConfigs[tab];
      const thead = document.getElementById("tableHeader");
      const tbody = document.getElementById("reportTableBody");

      // Update table headers
      thead.innerHTML = `
        <tr>
          ${config.tableHeaders.map(header => `<th class="px-4 py-3">${header}</th>`).join("")}
        </tr>
      `;

      // Paginate data
      const start = (currentPage - 1) * entriesPerPage;
      const end = start + entriesPerPage;
      const paginatedData = data.slice(start, end);

      // Update table body
      tbody.innerHTML = "";
      paginatedData.forEach((item, index) => {
        const row = `
          <tr class="border-t">
            ${config.tableFields.map(field => {
              if (field === "id") return `<td class="px-4 py-2">${start + index + 1}</td>`;
              if (field === "revenue" || field === "stockValue" || field === "amount")
                return `<td class="px-4 py-2">₹${item[field]?.toLocaleString() || 0}</td>`;
              return `<td class="px-4 py-2">${item[field] || "N/A"}</td>`;
            }).join("")}
          </tr>
        `;
        tbody.innerHTML += row;
      });

      // Update pagination info
      const totalPages = Math.ceil(data.length / entriesPerPage);
      document.getElementById("pageInfo").textContent = `Showing ${start + 1} to ${Math.min(end, data.length)} of ${data.length} entries`;
      document.getElementById("prevPage").disabled = currentPage === 1;
      document.getElementById("nextPage").disabled = currentPage === totalPages;
    }

    // Update Summary Cards
    function updateSummaryCards(tab, data) {
      const config = tabConfigs[tab];
      let cardValues = [];

      if (tab === "sales") {
        const totalSales = data.reduce((sum, item) => sum + item.revenue, 0);
        const topProduct = data.sort((a, b) => b.revenue - a.revenue)[0]?.product || "N/A";
        const totalOrders = data.reduce((sum, item) => sum + item.qty, 0);
        const totalProfit = totalSales * 0.24; // 24% profit margin
        cardValues = [
          `₹${totalSales.toLocaleString()}`,
          topProduct,
          totalOrders,
          `₹${totalProfit.toLocaleString()}`
        ];
      } else if (tab === "inventory") {
        const totalStockValue = data.reduce((sum, item) => sum + item.stockValue, 0);
        const lowStockItems = data.filter(item => item.qty < 10).length;
        const totalProducts = data.length;
        const expiringSoon = data.filter(item => {
          const expiry = new Date(item.expiryDate);
          const now = new Date("2025-09-19");
          const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
          return diffDays <= 30;
        }).length;
        cardValues = [
          `₹${totalStockValue.toLocaleString()}`,
          lowStockItems,
          totalProducts,
          expiringSoon
        ];
      } else if (tab === "customers") {
        const uniqueCustomers = [...new Set(data.map(item => item.customer))].length;
        const topCustomer = data.sort((a, b) => b.revenue - a.revenue)[0]?.customer || "N/A";
        const totalOrders = data.reduce((sum, item) => sum + item.qty, 0);
        const avgOrderValue = data.length ? data.reduce((sum, item) => sum + item.revenue, 0) / data.length : 0;
        cardValues = [
          uniqueCustomers,
          topCustomer,
          totalOrders,
          `₹${avgOrderValue.toLocaleString()}`
        ];
      } else if (tab === "financial") {
        const totalRevenue = data.filter(item => item.category === "Revenue").reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = data.filter(item => item.category === "Expenses").reduce((sum, item) => sum + item.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;
        cardValues = [
          `₹${totalRevenue.toLocaleString()}`,
          `₹${totalExpenses.toLocaleString()}`,
          `₹${netProfit.toLocaleString()}`,
          `${profitMargin}%`
        ];
      }

      const cards = document.getElementById("summaryCards");
      cards.innerHTML = config.cardLabels.map((label, index) => `
        <div class="bg-white rounded-xl border-l-4 border-blue-500 shadow-md p-5">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-gray-500 text-sm font-medium">${label}</p>
              <h2 class="text-2xl font-bold text-gray-800 mt-1">${cardValues[index]}</h2>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <i class="fas ${tab === 'sales' ? 'fa-dollar-sign' : tab === 'inventory' ? 'fa-warehouse' : tab === 'customers' ? 'fa-users' : 'fa-chart-line'} text-blue-500 text-xl"></i>
            </div>
          </div>
        </div>
      `).join("");
    }

    // Export to Excel
    document.getElementById("exportExcel").addEventListener("click", () => {
      const activeTab = document.querySelector(".tab-btn.bg-blue-600").dataset.tab;
      const filteredData = getFilteredData(activeTab);
      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `PharmaCare_${activeTab}_Report.xlsx`);
    });

    // Export to CSV
    document.getElementById("exportCsv").addEventListener("click", () => {
      const activeTab = document.querySelector(".tab-btn.bg-blue-600").dataset.tab;
      const filteredData = getFilteredData(activeTab);
      const ws = XLSX.utils.json_to_sheet(filteredData);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PharmaCare_${activeTab}_Report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });

    // Export to PDF
    document.getElementById("exportPdf").addEventListener("click", () => {
      const activeTab = document.querySelector(".tab-btn.bg-blue-600").dataset.tab;
      const config = tabConfigs[activeTab];
      const filteredData = getFilteredData(activeTab);

      // Create a temporary container for PDF content
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = `
        <div class="print-header">PharmaCare - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report</div>
        <table style="width: 100%; border-collapse: collapse; table-layout: auto; word-wrap: break-word;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              ${config.tableHeaders.map(header => `<th style="border: 1px solid #ddd; padding: 8px; word-wrap: break-word; max-width: 0; overflow-wrap: break-word;">${header}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((item, index) => `
              <tr>
                ${config.tableFields.map(field => {
                  if (field === "id") return `<td style="border: 1px solid #ddd; padding: 8px; word-wrap: break-word; max-width: 0; overflow-wrap: break-word;">${index + 1}</td>`;
                  if (field === "revenue" || field === "stockValue" || field === "amount")
                    return `<td style="border: 1px solid #ddd; padding: 8px; word-wrap: break-word; max-width: 0; overflow-wrap: break-word;">₹${item[field]?.toLocaleString() || 0}</td>`;
                  return `<td style="border: 1px solid #ddd; padding: 8px; word-wrap: break-word; max-width: 0; overflow-wrap: break-word;">${item[field] || "N/A"}</td>`;
                }).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="print-footer">Generated on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true })} IST | Page <span class="pageNumber"></span></div>
      `;

      // Export to PDF with landscape orientation for wider content
      html2pdf()
        .from(tempContainer)
        .set({
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `PharmaCare_${activeTab}_Report.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { orientation: "landscape", unit: "in", format: "letter", compressPDF: true }
        })
        .save();
    });

    // Initial Report Load
    updateReport("sales");

    function updateReport(tab) {
      const filteredData = getFilteredData(tab);
      updateReportTable(tab, filteredData);
      updateSummaryCards(tab, filteredData);
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




    // Sidebar Toggle Functionality
    // $("#toggle-sidebar-mobile, #close-sidebar").on("click", function () {
    //   $("#sidebar").toggleClass("-translate-x-full");
    // });

    // $("#toggle-sidebar-logo").on("click", function () {
    //   const sidebar = $("#sidebar");
    //   const isCollapsed = sidebar.hasClass("w-20");
    //   sidebar.toggleClass("w-64 w-20");
    //   $("#sidebar-title, .nav-text").toggleClass("hidden");
    //   $("#sidebar-arrow").toggleClass("fa-chevron-right fa-chevron-left");
    //   $("#sidebar-logo").toggleClass("mr-2 mx-auto");
    //   $(".nav-icon").toggleClass("mr-3 mx-auto");
    //   if (isCollapsed) {
    //     sidebar.removeClass("-translate-x-full"); // Ensure sidebar is visible when expanding
    //   }
    // });

   