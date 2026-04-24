/* DESKLIGHT */

if (window.lucide) {
    lucide.createIcons();
}

/* Small helpers */

function readStorage(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
        return fallback;
    }
}

function saveStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function escapeHTML(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getTodayDateOnly() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getTodayString() {
    return formatDateForInput(new Date());
}

function getDateAfterDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);

    return formatDateForInput(date);
}

function getDaysUntilDue(dateString) {
    if (!dateString) return null;

    const today = getTodayDateOnly();
    const dueDate = new Date(dateString + "T00:00:00");

    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
}

/* Default demo data */

const defaultTasks = [
    {
        id: 1,
        title: "Finish project report",
        module: "Project",
        dueDate: getDateAfterDays(1),
        completed: false,
    },
    {
        id: 2,
        title: "Revise chapter notes",
        module: "Study",
        dueDate: getDateAfterDays(3),
        completed: false,
    },
    {
        id: 3,
        title: "Prepare for next class",
        module: "General",
        dueDate: getDateAfterDays(7),
        completed: false,
    },
];

const defaultEvents = [
    {
        id: 1,
        title: "Study session",
        date: getTodayString(),
        time: "09:00",
        category: "study",
        notes: "Review notes and practice exercises.",
    },
    {
        id: 2,
        title: "Project work",
        date: getTodayString(),
        time: "13:00",
        category: "deadline",
        notes: "Make progress on an important assignment.",
    },
    {
        id: 3,
        title: "Break",
        date: getTodayString(),
        time: "18:00",
        category: "personal",
        notes: "Rest a little. Shocking concept.",
    },
];

const defaultBudgetData = {
    monthlyBudget: 1000,
    expenses: [
        {
            id: 1,
            name: "Lunch",
            amount: 35,
            category: "food",
            date: getTodayString(),
        },
        {
            id: 2,
            name: "Transport",
            amount: 18,
            category: "transport",
            date: getTodayString(),
        },
    ],
};

const defaultMoodEntries = [
    {
        id: 1,
        mood: "tired",
        energy: 45,
        stress: 65,
        sleep: 6,
        note: "Tired but functional. Academic goblin mode.",
        date: getTodayString(),
    },
];

const defaultJournalEntries = [
    {
        id: 1,
        title: "First entry",
        mood: "tired",
        category: "reflection",
        text: "Today was busy, but I made a little progress. Small steps still count.",
        date: getTodayString(),
    },
];

const defaultSettings = {
    userName: "Student",
    dashboardTitle: "Academic Survival OS",
    currency: "DH",
    tone: "funny",
    theme: "cream",
    dashboardCards: {
        status: true,
        study: true,
        budget: true,
        mood: true,
        quickTasks: true,
        quickStudy: true,
    },
};

/* App data */

let tasks = readStorage("studentTasks", defaultTasks);
let modules = readStorage("studyModules", []);
let events = readStorage("scheduleEvents", defaultEvents);
let budgetData = readStorage("budgetData", defaultBudgetData);
let moodEntries = readStorage("moodEntries", defaultMoodEntries);
let journalEntries = readStorage("journalEntries", defaultJournalEntries);
let appSettings = readStorage("appSettings", defaultSettings);

/* TASKS */

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskModule = document.getElementById("taskModule");
const taskDate = document.getElementById("taskDate");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

function saveTasks() {
    saveStorage("studentTasks", tasks);
}

function getUrgencyInfo(dueDate) {
    const daysLeft = getDaysUntilDue(dueDate);

    if (daysLeft === null) {
        return {
            className: "nodate",
            label: "floating in the void",
            dateText: "No due date",
        };
    }

    if (daysLeft < 0) {
        return {
            className: "overdue",
            label: "academic crime scene",
            dateText: `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"
                } overdue`,
        };
    }

    if (daysLeft === 0) {
        return {
            className: "today",
            label: "do it today",
            dateText: "Due today",
        };
    }

    if (daysLeft === 1) {
        return {
            className: "tomorrow",
            label: "bro start now",
            dateText: "Due tomorrow",
        };
    }

    if (daysLeft <= 3) {
        return {
            className: "danger",
            label: "danger",
            dateText: `Due in ${daysLeft} days`,
        };
    }

    if (daysLeft <= 7) {
        return {
            className: "soon",
            label: "soon",
            dateText: `Due in ${daysLeft} days`,
        };
    }

    return {
        className: "safe",
        label: "safe",
        dateText: `Due in ${daysLeft} days`,
    };
}

function renderTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed - b.completed;

        const aDays = getDaysUntilDue(a.dueDate);
        const bDays = getDaysUntilDue(b.dueDate);

        if (aDays === null) return 1;
        if (bDays === null) return -1;

        return aDays - bDays;
    });

    if (sortedTasks.length === 0) {
        taskList.innerHTML = `
      <div class="empty-state">
        <h4>No tasks for now</h4>
        <p>Suspiciously peaceful...</p>
      </div>
    `;
    }

    sortedTasks.forEach((task) => {
        const urgency = getUrgencyInfo(task.dueDate);
        const taskElement = document.createElement("div");

        taskElement.className = `task ${urgency.className} ${task.completed ? "completed" : ""
            }`;

        taskElement.innerHTML = `
      <div>
        <h4>${escapeHTML(task.title)}</h4>

        <div class="task-meta">
          <span class="task-tag">${escapeHTML(task.module)}</span>
          <span class="task-tag">${urgency.dateText}</span>
          <span class="task-tag">${urgency.label}</span>
        </div>
      </div>

      <button class="task-delete" title="Delete task">×</button>
    `;

        taskElement.addEventListener("click", () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        taskElement.querySelector(".task-delete").addEventListener("click", (e) => {
            e.stopPropagation();

            tasks = tasks.filter((item) => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        taskList.appendChild(taskElement);
    });

    const incompleteTasks = tasks.filter((task) => !task.completed).length;

    if (taskCount) {
        taskCount.textContent =
            incompleteTasks === 1 ? "1 task left" : `${incompleteTasks} tasks left`;
    }

    updateHeroText(incompleteTasks);
    updateStatusCard(incompleteTasks);
    renderDashboardTaskPreview();
}

function updateHeroText(incompleteTasks) {
    const heroText = document.querySelector(".hero p");
    if (!heroText) return;

    const urgentTasks = tasks.filter((task) => {
        const urgency = getUrgencyInfo(task.dueDate);

        return (
            !task.completed &&
            ["overdue", "today", "tomorrow", "danger"].includes(urgency.className)
        );
    }).length;

    const deadlinesThisWeek = getDeadlinesThisWeekCount();
    const motivationText = getMotivationText();

    if (incompleteTasks === 0 && deadlinesThisWeek === 0) {
        heroText.textContent = `You have no tasks and no deadlines this week. ${motivationText}`;
        return;
    }

    if (incompleteTasks === 0 && deadlinesThisWeek > 0) {
        heroText.textContent = `You have no tasks today, ${deadlinesThisWeek} deadline${deadlinesThisWeek === 1 ? "" : "s"
            } this week, and ${motivationText}`;
        return;
    }

    if (urgentTasks > 0) {
        heroText.textContent = `You have ${incompleteTasks} task${incompleteTasks === 1 ? "" : "s"
            } today, ${deadlinesThisWeek} deadline${deadlinesThisWeek === 1 ? "" : "s"
            } this week, and ${urgentTasks} thing${urgentTasks === 1 ? "" : "s"
            } looking directly at you.`;
        return;
    }

    heroText.textContent = `You have ${incompleteTasks} task${incompleteTasks === 1 ? "" : "s"
        } today, ${deadlinesThisWeek} deadline${deadlinesThisWeek === 1 ? "" : "s"
        } this week, and ${motivationText}`;
}

function getDeadlinesThisWeekCount() {
    const today = getTodayDateOnly();

    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);

    const taskDeadlines = tasks.filter((task) => {
        if (task.completed || !task.dueDate) return false;

        const due = new Date(task.dueDate + "T00:00:00");
        return due >= today && due <= weekFromNow;
    }).length;

    const scheduleDeadlines = events.filter((event) => {
        if (!event.date || event.category !== "deadline") return false;

        const eventDate = new Date(event.date + "T00:00:00");
        return eventDate >= today && eventDate <= weekFromNow;
    }).length;

    return taskDeadlines + scheduleDeadlines;
}

function getMotivationText() {
    if (moodEntries.length === 0) {
        return "one suspiciously unknown amount of motivation.";
    }

    const latestMood = [...moodEntries].sort((a, b) => {
        const dateA = new Date(a.date + "T00:00:00").getTime();
        const dateB = new Date(b.date + "T00:00:00").getTime();

        return dateB - dateA || b.id - a.id;
    })[0];

    const energy = Number(latestMood.energy) || 0;
    const stress = Number(latestMood.stress) || 0;

    if (energy >= 75 && stress <= 40) {
        return "a surprisingly decent amount of motivation.";
    }

    if (energy >= 55 && stress <= 65) {
        return "a usable amount of motivation. Rare. Beautiful.";
    }

    if (energy < 35 && stress >= 70) {
        return "one extremely questionable amount of motivation.";
    }

    if (energy < 40) {
        return "one suspiciously low amount of motivation.";
    }

    if (stress >= 80) {
        return "a stress level that should probably be supervised.";
    }

    return "a medium amount of motivation, which is basically a miracle.";
}

function refreshHeroLine() {
    const incompleteTasks = tasks.filter((task) => !task.completed).length;
    updateHeroText(incompleteTasks);
}

function updateStatusCard(incompleteTasks) {
    const survivalStat = document.querySelector("#dashboardStatusCard .big-stat");
    const statusPill = document.querySelector("#dashboardStatusCard .pill");
    const statusText = document.querySelector("#dashboardStatusCard p");

    if (!survivalStat || !statusPill || !statusText) return;

    const urgentTasks = tasks.filter((task) => {
        const urgency = getUrgencyInfo(task.dueDate);

        return (
            !task.completed &&
            ["overdue", "today", "tomorrow", "danger"].includes(urgency.className)
        );
    }).length;

    let survivalChance = 90 - incompleteTasks * 5 - urgentTasks * 12;

    survivalChance = Math.min(98, Math.max(12, survivalChance));

    survivalStat.textContent = `${survivalChance}%`;
    statusText.textContent = "Academic survival chance";

    if (urgentTasks >= 3) {
        statusPill.textContent = "panic era";
    } else if (urgentTasks >= 1) {
        statusPill.textContent = "lock in";
    } else if (incompleteTasks === 0) {
        statusPill.textContent = "legendary";
    } else {
        statusPill.textContent = "alive-ish";
    }
}

function renderDashboardTaskPreview() {
    const preview = document.getElementById("dashboardTaskPreview");
    if (!preview) return;

    const nextTasks = [...tasks]
        .filter((task) => !task.completed)
        .sort((a, b) => {
            const aDays = getDaysUntilDue(a.dueDate);
            const bDays = getDaysUntilDue(b.dueDate);

            if (aDays === null) return 1;
            if (bDays === null) return -1;

            return aDays - bDays;
        })
        .slice(0, 3);

    if (nextTasks.length === 0) {
        preview.innerHTML = `
      <div class="preview-item">
        <h4>No tasks left</h4>
        <p>Suspiciously peaceful.</p>
      </div>
    `;
        return;
    }

    preview.innerHTML = nextTasks
        .map((task) => {
            const urgency = getUrgencyInfo(task.dueDate);

            return `
        <div class="preview-item">
          <h4>${escapeHTML(task.title)}</h4>
          <p>${escapeHTML(task.module)} · ${urgency.dateText}</p>
        </div>
      `;
        })
        .join("");
}

if (taskForm) {
    taskForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = taskInput.value.trim();
        const module = taskModule.value.trim() || "General";
        const dueDate = taskDate.value;

        if (title === "") return;

        tasks.unshift({
            id: Date.now(),
            title,
            module,
            dueDate,
            completed: false,
        });

        taskInput.value = "";
        taskModule.value = "";
        taskDate.value = "";

        saveTasks();
        renderTasks();
    });
}

/* STUDY MODULES */

const moduleForm = document.getElementById("moduleForm");
const moduleName = document.getElementById("moduleName");
const moduleConfidence = document.getElementById("moduleConfidence");
const moduleProgress = document.getElementById("moduleProgress");
const moduleExamDate = document.getElementById("moduleExamDate");
const moduleList = document.getElementById("moduleList");
const moduleCount = document.getElementById("moduleCount");

function saveModules() {
    saveStorage("studyModules", modules);
}

function getExamText(examDate) {
    const daysLeft = getDaysUntilDue(examDate);

    if (daysLeft === null) return "no exam date";
    if (daysLeft < 0) return "exam passed";
    if (daysLeft === 0) return "exam today";
    if (daysLeft === 1) return "exam tomorrow";

    return `exam in ${daysLeft} days`;
}

function getConfidenceText(confidence) {
    if (confidence === "low") return "needs help";
    if (confidence === "medium") return "getting there";

    return "confident";
}

