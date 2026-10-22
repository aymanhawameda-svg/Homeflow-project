const EXPENSES_KEY = "homeflow_expenses";
const FIXCOSTS_KEY = "homeflow_fixcosts";
const MEMBERS_KEY = "homeflow_members";
const MONTHLY_LIMIT = 2500.0;

let currentFilterType = "all"; // 'all', 'fix', 'variable'

function getExpenses() {
  const data = localStorage.getItem(EXPENSES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveExpenses(data) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(data));
}

function getFixCosts() {
  const data = localStorage.getItem(FIXCOSTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveFixCosts(data) {
  localStorage.setItem(FIXCOSTS_KEY, JSON.stringify(data));
}

function getMembers() {
  const members = localStorage.getItem(MEMBERS_KEY);
  return members ? JSON.parse(members) : ["Alex", "Sadeen", "Ayman"];
}

// تعبئة القوائم المنسدلة بالأعضاء
function populateMemberSelects() {
  const members = getMembers();
  const fixSelect = document.getElementById("fixcost-assignee-select");
  const expSelect = document.getElementById("expense-assignee-select");
  const filterPersonSelect = document.getElementById("filter-person-select");

  const selectedPerson = filterPersonSelect.value;

  fixSelect.innerHTML =
    '<option value="Allgemein">Allgemein (Haushalt)</option>';
  expSelect.innerHTML =
    '<option value="Allgemein">Allgemein (Haushalt)</option>';
  filterPersonSelect.innerHTML = '<option value="all">Alle Personen</option>';

  members.forEach((m) => {
    fixSelect.innerHTML += `<option value="${m}">${m}</option>`;
    expSelect.innerHTML += `<option value="${m}">${m}</option>`;
    filterPersonSelect.innerHTML += `<option value="${m}">${m}</option>`;
  });

  filterPersonSelect.value = selectedPerson || "all";
}

function openAddExpenseModal() {
  document.getElementById("add-expense-form").reset();
  document.getElementById("expense-date").value = new Date()
    .toISOString()
    .split("T")[0];
  expense_modal.showModal();
}

// إضافة مصروف متغير
document
  .getElementById("add-expense-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const newExpense = {
      id: Date.now().toString(),
      title: document.getElementById("expense-title").value,
      amount: parseFloat(document.getElementById("expense-amount").value),
      date: document.getElementById("expense-date").value,
      category: document.getElementById("expense-category").value,
      assignee: document.getElementById("expense-assignee-select").value,
    };

    const expenses = getExpenses();
    expenses.push(newExpense);
    saveExpenses(expenses);

    expense_modal.close();
    renderBudgetPage();
  });

// إضافة تكلفة ثابتة
document
  .getElementById("add-fixcost-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const newFixCost = {
      id: Date.now().toString(),
      title: document.getElementById("fixcost-title").value,
      amount: parseFloat(document.getElementById("fixcost-amount").value),
      day: parseInt(document.getElementById("fixcost-day").value),
      category: document.getElementById("fixcost-category").value,
      assignee: document.getElementById("fixcost-assignee-select").value,
    };

    const fixcosts = getFixCosts();
    fixcosts.push(newFixCost);
    saveFixCosts(fixcosts);

    fixcost_modal.close();
    renderBudgetPage();
  });

function deleteExpense(id) {
  if (confirm("Möchten Sie diese Ausgabe wirklich löschen?")) {
    let expenses = getExpenses().filter((e) => e.id !== id);
    saveExpenses(expenses);
    renderBudgetPage();
  }
}

function deleteFixCost(id) {
  if (confirm("Möchten Sie diese Fixkosten wirklich löschen?")) {
    let fixcosts = getFixCosts().filter((f) => f.id !== id);
    saveFixCosts(fixcosts);
    renderBudgetPage();
  }
}

function setFilterType(type) {
  currentFilterType = type;
  document
    .querySelectorAll(
      "#filter-type-all, #filter-type-fix, #filter-type-variable",
    )
    .forEach((btn) => {
      btn.className = "btn btn-sm btn-ghost text-xs text-gray-400";
    });
  document.getElementById(`filter-type-${type}`).className =
    "btn btn-sm bg-[#173e30] text-[#72e0ad] border-none";

  renderBudgetPage();
}

