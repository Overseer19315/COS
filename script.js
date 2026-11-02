
/* ==========================================
   COS // PRIVATE TERMINAL
   MAIN SYSTEM SCRIPT
========================================== */

const COS_USERNAME = "COS";
const COS_PASSWORD = "deus ex machina";

const CHAMBER_COMMAND = "BLACKCHAMBER";
const CHAMBER_PASSWORD = "MEMENTO MORI";


/* ==========================================
   STORAGE
========================================== */

const STORAGE_KEY = "COS_PRIVATE_TERMINAL_DATA";

let database = {};

function loadDatabase() {
    try {
        database = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        database = {};
    }
}

function saveDatabase() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function getRecords(section) {
    if (!Array.isArray(database[section])) {
        database[section] = [];
    }

    return database[section];
}


/* ==========================================
   HTML SECURITY HELPERS
========================================== */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


/* ==========================================
   SCREEN MANAGEMENT
========================================== */

const loginScreen = document.getElementById("login-screen");
const mainTerminal = document.getElementById("main-terminal");
const chamberAccess = document.getElementById("black-chamber-access");
const blackChamber = document.getElementById("black-chamber");

function showScreen(screen) {
    [
        loginScreen,
        mainTerminal,
        chamberAccess,
        blackChamber
    ].forEach(element => element.classList.add("hidden"));

    screen.classList.remove("hidden");
}


/* ==========================================
   MAIN LOGIN
========================================== */

document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const error = document.getElementById("login-error");

    if (username === COS_USERNAME && password === COS_PASSWORD) {
        error.textContent = "";

        showScreen(mainTerminal);
        navigateToPage("dashboard");
        updateRecentActivity();
        addActivity("COS session started");
    } else {
        error.textContent = "ACCESS DENIED // INVALID CREDENTIALS";
    }
});


/* ==========================================
   LOGOUT
========================================== */

document.getElementById("logout-button").addEventListener("click", function() {
    addActivity("COS session ended");

    showScreen(loginScreen);

    document.getElementById("login-form").reset();
    document.getElementById("login-error").textContent = "";
});


/* ==========================================
   MAIN NAVIGATION
========================================== */

function navigateToPage(pageName) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.remove("active");
    });

    const targetPage = document.getElementById("page-" + pageName);

    if (!targetPage) return;

    targetPage.classList.add("active");

    const targetButton = document.querySelector(
        `.nav-button[data-page="${pageName}"]`
    );

    if (targetButton) {
        targetButton.classList.add("active");
    }

    renderSection(pageName);
}

document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", function() {
        navigateToPage(this.dataset.page);
    });
});


/* ==========================================
   BLACK CHAMBER SPECIAL ENTRY
========================================== */

document.getElementById("special-entry").addEventListener("click", function() {
    document.getElementById("chamber-form").reset();
    document.getElementById("chamber-error").textContent = "";

    showScreen(chamberAccess);
});

document.getElementById("chamber-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const command = document.getElementById("chamber-command").value.trim();
    const password = document.getElementById("chamber-password").value;
    const error = document.getElementById("chamber-error");

    if (
        command.toUpperCase() === CHAMBER_COMMAND &&
        password === CHAMBER_PASSWORD
    ) {
        error.textContent = "";

        showScreen(blackChamber);
        navigateToChamberPage("chamber-dashboard");

        addActivity("BLACK CHAMBER accessed");
        addChamberActivity("BLACK CHAMBER session opened");
    } else {
        error.textContent = "ACCESS DENIED // AUTHENTICATION FAILED";
        addActivity("Failed BLACK CHAMBER authentication");
    }
});


/* ==========================================
   RETURN FROM CHAMBER ACCESS
========================================== */

document.getElementById("chamber-return").addEventListener("click", function() {
    showScreen(mainTerminal);
});


/* ==========================================
   EXIT BLACK CHAMBER
========================================== */

