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
  } catch {
    // Use default tasks if local storage is unavailable.
  }

  return initialTasks.map((task) => ({ ...task }));
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Changes still work within the current session.
  }
}

function initializeDashboard() {
  const taskList = document.getElementById("task-list");
  const taskForm = document.getElementById("task-form");
  const taskTitle = document.getElementById("task-title");
  const taskCategory = document.getElementById("task-category");
  const taskModal = document.getElementById("task-modal");
  const emptyMessage = document.getElementById("empty-tasks");
  const openCount = document.getElementById("open-count");
  const navCount = document.getElementById("nav-count");
  const filterButtons = document.querySelectorAll("[data-filter]");

  function updateTaskSummary() {
    const open = tasks.filter((task) => !task.done).length;

    openCount.textContent = open;
    navCount.textContent = open;
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

    emptyMessage.classList.toggle("hidden", visibleCount > 0);

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

  // Filter tasks.
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });

  // Open dialogs from buttons and links.
  document.querySelectorAll("[data-open-dialog]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();

      const dialog = document.getElementById(trigger.dataset.openDialog);

      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    });
  });

  // Close dialogs.
  document.querySelectorAll("[data-close-dialog]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();

      const dialog = document.getElementById(trigger.dataset.closeDialog);

      if (dialog) {
        dialog.close();
      }
    });
  });

  // Clear validation when typing.
  taskTitle.addEventListener("input", () => {
    taskTitle.setCustomValidity("");
  });

  // Add a task.
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

// Works with defer or when loaded before the HTML is ready.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDashboard, {
    once: true,
  });
} else {
  initializeDashboard();
}
