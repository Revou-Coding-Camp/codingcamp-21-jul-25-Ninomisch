// Enhanced Apple-Style / - JavaScript

class TodoApp {
  constructor() {
    this.tasks = [];
    this.filteredTasks = [];
    this.currentTheme = "light";
    this.editingTaskId = null;

    this.initElements();
    this.initEventListeners();
    this.initTheme();
    this.renderTasks();
    this.updateTaskCount();
    this.setDefaultDate();
  }

  initElements() {
    // Form elements
    this.taskForm = document.getElementById("taskForm");
    this.taskInput = document.getElementById("taskInput");
    this.dateInput = document.getElementById("dateInput");
    this.priorityInput = document.getElementById("priorityInput");

    // Filter elements
    this.searchInput = document.getElementById("searchInput");
    this.filterDate = document.getElementById("filterDate");
    this.priorityFilter = document.getElementById("priorityFilter");
    this.clearFilter = document.getElementById("clearFilter");

    // Display elements
    this.taskList = document.getElementById("taskList");
    this.taskCount = document.getElementById("taskCount");
    this.completedCount = document.getElementById("completedCount");
    this.clearAll = document.getElementById("clearAll");
    this.themeToggle = document.getElementById("themeToggle");
    this.notification = document.getElementById("notification");
    this.emptyState = document.getElementById("emptyState");

    // Modal elements
    this.editModal = document.getElementById("editModal");
    this.editForm = document.getElementById("editForm");
    this.editTaskName = document.getElementById("editTaskName");
    this.editTaskDate = document.getElementById("editTaskDate");
    this.editTaskPriority = document.getElementById("editTaskPriority");
    this.closeModal = document.getElementById("closeModal");
    this.cancelEdit = document.getElementById("cancelEdit");
  }

  initEventListeners() {
    // Form submission
    this.taskForm.addEventListener("submit", (e) => this.handleAddTask(e));

    // Filter events
    this.searchInput.addEventListener("input", () => this.handleFilter());
    this.filterDate.addEventListener("change", () => this.handleFilter());
    this.priorityFilter.addEventListener("change", () => this.handleFilter());
    this.clearFilter.addEventListener("click", () => this.handleClearFilter());

    // Button events
    this.clearAll.addEventListener("click", () => this.handleClearAll());
    this.themeToggle.addEventListener("click", () => this.handleThemeToggle());

    // Modal events
    this.editForm.addEventListener("submit", (e) => this.handleEditSubmit(e));
    this.closeModal.addEventListener("click", () => this.hideEditModal());
    this.cancelEdit.addEventListener("click", () => this.hideEditModal());
    this.editModal.addEventListener("click", (e) => {
      if (e.target === this.editModal) this.hideEditModal();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e)
    );

    // Enhanced input interactions
    this.setupInputEnhancements();
  }