document.getElementById("chamber-exit").addEventListener("click", function() {
    addChamberActivity("BLACK CHAMBER session closed");
    addActivity("BLACK CHAMBER session closed");

    showScreen(mainTerminal);
    navigateToPage("dashboard");
});


/* ==========================================
   BLACK CHAMBER NAVIGATION
========================================== */

function navigateToChamberPage(pageName) {
    document.querySelectorAll(".chamber-page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".chamber-nav").forEach(button => {
        button.classList.remove("active");
    });

    const target = document.getElementById(pageName);

    if (!target) return;

    target.classList.add("active");

    const button = document.querySelector(
        `.chamber-nav[data-chamber-page="${pageName}"]`
    );

    if (button) {
        button.classList.add("active");
    }

    renderSection(pageName);
}

document.querySelectorAll(".chamber-nav").forEach(button => {
    button.addEventListener("click", function() {
        navigateToChamberPage(this.dataset.chamberPage);
    });
});


/* ==========================================
   ACTIVITY HISTORY
========================================== */

function addActivity(description) {
    const activity = getRecords("activity");

    activity.unshift({
        description,
        date: new Date().toLocaleString()
    });

    database.activity = activity.slice(0, 30);

    saveDatabase();
    updateRecentActivity();
}

function addChamberActivity(description) {
    const activity = getRecords("chamberActivity");

    activity.unshift({
        description,
        date: new Date().toLocaleString()
    });

    database.chamberActivity = activity.slice(0, 100);

    saveDatabase();
}

function updateRecentActivity() {
    const container = document.getElementById("recent-activity");

    if (!container) return;

    const activity = getRecords("activity");

    if (activity.length === 0) {
        container.innerHTML = "<p>No recent activity recorded.</p>";
        return;
    }

    container.innerHTML = activity.slice(0, 6).map(item => `
        <div class="record-item">
            <strong>${escapeHTML(item.description)}</strong>
            <small>${escapeHTML(item.date)}</small>
        </div>
    `).join("");
}


/* ==========================================
   MODULE CONFIGURATION
========================================== */

const moduleConfig = {
    archive: {
        storage: "archive",
        list: "archive-list",
        title: "DOCUMENT TITLE",
        description: "DOCUMENT CONTENT",
        action: "Document created"
    },

    journal: {
        storage: "journal",
        list: "journal-list",
        title: "ENTRY TITLE",
        description: "YOUR ENTRY",
        action: "Journal entry created"
    },

    "black-files": {
        storage: "blackFiles",
        list: "black-files-list",
        title: "DOSSIER TITLE",
        description: "DOSSIER DESCRIPTION",
        action: "Black file created"
    },

    contacts: {
        storage: "contacts",
        list: "contacts-list",
        title: "CONTACT NAME",
        description: "POSITION / ORGANIZATION / NOTES",
        action: "Contact added"
    },

    notes: {
        storage: "notes",
        list: "notes-list",
        title: "NOTE TITLE",
        description: "NOTE CONTENT",
        action: "Executive note created"
    },

    decisions: {
        storage: "decisions",
        list: "decisions-list",
        title: "DECISION TITLE",
        description: "REASON AND EXPECTED CONSEQUENCES",
        action: "Decision registered"
    },

    sealed: {
        storage: "sealed",
        list: "sealed-list",
        title: "RECORD TITLE",
        description: "SEALED RECORD CONTENT",
        action: "Sealed record created"
    },

    projects: {
        storage: "projects",
        list: "projects-list",
        title: "PROJECT NAME",
        description: "PROJECT DESCRIPTION AND OBJECTIVES",
        action: "Project created"
    },

    unfinished: {
        storage: "unfinished",
        list: "unfinished-list",
        title: "MATTER TITLE",
        description: "DESCRIPTION / PENDING ACTION",
        action: "Pending matter added"
    },

    correspondence: {
        storage: "correspondence",
        list: "correspondence-list",
        title: "CORRESPONDENCE TITLE",
        description: "COMMUNICATION DETAILS",
        action: "Correspondence recorded"
    },

    history: {
        storage: "history",
        list: "history-list",
        title: "HISTORICAL RECORD TITLE",
        description: "HISTORICAL DETAILS",
        action: "Historical record added"
    },

    inbox: {
        storage: "inbox",
        list: "inbox-list",
        title: "MESSAGE TITLE",
        description: "MESSAGE CONTENT",
        action: "Message created"
    },

    "private-dossiers": {
        storage: "privateDossiers",
        list: "private-dossiers-list",
        title: "DOSSIER TITLE",
        description: "PRIVATE DOSSIER DETAILS",
        action: "Private dossier created"
    },

    "sealed-documents": {
        storage: "sealedDocuments",
        list: "sealed-documents-list",
        title: "DOCUMENT TITLE",
        description: "DOCUMENT CONTENT",
        action: "Sealed document added"
    },

    observations: {
        storage: "observations",
        list: "observations-list",
        title: "OBSERVATION TITLE",
        description: "OBSERVATION DETAILS",
        action: "Observation recorded"
    },

    unresolved: {
        storage: "unresolved",
        list: "unresolved-list",
        title: "MATTER TITLE",
        description: "MATTER DETAILS",
        action: "Unresolved matter added"
    },

    "final-records": {
        storage: "finalRecords",
        list: "final-records-list",
        title: "FINAL RECORD TITLE",
        description: "FINAL RECORD DETAILS",
        action: "Final record created"
    }
};