function renderModules() {
    if (!moduleList) return;

    moduleList.innerHTML = "";

    const sortedModules = [...modules].sort((a, b) => {
        const aDays = getDaysUntilDue(a.examDate);
        const bDays = getDaysUntilDue(b.examDate);

        if (aDays === null) return 1;
        if (bDays === null) return -1;

        return aDays - bDays;
    });

    if (sortedModules.length === 0) {
        moduleList.innerHTML = `
      <div class="empty-state">
        <h4>No modules yet</h4>
        <p>Add your subjects and start defeating them slowly.</p>
      </div>
    `;
    }

    sortedModules.forEach((module) => {
        const moduleElement = document.createElement("div");
        moduleElement.className = "module-card";

        moduleElement.innerHTML = `
      <div class="module-top">
        <div>
          <h4>${escapeHTML(module.name)}</h4>

          <div class="module-meta">
            <span class="module-tag ${module.confidence}">
              ${getConfidenceText(module.confidence)}
            </span>

            <span class="module-tag">
              ${getExamText(module.examDate)}
            </span>

            <span class="module-tag">
              boss HP: ${100 - module.progress}%
            </span>
          </div>
        </div>

        <button class="module-delete" title="Delete module">×</button>
      </div>

      <div class="module-progress-row">
        <div class="module-progress">
          <span style="width: ${module.progress}%"></span>
        </div>

        <strong>${module.progress}%</strong>
      </div>
    `;

        moduleElement.querySelector(".module-delete").addEventListener("click", () => {
            modules = modules.filter((item) => item.id !== module.id);
            saveModules();
            renderModules();
        });

        moduleList.appendChild(moduleElement);
    });

    if (moduleCount) {
        moduleCount.textContent =
            modules.length === 1 ? "1 module" : `${modules.length} modules`;
    }

    updateStudySummaryCard();
    renderDashboardStudyPreview();
    updateModuleSuggestions();
}

function updateStudySummaryCard() {
    const studyStrongValues = document.querySelectorAll(".study-line strong");
    if (studyStrongValues.length < 3) return;

    const totalProgress =
        modules.length === 0
            ? 0
            : Math.round(
                modules.reduce((sum, module) => sum + Number(module.progress), 0) /
                modules.length
            );

    const lowConfidence = modules.filter(
        (module) => module.confidence === "low"
    ).length;

    const nextExamModule = [...modules]
        .filter((module) => getDaysUntilDue(module.examDate) !== null)
        .sort((a, b) => getDaysUntilDue(a.examDate) - getDaysUntilDue(b.examDate))[0];

    studyStrongValues[0].textContent = `${totalProgress}%`;
    studyStrongValues[1].textContent = `${modules.length}`;
    studyStrongValues[2].textContent = `${lowConfidence}`;

    const studyCardTitle = document.querySelector("#dashboardStudyCard h3");

    if (studyCardTitle && nextExamModule) {
        studyCardTitle.textContent = `Next: ${nextExamModule.name}`;
    } else if (studyCardTitle) {
        studyCardTitle.textContent = "Study Summary";
    }
}

function renderDashboardStudyPreview() {
    const preview = document.getElementById("dashboardStudyPreview");
    if (!preview) return;

    const nextModules = [...modules]
        .sort((a, b) => {
            const aDays = getDaysUntilDue(a.examDate);
            const bDays = getDaysUntilDue(b.examDate);

            if (aDays === null) return 1;
            if (bDays === null) return -1;

            return aDays - bDays;
        })
        .slice(0, 3);

    if (nextModules.length === 0) {
        preview.innerHTML = `
      <div class="preview-item">
        <h4>No modules yet</h4>
        <p>Add your subjects first.</p>
      </div>
    `;
        return;
    }

    preview.innerHTML = nextModules
        .map((module) => {
            return `
        <div class="preview-item">
          <h4>${escapeHTML(module.name)}</h4>
          <p>${getExamText(module.examDate)} · ${module.progress}% progress</p>
        </div>
      `;
        })
        .join("");
}

function updateModuleSuggestions() {
    const moduleSuggestions = document.getElementById("moduleSuggestions");
    if (!moduleSuggestions) return;

    const defaultSuggestions = [
        "General",
        "Study",
        "Homework",
        "Project",
        "Personal",
    ];

    const moduleNames = modules.map((module) => module.name);
    const allSuggestions = [...new Set([...defaultSuggestions, ...moduleNames])];

    moduleSuggestions.innerHTML = allSuggestions
        .map((name) => `<option value="${escapeHTML(name)}"></option>`)
        .join("");
}

if (moduleForm) {
    moduleForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = moduleName.value.trim();
        const confidence = moduleConfidence.value;
        const progress = Number(moduleProgress.value);
        const examDate = moduleExamDate.value;

        if (name === "") return;

        modules.push({
            id: Date.now(),
            name,
            confidence,
            progress: Math.min(100, Math.max(0, progress || 0)),
            examDate,
        });

        moduleName.value = "";
        moduleConfidence.value = "low";
        moduleProgress.value = "";
        moduleExamDate.value = "";

        saveModules();
        renderModules();
    });
}

/* PAGE NAVIGATION */

const navItems = document.querySelectorAll(".nav-item[data-page]");
const pages = document.querySelectorAll(".page");
const pageButtons = document.querySelectorAll("[data-open-page]");

function openPage(pageId) {
    pages.forEach((page) => {
        page.classList.toggle("active-page", page.id === pageId);
    });

    navItems.forEach((item) => {
        item.classList.toggle("active", item.dataset.page === pageId);
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}

navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
        event.preventDefault();

        const pageId = item.dataset.page;
        if (!document.getElementById(pageId)) return;

        openPage(pageId);
    });
});

pageButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const pageId = button.dataset.openPage;
        if (!document.getElementById(pageId)) return;

        openPage(pageId);
    });
});

/* SCHEDULE */

const eventForm = document.getElementById("eventForm");
const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventCategory = document.getElementById("eventCategory");
const eventNotes = document.getElementById("eventNotes");
const eventList = document.getElementById("eventList");
const eventCount = document.getElementById("eventCount");
const clearPastEvents = document.getElementById("clearPastEvents");

function saveEvents() {
    saveStorage("scheduleEvents", events);
}

function formatEventDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return {
        day: date.getDate(),
        month: date.toLocaleString("en-US", { month: "short" }),
        full: date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        }),
    };
}

function getCategoryLabel(category) {
    const labels = {
        study: "study session",
        class: "class",
        exam: "exam",
        deadline: "deadline",
        personal: "personal",
    };

    return labels[category] || "event";
}

