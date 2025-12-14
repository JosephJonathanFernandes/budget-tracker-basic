// Configuration
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api";
const USE_BACKEND = true; // Set to false to use localStorage only

// DOM Elements
const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const ctx = document.getElementById("expense-chart").getContext("2d");
const filterStart = document.getElementById("filter-start");
const filterEnd = document.getElementById("filter-end");
const applyFilterBtn = document.getElementById("apply-filter");
const downloadCsvBtn = document.getElementById("download-csv");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const monthTotalEl = document.getElementById("month-total");
const topCategoryEl = document.getElementById("top-category");
const searchInput = document.getElementById("search-input");
const toast = document.getElementById("toast");
const emptyState = document.getElementById("empty-state");
const expenseCount = document.getElementById("expense-count");
const monthTotalSimple = document.getElementById("month-total-simple");
const topCategorySimple = document.getElementById("top-category-simple");
const avgPerDay = document.getElementById("avg-per-day");
const filteredCount = document.getElementById("filtered-count");
const welcomeOverlay = document.getElementById("welcome-overlay");
const startTrackingBtn = document.getElementById("start-tracking");
const helpBtn = document.getElementById("help-btn");
const clearFormBtn = document.getElementById("clear-form");
const submitBtn = document.getElementById("submit-btn");

// Data
let expenses = [];
let filteredExpenses = [];
let searchQuery = "";
let editingId = null;

const categoryColors = {
  Food: "#ff6384",
  Travel: "#36a2eb",
  Bills: "#cc65fe",
  Shopping: "#ffce56",
  Entertainment: "#4bc0c0",
  Health: "#ff9f40",
  Education: "#9966ff",
  Other: "#4caf50",
};

const categoryEmojis = {
  Food: "🍔",
  Travel: "✈️",
  Bills: "💡",
  Shopping: "🛍️",
  Entertainment: "🎮",
  Health: "🏥",
  Education: "📚",
  Other: "📦",
};

// API Functions
async function fetchExpenses() {
  if (!USE_BACKEND) {
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    return expenses;
  }

  try {
    const response = await fetch(`${API_URL}/expenses`);
    const result = await response.json();
    if (result.success) {
      expenses = result.data;
      return expenses;
    }
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    showToast("Failed to load expenses. Using offline mode.", "⚠️");
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  }
  return expenses;
}

async function addExpenseAPI(expenseData) {
  if (!USE_BACKEND) {
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      createdAt: new Date().toISOString(),
    };
    expenses.push(newExpense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    return newExpense;
  }

  try {
    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData),
    });
    const result = await response.json();
    if (result.success) {
      expenses.push(result.data);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      return result.data;
    }
  } catch (error) {
    console.error("Failed to add expense:", error);
    showToast("Failed to save. Saved locally instead.", "⚠️");
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      createdAt: new Date().toISOString(),
    };
    expenses.push(newExpense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }
}

async function updateExpenseAPI(id, expenseData) {
  if (!USE_BACKEND) {
    const index = expenses.findIndex((exp) => exp.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...expenseData };
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
    return;
  }

  try {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData),
    });
    const result = await response.json();
    if (result.success) {
      const index = expenses.findIndex((exp) => exp.id === id);
      if (index !== -1) {
        expenses[index] = result.data;
        localStorage.setItem("expenses", JSON.stringify(expenses));
      }
    }
  } catch (error) {
    console.error("Failed to update expense:", error);
    showToast("Failed to update online. Updated locally.", "⚠️");
  }
}

