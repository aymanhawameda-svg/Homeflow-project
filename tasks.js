const TASKS_KEY = "homeflow_tasks";
const MEMBERS_KEY = "homeflow_members";

let editingTaskId = null;
let currentFilterTime = "all"; // 'all', 'today', 'week'


function getTasks() {
  const tasks = localStorage.getItem(TASKS_KEY);
  return tasks ? JSON.parse(tasks) : [];
}

function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function getMembers() {
  const members = localStorage.getItem(MEMBERS_KEY);
  return members ? JSON.parse(members) : ["Alex", "Sadeen", "Ayman"]; 
}

function saveMembers(members) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}


document
  .getElementById("add-member-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const nameInput = document.getElementById("member-name");
    const name = nameInput.value.trim();

    if (name) {
      const members = getMembers();
      if (!members.includes(name)) {
        members.push(name);
        saveMembers(members);
        renderMembers();
        populateAssigneeSelects();
      }
      nameInput.value = "";
    }
  });

function deleteMember(name) {
  let members = getMembers();
  members = members.filter((m) => m !== name);
  saveMembers(members);
  renderMembers();
  populateAssigneeSelects();
}

function renderMembers() {
  const members = getMembers();
  const membersList = document.getElementById("members-list");
  membersList.innerHTML = "";

  members.forEach((member) => {
    const badge = document.createElement("div");
    badge.className =
      "badge bg-[#173e30] text-[#72e0ad] border-[#293630] gap-1 p-3 text-xs";
    badge.innerHTML = `
      👤 ${member}
      <button onclick="deleteMember('${member}')" class="text-xs hover:text-red-400 ml-1">✕</button>
    `;
    membersList.appendChild(badge);
  });
}

function populateAssigneeSelects() {
  const members = getMembers();
  const taskAssigneeSelect = document.getElementById("task-assignee-select");
  const filterPersonSelect = document.getElementById("filter-person-select");

  
  const selectedFilterPerson = filterPersonSelect.value;

  taskAssigneeSelect.innerHTML =
    '<option value="Nicht zugewiesen">Nicht zugewiesen</option>';
  filterPersonSelect.innerHTML = '<option value="all">Alle Personen</option>';

  members.forEach((member) => {
    taskAssigneeSelect.innerHTML += `<option value="${member}">${member}</option>`;
    filterPersonSelect.innerHTML += `<option value="${member}">${member}</option>`;
  });

  filterPersonSelect.value = selectedFilterPerson || "all";
}


function openAddModal() {
  editingTaskId = null;
  document.getElementById("modal-title").textContent =
    "Neue Aufgabe hinzufügen";
  document.getElementById("add-task-form").reset();
  task_modal.showModal();
}


document
  .getElementById("add-task-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("task-title").value;
    const category = document.getElementById("task-category").value;
    const assignee = document.getElementById("task-assignee-select").value;
    const dueDate = document.getElementById("task-datetime").value;

    const tasks = getTasks();

    if (editingTaskId) {
      const task = tasks.find((t) => t.id === editingTaskId);
      if (task) {
        task.title = title;
        task.category = category;
        task.assignee = assignee;
        task.dueDate = dueDate;
      }
    } else {
      const newTask = {
        id: Date.now().toString(),
        title,
        category,
        assignee,
        dueDate,
        completed: false,
      };
      tasks.push(newTask);
    }

    saveTasks(tasks);
    document.getElementById("task_modal").close();
    this.reset();
    editingTaskId = null;
    renderTasks();
  });


function editTask(id) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  editingTaskId = id;
  document.getElementById("modal-title").textContent = "Aufgabe bearbeiten";
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-category").value = task.category;
  document.getElementById("task-assignee-select").value = task.assignee;
  document.getElementById("task-datetime").value = task.dueDate;

  task_modal.showModal();
}


function toggleTask(id) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const taskDateStr = task.dueDate.split("T")[0];

  
  if (taskDateStr !== todayStr && !task.completed) {
    alert(
      "⚠️ Sie können diese Aufgabe nur an dem Tag als erledigt markieren, an dem sie fällig ist (Heute).",
    );
    renderTasks();
    return;
  }

  task.completed = !task.completed;
  saveTasks(tasks);
  renderTasks();
}


function deleteTask(id) {
  if (confirm("Möchten Sie diese Aufgabe wirklich löschen?")) {
    let tasks = getTasks();
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks(tasks);
    renderTasks();
  }
}