/* ==========================================
   CREATE RECORDS
========================================== */

function createRecord(section) {
    const config = moduleConfig[section];

    if (!config) return;

    const title = prompt(config.title);

    if (title === null || !title.trim()) return;

    const description = prompt(config.description);

    if (description === null) return;

    const record = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        date: new Date().toLocaleString()
    };

    getRecords(config.storage).unshift(record);

    saveDatabase();
    renderSection(section);
    addActivity(config.action);
}


/* ==========================================
   DELETE AND RECOVER RECORDS
========================================== */

function deleteRecord(storage, id, section) {
    const records = getRecords(storage);
    const index = records.findIndex(record => record.id === id);

    if (index === -1) return;

    const record = records.splice(index, 1)[0];

    getRecords("trash").unshift({
        ...record,
        originalStorage: storage,
        originalSection: section,
        deletedAt: new Date().toLocaleString()
    });

    saveDatabase();

    renderSection(section);
    addActivity("Record moved to Trash");
}

function recoverRecord(id) {
    const trash = getRecords("trash");
    const index = trash.findIndex(record => record.id === id);

    if (index === -1) return;

    const record = trash.splice(index, 1)[0];

    const originalStorage = record.originalStorage;
    const originalSection = record.originalSection;

    delete record.originalStorage;
    delete record.originalSection;
    delete record.deletedAt;

    if (originalStorage) {
        getRecords(originalStorage).unshift(record);
    }

    saveDatabase();

    renderSection("trash");
    renderSection(originalSection);
    addActivity("Record recovered from Trash");
}

function permanentlyDeleteRecord(id) {
    const trash = getRecords("trash");
    const index = trash.findIndex(record => record.id === id);

    if (index === -1) return;

    if (!confirm("Permanently delete this record?")) return;

    trash.splice(index, 1);

    saveDatabase();
    renderSection("trash");
    addActivity("Record permanently deleted");
}


/* ==========================================
   RENDER MODULES
========================================== */