  setupInputEnhancements() {
    // Auto-resize task input
    this.taskInput.addEventListener("input", () => {
      if (this.taskInput.value.length > 50) {
        this.taskInput.style.fontSize = "15px";
      } else {
        this.taskInput.style.fontSize = "17px";
      }
    });

    // Smart date suggestions
    this.taskInput.addEventListener("input", () => {
      const value = this.taskInput.value.toLowerCase();
      const today = new Date();

      if (value.includes("tomorrow")) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.dateInput.value = tomorrow.toISOString().split("T")[0];
      } else if (value.includes("next week")) {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        this.dateInput.value = nextWeek.toISOString().split("T")[0];
      }
    });
  }

  initTheme() {
    // Check system preference if no theme is set
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      this.currentTheme = "dark";
    }

    document.documentElement.setAttribute("data-theme", this.currentTheme);
    this.updateThemeIcon();

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("user-theme-preference")) {
          this.currentTheme = e.matches ? "dark" : "light";
          document.documentElement.setAttribute(
            "data-theme",
            this.currentTheme
          );
          this.updateThemeIcon();
        }
      });
  }

  updateThemeIcon() {
    const icon = this.themeToggle.querySelector("i");
    icon.className =
      this.currentTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
  }

  setDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    this.dateInput.value = today;
  }

  handleAddTask(e) {
    e.preventDefault();

    const taskName = this.taskInput.value.trim();
    const taskDate = this.dateInput.value;
    const taskPriority = this.priorityInput.value;

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

    // Check if date is in the past
    const selectedDate = new Date(taskDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.showNotification(
        "Cannot add tasks for past dates!",
        "error",
        "fas fa-calendar-times"
      );
      this.dateInput.focus();
      return;
    }

    const newTask = {
      id: Date.now() + Math.random(),
      name: taskName,
      date: taskDate,
      priority: taskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    this.tasks.unshift(newTask);
    this.handleFilter();
    this.updateTaskCount();

    // Reset form with animation
    this.taskForm.reset();
    this.setDefaultDate();
    this.priorityInput.value = "medium";
    this.taskInput.focus();

    // Success feedback with priority color
    const priorityColors = {
      high: "fas fa-exclamation-circle",
      medium: "fas fa-check-circle",
      low: "fas fa-plus-circle",
    };

    this.showNotification(
      `Task "${taskName}" added with ${taskPriority} priority!`,
      "success",
      priorityColors[taskPriority]
    );

    // Add subtle shake animation to task list
    this.taskList.style.animation = "none";
    setTimeout(() => {
      this.taskList.style.animation = "fadeInUp 0.5s ease";
    }, 10);
  }

  handleFilter() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    const dateFilter = this.filterDate.value;
    const priorityFilterValue = this.priorityFilter.value;

    this.filteredTasks = this.tasks.filter((task) => {
      const matchesSearch =
        !searchTerm || task.name.toLowerCase().includes(searchTerm);
      const matchesDate = !dateFilter || task.date === dateFilter;
      const matchesPriority =
        !priorityFilterValue || task.priority === priorityFilterValue;

      return matchesSearch && matchesDate && matchesPriority;
    });

    // Sort tasks by priority and date
    this.filteredTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) return priorityDiff;

      return new Date(a.date) - new Date(b.date);
    });

    this.renderTasks();

    // Smart filter feedback
    const filterCount = this.filteredTasks.length;
    const totalCount = this.tasks.length;

    if (searchTerm || dateFilter || priorityFilterValue) {
      let message = `Found ${filterCount} of ${totalCount} tasks`;
      if (searchTerm) message += ` matching "${searchTerm}"`;
      if (dateFilter) message += ` on ${this.formatDate(dateFilter)}`;
      if (priorityFilterValue)
        message += ` with ${priorityFilterValue} priority`;

      this.showNotification(message, "info", "fas fa-search");
    }
  }

  handleClearFilter() {
    this.searchInput.value = "";
    this.filterDate.value = "";
    this.priorityFilter.value = "";
    this.filteredTasks = [...this.tasks];
    this.renderTasks();
    this.showNotification("All filters cleared!", "info", "fas fa-broom");
  }

  handleToggleComplete(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;

      this.handleFilter();
      this.updateTaskCount();

      const message = task.completed
        ? `Task "${task.name}" completed! 🎉`
        : `Task "${task.name}" reopened`;
      const type = task.completed ? "success" : "info";
      const icon = task.completed ? "fas fa-check-circle" : "fas fa-undo";

      this.showNotification(message, type, icon);
    }
  }

  handleEditTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      this.editingTaskId = taskId;
      this.editTaskName.value = task.name;
      this.editTaskDate.value = task.date;
      this.editTaskPriority.value = task.priority;
      this.showEditModal();
    }
  }

  handleEditSubmit(e) {
    e.preventDefault();

    const taskName = this.editTaskName.value.trim();
    const taskDate = this.editTaskDate.value;
    const taskPriority = this.editTaskPriority.value;

    if (!taskName || !taskDate) {
      this.showNotification(
        "Please fill in all fields!",
        "error",
        "fas fa-exclamation-triangle"
      );
      return;
    }

    const task = this.tasks.find((t) => t.id === this.editingTaskId);
    if (task) {
      const oldName = task.name;
      task.name = taskName;
      task.date = taskDate;
      task.priority = taskPriority;
      task.updatedAt = new Date().toISOString();

      this.handleFilter();
      this.hideEditModal();

      this.showNotification(
        `Task "${oldName}" updated successfully!`,
        "success",
        "fas fa-edit"
      );
    }
  }

  handleDeleteTask(taskId) {
    const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      const deletedTask = this.tasks[taskIndex];

      // Add delete animation
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (taskElement) {
        taskElement.style.transform = "translateX(-100%)";
        taskElement.style.opacity = "0";

        setTimeout(() => {
          this.tasks.splice(taskIndex, 1);
          this.handleFilter();
          this.updateTaskCount();
          this.showNotification(
            `Task "${deletedTask.name}" deleted!`,
            "success",
            "fas fa-trash-alt"
          );
        }, 300);
      } else {
        this.tasks.splice(taskIndex, 1);
        this.handleFilter();
        this.updateTaskCount();
        this.showNotification(
          `Task "${deletedTask.name}" deleted!`,
          "success",
          "fas fa-trash-alt"
        );
      }
    }
  }

  handleClearAll() {
    if (this.tasks.length === 0) {
      this.showNotification("No tasks to clear!", "info", "fas fa-info-circle");
      return;
    }

    // Confirm deletion with animation
    const taskCount = this.tasks.length;
    const completedCount = this.tasks.filter((t) => t.completed).length;

    // Add clear animation
    this.taskList.style.transform = "scale(0.95)";
    this.taskList.style.opacity = "0.5";

    setTimeout(() => {
      this.tasks = [];
      this.filteredTasks = [];
      this.renderTasks();
      this.updateTaskCount();

      this.taskList.style.transform = "scale(1)";
      this.taskList.style.opacity = "1";

      this.showNotification(
        `Cleared ${taskCount} tasks (${completedCount} completed)!`,
        "success",
        "fas fa-broom"
      );
    }, 300);
  }

  handleThemeToggle() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", this.currentTheme);

    // Save user preference
    localStorage.setItem("user-theme-preference", this.currentTheme);

    this.updateThemeIcon();

    const themeName = this.currentTheme === "dark" ? "Dark" : "Light";
    const themeIcon =
      this.currentTheme === "dark" ? "fas fa-moon" : "fas fa-sun";
    this.showNotification(`${themeName} mode activated!`, "info", themeIcon);
  }

  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (document.activeElement === this.taskInput) {
        this.taskForm.dispatchEvent(new Event("submit"));
      }
    }

    // Escape to close modal
    if (e.key === "Escape") {
      this.hideEditModal();
    }

    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      this.searchInput.focus();
    }

    // Ctrl/Cmd + K to clear filters
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      this.handleClearFilter();
    }
  }

  showEditModal() {
    this.editModal.classList.add("show");
    this.editTaskName.focus();
    document.body.style.overflow = "hidden";
  }

  hideEditModal() {
    this.editModal.classList.remove("show");
    this.editingTaskId = null;
    this.editForm.reset();
    document.body.style.overflow = "";
  }

  renderTasks() {
    if (this.filteredTasks.length === 0) {
      const hasFilters =
        this.searchInput.value ||
        this.filterDate.value ||
        this.priorityFilter.value;
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
        (task, index) => `
            <div class="task-item ${task.priority}-priority ${
          task.completed ? "completed" : ""
        }" 
                 data-task-id="${task.id}"
                 style="animation-delay: ${index * 0.05}s">
                <div class="task-info">
                    <div class="task-checkbox ${
                      task.completed ? "completed" : ""
                    }" 
                         onclick="todoApp.handleToggleComplete(${task.id})">
                        ${task.completed ? '<i class="fas fa-check"></i>' : ""}
                    </div>
                    <div class="task-content">
                        <div class="task-name">${this.escapeHtml(
                          task.name
                        )}</div>
                        <div class="task-date">
                            <i class="fas fa-calendar-day"></i>
                            ${this.formatDate(task.date)}
                            ${
                              this.isOverdue(task.date) && !task.completed
                                ? '<i class="fas fa-exclamation-triangle" style="color: var(--accent-red); margin-left: 8px;" title="Overdue"></i>'
                                : ""
                            }
                        </div>
                    </div>
                    <div class="task-priority ${task.priority}">
                        ${task.priority.toUpperCase()}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" onclick="todoApp.handleEditTask(${
                      task.id
                    })" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="todoApp.handleDeleteTask(${
                      task.id
                    })" title="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }

  updateTaskCount() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter((task) => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    this.taskCount.textContent = `${totalTasks} task${
      totalTasks !== 1 ? "s" : ""
    }`;
    this.completedCount.textContent = `${completedTasks} completed`;

    // Update progress in title
    if (totalTasks > 0) {
      const progress = Math.round((completedTasks / totalTasks) * 100);
      document.title = `Ninote (${progress}% Complete)`;
    } else {
      document.title = "Ninote - Apple Style To-Do";
    }
  }

  isOverdue(dateString) {
    const taskDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Reset time for comparison
      today.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);
      yesterday.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        return "Today";
      } else if (date.getTime() === tomorrow.getTime()) {
        return "Tomorrow";
      } else if (date.getTime() === yesterday.getTime()) {
        return "Yesterday";
      } else {
        const options = {
          weekday: "short",
          month: "short",
          day: "numeric",
          year:
            date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        };
        return date.toLocaleDateString("en-US", options);
      }
    } catch (error) {
      return dateString;
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

    // Auto hide after 4 seconds
    setTimeout(() => {
      this.notification.classList.remove("show");
    }, 4000);
  }

  // Advanced features
  getTaskStatistics() {
    const stats = {
      total: this.tasks.length,
      completed: this.tasks.filter((t) => t.completed).length,
      pending: this.tasks.filter((t) => !t.completed).length,
      overdue: this.tasks.filter((t) => !t.completed && this.isOverdue(t.date))
        .length,
      highPriority: this.tasks.filter(
        (t) => !t.completed && t.priority === "high"
      ).length,
      mediumPriority: this.tasks.filter(
        (t) => !t.completed && t.priority === "medium"
      ).length,
      lowPriority: this.tasks.filter(
        (t) => !t.completed && t.priority === "low"
      ).length,
      today: this.tasks.filter(
        (t) => t.date === new Date().toISOString().split("T")[0]
      ).length,
    };

    return stats;
  }

  exportTasks() {
    const exportData = {
      tasks: this.tasks,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ninote-tasks-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    this.showNotification(
      "Tasks exported successfully!",
      "success",
      "fas fa-download"
    );
  }

  importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        if (importData.tasks && Array.isArray(importData.tasks)) {
          const importCount = importData.tasks.length;
          this.tasks = [...this.tasks, ...importData.tasks];
          this.handleFilter();
          this.updateTaskCount();
          this.showNotification(
            `Imported ${importCount} tasks successfully!`,
            "success",
            "fas fa-upload"
          );
        } else {
          throw new Error("Invalid file format");
        }
      } catch (error) {
        this.showNotification(
          "Error importing tasks. Please check the file format.",
          "error",
          "fas fa-exclamation-triangle"
        );
      }
    };
    reader.readAsText(file);
  }

  // Search suggestions
  getSearchSuggestions(query) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    // Task name suggestions
    this.tasks.forEach((task) => {
      if (
        task.name.toLowerCase().includes(lowerQuery) &&
        !suggestions.includes(task.name)
      ) {
        suggestions.push(task.name);
      }
    });

    return suggestions.slice(0, 5);
  }

  // Productivity insights
  getProductivityInsights() {
    const stats = this.getTaskStatistics();
    const insights = [];

    if (stats.completed > 0) {
      const completionRate = Math.round((stats.completed / stats.total) * 100);
      insights.push(`You've completed ${completionRate}% of your tasks! 🎉`);
    }

    if (stats.overdue > 0) {
      insights.push(
        `You have ${stats.overdue} overdue task${
          stats.overdue > 1 ? "s" : ""
        }. Consider prioritizing them.`
      );
    }

    if (stats.highPriority > 0) {
      insights.push(
        `${stats.highPriority} high-priority task${
          stats.highPriority > 1 ? "s" : ""
        } need${stats.highPriority === 1 ? "s" : ""} your attention.`
      );
    }

    if (stats.today > 0) {
      insights.push(
        `You have ${stats.today} task${stats.today > 1 ? "s" : ""} due today.`
      );
    }

    return insights;
  }
}

