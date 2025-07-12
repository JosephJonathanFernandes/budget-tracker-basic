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

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let filteredExpenses = [...expenses];
let searchQuery = "";
let categoryColors = {
  Food: "#ff6384",
  Travel: "#36a2eb",
  Bills: "#cc65fe",
  Shopping: "#ffce56",
  Other: "#4caf50"
};

function showToast(message) {
  toast.innerText = message;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 2000);
}

function renderExpenses() {
  list.innerHTML = "";
  let total = 0;
  filteredExpenses.forEach((exp, index) => {
    if (!exp.category.toLowerCase().includes(searchQuery.toLowerCase()) && !exp.date.includes(searchQuery)) return;
    total += exp.amount;
    const li = document.createElement("li");
    const color = getCategoryColor(exp.category);
    const icon = "💸";
    li.innerHTML = `<span class='badge' style='background:${color}'>${icon}</span> ${exp.category} - ₹${exp.amount} (${exp.date})
      <button onclick="deleteExpense(${index})">Delete</button>
      <button onclick="editExpense(${index})">Edit</button>`;
    list.appendChild(li);
  });
  totalEl.innerText = total;
  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderChart();
  updateSummary();
}

function getCategoryColor(category) {
  if (!categoryColors[category]) {
    categoryColors[category] = "#" + Math.floor(Math.random() * 16777215).toString(16);
  }
  return categoryColors[category];
}

function deleteExpense(index) {
  if (confirm("Are you sure you want to delete this expense?")) {
    const expIndex = expenses.findIndex(e => e === filteredExpenses[index]);
    expenses.splice(expIndex, 1);
    showToast("Expense deleted!");
    applyFilter();
  }
}

function editExpense(index) {
  const exp = filteredExpenses[index];
  document.getElementById("category").value = exp.category;
  document.getElementById("amount").value = exp.amount;
  document.getElementById("date").value = exp.date;
  deleteExpense(index);
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const category = document.getElementById("category").value;
  const amount = Number(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  expenses.push({ category, amount, date });
  showToast("Expense added!");
  applyFilter();
  form.reset();
});

applyFilterBtn.addEventListener("click", applyFilter);
searchInput.addEventListener("input", e => {
  searchQuery = e.target.value;
  renderExpenses();
});

downloadCsvBtn.addEventListener("click", () => {
  let csvContent = "data:text/csv;charset=utf-8,Category,Amount,Date\n" +
    expenses.map(e => `${e.category},${e.amount},${e.date}`).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "expenses.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("CSV downloaded!");
});

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

function checkDarkMode() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
}

function applyFilter() {
  let start = filterStart.value;
  let end = filterEnd.value;
  filteredExpenses = expenses.filter(exp => {
    return (!start || exp.date >= start) && (!end || exp.date <= end);
  });
  renderExpenses();
}

function renderChart() {
  const categories = [...new Set(filteredExpenses.map(e => e.category))];
  const categoryTotals = categories.map(cat =>
    filteredExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  );
  if (window.expenseChart) window.expenseChart.destroy();
  window.expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: categories,
      datasets: [{
        label: "Expenses by Category",
        data: categoryTotals,
        backgroundColor: categories.map(cat => getCategoryColor(cat))
      }]
    }
  });
}

function updateSummary() {
  const month = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter(exp => exp.date.startsWith(month));
  const totalMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  monthTotalEl.innerText = `Total This Month: ₹${totalMonth}`;

  const categoryCount = {};
  monthlyExpenses.forEach(e => {
    categoryCount[e.category] = (categoryCount[e.category] || 0) + e.amount;
  });
  let topCat = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
  topCategoryEl.innerText = topCat ? `Top Category: ${topCat[0]} (₹${topCat[1]})` : "Top Category: N/A";
}

checkDarkMode();
applyFilter();
