// Modern To-Do List - JavaScript File (js/script.js)

class TodoApp {
  constructor() {
    this.tasks = this.loadTasks();
    this.filteredTasks = [...this.tasks];
    this.currentTheme = localStorage.getItem("theme") || "light";

    this.initElements();
    this.initEventListeners();
    this.initTheme();
    this.renderTasks();
    this.updateTaskCount();
  }

  // Load tasks from localStorage
  loadTasks() {
    try {
      const savedTasks = localStorage.getItem("todoTasks");
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }

  // Save tasks to localStorage
  saveTasks() {
    try {
      localStorage.setItem("todoTasks", JSON.stringify(this.tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
      this.showNotification(
        "Error saving tasks!",
        "error",
        "fas fa-exclamation-triangle"
      );
    }
  }

  initElements() {
    this.taskForm = document.getElementById("taskForm");
    this.taskInput = document.getElementById("taskInput");
    this.dateInput = document.getElementById("dateInput");
    this.searchInput = document.getElementById("searchInput");
    this.filterDate = document.getElementById("filterDate");
    this.clearFilter = document.getElementById("clearFilter");
    this.taskList = document.getElementById("taskList");
    this.taskCount = document.getElementById("taskCount");
    this.clearAll = document.getElementById("clearAll");
    this.themeToggle = document.getElementById("themeToggle");
    this.notification = document.getElementById("notification");
    this.emptyState = document.getElementById("emptyState");
  }

  initEventListeners() {
    // Form submission
    this.taskForm.addEventListener("submit", (e) => this.handleAddTask(e));

    // Filter events
    this.searchInput.addEventListener("input", () => this.handleFilter());
    this.filterDate.addEventListener("change", () => this.handleFilter());
    this.clearFilter.addEventListener("click", () => this.handleClearFilter());

    // Button events
    this.clearAll.addEventListener("click", () => this.handleClearAll());
    this.themeToggle.addEventListener("click", () => this.handleThemeToggle());

    // Set today as default date
    const today = new Date().toISOString().split("T")[0];
    this.dateInput.value = today;
  }

  initTheme() {
    document.documentElement.setAttribute("data-theme", this.currentTheme);
    const icon = this.themeToggle.querySelector("i");
    icon.className =
      this.currentTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
  }

  handleAddTask(e) {
    e.preventDefault();

    const taskName = this.taskInput.value.trim();
    const taskDate = this.dateInput.value;

    if (!taskName) {
      this.showNotification(
        "Task name is required!",
        "error",
        "fas fa-exclamation-triangle"
      );
      this.taskInput.focus();
      return;
    }

    if (!taskDate) {
      this.showNotification(
        "Task date is required!",
        "error",
        "fas fa-exclamation-triangle"
      );
      this.dateInput.focus();
      return;
    }

    const newTask = {
      id: Date.now(),
      name: taskName,
      date: taskDate,
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    this.handleFilter(); // Apply current filters
    this.updateTaskCount();

    // Reset form
    this.taskForm.reset();
    const today = new Date().toISOString().split("T")[0];
    this.dateInput.value = today;
    this.taskInput.focus();

    this.showNotification(
      `Task "${taskName}" added successfully!`,
      "success",
      "fas fa-check-circle"
    );
  }

  handleFilter() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    const dateFilter = this.filterDate.value;

    this.filteredTasks = this.tasks.filter((task) => {
      const matchesSearch =
        !searchTerm || task.name.toLowerCase().includes(searchTerm);
      const matchesDate = !dateFilter || task.date === dateFilter;
      return matchesSearch && matchesDate;
    });

    this.renderTasks();

    if (searchTerm && dateFilter) {
      this.showNotification(
        `Found ${
          this.filteredTasks.length
        } tasks matching "${searchTerm}" on ${this.formatDate(dateFilter)}`,
        "info",
        "fas fa-search"
      );
    } else if (searchTerm) {
      this.showNotification(
        `Found ${this.filteredTasks.length} tasks matching "${searchTerm}"`,
        "info",
        "fas fa-search"
      );
    } else if (dateFilter) {
      this.showNotification(
        `Found ${this.filteredTasks.length} tasks on ${this.formatDate(
          dateFilter
        )}`,
        "info",
        "fas fa-calendar"
      );
    }
  }

  handleClearFilter() {
    this.searchInput.value = "";
    this.filterDate.value = "";
    this.filteredTasks = [...this.tasks];
    this.renderTasks();
    this.showNotification("All filters cleared!", "info", "fas fa-broom");
  }

  handleDeleteTask(taskId) {
    const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      const deletedTask = this.tasks[taskIndex];
      this.tasks.splice(taskIndex, 1);
      this.saveTasks();
      this.handleFilter(); // Re-apply current filters
      this.updateTaskCount();
      this.showNotification(
        `Task "${deletedTask.name}" deleted!`,
        "success",
        "fas fa-trash-alt"
      );
    }
  }

  handleClearAll() {
    if (this.tasks.length === 0) {
      this.showNotification("No tasks to clear!", "info", "fas fa-info-circle");
      return;
    }

    const taskCount = this.tasks.length;
    this.tasks = [];
    this.filteredTasks = [];
    this.saveTasks();
    this.renderTasks();
    this.updateTaskCount();
    this.showNotification(
      `All ${taskCount} tasks cleared!`,
      "success",
      "fas fa-broom"
    );
  }

  handleThemeToggle() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", this.currentTheme);
    localStorage.setItem("theme", this.currentTheme);

    const icon = this.themeToggle.querySelector("i");
    icon.className =
      this.currentTheme === "dark" ? "fas fa-sun" : "fas fa-moon";

    const themeName = this.currentTheme === "dark" ? "Dark" : "Light";
    const themeIcon =
      this.currentTheme === "dark" ? "fas fa-moon" : "fas fa-sun";
    this.showNotification(`${themeName} mode activated!`, "info", themeIcon);
  }

  renderTasks() {
    if (this.filteredTasks.length === 0) {
      const hasFilters = this.searchInput.value || this.filterDate.value;
      this.taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-${
                      hasFilters ? "search" : "clipboard-list"
                    }"></i>
                    <h3>${
                      hasFilters ? "No matching tasks" : "No tasks yet"
                    }</h3>
                    <p>${
                      hasFilters
                        ? "Try adjusting your filters"
                        : "Add a new task to get started!"
                    }</p>
                </div>
            `;
      return;
    }

    this.taskList.innerHTML = this.filteredTasks
      .map(
        (task) => `
            <div class="task-item" style="animation-delay: ${
              Math.random() * 0.1
            }s">
                <div class="task-info">
                    <div class="task-name">${this.escapeHtml(task.name)}</div>
                    <div class="task-date">
                        <i class="fas fa-calendar-day"></i>
                        ${this.formatDate(task.date)}
                    </div>
                </div>
                <button class="delete-btn" onclick="todoApp.handleDeleteTask(${
                  task.id
                })" title="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `
      )
      .join("");
  }

  updateTaskCount() {
    const count = this.tasks.length;
    this.taskCount.textContent = `${count} task${count !== 1 ? "s" : ""}`;
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      return dateString; // Return original if formatting fails
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = "info", icon = "fas fa-info-circle") {
    const notificationIcon =
      this.notification.querySelector(".notification-icon");
    const notificationText =
      this.notification.querySelector(".notification-text");

    notificationIcon.className = `notification-icon ${icon}`;
    notificationText.textContent = message;

    this.notification.className = `notification ${type}`;
    this.notification.classList.add("show");

    // Auto hide after 3 seconds
    setTimeout(() => {
      this.notification.classList.remove("show");
    }, 3000);
  }
}

// Initialize the app when DOM is loaded
let todoApp;
document.addEventListener("DOMContentLoaded", () => {
  todoApp = new TodoApp();
});

// Add click feedback for buttons
document.addEventListener("click", (e) => {
  if (e.target.matches('button, .task-item, input[type="submit"]')) {
    // Add visual feedback
    e.target.style.transform = "scale(0.95)";
    setTimeout(() => {
      e.target.style.transform = "";
    }, 100);
  }
});