function renderEvents() {
    if (!eventList) return;

    eventList.innerHTML = "";

    const sortedEvents = [...events].sort((a, b) => {
        const dateA = new Date(`${a.date || "9999-12-31"}T${a.time || "23:59"}`);
        const dateB = new Date(`${b.date || "9999-12-31"}T${b.time || "23:59"}`);

        return dateA - dateB;
    });

    if (sortedEvents.length === 0) {
        eventList.innerHTML = `
      <div class="empty-state">
        <h4>No events yet</h4>
        <p>Your schedule is either peaceful or suspiciously undocumented.</p>
      </div>
    `;
    }

    sortedEvents.forEach((event) => {
        const eventDateInfo = formatEventDate(event.date);
        const eventElement = document.createElement("div");

        eventElement.className = `event-card ${event.category}`;

        eventElement.innerHTML = `
      <div class="event-date-box">
        <strong>${eventDateInfo.day}</strong>
        <span>${eventDateInfo.month}</span>
      </div>

      <div class="event-content">
        <h4>${escapeHTML(event.title)}</h4>
        <p>${escapeHTML(event.notes || "No notes added.")}</p>

        <div class="event-meta">
          <span class="event-tag">${eventDateInfo.full}</span>
          <span class="event-tag">${event.time || "No time"}</span>
          <span class="event-tag">${getCategoryLabel(event.category)}</span>
        </div>
      </div>

      <button class="event-delete" title="Delete event">×</button>
    `;

        eventElement.querySelector(".event-delete").addEventListener("click", () => {
            events = events.filter((item) => item.id !== event.id);
            saveEvents();
            renderEvents();
        });

        eventList.appendChild(eventElement);
    });

    if (eventCount) {
        eventCount.textContent =
            events.length === 1 ? "1 event" : `${events.length} events`;
    }

    updateDashboardSchedule();
    refreshHeroLine();
}

if (eventForm) {
    eventForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = eventTitle.value.trim();
        const date = eventDate.value;
        const time = eventTime.value;
        const category = eventCategory.value;
        const notes = eventNotes.value.trim();

        if (title === "" || date === "") return;

        events.push({
            id: Date.now(),
            title,
            date,
            time,
            category,
            notes,
        });

        eventTitle.value = "";
        eventDate.value = "";
        eventTime.value = "";
        eventCategory.value = "study";
        eventNotes.value = "";

        saveEvents();
        renderEvents();
    });
}

if (clearPastEvents) {
    clearPastEvents.addEventListener("click", () => {
        const today = getTodayDateOnly();

        events = events.filter((event) => {
            const eventDateOnly = new Date(event.date + "T00:00:00");
            return eventDateOnly >= today;
        });

        saveEvents();
        renderEvents();
    });
}

/* Dashboard mini-calendar + timeline */

const calendarMonthTitle = document.getElementById("calendarMonthTitle");
const miniCalendarGrid = document.getElementById("miniCalendarGrid");
const todayTimeline = document.getElementById("todayTimeline");

function renderMiniCalendar() {
    if (!miniCalendarGrid || !calendarMonthTitle) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    calendarMonthTitle.textContent = today.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const eventDates = events.map((event) => event.date);

    let calendarHTML = `
    <span>MO</span>
    <span>TU</span>
    <span>WE</span>
    <span>TH</span>
    <span>FR</span>
    <span>SA</span>
    <span>SU</span>
  `;

    for (let i = 0; i < startOffset; i++) {
        calendarHTML += `<p></p>`;
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateString = formatDateForInput(new Date(year, month, day));
        const isToday = day === today.getDate();
        const hasEvent = eventDates.includes(dateString);

        let className = "";

        if (hasEvent) className += " has-event";
        if (isToday) className += " today-dot";

        calendarHTML += `<p class="${className.trim()}">${day}</p>`;
    }

    miniCalendarGrid.innerHTML = calendarHTML;
}

function renderTodayTimeline() {
    if (!todayTimeline) return;

    const todayEvents = events
        .filter((event) => event.date === getTodayString())
        .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"));

    if (todayEvents.length === 0) {
        todayTimeline.innerHTML = `
      <div class="timeline-empty">
        No events today. Either you're free, or you forgot to add them.
      </div>
    `;
        return;
    }

    todayTimeline.innerHTML = todayEvents
        .map((event) => {
            const importantClass =
                event.category === "exam" || event.category === "deadline"
                    ? "important"
                    : "";

            return `
        <div class="timeline-item ${importantClass}">
          <span class="time">${event.time || "—"}</span>

          <div>
            <h4>${escapeHTML(event.title)}</h4>
            <p>${escapeHTML(event.notes || getCategoryLabel(event.category))}</p>
          </div>
        </div>
      `;
        })
        .join("");
}

function updateDashboardSchedule() {
    renderMiniCalendar();
    renderTodayTimeline();
}

/* BUDGET */

const budgetForm = document.getElementById("budgetForm");
const monthlyBudgetInput = document.getElementById("monthlyBudget");
const budgetRemaining = document.getElementById("budgetRemaining");
const budgetRemainingText = document.getElementById("budgetRemainingText");
const budgetSpent = document.getElementById("budgetSpent");
const budgetSpentText = document.getElementById("budgetSpentText");
const dailyAllowance = document.getElementById("dailyAllowance");
const topCategory = document.getElementById("topCategory");
const topCategoryText = document.getElementById("topCategoryText");
const budgetStatusPill = document.getElementById("budgetStatusPill");
const budgetPercent = document.getElementById("budgetPercent");
const budgetProgressBar = document.getElementById("budgetProgressBar");
const budgetMonthLabel = document.getElementById("budgetMonthLabel");

const expenseForm = document.getElementById("expenseForm");
const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");
const expenseCount = document.getElementById("expenseCount");
const expenseList = document.getElementById("expenseList");
const categoryList = document.getElementById("categoryList");
const clearExpenses = document.getElementById("clearExpenses");

function saveBudgetData() {
    saveStorage("budgetData", budgetData);
}

function formatMoney(amount) {
    const currency = appSettings.currency || "DH";
    return `${Math.round(amount * 100) / 100} ${currency}`;
}

function getCurrentMonthExpenses() {
    const now = new Date();

    return budgetData.expenses.filter((expense) => {
        const expenseDateObj = new Date(expense.date + "T00:00:00");

        return (
            expenseDateObj.getMonth() === now.getMonth() &&
            expenseDateObj.getFullYear() === now.getFullYear()
        );
    });
}

function getDaysLeftInMonth() {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return lastDay.getDate() - today.getDate() + 1;
}

function getCategoryName(category) {
    const names = {
        food: "Food",
        transport: "Transport",
        school: "School",
        fun: "Fun",
        health: "Health",
        other: "Other",
    };

    return names[category] || "Other";
}

function getCategoryBreakdown(expenses) {
    const breakdown = {
        food: 0,
        transport: 0,
        school: 0,
        fun: 0,
        health: 0,
        other: 0,
    };

    expenses.forEach((expense) => {
        const category = expense.category || "other";
        breakdown[category] += Number(expense.amount) || 0;
    });

    return breakdown;
}