function renderSection(section) {
    if (section === "trash") {
        renderTrash();
        return;
    }

    if (section === "timeline") {
        renderTimeline();
        return;
    }

    if (section === "black-ledger") {
        renderBlackLedger();
        return;
    }

    const config = moduleConfig[section];

    if (!config) return;

    const container = document.getElementById(config.list);

    if (!container) return;

    const records = getRecords(config.storage);

    if (records.length === 0) {
        container.innerHTML = "<p>No records available.</p>";
        return;
    }

    container.innerHTML = records.map(record => `
        <article class="record-item">
            <div>
                <h3>${escapeHTML(record.title)}</h3>
                <p>${escapeHTML(record.description)}</p>
                <small>${escapeHTML(record.date)}</small>
            </div>

            <button
                class="record-delete"
                data-delete-storage="${escapeHTML(config.storage)}"
                data-delete-id="${escapeHTML(record.id)}"
                data-delete-section="${escapeHTML(section)}">
                MOVE TO TRASH
            </button>
        </article>
    `).join("");
}


/* ==========================================
   TRASH
========================================== */

function renderTrash() {
    const container = document.getElementById("trash-list");

    if (!container) return;

    const records = getRecords("trash");

    if (records.length === 0) {
        container.innerHTML = "<p>No deleted records.</p>";
        return;
    }

    container.innerHTML = records.map(record => `
        <article class="record-item">
            <div>
                <h3>${escapeHTML(record.title)}</h3>
                <p>${escapeHTML(record.description)}</p>
                <small>Deleted: ${escapeHTML(record.deletedAt || "")}</small>
            </div>

            <div class="record-actions">
                <button
                    class="record-recover"
                    data-recover-id="${escapeHTML(record.id)}">
                    RECOVER
                </button>

                <button
                    class="record-delete"
                    data-permanent-id="${escapeHTML(record.id)}">
                    DELETE
                </button>
            </div>
        </article>
    `).join("");
}


/* ==========================================
   TIMELINE
========================================== */

function renderTimeline() {
    const container = document.getElementById("timeline-list");

    if (!container) return;

    const timeline = [
        ...getRecords("activity"),
        ...getRecords("chamberActivity")
    ];

    if (timeline.length === 0) {
        container.innerHTML = "<p>No timeline events.</p>";
        return;
    }

    timeline.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    container.innerHTML = timeline.map(item => `
        <article class="record-item">
            <div>
                <h3>${escapeHTML(item.description)}</h3>
                <small>${escapeHTML(item.date)}</small>
            </div>
        </article>
    `).join("");
}


/* ==========================================
   BLACK LEDGER
========================================== */

function renderBlackLedger() {
    const container = document.getElementById("black-ledger-list");

    if (!container) return;

    const records = getRecords("chamberActivity");

    if (records.length === 0) {
        container.innerHTML = "<p>No ledger entries.</p>";
        return;
    }

    container.innerHTML = records.map(item => `
        <article class="record-item">
            <div>
                <h3>${escapeHTML(item.description)}</h3>
                <small>${escapeHTML(item.date)}</small>
            </div>
        </article>
    `).join("");
}


/* ==========================================
   BUTTON EVENT HANDLING
========================================== */

document.addEventListener("click", function(event) {

    const createButton = event.target.closest("[data-action]");

    if (createButton) {
        createRecord(createButton.dataset.action);
        return;
    }

    const deleteButton = event.target.closest("[data-delete-id]");

    if (deleteButton) {
        deleteRecord(
            deleteButton.dataset.deleteStorage,
            deleteButton.dataset.deleteId,
            deleteButton.dataset.deleteSection
        );
        return;
    }

    const recoverButton = event.target.closest("[data-recover-id]");

    if (recoverButton) {
        recoverRecord(recoverButton.dataset.recoverId);
        return;
    }

    const permanentButton = event.target.closest("[data-permanent-id]");

    if (permanentButton) {
        permanentlyDeleteRecord(permanentButton.dataset.permanentId);
    }
});


/* ==========================================
   SYSTEM CLOCK
========================================== */

function updateClock() {
    const clock = document.getElementById("system-clock");

    if (!clock) return;

    clock.textContent = new Date().toLocaleTimeString("en-GB");
}

setInterval(updateClock, 1000);
updateClock();


/* ==========================================
   INITIALIZATION
========================================== */

loadDatabase();
updateRecentActivity();
