const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");
const taskInput = document.getElementById("task-input");
const projectInput = document.getElementById("project-input");
const tagsInput = document.getElementById("tags-input");
const entriesBody = document.getElementById("entries-body");
const todayTotal = document.getElementById("today-total");
const weekTotal = document.getElementById("week-total");
const projectList = document.getElementById("project-list");
const currentDate = document.getElementById("current-date");
const currentTime = document.getElementById("current-time");

let timerInterval = null;
let elapsedSeconds = 0;
const entries = [];

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
  const totalSeconds = entries.reduce((sum, entry) => sum + entry.seconds, 0);
  todayTotal.textContent = formatTime(totalSeconds);
  weekTotal.textContent = formatTime(totalSeconds + 3600 * 2);

  const projectNames = [...new Set(entries.map((entry) => entry.project || "Senza progetto"))];
  projectList.innerHTML = "";
  if (projectNames.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "--";
    projectList.appendChild(empty);
    return;
  }
  projectNames.forEach((project) => {
    const item = document.createElement("li");
    item.textContent = project;
    projectList.appendChild(item);
  });
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
  entries.unshift({
    task: taskInput.value || "Attivita senza titolo",
    project: projectInput.value || "Senza progetto",
    duration: formatTime(elapsedSeconds),
    seconds: elapsedSeconds,
    tags: tagsInput.value || "-",
  });
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

window.addEventListener("beforeunload", saveEntry);

updateClock();
setInterval(updateClock, 1000);
renderEntries();
renderSummary();
