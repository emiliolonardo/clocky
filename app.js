const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");
const taskInput = document.getElementById("task-input");
const projectSelect = document.getElementById("project-select");
const projectNameInput = document.getElementById("project-name-input");
const projectClientSelect = document.getElementById("project-client-select");
const projectAddBtn = document.getElementById("project-add-btn");
const clientNameInput = document.getElementById("client-name-input");
const clientAddBtn = document.getElementById("client-add-btn");
const tagsInput = document.getElementById("tags-input");
const entriesBody = document.getElementById("entries-body");
const todayTotal = document.getElementById("today-total");
const weekTotal = document.getElementById("week-total");
const projectList = document.getElementById("project-list");
const projectRegistry = document.getElementById("project-registry");
const clientRegistry = document.getElementById("client-registry");
const menuButtons = document.querySelectorAll(".menu-btn");
const views = document.querySelectorAll(".view");
const currentDate = document.getElementById("current-date");
const currentTime = document.getElementById("current-time");

let timerInterval = null;
let elapsedSeconds = 0;
const STORAGE_KEYS = {
  entries: "clocky_entries_v1",
  projects: "clocky_projects_v1",
  clients: "clocky_clients_v1",
};

const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn("Storage error", error);
    return fallback;
  }
};

const persistToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

let entries = loadFromStorage(STORAGE_KEYS.entries, []);
let projects = loadFromStorage(STORAGE_KEYS.projects, []);
let clients = loadFromStorage(STORAGE_KEYS.clients, []);

const formatTime = (totalSeconds) => {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const updateClock = () => {
  const now = new Date();
  const date = now.toLocaleDateString("it-IT");
  const time = now.toLocaleTimeString("it-IT");
  currentDate.textContent = date;
  currentTime.textContent = time;
};

const renderEntries = () => {
  entriesBody.innerHTML = "";
  if (entries.length === 0) {
    const emptyRow = document.createElement("div");
    emptyRow.className = "entry-row empty";
    emptyRow.textContent = "Nessuna sessione registrata";
    entriesBody.appendChild(emptyRow);
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "entry-row";

    [entry.task, entry.project, entry.duration, entry.tags].forEach((text) => {
      const cell = document.createElement("span");
      cell.textContent = text;
      row.appendChild(cell);
    });

    entriesBody.appendChild(row);
  });
};

const renderSummary = () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayIndex = (startOfToday.getDay() + 6) % 7;
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - dayIndex);

  const todaySeconds = entries.reduce((sum, entry) => {
    const entryDate = entry.date ? new Date(entry.date) : null;
    if (!entryDate || entryDate >= startOfToday) {
      return sum + entry.seconds;
    }
    return sum;
  }, 0);

  const weekSeconds = entries.reduce((sum, entry) => {
    const entryDate = entry.date ? new Date(entry.date) : null;
    if (!entryDate || entryDate >= startOfWeek) {
      return sum + entry.seconds;
    }
    return sum;
  }, 0);

  todayTotal.textContent = formatTime(todaySeconds);
  weekTotal.textContent = formatTime(weekSeconds);

  const totalsByProject = entries.reduce((acc, entry) => {
    const name = entry.project || "Senza progetto";
    acc[name] = (acc[name] || 0) + entry.seconds;
    return acc;
  }, {});
  const projectNames = Object.keys(totalsByProject).sort((a, b) => totalsByProject[b] - totalsByProject[a]);
  projectList.innerHTML = "";
  if (projectNames.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "--";
    projectList.appendChild(empty);
    return;
  }
  projectNames.forEach((project) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    const duration = document.createElement("strong");
    name.textContent = project;
    duration.textContent = formatTime(totalsByProject[project]);
    item.appendChild(name);
    item.appendChild(duration);
    projectList.appendChild(item);
  });
};

const renderProjectSelect = () => {
  const currentValue = projectSelect.value;
  projectSelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Senza progetto";
  projectSelect.appendChild(defaultOption);

  projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.name;
    option.textContent = project.name;
    projectSelect.appendChild(option);
  });

  if (currentValue && projects.some((project) => project.name === currentValue)) {
    projectSelect.value = currentValue;
  }
};

const renderProjectClientSelect = () => {
  const currentValue = projectClientSelect.value;
  projectClientSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Senza cliente";
  projectClientSelect.appendChild(defaultOption);

  clients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client.name;
    option.textContent = client.name;
    projectClientSelect.appendChild(option);
  });

  if (currentValue && clients.some((client) => client.name === currentValue)) {
    projectClientSelect.value = currentValue;
  }
};

