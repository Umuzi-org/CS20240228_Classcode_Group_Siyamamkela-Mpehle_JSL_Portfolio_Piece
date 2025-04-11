// TASK: import helper functions from utils
// TASK: import initialData
import { taskFunctions } from "./utils.js";
import { initialData } from "./initialData.js";

const { getTasks, createNewTask, updateTask, deleteTask } = taskFunctions;

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// TASK: Get elements from the DOM
const elements = {
  // Modals & Forms
  newTaskModal: document.getElementById("new-task-modal-window"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),

  // Sidebar and Navigation
  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),

  // Header
  headerBoardName: document.getElementById("header-board-name"),
  addNewTaskBtn: document.getElementById("add-new-task-btn"),
  editBoardBtn: document.getElementById("edit-board-btn"),
  deleteBoardBtn: document.getElementById("deleteBoardBtn"),

  // Task Columns
  columnDivs: Array.from(document.querySelectorAll(".column-div")),
  todoTasksContainer: document.querySelector(
    '[data-status="todo"] .tasks-container'
  ),
  doingTasksContainer: document.querySelector(
    '[data-status="doing"] .tasks-container'
  ),
  doneTasksContainer: document.querySelector(
    '[data-status="done"] .tasks-container'
  ),

  // Task Creation Form Fields
  createTaskBtn: document.getElementById("create-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  selectStatus: document.getElementById("select-status"),

  // Task Editing Fields
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),

  // Misc
  filterDiv: document.getElementById("filterDiv"),
};
return elements;

let activeBoard = ""; // Variable to store the active board name
initializeData(); // Initialize data on page load

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks() || []; // Prevents crashing if null
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];

  displayBoards(boards);

  if (boards.length) {
    const stored = localStorage.getItem("activeBoard");
    const saved = stored ? JSON.parse(stored) : null;
    activeBoard = boards.includes(saved) ? saved : boards[0];

    elements.headerBoardName.textContent = activeBoard;
    filterAndDisplayTasksByBoard(activeBoard);
    styleActiveBoard(activeBoard);
  } else {
    elements.headerBoardName.textContent = "No Boards Available";
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container

  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

    // Fixed by Add event listener
    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });

    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// Assignment operator was used instead of comparison operator in the filter function
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Safely gets tasks
  const filteredTasks = tasks.filter((task) => task.board === boardName); //  Compare, not assign

  // Clear existing tasks in the UI
  elements.columnDivs.forEach((column) => {
    const container = column.querySelector(".tasks-container");
    if (container) container.innerHTML = ""; // Clear current tasks
  });

  // Loop through and place each task in its appropriate column
  filteredTasks.forEach((task) => {
    const column = document.querySelector(
      `.column-div[data-status="${task.status}"]`
    );
    const container = column?.querySelector(".tasks-container");
    if (!container) return;

    const taskElement = document.createElement("div");
    taskElement.classList.add("task-card");
    taskElement.textContent = task.title; // Customize this as needed
    container.appendChild(taskElement);
  });
}

// Ensure the column titles are set outside of this function or correctly initialized before this function runs

// Loop through each column to reset and populate with tasks
elements.columnDivs.forEach((column) => {
  const status = column.getAttribute("data-status");

  // Reset the column's inner HTML while preserving its structure
  column.innerHTML = `
    <div class="column-head-div">
      <span class="dot" id="${status}-dot"></span>
      <h4 class="columnHeader">${status.toUpperCase()}</h4>
    </div>
  `;

  // Create and append the tasks container
  const tasksContainer = document.createElement("div");
  tasksContainer.classList.add("tasks-container");
  column.appendChild(tasksContainer);

  // Filter tasks by status correctly and display them
  filteredTasks
    .filter((task) => task.status === status)
    .forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute("data-task-id", task.id);

      // Proper click handler
      taskElement.addEventListener("click", () => {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
});

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs

function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    // foreach -> forEach
    // Check if the button's text matches the active board name
    if (btn.textContent === boardName) {
      btn.classList.add("active"); // btn.add('active') -> btn.classList.add('active')
    } else {
      btn.classList.remove("active"); // btn.remove('active') -> btn.classList.remove('active')
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");

  // If tasks container doesn't exist, create it dynamically
  if (!tasksContainer) {
    tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.classList.add("task-div");
  taskElement.textContent = task.title || "Untitled Task";
  taskElement.setAttribute("data-task-id", task.id);

  // Add click handler for editing
  taskElement.addEventListener("click", () => {
    if (typeof openEditTaskModal === "function") {
      openEditTaskModal(task);
    } else {
      console.warn("openEditTaskModal function not defined.");
    }
  });

  tasksContainer.appendChild(taskElement);
}

let tasksContainer = column.querySelector(".tasks-container");
if (!tasksContainer) {
  console.warn(
    `Tasks container not found for status: ${task.status}, creating one.`
  );
  tasksContainer = document.createElement("div");
  tasksContainer.classList.add("tasks-container");
  column.appendChild(tasksContainer);
}

const taskElement = document.createElement("div");
taskElement.className = "task-div";
taskElement.textContent = task.title || "Untitled Task"; // Safe fallback
taskElement.setAttribute("data-task-id", task.id);

tasksContainer.appendChild(taskElement); // Append the created taskElement

function setupEventListeners() {
  // Cancel add event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () => {
    // invalid syntax was used by .click => instead of .addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none";
  });
  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true)); // comma was missing

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block";
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent form reload
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none"; // => was invalid syntax for tenary operator
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  // Get user input values from the form
  const title = document.getElementById("title-input").value.trim();
  const description = document.getElementById("desc-input").value.trim();
  const status = document.getElementById("select-status").value;

  if (!title) {
    alert("Task title is required.");
    return;
  }

  // Construct the task object
  const task = {
    id: Date.now(), // Unique ID
    title,
    description,
    status,
    board: activeBoard, // Pull from global context
    createdAt: new Date().toISOString(),
  };

  // Create and store the task
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Hide overlay
    event.target.reset(); // Clear form
    refreshTasksUI(); // Optional: refresh columns
  }
}

