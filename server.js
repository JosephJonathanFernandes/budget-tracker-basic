const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "expenses.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.mkdir(path.join(__dirname, "data"), { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}

// Read expenses from file
async function readExpenses() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading expenses:", error);
    return [];
  }
}

// Write expenses to file
async function writeExpenses(expenses) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(expenses, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing expenses:", error);
    return false;
  }
}

// API Routes

// Get all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await readExpenses();
    res.json({ success: true, data: expenses });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch expenses" });
  }
});

// Add new expense
app.post("/api/expenses", async (req, res) => {
  try {
    const { category, amount, date, notes } = req.body;

    // Validation
    if (!category || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: "Category, amount, and date are required",
      });
    }

    const expenses = await readExpenses();
    const newExpense = {
      id: Date.now().toString(),
      category,
      amount: parseFloat(amount),
      date,
      notes: notes || "",
      createdAt: new Date().toISOString(),
    };

    expenses.push(newExpense);
    await writeExpenses(expenses);

    res.json({ success: true, data: newExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add expense" });
  }
});

// Update expense
app.put("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, date, notes } = req.body;

    const expenses = await readExpenses();
    const index = expenses.findIndex((exp) => exp.id === id);

    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    expenses[index] = {
      ...expenses[index],
      category: category || expenses[index].category,
      amount:
        amount !== undefined ? parseFloat(amount) : expenses[index].amount,
      date: date || expenses[index].date,
      notes: notes !== undefined ? notes : expenses[index].notes,
      updatedAt: new Date().toISOString(),
    };

    await writeExpenses(expenses);
    res.json({ success: true, data: expenses[index] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update expense" });
  }
});

// Delete expense
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const expenses = await readExpenses();
    const filteredExpenses = expenses.filter((exp) => exp.id !== id);

    if (expenses.length === filteredExpenses.length) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    await writeExpenses(filteredExpenses);
    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete expense" });
  }
});

// Get expense statistics
app.get("/api/statistics", async (req, res) => {
  try {
    const expenses = await readExpenses();
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Monthly statistics
    const month = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = expenses.filter((exp) =>
      exp.date.startsWith(month)
    );
    const monthlyTotal = monthlyExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const topCategory = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    )[0];

    res.json({
      success: true,
      data: {
        total,
        count: expenses.length,
        monthlyTotal,
        monthlyCount: monthlyExpenses.length,
        topCategory: topCategory
          ? { name: topCategory[0], amount: topCategory[1] }
          : null,
        categoryBreakdown: categoryTotals,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch statistics" });
  }
});

// Initialize and start server
async function startServer() {
  await ensureDataDirectory();
  app.listen(PORT, () => {
    console.log(`\n🚀 Budget Tracker Pro Server Running!\n`);
    console.log(`📍 Local:   http://localhost:${PORT}`);
    console.log(`📊 API:     http://localhost:${PORT}/api/expenses\n`);
  });
}

startServer();