const renderProjectRegistry = () => {
  projectRegistry.innerHTML = "";
  if (projects.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "--";
    projectRegistry.appendChild(empty);
    return;
  }

  projects.forEach((project) => {
    const item = document.createElement("li");
    item.className = "project-row";

    const info = document.createElement("div");
    info.className = "project-info";

    const name = document.createElement("strong");
    name.textContent = project.name;
    info.appendChild(name);

    const client = document.createElement("span");
    client.textContent = project.client || "Senza cliente";
    info.appendChild(client);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "project-remove";
    removeBtn.dataset.project = project.name;
    removeBtn.textContent = "DEL";

    item.appendChild(info);
    item.appendChild(removeBtn);
    projectRegistry.appendChild(item);
  });
};

const renderProjects = () => {
  renderProjectSelect();
  renderProjectClientSelect();
  renderProjectRegistry();
  renderClients();
};

const flashInputError = (input) => {
  input.classList.add("input-error");
  setTimeout(() => {
    input.classList.remove("input-error");
  }, 900);
};

const setActiveView = (viewName) => {
  views.forEach((view) => {
    view.hidden = view.dataset.view !== viewName;
  });
  menuButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });
};

const renderClients = () => {
  clientRegistry.innerHTML = "";
  if (clients.length === 0 && projects.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "--";
    clientRegistry.appendChild(empty);
    return;
  }

  const grouped = projects.reduce((acc, project) => {
    const client = project.client?.trim() || "";
    if (!acc[client]) acc[client] = [];
    acc[client].push(project.name);
    return acc;
  }, {});

  const sortedClients = clients
    .map((client) => client.name)
    .sort((a, b) => a.localeCompare(b, "it"));

  sortedClients.forEach((clientName) => {
    const item = document.createElement("li");
    item.className = "client-row";

    const name = document.createElement("strong");
    name.textContent = clientName;

    const projectsSpan = document.createElement("span");
    const assigned = grouped[clientName] || [];
    projectsSpan.textContent = assigned.length ? assigned.join(", ") : "-";

    item.appendChild(name);
    item.appendChild(projectsSpan);
    clientRegistry.appendChild(item);
  });

  const unassigned = grouped[""] || [];
  if (unassigned.length > 0) {
    const item = document.createElement("li");
    item.className = "client-row";

    const name = document.createElement("strong");
    name.textContent = "Senza cliente";

    const projectsSpan = document.createElement("span");
    projectsSpan.textContent = unassigned.join(", ");

    item.appendChild(name);
    item.appendChild(projectsSpan);
    clientRegistry.appendChild(item);
  }
};

const resetTimer = () => {
  elapsedSeconds = 0;
  timerDisplay.textContent = formatTime(elapsedSeconds);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  stopBtn.disabled = true;
  startBtn.disabled = false;
};

const startTimer = () => {
  if (timerInterval) return;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    timerDisplay.textContent = formatTime(elapsedSeconds);
  }, 1000);
};

const saveEntry = () => {
  if (elapsedSeconds === 0) return;
  const now = new Date();
  const selectedProject = projectSelect.value || "Senza progetto";
  entries.unshift({
    task: taskInput.value || "Attivita senza titolo",
    project: selectedProject,
    duration: formatTime(elapsedSeconds),
    seconds: elapsedSeconds,
    tags: tagsInput.value || "-",
    date: now.toISOString(),
  });
  persistToStorage(STORAGE_KEYS.entries, entries);
  resetTimer();
  renderEntries();
  renderSummary();
};

startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", () => {
  stopTimer();
  saveEntry();
});

projectAddBtn.addEventListener("click", () => {
  const name = projectNameInput.value.trim();
  const client = projectClientSelect.value;
  if (!name) {
    flashInputError(projectNameInput);
    return;
  }

  const exists = projects.some((project) => project.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    flashInputError(projectNameInput);
    return;
  }

  const newProject = {
    name,
    client,
    createdAt: new Date().toISOString(),
  };
  projects.unshift(newProject);
  persistToStorage(STORAGE_KEYS.projects, projects);
  renderProjects();
  projectSelect.value = name;
  projectNameInput.value = "";
  projectClientSelect.value = "";
});

clientAddBtn.addEventListener("click", () => {
  const name = clientNameInput.value.trim();
  if (!name) {
    flashInputError(clientNameInput);
    return;
  }

  const exists = clients.some((client) => client.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    flashInputError(clientNameInput);
    return;
  }

  clients.unshift({
    name,
    createdAt: new Date().toISOString(),
  });
  persistToStorage(STORAGE_KEYS.clients, clients);
  renderProjects();
  clientNameInput.value = "";
});

projectRegistry.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("project-remove")) return;

  const name = target.dataset.project;
  projects = projects.filter((project) => project.name !== name);
  persistToStorage(STORAGE_KEYS.projects, projects);
  renderProjects();
  if (projectSelect.value === name) {
    projectSelect.value = "";
  }
});

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveView(button.dataset.view);
  });
});

window.addEventListener("beforeunload", saveEntry);

updateClock();
setInterval(updateClock, 1000);
setActiveView("home");
renderProjects();
renderEntries();
renderSummary();