async function deleteExpenseAPI(id) {
  if (!USE_BACKEND) {
    expenses = expenses.filter((exp) => exp.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    return;
  }

  try {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (result.success) {
      expenses = expenses.filter((exp) => exp.id !== id);
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  } catch (error) {
    console.error("Failed to delete expense:", error);
    showToast("Failed to delete online. Deleted locally.", "⚠️");
    expenses = expenses.filter((exp) => exp.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }
}

// Form Validation
function validateForm() {
  let isValid = true;
  const category = document.getElementById("category");
  const amount = document.getElementById("amount");
  const date = document.getElementById("date");

  // Clear previous errors
  document.querySelectorAll(".form-group").forEach((group) => {
    group.classList.remove("error", "success");
  });
  document.querySelectorAll(".error-message").forEach((msg) => {
    msg.classList.remove("show");
  });

  // Validate category
  if (!category.value) {
    showFieldError(category, "Please select a category");
    isValid = false;
  } else {
    showFieldSuccess(category);
  }

  // Validate amount
  if (!amount.value || parseFloat(amount.value) <= 0) {
    showFieldError(amount, "Please enter a valid amount");
    isValid = false;
  } else {
    showFieldSuccess(amount);
  }

  // Validate date
  if (!date.value) {
    showFieldError(date, "Please select a date");
    isValid = false;
  } else {
    showFieldSuccess(date);
  }

  return isValid;
}

function showFieldError(field, message) {
  const formGroup = field.closest(".form-group");
  const errorMsg = formGroup.querySelector(".error-message");
  formGroup.classList.add("error");
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.classList.add("show");
  }
}

function showFieldSuccess(field) {
  const formGroup = field.closest(".form-group");
  formGroup.classList.add("success");
}

// Toast Notification
function showToast(message, icon = "✓") {
  const toastMessage = toast.querySelector(".toast-message");
  const toastIcon = toast.querySelector(".toast-icon");
  toastMessage.innerText = message;
  toastIcon.innerText = icon;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Render Expenses
function renderExpenses() {
  list.innerHTML = "";
  let total = 0;
  let displayedExpenses = [];

  filteredExpenses.forEach((exp) => {
    const matchesSearch =
      exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.date.includes(searchQuery) ||
      exp.amount.toString().includes(searchQuery) ||
      (exp.notes &&
        exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return;

    total += exp.amount;
    displayedExpenses.push(exp);

    const li = document.createElement("li");
    const color = getCategoryColor(exp.category);
    const emoji = categoryEmojis[exp.category] || "💸";

    li.innerHTML = `
      <div class="expense-info">
        <div class="expense-badge-icon" style="background: ${color}">
          ${emoji}
        </div>
        <div class="expense-details">
          <h4>${exp.category}</h4>
          <p>${formatDate(exp.date)}</p>
          ${exp.notes ? `<p class="expense-notes">${exp.notes}</p>` : ""}
        </div>
      </div>
      <div class="expense-amount">₹${exp.amount.toFixed(2)}</div>
      <div class="expense-actions">
        <button class="btn-edit" onclick="editExpense('${exp.id}')" aria-label="Edit expense">✏️ Edit</button>
        <button class="btn-delete" onclick="deleteExpense('${exp.id}')" aria-label="Delete expense">🗑️ Delete</button>
      </div>
    `;

    list.appendChild(li);
  });

  totalEl.innerText = total.toFixed(2);
  expenseCount.innerText = expenses.length;
  filteredCount.innerText = `${displayedExpenses.length} items`;

  // Show/hide empty state
  if (displayedExpenses.length === 0) {
    emptyState.classList.add("active");
    list.style.display = "none";
  } else {
    emptyState.classList.remove("active");
    list.style.display = "flex";
  }

  renderChart();
  updateSummary();
}

// Format Date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Get Category Color
function getCategoryColor(category) {
  if (!categoryColors[category]) {
    categoryColors[category] =
      "#" + Math.floor(Math.random() * 16777215).toString(16);
  }
  return categoryColors[category];
}

// Delete Expense
async function deleteExpense(id) {
  if (confirm("Are you sure you want to delete this expense?")) {
    const deletedExpense = expenses.find((exp) => exp.id === id);
    await deleteExpenseAPI(id);
    showToast(`Deleted ${deletedExpense.category} expense`, "🗑️");
    applyFilter();
  }
}

// Edit Expense
function editExpense(id) {
  const exp = expenses.find((e) => e.id === id);
  if (!exp) return;

  document.getElementById("category").value = exp.category;
  document.getElementById("amount").value = exp.amount;
  document.getElementById("date").value = exp.date;
  document.getElementById("notes").value = exp.notes || "";

  editingId = id;
  submitBtn.innerHTML =
    '<span>Update Expense</span><span class="btn-icon">✓</span>';
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Add/Update Expense (Form Submit)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showToast("Please fix the errors in the form", "⚠️");
    return;
  }

  submitBtn.classList.add("loading");

  const category = document.getElementById("category").value;
  const amount = Number(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  const notes = document.getElementById("notes").value;

  const expenseData = { category, amount, date, notes };

  if (editingId) {
    // Update existing expense
    await updateExpenseAPI(editingId, expenseData);
    showToast(`Updated ${category} expense!`, "✅");
    editingId = null;
    submitBtn.innerHTML =
      '<span>Add Expense</span><span class="btn-icon">➕</span>';
  } else {
    // Add new expense
    await addExpenseAPI(expenseData);
    showToast(`Added ${category} expense!`, "✅");
  }

  applyFilter();
  form.reset();
  document.getElementById("date").valueAsDate = new Date();
  submitBtn.classList.remove("loading");
});

// Clear Form
clearFormBtn.addEventListener("click", () => {
  form.reset();
  editingId = null;
  submitBtn.innerHTML =
    '<span>Add Expense</span><span class="btn-icon">➕</span>';
  document.querySelectorAll(".form-group").forEach((group) => {
    group.classList.remove("error", "success");
  });
  document.querySelectorAll(".error-message").forEach((msg) => {
    msg.classList.remove("show");
  });
});

// Search
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderExpenses();
});

// Filter by Date
applyFilterBtn.addEventListener("click", applyFilter);

function applyFilter() {
  let start = filterStart.value;
  let end = filterEnd.value;
  filteredExpenses = expenses.filter((exp) => {
    return (!start || exp.date >= start) && (!end || exp.date <= end);
  });
  renderExpenses();
  if (start || end) {
    showToast("Filter applied!", "🔍");
  }
}

// Download CSV
downloadCsvBtn.addEventListener("click", () => {
  if (expenses.length === 0) {
    showToast("No expenses to export!", "⚠️");
    return;
  }

  let csvContent =
    "data:text/csv;charset=utf-8,Category,Amount,Date,Notes\n" +
    expenses
      .map((e) => `${e.category},${e.amount},${e.date},"${e.notes || ""}"`)
      .join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `expenses_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("CSV downloaded successfully!", "📥");
});

// Dark Mode Toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
  showToast(
    isDark ? "Dark mode enabled" : "Light mode enabled",
    isDark ? "🌙" : "☀️"
  );
});

// Check Dark Mode on Load
function checkDarkMode() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
}

// Render Chart
function renderChart() {
  const categories = [...new Set(filteredExpenses.map((e) => e.category))];
  const categoryTotals = categories.map((cat) =>
    filteredExpenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0)
  );

  if (window.expenseChart) window.expenseChart.destroy();

  if (categories.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  window.expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [
        {
          label: "Expenses by Category",
          data: categoryTotals,
          backgroundColor: categories.map((cat) => getCategoryColor(cat)),
          borderWidth: 3,
          borderColor: "#fff",
          hoverOffset: 15,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            font: { size: 14, family: "Poppins" },
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: { size: 16, family: "Poppins" },
          bodyFont: { size: 14, family: "Poppins" },
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000,
        easing: "easeInOutQuart",
      },
    },
  });
}

// Update Summary
function updateSummary() {
  const month = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter((exp) => exp.date.startsWith(month));
  const totalMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  monthTotalEl.innerText = `₹${totalMonth.toFixed(2)}`;
  monthTotalSimple.innerText = `₹${totalMonth.toFixed(2)}`;

  // Calculate average per day
  const daysInMonth = new Date().getDate();
  const avgDaily = totalMonth / daysInMonth;
  avgPerDay.innerText = `₹${avgDaily.toFixed(2)}`;

  // Top category
  const categoryCount = {};
  monthlyExpenses.forEach((e) => {
    categoryCount[e.category] = (categoryCount[e.category] || 0) + e.amount;
  });

  let topCat = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
  const topText = topCat ? `${topCat[0]} (₹${topCat[1].toFixed(2)})` : "N/A";
  topCategoryEl.innerText = topText;
  topCategorySimple.innerText = topCat ? topCat[0] : "N/A";
}

// Welcome Overlay
startTrackingBtn.addEventListener("click", () => {
  welcomeOverlay.classList.add("hidden");
  localStorage.setItem("hasVisited", "true");
});

function checkFirstVisit() {
  if (localStorage.getItem("hasVisited")) {
    welcomeOverlay.classList.add("hidden");
  }
}

// Help Button
helpBtn.addEventListener("click", () => {
  alert(`Budget Tracker Pro Help

📊 Dashboard: View your total spending and key metrics
➕ Add Expense: Fill the form to track new expenses
🔍 Filter & Search: Find specific expenses easily
📥 Export: Download your data as CSV
🌙 Dark Mode: Toggle theme for comfortable viewing

Tips:
• Add notes to remember expense details
• Use categories to organize spending
• Review monthly insights regularly
• Export data for backup`);
});

// Set default date to today
document.getElementById("date").valueAsDate = new Date();

// Initialize
async function init() {
  checkDarkMode();
  checkFirstVisit();
  await fetchExpenses();
  applyFilter();

  // Show connection status
  if (USE_BACKEND) {
    try {
      await fetch(`${API_URL}/expenses`);
      console.log("✅ Connected to backend server");
    } catch (error) {
      console.log("⚠️ Backend not available, using offline mode");
      showToast("Running in offline mode", "📴");
    }
  }
}

init();