function toggleSidebar(show) {
  const sidebar = document.getElementById("side-bar-div");
  const showSidebarBtn = document.getElementById("show-side-bar-btn");

  if (show) {
    sidebar.style.display = "flex";
    showSidebarBtn.style.display = "none";
  } else {
    sidebar.style.display = "none";
    showSidebarBtn.style.display = "block";
  }
}

function toggleTheme() {
  const isDark = document.getElementById("switch").checked;
  const body = document.body;

  if (isDark) {
    body.classList.add("dark-theme");
    body.classList.remove("light-theme");
  } else {
    body.classList.add("light-theme");
    body.classList.remove("dark-theme");
  }

  // Optionally save preference to localStorage
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");

  titleInput.value = task.title;
  descInput.value = task.description;
  statusSelect.value = task.status;

  // Store task ID or reference for saving later
  const saveBtn = document.getElementById("save-task-changes-btn");
  const deleteBtn = document.getElementById("delete-task-btn");
  const cancelBtn = document.getElementById("cancel-edit-btn");

  // Remove old event listeners (important to avoid stacking)
  saveBtn.replaceWith(saveBtn.cloneNode(true));
  deleteBtn.replaceWith(deleteBtn.cloneNode(true));
  cancelBtn.replaceWith(cancelBtn.cloneNode(true));

  const newSaveBtn = document.getElementById("save-task-changes-btn");
  const newDeleteBtn = document.getElementById("delete-task-btn");
  const newCancelBtn = document.getElementById("cancel-edit-btn");

  // Save changes logic
  newSaveBtn.addEventListener("click", () => {
    const updatedTask = {
      ...task,
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      status: statusSelect.value,
    };
    saveTaskChanges(updatedTask); // You should define this helper
    toggleModal(false, elements.editTaskModal);
  });

  // Delete task logic
  newDeleteBtn.addEventListener("click", () => {
    deleteTask(task); // You should define this helper
    toggleModal(false, elements.editTaskModal);
  });

  // Cancel editing logic
  newCancelBtn.addEventListener("click", () => {
    toggleModal(false, elements.editTaskModal);
  });

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs

  const title = document.getElementById("edit-task-title-input").value.trim();
  const description = document
    .getElementById("edit-task-desc-input")
    .value.trim();
  const status = document.getElementById("edit-select-status").value;

  // Create an object with the updated task details

  const updatedTask = {
    id: taskId,
    title,
    description,
    status,
  };

  // Update task using a hlper function

  updateTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes

  const editTaskModal = document.querySelector(".edit-task-modal-window");
  toggleModal(false, editTaskModal);

  refreshTasksUI();
}

function updateTask(taskId, updatedTask) {
  // Assuming tasks are stored in an array or object
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex] = updatedTask;
  }
}

function toggleModal(show, modalElement) {
  if (show) {
    modalElement.classList.add("visible");
  } else {
    modalElement.classList.remove("visible");
  }
}

function refreshTasksUI() {
  if (!activeBoard) {
    console.warn("No active board selected. Cannot refresh tasks.");
    return;
  }

  filterAndDisplayTasksByBoard(activeBoard);
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