// رسم المخطط البياني للأشهر
function renderMonthlyComparison() {
  const expenses = getExpenses();
  const fixcosts = getFixCosts();

  const totalFix = fixcosts.reduce((sum, item) => sum + item.amount, 0);
  const monthlyTotals = {};

  expenses.forEach((exp) => {
    if (!exp.date) return;
    const monthKey = exp.date.substring(0, 7);
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = 0;
    }
    monthlyTotals[monthKey] += exp.amount;
  });

  const currentMonthKey = new Date().toISOString().substring(0, 7);
  if (!monthlyTotals[currentMonthKey]) {
    monthlyTotals[currentMonthKey] = 0;
  }

  const chartContainer = document.getElementById("monthly-chart-container");
  const labelsContainer = document.getElementById("monthly-labels-container");

  chartContainer.innerHTML = "";
  labelsContainer.innerHTML = "";

  const sortedMonths = Object.keys(monthlyTotals).sort();

  sortedMonths.forEach((monthKey) => {
    const variableAmount = monthlyTotals[monthKey];
    const totalMonthAmount = variableAmount + totalFix;

    const heightPercent = Math.min(
      Math.round((totalMonthAmount / MONTHLY_LIMIT) * 100),
      100,
    );

    const [year, month] = monthKey.split("-");
    const dateObj = new Date(year, month - 1, 1);
    const monthName = dateObj.toLocaleString("de-DE", {
      month: "short",
      year: "2-digit",
    });

    const isOverBudget = totalMonthAmount > MONTHLY_LIMIT;
    const barColorClass = isOverBudget ? "bg-error" : "bg-[#72e0ad]";

    const barWrapper = document.createElement("div");
    barWrapper.className =
      "flex flex-col items-center h-full justify-end gap-1 w-full max-group";
    barWrapper.innerHTML = `
      <span class="text-[10px] font-bold text-gray-300">€${totalMonthAmount.toFixed(0)}</span>
      <div style="height: ${heightPercent}%;" class="w-full max-w-[40px] ${barColorClass} rounded-t-lg transition-all duration-500 hover:opacity-80 relative group cursor-pointer">
        <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-[#131a18] text-xs text-white p-2 rounded shadow-lg border border-[#293630] z-10 whitespace-nowrap">
          <span>${monthName}</span>
          <span>Fix: €${totalFix.toFixed(0)}</span>
          <span>Variabel: €${variableAmount.toFixed(0)}</span>
        </div>
      </div>
    `;
    chartContainer.appendChild(barWrapper);

    const label = document.createElement("div");
    label.className = "text-center w-full truncate font-medium text-[11px]";
    label.textContent = monthName;
    labelsContainer.appendChild(label);
  });

  if (sortedMonths.length === 0) {
    chartContainer.innerHTML = `<p class="text-center text-xs w-full py-10" style="color: var(--home-muted);">Keine Daten für das Chart verfügbar.</p>`;
  }
}

// عرض الصفحة بالكامل
function renderBudgetPage() {
  const expenses = getExpenses();
  const fixcosts = getFixCosts();

  const selectedPerson = document.getElementById("filter-person-select").value;
  const selectedCategory = document.getElementById(
    "filter-category-select",
  ).value;

  const fixcostsList = document.getElementById("fixcosts-list");
  const expensesList = document.getElementById("expenses-list");

  fixcostsList.innerHTML = "";
  expensesList.innerHTML = "";

  let totalFix = 0;
  let totalVariable = 0;

  // 1. تصفية وعرض التكاليف الثابتة
  fixcosts.forEach((fix) => {
    if (selectedPerson !== "all" && fix.assignee !== selectedPerson) return;
    if (selectedCategory !== "all" && fix.category !== selectedCategory) return;

    totalFix += fix.amount;

    if (currentFilterType === "all" || currentFilterType === "fix") {
      const row = document.createElement("div");
      row.className =
        "flex items-center justify-between p-3 rounded-lg border border-[#293630] bg-[#0b100f]";
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-lg">📌</span>
          <div>
            <p class="font-medium text-sm text-[#f1f7f3]">${fix.title}</p>
            <div class="flex gap-2 items-center text-xs text-[#8d9d94] mt-0.5">
              <span class="badge badge-xs badge-outline text-amber-400 border-amber-400/40">${fix.category}</span>
              <span>📅 Jeden ${fix.day}. des Monats</span>
              <span>👤 ${fix.assignee}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-bold text-sm text-amber-400">€${fix.amount.toFixed(2)}</span>
          <button onclick="deleteFixCost('${fix.id}')" class="btn btn-ghost btn-xs text-error">✕</button>
        </div>
      `;
      fixcostsList.appendChild(row);
    }
  });

  // 2. تصفية وعرض المصاريف المتغيرة
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  expenses.forEach((exp) => {
    if (selectedPerson !== "all" && exp.assignee !== selectedPerson) return;
    if (selectedCategory !== "all" && exp.category !== selectedCategory) return;

    totalVariable += exp.amount;

    if (currentFilterType === "all" || currentFilterType === "variable") {
      const row = document.createElement("div");
      row.className =
        "flex items-center justify-between p-3 rounded-lg border border-[#293630] bg-[#0b100f]";
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-lg">🛒</span>
          <div>
            <p class="font-medium text-sm text-[#f1f7f3]">${exp.title}</p>
            <div class="flex gap-2 items-center text-xs text-[#8d9d94] mt-0.5">
              <span class="badge badge-xs badge-outline">${exp.category}</span>
              <span>📅 ${exp.date}</span>
              <span>👤 ${exp.assignee}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-bold text-sm text-emerald-400">€${exp.amount.toFixed(2)}</span>
          <button onclick="deleteExpense('${exp.id}')" class="btn btn-ghost btn-xs text-error">✕</button>
        </div>
      `;
      expensesList.appendChild(row);
    }
  });

  document.getElementById("fixcosts-section").style.display =
    currentFilterType === "variable" ? "none" : "block";
  document.getElementById("variable-section").style.display =
    currentFilterType === "fix" ? "none" : "block";

  const overallTotal = totalFix + totalVariable;
  document.getElementById("total-fixcosts-amount").textContent =
    `€${totalFix.toFixed(2)}`;
  document.getElementById("total-variable-amount").textContent =
    `€${totalVariable.toFixed(2)}`;
  document.getElementById("total-overall-amount").textContent =
    `€${overallTotal.toFixed(2)}`;

  const percentage = Math.min(
    Math.round((overallTotal / MONTHLY_LIMIT) * 100),
    100,
  );
  document.getElementById("budget-percent").textContent = `${percentage}%`;

  renderMonthlyComparison();
}

document.addEventListener("DOMContentLoaded", () => {
  populateMemberSelects();
  renderBudgetPage();
});