function getTopCategory(breakdown) {
    const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0 || entries[0][1] === 0) {
        return {
            category: "None",
            amount: 0,
        };
    }

    return {
        category: entries[0][0],
        amount: entries[0][1],
    };
}

function renderBudget() {
    if (!budgetRemaining) return;

    const monthlyBudget = Number(budgetData.monthlyBudget) || 0;
    const monthExpenses = getCurrentMonthExpenses();

    const totalSpent = monthExpenses.reduce(
        (sum, expense) => sum + (Number(expense.amount) || 0),
        0
    );

    const remaining = monthlyBudget - totalSpent;
    const usedPercent =
        monthlyBudget === 0 ? 0 : Math.round((totalSpent / monthlyBudget) * 100);

    const allowance = remaining / getDaysLeftInMonth();
    const breakdown = getCategoryBreakdown(monthExpenses);
    const villain = getTopCategory(breakdown);

    monthlyBudgetInput.value = monthlyBudget;

    budgetRemaining.textContent = formatMoney(remaining);
    budgetSpent.textContent = formatMoney(totalSpent);
    budgetSpentText.textContent = `${usedPercent}% of budget used`;
    budgetPercent.textContent = `${usedPercent}%`;
    budgetProgressBar.style.width = `${Math.min(usedPercent, 100)}%`;

    dailyAllowance.textContent = formatMoney(Math.max(allowance, 0));

    if (remaining < 0) {
        budgetStatusPill.textContent = "financial crime scene";
        budgetRemainingText.textContent = "you passed the budget limit";
    } else if (usedPercent >= 85) {
        budgetStatusPill.textContent = "danger";
        budgetRemainingText.textContent = "be careful this month";
    } else if (usedPercent >= 60) {
        budgetStatusPill.textContent = "watch it";
        budgetRemainingText.textContent = "left this month";
    } else {
        budgetStatusPill.textContent = "safe-ish";
        budgetRemainingText.textContent = "left this month";
    }

    if (villain.amount === 0) {
        topCategory.textContent = "None";
        topCategoryText.textContent = "no expenses yet";
    } else {
        topCategory.textContent = getCategoryName(villain.category);
        topCategoryText.textContent = `${formatMoney(villain.amount)} spent`;
    }

    if (budgetMonthLabel) {
        budgetMonthLabel.textContent = new Date().toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        });
    }

    if (expenseCount) {
        expenseCount.textContent =
            monthExpenses.length === 1
                ? "1 expense"
                : `${monthExpenses.length} expenses`;
    }

    renderCategoryList(breakdown, totalSpent);
    renderExpenseList(monthExpenses);
    updateDashboardBudgetCard(remaining);
}

function renderCategoryList(breakdown, totalSpent) {
    if (!categoryList) return;

    const categories = Object.entries(breakdown).filter(
        ([, amount]) => amount > 0
    );

    if (categories.length === 0) {
        categoryList.innerHTML = `
      <div class="empty-state">
        <h4>No spending yet</h4>
        <p>Your wallet is currently untouched. Suspiciously peaceful.</p>
      </div>
    `;
        return;
    }

    categoryList.innerHTML = categories
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => {
            const percent =
                totalSpent === 0 ? 0 : Math.round((amount / totalSpent) * 100);

            return `
        <div class="category-item category-${category}">
          <div class="category-top">
            <h4>${getCategoryName(category)}</h4>
            <span>${formatMoney(amount)} · ${percent}%</span>
          </div>

          <div class="category-bar">
            <span style="width: ${percent}%"></span>
          </div>
        </div>
      `;
        })
        .join("");
}

function renderExpenseList(monthExpenses) {
    if (!expenseList) return;

    if (monthExpenses.length === 0) {
        expenseList.innerHTML = `
      <div class="empty-state">
        <h4>No expenses yet</h4>
        <p>Add what you spend so the dashboard can judge you gently.</p>
      </div>
    `;
        return;
    }

    const sortedExpenses = [...monthExpenses].sort((a, b) => {
        const dateA = new Date(a.date + "T00:00:00");
        const dateB = new Date(b.date + "T00:00:00");

        return dateB - dateA;
    });

    expenseList.innerHTML = "";

    sortedExpenses.forEach((expense) => {
        const expenseElement = document.createElement("div");
        const dateText = new Date(expense.date + "T00:00:00").toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
            }
        );

        expenseElement.className = `expense-item category-${expense.category}`;

        expenseElement.innerHTML = `
      <div>
        <h4>${escapeHTML(expense.name)}</h4>
        <p>${getCategoryName(expense.category)} · ${dateText}</p>
      </div>

      <span class="expense-amount">${formatMoney(Number(expense.amount))}</span>

      <button class="expense-delete" title="Delete expense">×</button>
    `;

        expenseElement.querySelector(".expense-delete").addEventListener("click", () => {
            budgetData.expenses = budgetData.expenses.filter(
                (item) => item.id !== expense.id
            );

            saveBudgetData();
            renderBudget();
        });

        expenseList.appendChild(expenseElement);
    });
}

function updateDashboardBudgetCard(remaining) {
    const budgetCardStat = document.querySelector("#dashboardBudgetCard .big-stat");
    const budgetCardText = document.querySelector("#dashboardBudgetCard p");

    if (!budgetCardStat || !budgetCardText) return;

    budgetCardStat.textContent = formatMoney(remaining);
    budgetCardText.textContent =
        remaining < 0 ? "over budget this month" : "remaining this month";
}

if (budgetForm) {
    budgetForm.addEventListener("submit", (event) => {
        event.preventDefault();

        budgetData.monthlyBudget = Number(monthlyBudgetInput.value) || 0;

        saveBudgetData();
        renderBudget();
    });
}

if (expenseForm) {
    expenseForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = expenseName.value.trim();
        const amount = Number(expenseAmount.value);
        const category = expenseCategory.value;
        const date = expenseDate.value || getTodayString();

        if (name === "" || !amount || amount <= 0) return;

        budgetData.expenses.push({
            id: Date.now(),
            name,
            amount,
            category,
            date,
        });

        expenseName.value = "";
        expenseAmount.value = "";
        expenseCategory.value = "food";
        expenseDate.value = "";

        saveBudgetData();
        renderBudget();
    });
}

if (clearExpenses) {
    clearExpenses.addEventListener("click", () => {
        if (!confirm("Delete all expenses?")) return;

        budgetData.expenses = [];
        saveBudgetData();
        renderBudget();
    });
}

/* MOOD */

const moodForm = document.getElementById("moodForm");
const energyInput = document.getElementById("energyInput");
const stressInput = document.getElementById("stressInput");
const sleepInput = document.getElementById("sleepInput");
const moodNote = document.getElementById("moodNote");

const energyValue = document.getElementById("energyValue");
const stressValue = document.getElementById("stressValue");

