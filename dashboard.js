const STORAGE_KEY = "homeflow-demo-tasks";

const initialTasks = [
  {
    title: "Clean the kitchen",
    category: "Cleaning",
    person: "Alex",
    time: "Today, 10:00",
    done: true,
  },
  {
    title: "Take out the trash",
    category: "Cleaning",
    person: "Sam",
    time: "Today, 18:00",
    done: true,
  },
  {
    title: "Laundry",
    category: "Laundry",
    person: "Jamie",
    time: "Today, 19:00",
    done: false,
  },
  {
    title: "Buy groceries",
    category: "Shopping",
    person: "Alex",
    time: "Today, 20:00",
    done: false,
  },
  {
    title: "Water the plants",
    category: "Other",
    person: "Taylor",
    time: "Tomorrow",
    done: false,
  },
];

const categoryClasses = {
  Cleaning: "category-cleaning",
  Laundry: "category-laundry",
  Shopping: "category-shopping",
  Other: "category-other",
};

let tasks = loadTasks();
let currentFilter = "all";

function isValidTask(task) {
  return (
    task !== null &&
    typeof task === "object" &&
    typeof task.title === "string" &&
    typeof task.category === "string" &&
    typeof task.person === "string" &&
    typeof task.time === "string" &&
    typeof task.done === "boolean"
  );
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (Array.isArray(saved) && saved.every(isValidTask)) {
      return saved;
    }
  } catch {}

  return initialTasks.map((task) => ({ ...task }));
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
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

  if (!taskList || !taskForm || !taskTitle || !taskCategory || !taskModal) {
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
    row.className = "task-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox checkbox-sm";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", task.title);

    checkbox.addEventListener("change", () => {
      tasks[index].done = checkbox.checked;

      saveTasks();
      renderTasks();
    });

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("p");
    title.className = "task-name";
    title.textContent = task.title;

    const meta = document.createElement("p");
    meta.className = "task-meta";
    meta.textContent = `${task.time} · ${task.person}`;

    content.append(title, meta);

    const badge = document.createElement("span");

    const categoryClass =
      categoryClasses[task.category] || categoryClasses.Other;

    badge.className = `badge task-badge ${categoryClass}`;
    badge.textContent = task.category;

    row.append(checkbox, content, badge);

    return row;
  }

  function renderTasks() {
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

    const title = taskTitle.value.trim();

    if (!title) {
      taskTitle.setCustomValidity("Please enter a task.");
      taskTitle.reportValidity();
      return;
    }

    tasks.push({
      title,
      category: taskCategory.value,
      person: "Alex",
      time: "Today",
      done: false,
    });

    saveTasks();
    setFilter("all");

    taskForm.reset();
    taskTitle.setCustomValidity("");
    taskModal.close();
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

window.addEventListener("pageshow", zeigeDringendeProdukte);
window.addEventListener("focus", zeigeDringendeProdukte);

window.addEventListener("storage", (event) => {
  if (event.key === "produkte" || event.key === null) {
    zeigeDringendeProdukte();
  }
});

/*STATISTIK SHOPPING*/

function updateShoppingCount() {
  const items = JSON.parse(localStorage.getItem("shopping_basket")) || [];

  const lebensmittel = items.filter((item) => {
    return (
      (item.category === "groceries" || item.category === "Lebensmittel") &&
      !item.bought
    );
  });

  document.querySelector("#shopping-count").textContent = lebensmittel.length;
}

updateShoppingCount();

window.addEventListener("pageshow", updateShoppingCount);
window.addEventListener("focus", updateShoppingCount);

window.addEventListener("storage", (event) => {
  if (event.key === "shopping_basket" || event.key === null) {
    updateShoppingCount();
  }
});

/*PANTRY*/

function updatePantryCount() {
  const produkte = JSON.parse(localStorage.getItem("produkte")) || [];

  const dringend = produkte.filter((produkt) => {
    return restlicheTage(produkt) <= 2;
  });

  document.querySelector("#pantry-count").textContent = dringend.length;
}

updatePantryCount();

window.addEventListener("pageshow", updatePantryCount);
window.addEventListener("focus", updatePantryCount);

window.addEventListener("storage", (event) => {
  if (event.key === "produkte" || event.key === null) {
    updatePantryCount();
  }
});
