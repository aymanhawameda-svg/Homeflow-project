function updateSidebarTaskCount() {
  const navCount = document.getElementById("nav-count");
  if (!navCount) return;

  try {
    const savedTasks = localStorage.getItem("homeflow_tasks");
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);

      const activeTasksCount = tasks.filter((t) => !t.completed).length;
      navCount.textContent = activeTasksCount;
    } else {
      navCount.textContent = "0";
    }
  } catch (e) {
    console.error("Fehler beim Laden des العداد", e);
  }
}

document.addEventListener("DOMContentLoaded", updateSidebarTaskCount);

window.addEventListener("storage", (e) => {
  if (e.key === "homeflow_tasks" || e.key === null) {
    updateSidebarTaskCount();
  }
});