const currentMoodEmoji = document.getElementById("currentMoodEmoji");
const currentMoodText = document.getElementById("currentMoodText");
const currentMoodPill = document.getElementById("currentMoodPill");
const averageEnergy = document.getElementById("averageEnergy");
const averageStress = document.getElementById("averageStress");
const averageSleep = document.getElementById("averageSleep");
const moodEntryCount = document.getElementById("moodEntryCount");
const moodHistoryList = document.getElementById("moodHistoryList");
const clearMoodEntries = document.getElementById("clearMoodEntries");

function saveMoodEntries() {
    saveStorage("moodEntries", moodEntries);
}

function getMoodInfo(mood) {
    const moods = {
        great: {
            emoji: "😌",
            label: "great",
            text: "peacefully functioning",
        },
        okay: {
            emoji: "🙂",
            label: "okay",
            text: "surprisingly stable",
        },
        tired: {
            emoji: "🧍",
            label: "tired",
            text: "tired but functional",
        },
        stressed: {
            emoji: "😵‍💫",
            label: "stressed",
            text: "brain has too many tabs open",
        },
        sad: {
            emoji: "😭",
            label: "sad",
            text: "emotionally buffering",
        },
    };

    return moods[mood] || moods.tired;
}

function formatMoodDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function getLatestMoodEntry() {
    if (moodEntries.length === 0) return null;

    return [...moodEntries].sort((a, b) => {
        const dateA = new Date(a.date + "T00:00:00").getTime();
        const dateB = new Date(b.date + "T00:00:00").getTime();

        return dateB - dateA || b.id - a.id;
    })[0];
}

function getAverage(entries, key) {
    if (entries.length === 0) return 0;

    const total = entries.reduce((sum, entry) => {
        return sum + (Number(entry[key]) || 0);
    }, 0);

    return Math.round(total / entries.length);
}

function renderMood() {
    if (!moodHistoryList) return;

    const latest = getLatestMoodEntry();

    if (latest) {
        const moodInfo = getMoodInfo(latest.mood);

        currentMoodEmoji.textContent = moodInfo.emoji;
        currentMoodText.textContent = moodInfo.text;
        currentMoodPill.textContent =
            latest.date === getTodayString() ? "today" : "latest";
    } else {
        currentMoodEmoji.textContent = "🧍";
        currentMoodText.textContent = "no mood logged yet";
        currentMoodPill.textContent = "empty";
    }

    averageEnergy.textContent = `${getAverage(moodEntries, "energy")}%`;
    averageStress.textContent = `${getAverage(moodEntries, "stress")}%`;
    averageSleep.textContent = `${getAverage(moodEntries, "sleep")}h`;

    moodEntryCount.textContent =
        moodEntries.length === 1 ? "1 entry" : `${moodEntries.length} entries`;

    renderMoodHistory();
    updateDashboardMoodCard(latest);
    refreshHeroLine();
}

function renderMoodHistory() {
    moodHistoryList.innerHTML = "";

    if (moodEntries.length === 0) {
        moodHistoryList.innerHTML = `
      <div class="empty-state">
        <h4>No mood entries yet</h4>
        <p>Add a check-in so your dashboard stops emotionally guessing.</p>
      </div>
    `;
        return;
    }

    const sortedEntries = [...moodEntries].sort((a, b) => {
        const dateA = new Date(a.date + "T00:00:00").getTime();
        const dateB = new Date(b.date + "T00:00:00").getTime();

        return dateB - dateA || b.id - a.id;
    });

    sortedEntries.forEach((entry) => {
        const moodInfo = getMoodInfo(entry.mood);
        const entryElement = document.createElement("div");

        entryElement.className = `mood-entry ${entry.mood}`;

        entryElement.innerHTML = `
      <div class="mood-entry-emoji">${moodInfo.emoji}</div>

      <div class="mood-entry-content">
        <h4>${moodInfo.label} · ${formatMoodDate(entry.date)}</h4>
        <p>${escapeHTML(entry.note || "No note added.")}</p>

        <div class="mood-entry-meta">
          <span class="mood-tag">energy ${entry.energy}%</span>
          <span class="mood-tag">stress ${entry.stress}%</span>
          <span class="mood-tag">sleep ${entry.sleep || 0}h</span>
        </div>
      </div>

      <button class="mood-delete" title="Delete mood entry">×</button>
    `;

        entryElement.querySelector(".mood-delete").addEventListener("click", () => {
            moodEntries = moodEntries.filter((item) => item.id !== entry.id);
            saveMoodEntries();
            renderMood();
        });

        moodHistoryList.appendChild(entryElement);
    });
}

function updateDashboardMoodCard(latest) {
    const dashboardMoodEmoji = document.querySelector(".mood-row .selected");
    const dashboardMoodText = document.querySelector("#dashboardMoodCard p");

    if (!dashboardMoodEmoji || !dashboardMoodText) return;

    if (!latest) {
        dashboardMoodEmoji.textContent = "🧍";
        dashboardMoodText.textContent = "Current mode: not logged yet";
        return;
    }

    const moodInfo = getMoodInfo(latest.mood);

    dashboardMoodEmoji.textContent = moodInfo.emoji;
    dashboardMoodText.textContent = `Current mode: ${moodInfo.text}`;
}

if (energyInput && energyValue) {
    energyInput.addEventListener("input", () => {
        energyValue.textContent = `${energyInput.value}%`;
    });
}

if (stressInput && stressValue) {
    stressInput.addEventListener("input", () => {
        stressValue.textContent = `${stressInput.value}%`;
    });
}

if (moodForm) {
    moodForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const selectedMood = document.querySelector('input[name="mood"]:checked');

        moodEntries.unshift({
            id: Date.now(),
            mood: selectedMood ? selectedMood.value : "tired",
            energy: Number(energyInput.value),
            stress: Number(stressInput.value),
            sleep: Number(sleepInput.value) || 0,
            note: moodNote.value.trim(),
            date: getTodayString(),
        });

        energyInput.value = 50;
        stressInput.value = 50;
        energyValue.textContent = "50%";
        stressValue.textContent = "50%";
        sleepInput.value = "";
        moodNote.value = "";

        saveMoodEntries();
        renderMood();
    });
}

if (clearMoodEntries) {
    clearMoodEntries.addEventListener("click", () => {
        if (!confirm("Delete all mood entries?")) return;

        moodEntries = [];
        saveMoodEntries();
        renderMood();
    });
}

/* JOURNAL */

const journalForm = document.getElementById("journalForm");
const journalTitle = document.getElementById("journalTitle");
const journalMood = document.getElementById("journalMood");
const journalCategory = document.getElementById("journalCategory");
const journalText = document.getElementById("journalText");