function setFilterTime(type) {
  currentFilterTime = type;

  
  document
    .querySelectorAll("#filter-all, #filter-today, #filter-week")
    .forEach((btn) => {
      btn.className = "btn btn-sm btn-ghost text-xs text-gray-400";
    });

  const activeBtn = document.getElementById(`filter-${type}`);
  if (activeBtn) {
    activeBtn.className = "btn btn-sm bg-[#173e30] text-[#72e0ad] border-none";
  }

  renderTasks();
}


function renderTasks() {
  const tasks = getTasks();
  const selectedPerson = document.getElementById("filter-person-select").value;

  const todayList = document.getElementById("today-list");
  const tomorrowList = document.getElementById("tomorrow-list");
  const upcomingList = document.getElementById("upcoming-list");
  const overdueList = document.getElementById("overdue-list");

  todayList.innerHTML = "";
  tomorrowList.innerHTML = "";
  upcomingList.innerHTML = "";
  overdueList.innerHTML = "";

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  
  const endOfWeek = new Date();
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

  let todayCount = 0,
    tomorrowCount = 0,
    upcomingCount = 0,
    overdueCount = 0;

  
  let filteredTasks = tasks.filter((task) => {
    
    if (selectedPerson !== "all" && task.assignee !== selectedPerson) {
      return false;
    }

    
    const taskDate = new Date(task.dueDate);
    const taskDateStr = task.dueDate.split("T")[0];

    if (currentFilterTime === "today" && taskDateStr !== todayStr) {
      return false;
    }
    if (
      currentFilterTime === "week" &&
      (taskDate > endOfWeek || (taskDate < now && taskDateStr !== todayStr))
    ) {
      return false;
    }

    return true;
  });

  
  filteredTasks.sort((a, b) => a.completed - b.completed);

  filteredTasks.forEach((task) => {
    const taskDate = new Date(task.dueDate);
    const taskDateStr = task.dueDate.split("T")[0];
    const timeStr = taskDate.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const card = document.createElement("div");
    card.className = `flex items-center justify-between p-3 rounded-lg border border-[#293630] bg-[#0b100f] transition-all ${
      task.completed ? "opacity-40 line-through bg-[#070b0a]" : ""
    }`;

    card.innerHTML = `
      <div class="flex items-center gap-3">
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask('${task.id}')" class="checkbox checkbox-accent checkbox-sm" />
        <div>
          <p class="font-medium text-sm ${task.completed ? "text-gray-500" : "text-[#f1f7f3]"}">${task.title}</p>
          <div class="flex gap-2 items-center text-xs text-[#8d9d94] mt-1">
            <span class="badge badge-xs badge-outline">${task.category}</span>
            <span>⏰ ${timeStr} Uhr</span>
            <span>👤 ${task.assignee}</span>
          </div>
        </div>
      </div>
      <div class="flex gap-1">
        <button onclick="editTask('${task.id}')" class="btn btn-ghost btn-xs text-info" title="Bearbeiten">✏️</button>
        <button onclick="deleteTask('${task.id}')" class="btn btn-ghost btn-xs text-error" title="Löschen">✕</button>
      </div>
    `;

    if (!task.completed && taskDate < now && taskDateStr !== todayStr) {
      overdueList.appendChild(card);
      overdueCount++;
    } else if (taskDateStr === todayStr) {
      todayList.appendChild(card);
      todayCount++;
    } else if (taskDateStr === tomorrowStr) {
      tomorrowList.appendChild(card);
      tomorrowCount++;
    } else {
      upcomingList.appendChild(card);
      upcomingCount++;
    }
  });

  document.getElementById("today-count").textContent = todayCount;
  document.getElementById("tomorrow-count").textContent = tomorrowCount;
  document.getElementById("upcoming-count").textContent = upcomingCount;
  document.getElementById("overdue-count").textContent = overdueCount;

  const navCount = document.getElementById("nav-count");
  if (navCount) {
    navCount.textContent = tasks.filter((t) => !t.completed).length;
  }

  
  const overdueSection = document.getElementById("overdue-section");
  if (overdueCount > 0) {
    overdueSection.classList.remove("hidden");
  } else {
    overdueSection.classList.add("hidden");
  }
}


document.addEventListener("DOMContentLoaded", () => {
  renderMembers();
  populateAssigneeSelects();
  renderTasks();
});
