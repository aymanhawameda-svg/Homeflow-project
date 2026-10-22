const REAL_TASKS_KEY = "homeflow_tasks";
const BUDGET_EXPENSES_KEY = "homeflow_expenses";
const BUDGET_FIXCOSTS_KEY = "homeflow_fixcosts";

let currentFilter = "all";
let tasks = [];

const categoryClasses = {
  Reinigung: "badge-success",
  Einkauf: "badge-warning",
  Wäsche: "badge-info",
  Sonstiges: "badge-neutral",
  Cleaning: "badge-success",
  Shopping: "badge-warning",
  Laundry: "badge-info",
  Other: "badge-neutral",
};

function loadTasks() {
  try {
    const saved = localStorage.getItem(REAL_TASKS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((t) => ({
          id: t.id || Date.now().toString(),
          title: t.title || "Ohne Titel",
          category: t.category || "Sonstiges",
          person: t.assignee || t.person || "Ayman",
          time: t.dueDate
            ? t.dueDate.includes("T")
              ? t.dueDate.split("T")[0]
              : t.dueDate
            : "Heute",
          done: t.completed !== undefined ? t.completed : t.done || false,
        }));
      }
    }
  } catch (e) {
    console.error("Fehler beim Laden der Aufgaben", e);
  }
  return [];
}

function saveTasksToStorage(tasksList) {
  try {
    const formattedForTasksPage = tasksList.map((t) => ({
      id: t.id || Date.now().toString(),
      title: t.title,
      category: t.category,
      assignee: t.person,
      dueDate: t.time ? `${t.time}T00:00` : new Date().toISOString(),
      completed: t.done,
    }));
    localStorage.setItem(REAL_TASKS_KEY, JSON.stringify(formattedForTasksPage));
  } catch (e) {
    console.error("Fehler beim Speichern der Aufgaben", e);
  }
}

function updateBudgetCard() {
  try {
    const expenses =
      JSON.parse(localStorage.getItem(BUDGET_EXPENSES_KEY)) || [];
    const fixcosts =
      JSON.parse(localStorage.getItem(BUDGET_FIXCOSTS_KEY)) || [];

    const totalFix = fixcosts.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
    const totalVar = expenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
    const overallSpent = totalFix + totalVar;

    const budgetEl = document.querySelector("#budget .text-3xl");
    if (budgetEl) {
      budgetEl.textContent = `€${overallSpent.toFixed(0)}`;
    }
  } catch (e) {
    console.error("Fehler beim Laden des Budgets", e);
  }
}

function initializeDashboard() {
  document.querySelectorAll("[data-open-dialog]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const dialog = document.getElementById(trigger.dataset.openDialog);
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    });
  });

  document.querySelectorAll("[data-close-dialog]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const dialog = document.getElementById(trigger.dataset.closeDialog);
      if (dialog) {
        dialog.close();
      }
    });
  });

  tasks = loadTasks();
  updateBudgetCard();
  initializeTasks();
  zeigeDringendeProdukte();
}

function initializeTasks() {
  const taskList = document.getElementById("task-list");
  const taskForm = document.getElementById("task-form");
  const taskTitle = document.getElementById("task-title");
  const taskCategory = document.getElementById("task-category");
  const taskModal = document.getElementById("task-modal");
  const emptyMessage = document.getElementById("empty-tasks");
  const openCount = document.getElementById("open-count");
  const navCount = document.getElementById("nav-count");
  const filterButtons = document.querySelectorAll("[data-filter]");

  if (!taskList || !taskForm || !taskTitle || !taskCategory) {
    return;
  }

  function updateTaskSummary() {
    const open = tasks.filter((task) => !task.done).length;
    if (openCount) openCount.textContent = open;
    if (navCount) navCount.textContent = open;
  }

  function matchesFilter(task) {
    if (currentFilter === "open") return !task.done;
    if (currentFilter === "done") return task.done;
    return true;
  }

  function createTaskRow(task, index) {
    const row = document.createElement("label");
    row.className =
      "task-row flex items-center justify-between p-3 rounded-xl border border-[#293630] bg-[#0b100f] mb-2 cursor-pointer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox checkbox-sm checkbox-accent";
    checkbox.checked = task.done;

    checkbox.addEventListener("change", () => {
      const task = tasks[index];

      // جلب تاريخ اليوم بصيغة YYYY-MM-DD
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const taskDateStr = task.time ? task.time.split("T")[0] : todayStr;

      if (taskDateStr !== todayStr && !task.done) {
        alert(
          "⚠️ Sie können diese Aufgabe nur an dem Tag als erledigt markieren, an dem sie fällig ist (Heute).",
        );
        checkbox.checked = false;
        return;
      }

      tasks[index].done = checkbox.checked;
      saveTasksToStorage(tasks);
      renderTasks();
    });

    const content = document.createElement("div");
    content.className = "task-content flex-1 ml-3";

    const title = document.createElement("p");
    title.className = `task-name text-sm font-medium ${task.done ? "line-through opacity-40" : "text-[#f1f7f3]"}`;
    title.textContent = task.title;

    const meta = document.createElement("p");
    meta.className = "task-meta muted text-xs mt-0.5";
    meta.textContent = `${task.time} · ${task.person}`;

    content.append(title, meta);

    const badge = document.createElement("span");
    const categoryClass =
      categoryClasses[task.category] || categoryClasses.Sonstiges;

    badge.className = `badge task-badge ${categoryClass}`;
    badge.textContent = task.category;

    row.append(checkbox, content, badge);
    return row;
  }

  function renderTasks() {
    if (!taskList) return;
    taskList.replaceChildren();

    let visibleCount = 0;

    tasks.forEach((task, index) => {
      if (!matchesFilter(task)) return;
      taskList.append(createTaskRow(task, index));
      visibleCount++;
    });

    if (emptyMessage) {
      emptyMessage.classList.toggle("hidden", visibleCount > 0);
    }

    updateTaskSummary();
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    renderTasks();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });

  taskTitle.addEventListener("input", () => {
    taskTitle.setCustomValidity("");
  });

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newTask = {
      id: Date.now().toString(),
      title: taskTitle.value.trim(),
      category: taskCategory.value,
      person: "Ayman",
      time: new Date().toISOString().split("T")[0],
      done: false,
    };

    tasks.push(newTask);
    saveTasksToStorage(tasks);
    setFilter("all");

    taskForm.reset();
    if (taskModal) taskModal.close();
    renderTasks();
  });

  renderTasks();
}