const journalSearch = document.getElementById("journalSearch");
const journalFilter = document.getElementById("journalFilter");
const journalList = document.getElementById("journalList");
const clearJournalEntries = document.getElementById("clearJournalEntries");

const journalEntryTotal = document.getElementById("journalEntryTotal");
const journalWordTotal = document.getElementById("journalWordTotal");
const journalTopCategory = document.getElementById("journalTopCategory");
const journalTopCategoryText = document.getElementById("journalTopCategoryText");

function saveJournalEntries() {
    saveStorage("journalEntries", journalEntries);
}

function getJournalCategoryName(category) {
    const names = {
        personal: "Personal",
        study: "Study",
        idea: "Idea",
        reflection: "Reflection",
        rant: "Rant",
        memory: "Memory",
    };

    return names[category] || "Personal";
}

function getJournalMoodEmoji(mood) {
    const moods = {
        calm: "😌",
        happy: "🙂",
        tired: "🧍",
        stressed: "😵‍💫",
        sad: "😭",
        chaotic: "🌀",
    };

    return moods[mood] || "🧍";
}

function countWords(text) {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function getJournalTopCategory() {
    if (journalEntries.length === 0) {
        return {
            category: "None",
            count: 0,
        };
    }

    const counts = {};

    journalEntries.forEach((entry) => {
        counts[entry.category] = (counts[entry.category] || 0) + 1;
    });

    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    return {
        category: top[0],
        count: top[1],
    };
}

function renderJournal() {
    if (!journalList) return;

    const searchValue = journalSearch.value.trim().toLowerCase();
    const filterValue = journalFilter.value;

    let filteredEntries = [...journalEntries];

    if (filterValue !== "all") {
        filteredEntries = filteredEntries.filter(
            (entry) => entry.category === filterValue
        );
    }

    if (searchValue !== "") {
        filteredEntries = filteredEntries.filter((entry) => {
            return (
                entry.title.toLowerCase().includes(searchValue) ||
                entry.text.toLowerCase().includes(searchValue)
            );
        });
    }

    filteredEntries.sort((a, b) => b.id - a.id);

    if (filteredEntries.length === 0) {
        journalList.innerHTML = `
      <div class="empty-state">
        <h4>No entries found</h4>
        <p>Either your brain is quiet or the filter is too dramatic.</p>
      </div>
    `;
    } else {
        journalList.innerHTML = "";

        filteredEntries.forEach((entry) => {
            const entryElement = document.createElement("div");
            const wordCount = countWords(entry.text);

            entryElement.className = `journal-entry ${entry.category}`;

            entryElement.innerHTML = `
        <div class="journal-entry-top">
          <div>
            <h4>${escapeHTML(entry.title)}</h4>
            <span class="journal-entry-date">${formatMoodDate(entry.date)}</span>
          </div>

          <button class="journal-delete" title="Delete entry">×</button>
        </div>

        <p class="journal-entry-text">${escapeHTML(entry.text)}</p>

        <div class="journal-tags">
          <span class="journal-tag">${getJournalMoodEmoji(entry.mood)} ${entry.mood
                }</span>
          <span class="journal-tag">${getJournalCategoryName(
                    entry.category
                )}</span>
          <span class="journal-tag">${wordCount} words</span>
        </div>
      `;

            entryElement.querySelector(".journal-delete").addEventListener("click", () => {
                journalEntries = journalEntries.filter((item) => item.id !== entry.id);
                saveJournalEntries();
                renderJournal();
            });

            journalList.appendChild(entryElement);
        });
    }

    updateJournalStats();
}

function updateJournalStats() {
    const totalWords = journalEntries.reduce((sum, entry) => {
        return sum + countWords(entry.text);
    }, 0);

    const top = getJournalTopCategory();

    journalEntryTotal.textContent = journalEntries.length;
    journalWordTotal.textContent = totalWords;

    if (top.count === 0) {
        journalTopCategory.textContent = "None";
        journalTopCategoryText.textContent = "no entries yet";
    } else {
        journalTopCategory.textContent = getJournalCategoryName(top.category);
        journalTopCategoryText.textContent = `${top.count} entr${top.count === 1 ? "y" : "ies"
            }`;
    }
}

if (journalForm) {
    journalForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = journalTitle.value.trim();
        const text = journalText.value.trim();

        if (title === "" || text === "") return;

        journalEntries.unshift({
            id: Date.now(),
            title,
            mood: journalMood.value,
            category: journalCategory.value,
            text,
            date: getTodayString(),
        });

        journalTitle.value = "";
        journalMood.value = "calm";
        journalCategory.value = "personal";
        journalText.value = "";

        saveJournalEntries();
        renderJournal();
    });
}

if (journalSearch) {
    journalSearch.addEventListener("input", renderJournal);
}

if (journalFilter) {
    journalFilter.addEventListener("change", renderJournal);
}

if (clearJournalEntries) {
    clearJournalEntries.addEventListener("click", () => {
        if (!confirm("Delete all journal entries?")) return;

        journalEntries = [];
        saveJournalEntries();
        renderJournal();
    });
}

/* SETTINGS*/

const personalSettingsForm = document.getElementById("personalSettingsForm");
const settingsUserName = document.getElementById("settingsUserName");
const settingsDashboardTitle = document.getElementById("settingsDashboardTitle");
const settingsCurrency = document.getElementById("settingsCurrency");
const settingsTone = document.getElementById("settingsTone");

const themeOptions = document.querySelectorAll(".theme-option");

const showStatusCard = document.getElementById("showStatusCard");
const showStudyCard = document.getElementById("showStudyCard");
const showBudgetCard = document.getElementById("showBudgetCard");
const showMoodCard = document.getElementById("showMoodCard");
const showQuickTasks = document.getElementById("showQuickTasks");
const showQuickStudy = document.getElementById("showQuickStudy");