// Initialize the app when DOM is loaded
let todoApp;
document.addEventListener("DOMContentLoaded", () => {
  todoApp = new TodoApp();

  // Add some sample tasks for demonstration
  setTimeout(() => {
    if (todoApp.tasks.length === 0) {
      const sampleTasks = [
        {
          id: Date.now() + 1,
          name: "Welcome to Ninote! 🎉",
          date: new Date().toISOString().split("T")[0],
          priority: "medium",
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
        {
          id: Date.now() + 2,
          name: "Try editing this task by clicking the edit button",
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
          priority: "low",
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
        {
          id: Date.now() + 3,
          name: "Mark this task as completed",
          date: new Date().toISOString().split("T")[0],
          priority: "high",
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
      ];

      todoApp.tasks = sampleTasks;
      todoApp.handleFilter();
      todoApp.updateTaskCount();
    }
  }, 1000);
});

// Enhanced click feedback
document.addEventListener("click", (e) => {
  if (
    e.target.matches('button, .task-item, input[type="submit"], .task-checkbox')
  ) {
    // Add visual feedback with different intensities
    const element = e.target;
    const originalTransform = element.style.transform;

    if (element.classList.contains("task-checkbox")) {
      element.style.transform = "scale(1.2)";
    } else if (element.classList.contains("delete-btn")) {
      element.style.transform = "scale(0.9) rotate(5deg)";
    } else if (element.classList.contains("edit-btn")) {
      element.style.transform = "scale(0.9) rotate(-5deg)";
    } else {
      element.style.transform = "scale(0.95)";
    }

    setTimeout(() => {
      element.style.transform = originalTransform;
    }, 150);
  }
});

// Add drag and drop functionality for task reordering
let draggedElement = null;

document.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("task-item")) {
    draggedElement = e.target;
    e.target.style.opacity = "0.5";
  }
});