function restlicheTage(produkt) {
  if (produkt.ablaufdatum) {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const datum = new Date(produkt.ablaufdatum + "T00:00:00");
    return Math.round((datum - heute) / 86400000);
  }

  if (
    produkt.restlaufzeit === null ||
    produkt.restlaufzeit === undefined ||
    produkt.restlaufzeit === ""
  ) {
    return NaN;
  }

  return Number(produkt.restlaufzeit);
}

function zeigeDringendeProdukte() {
  const container = document.getElementById("dringendeProdukteContainer");
  const hinweis = document.getElementById("keineDringendenProdukte");

  if (!container || !hinweis) return;

  let produkte = [];

  try {
    const gespeichert = JSON.parse(localStorage.getItem("produkte"));
    if (Array.isArray(gespeichert)) {
      produkte = gespeichert;
    }
  } catch {}

  const dringend = produkte
    .filter((produkt) => produkt && typeof produkt === "object")
    .filter((produkt) => restlicheTage(produkt) <= 6)
    .sort((a, b) => restlicheTage(a) - restlicheTage(b));

  container.replaceChildren();
  hinweis.classList.toggle("hidden", dringend.length > 0);

  dringend.forEach((produkt) => {
    const tage = restlicheTage(produkt);
    const karte = document.createElement("article");

    karte.className = "card";

    karte.innerHTML = `
      <figure>
        <img loading="lazy">
      </figure>

      <div class="card-body">
        <h3 class="card-title"></h3>
        <p class="produkt-menge"></p>
      </div>

      <span class="badge restlaufzeit-badge"></span>
    `;

    const bild = karte.querySelector("img");
    const figure = karte.querySelector("figure");
    const titel = karte.querySelector(".card-title");
    const menge = karte.querySelector(".produkt-menge");
    const badge = karte.querySelector(".restlaufzeit-badge");

    titel.textContent = produkt.name || "Produkt";
    menge.textContent = produkt.menge || "—";

    badge.classList.add(tage <= 2 ? "danger" : "warning");

    if (tage < 0) {
      badge.textContent = "Abgelaufen";
    } else if (tage === 0) {
      badge.textContent = "Heute";
    } else {
      badge.textContent = `${tage} ${tage === 1 ? "Tag" : "Tage"}`;
    }

    bild.alt = "";

    function zeigePlatzhalter() {
      figure.replaceChildren();
      figure.textContent = "🌿";
    }

    bild.addEventListener("error", zeigePlatzhalter);

    if (produkt.image) {
      bild.src = produkt.image;
    } else {
      zeigePlatzhalter();
    }

    container.append(karte);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDashboard, {
    once: true,
  });
} else {
  initializeDashboard();
}

window.addEventListener("pageshow", () => {
  tasks = loadTasks();
  updateBudgetCard();
  zeigeDringendeProdukte();
});

window.addEventListener("focus", () => {
  tasks = loadTasks();
  updateBudgetCard();
  zeigeDringendeProdukte();
});

window.addEventListener("storage", (event) => {
  if (event.key === REAL_TASKS_KEY || event.key === null) {
    tasks = loadTasks();
    initializeTasks();
  }
  if (
    event.key === BUDGET_EXPENSES_KEY ||
    event.key === BUDGET_FIXCOSTS_KEY ||
    event.key === null
  ) {
    updateBudgetCard();
  }
  if (event.key === "produkte" || event.key === null) {
    zeigeDringendeProdukte();
  }
});