const exportDataBtn = document.getElementById("exportDataBtn");
const importDataInput = document.getElementById("importDataInput");
const clearTasksBtn = document.getElementById("clearTasksBtn");
const clearScheduleBtn = document.getElementById("clearScheduleBtn");
const clearBudgetBtn = document.getElementById("clearBudgetBtn");
const clearMoodBtn = document.getElementById("clearMoodBtn");
const clearJournalBtn = document.getElementById("clearJournalBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

function saveAppSettings() {
    saveStorage("appSettings", appSettings);
}

function applyTheme(theme) {
    document.body.classList.remove(
        "theme-cream",
        "theme-pink",
        "theme-green",
        "theme-blue",
        "theme-dark"
    );

    document.body.classList.add(`theme-${theme}`);

    themeOptions.forEach((button) => {
        button.classList.toggle("active", button.dataset.theme === theme);
    });
}

function applyPersonalSettings() {
    const heroTitle = document.querySelector(".hero h1");
    const dashboardEyebrow = document.querySelector(".hero .eyebrow");

    if (dashboardEyebrow) {
        dashboardEyebrow.textContent = appSettings.dashboardTitle;
    }

    if (heroTitle) {
        const hour = new Date().getHours();
        let greetingText = "Good evening";

        if (hour < 12) greetingText = "Good morning";
        else if (hour < 18) greetingText = "Good afternoon";

        heroTitle.textContent = `${greetingText}, ${appSettings.userName}`;
    }

    if (settingsUserName) settingsUserName.value = appSettings.userName;
    if (settingsDashboardTitle) {
        settingsDashboardTitle.value = appSettings.dashboardTitle;
    }
    if (settingsCurrency) settingsCurrency.value = appSettings.currency;
    if (settingsTone) settingsTone.value = appSettings.tone;
}

function applyDashboardVisibility() {
    const cards = appSettings.dashboardCards;

    const statusCard = document.getElementById("dashboardStatusCard");
    const studyCard = document.getElementById("dashboardStudyCard");
    const budgetCard = document.getElementById("dashboardBudgetCard");
    const moodCard = document.getElementById("dashboardMoodCard");
    const quickTasksPanel = document.getElementById("quickTasksPanel");
    const quickStudyPanel = document.getElementById("quickStudyPanel");

    if (statusCard) statusCard.classList.toggle("is-hidden", !cards.status);
    if (studyCard) studyCard.classList.toggle("is-hidden", !cards.study);
    if (budgetCard) budgetCard.classList.toggle("is-hidden", !cards.budget);
    if (moodCard) moodCard.classList.toggle("is-hidden", !cards.mood);
    if (quickTasksPanel) {
        quickTasksPanel.classList.toggle("is-hidden", !cards.quickTasks);
    }
    if (quickStudyPanel) {
        quickStudyPanel.classList.toggle("is-hidden", !cards.quickStudy);
    }

    if (showStatusCard) showStatusCard.checked = cards.status;
    if (showStudyCard) showStudyCard.checked = cards.study;
    if (showBudgetCard) showBudgetCard.checked = cards.budget;
    if (showMoodCard) showMoodCard.checked = cards.mood;
    if (showQuickTasks) showQuickTasks.checked = cards.quickTasks;
    if (showQuickStudy) showQuickStudy.checked = cards.quickStudy;
}

function applySettings() {
    applyTheme(appSettings.theme);
    applyPersonalSettings();
    applyDashboardVisibility();
    renderBudget();
}

if (personalSettingsForm) {
    personalSettingsForm.addEventListener("submit", (event) => {
        event.preventDefault();

        appSettings.userName = settingsUserName.value.trim() || "Student";
        appSettings.dashboardTitle =
            settingsDashboardTitle.value.trim() || "Academic Survival OS";
        appSettings.currency = settingsCurrency.value;
        appSettings.tone = settingsTone.value;

        saveAppSettings();
        applySettings();
    });
}

themeOptions.forEach((button) => {
    button.addEventListener("click", () => {
        appSettings.theme = button.dataset.theme;
        saveAppSettings();
        applySettings();
    });
});

[
    {
        input: showStatusCard,
        key: "status",
    },
    {
        input: showStudyCard,
        key: "study",
    },
    {
        input: showBudgetCard,
        key: "budget",
    },
    {
        input: showMoodCard,
        key: "mood",
    },
    {
        input: showQuickTasks,
        key: "quickTasks",
    },
    {
        input: showQuickStudy,
        key: "quickStudy",
    },
].forEach(({ input, key }) => {
    if (!input) return;

    input.addEventListener("change", () => {
        appSettings.dashboardCards[key] = input.checked;
        saveAppSettings();
        applyDashboardVisibility();
    });
});

/* Export / import data */

function downloadJSON(filename, data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {
        type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

function collectAllData() {
    return {
        appSettings,
        tasks,
        modules,
        events,
        budgetData,
        moodEntries,
        journalEntries,
        exportedAt: new Date().toISOString(),
    };
}

if (exportDataBtn) {
    exportDataBtn.addEventListener("click", () => {
        downloadJSON("desklight-dashboard-data.json", collectAllData());
    });
}

if (importDataInput) {
    importDataInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const importedData = JSON.parse(reader.result);

                if (!confirm("Import this data? It may replace your current data.")) {
                    return;
                }

                if (importedData.appSettings) {
                    saveStorage("appSettings", importedData.appSettings);
                }

                if (importedData.tasks) {
                    saveStorage("studentTasks", importedData.tasks);
                }

                if (importedData.modules) {
                    saveStorage("studyModules", importedData.modules);
                }

                if (importedData.events) {
                    saveStorage("scheduleEvents", importedData.events);
                }

                if (importedData.budgetData) {
                    saveStorage("budgetData", importedData.budgetData);
                }

                if (importedData.moodEntries) {
                    saveStorage("moodEntries", importedData.moodEntries);
                }

                if (importedData.journalEntries) {
                    saveStorage("journalEntries", importedData.journalEntries);
                }

                location.reload();
            } catch {
                alert("Could not import this file. Make sure it is a valid JSON export.");
            }
        };

        reader.readAsText(file);
    });
}

/* Clear buttons */

function clearStorageKey(key, message) {
    if (!confirm(message)) return;

    localStorage.removeItem(key);
    location.reload();
}

if (clearTasksBtn) {
    clearTasksBtn.addEventListener("click", () => {
        clearStorageKey("studentTasks", "Clear all tasks?");
    });
}

if (clearScheduleBtn) {
    clearScheduleBtn.addEventListener("click", () => {
        clearStorageKey("scheduleEvents", "Clear all schedule events?");
    });
}

if (clearBudgetBtn) {
    clearBudgetBtn.addEventListener("click", () => {
        clearStorageKey("budgetData", "Clear all budget data?");
    });
}

if (clearMoodBtn) {
    clearMoodBtn.addEventListener("click", () => {
        clearStorageKey("moodEntries", "Clear all mood entries?");
    });
}

if (clearJournalBtn) {
    clearJournalBtn.addEventListener("click", () => {
        clearStorageKey("journalEntries", "Clear all journal entries?");
    });
}

if (resetAllBtn) {
    resetAllBtn.addEventListener("click", () => {
        const confirmed = confirm(
            "Reset everything? This deletes tasks, schedule, budget, mood, journal, modules, and settings."
        );

        if (!confirmed) return;

        [
            "appSettings",
            "studentTasks",
            "studyModules",
            "scheduleEvents",
            "budgetData",
            "moodEntries",
            "journalEntries",
        ].forEach((key) => localStorage.removeItem(key));

        location.reload();
    });
}

/* First render */

renderTasks();
renderModules();
renderEvents();
renderBudget();
renderMood();
renderJournal();
applySettings();