document.addEventListener("dragend", (e) => {
  if (e.target.classList.contains("task-item")) {
    e.target.style.opacity = "1";
    draggedElement = null;
  }
});

document.addEventListener("dragover", (e) => {
  e.preventDefault();
});

document.addEventListener("drop", (e) => {
  e.preventDefault();
  if (draggedElement && e.target.classList.contains("task-item")) {
    const draggedId = parseInt(draggedElement.dataset.taskId);
    const targetId = parseInt(e.target.dataset.taskId);

    if (draggedId !== targetId) {
      // Reorder tasks in the array
      const draggedIndex = todoApp.tasks.findIndex((t) => t.id === draggedId);
      const targetIndex = todoApp.tasks.findIndex((t) => t.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedTask] = todoApp.tasks.splice(draggedIndex, 1);
        todoApp.tasks.splice(targetIndex, 0, draggedTask);

        todoApp.handleFilter();
        todoApp.showNotification(
          "Task order updated!",
          "info",
          "fas fa-arrows-alt"
        );
      }
    }
  }
});

// Add service worker for offline functionality (if needed)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Performance monitoring
const observePerformance = () => {
  if ("performance" in window) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType("navigation")[0];
        console.log(
          "Page Load Time:",
          perfData.loadEventEnd - perfData.fetchStart,
          "ms"
        );
      }, 0);
    });
  }
};

observePerformance();
