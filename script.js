
/* =====================================================
   COS // PRIVATE TERMINAL
   PERSONAL EXECUTIVE SYSTEM
   JAVASCRIPT VERSION 2.0
===================================================== */

/* =====================================================
   01. CONFIGURATION
===================================================== */

const COS_USERNAME = "COS";
const COS_PASSWORD = "deus ex machina";

const CHAMBER_COMMAND = "BLACKCHAMBER";
const CHAMBER_PASSWORD = "MEMENTO MORI";

const DATABASE_KEY = "COS_PRIVATE_TERMINAL_V2";
const SESSION_KEY = "COS_PRIVATE_SESSION";

const MODULES = {
    archive: {
        action: "create-archive",
        title: "New document",
        id: "archive-list",
        counter: "archive-count",
        stat: "stat-archive",
        label: "DOCUMENT"
    },
    journal: {
        action: "create-journal",
        title: "New journal entry",
        id: "journal-list",
        counter: "journal-count",
        label: "ENTRY"
    },
    "black-files": {
        action: "create-black-file",
        title: "New dossier",
        id: "black-files-list",
        counter: "black-files-count",
        stat: "stat-files",
        label: "DOSSIER"
    },
    contacts: {
        action: "create-contact",
        title: "New contact",
        id: "contacts-list",
        counter: "contacts-count",
        label: "CONTACT"
    },
    sealed: {
        action: "create-sealed",
        title: "New sealed record",
        id: "sealed-list",
        counter: "sealed-count",
        label: "SEALED RECORD"
    },
    history: {
        action: "create-history",
        title: "New historical record",
        id: "history-list",
        counter: "history-count",
        label: "HISTORICAL RECORD"
    },
    notes: {
        action: "create-note",
        title: "New executive note",
        id: "notes-list",
        counter: "notes-count",
        label: "NOTE"
    },
    decisions: {
        action: "create-decision",
        title: "New decision",
        id: "decisions-list",
        counter: "decisions-count",
        stat: "stat-decisions",
        label: "DECISION"
    },
    projects: {
        action: "create-project",
        title: "New project",
        id: "projects-list",
        counter: "projects-count",
        stat: "stat-projects",
        label: "PROJECT"
    },
    unfinished: {
        action: "create-unfinished",
        title: "New pending matter",
        id: "unfinished-list",
        counter: "unfinished-count",
        label: "PENDING MATTER"
    },
    correspondence: {
        action: "create-correspondence",
        title: "New correspondence record",
        id: "correspondence-list",
        counter: "correspondence-count",
        label: "CORRESPONDENCE"
    },
    inbox: {
        action: "create-inbox",
        title: "New inbox item",
        id: "inbox-list",
        counter: "inbox-count",
        label: "INBOX ITEM"
    }
};

const CHAMBER_MODULES = {
    "private-dossiers": {
        action: "create-dossier",
        title: "New private dossier",
        id: "dossiers-list",
        counter: "dossiers-count",
        stat: "stat-dossiers",
        label: "PRIVATE DOSSIER"
    },
    "sealed-documents": {
        action: "create-document",
        title: "New sealed document",
        id: "documents-list",
        counter: "documents-count",
        stat: "stat-sealed",
        label: "SEALED DOCUMENT"
    },
    observations: {
        action: "create-observation",
        title: "New personal observation",
        id: "observations-list",
        counter: "observations-count",
        stat: "stat-observations",
        label: "OBSERVATION"
    },
    unresolved: {
        action: "create-unresolved",
        title: "New unresolved matter",
        id: "unresolved-list",
        counter: "unresolved-count",
        stat: "stat-unresolved",
        label: "UNRESOLVED MATTER"
    },
    "final-records": {
        action: "create-final",
        title: "New final record",
        id: "final-list",
        counter: "final-count",
        label: "FINAL RECORD"
    }
};


/* =====================================================
   02. DATABASE
===================================================== */

function createEmptyDatabase() {
    return {
        records: {},
        trash: [],
        activity: [],
        chamberRecords: {},
        chamberActivity: []
    };
}

function loadDatabase() {
    try {
        const saved = localStorage.getItem(DATABASE_KEY);

        if (!saved) {
            return createEmptyDatabase();
        }

        const data = JSON.parse(saved);

        return {
            ...createEmptyDatabase(),
            ...data,
            records: data.records || {},
            trash: data.trash || [],
            activity: data.activity || [],
            chamberRecords: data.chamberRecords || {},
            chamberActivity: data.chamberActivity || []
        };

    } catch (error) {
        console.error("Database loading error:", error);
        return createEmptyDatabase();
    }
}

let database = loadDatabase();

function saveDatabase() {
    try {
        localStorage.setItem(
            DATABASE_KEY,
            JSON.stringify(database)
        );
    } catch (error) {
        console.error("Database saving error:", error);
        showNotification("Unable to save the record.");
    }
}


/* =====================================================
   03. ELEMENT HELPERS
===================================================== */

function getElement(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(element => {
        element.classList.add("hidden");
    });

    if (screen) {
        screen.classList.remove("hidden");
    }
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function createID(prefix) {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();

    return `${prefix}-${Date.now().toString().slice(-6)}-${random}`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


/* =====================================================
   04. NOTIFICATIONS
===================================================== */

function showNotification(message) {
    let notification = getElement("system-notification");

    if (!notification) {
        notification = document.createElement("div");
        notification.id = "system-notification";

        Object.assign(notification.style, {
            position: "fixed",
            right: "20px",
            bottom: "75px",
            zIndex: "500",
            padding: "14px 18px",
            background: "#171b1f",
            border: "1px solid #535b62",
            borderLeft: "3px solid #923c45",
            color: "#e5e5e5",
            fontFamily: "monospace",
            fontSize: "11px",
            maxWidth: "320px",
            boxShadow: "0 10px 35px rgba(0,0,0,.4)"
        });

        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.classList.remove("hidden");

    clearTimeout(notification.hideTimer);

    notification.hideTimer = setTimeout(() => {
        notification.classList.add("hidden");
    }, 3000);
}


/* =====================================================
   05. LOGIN AND LOGOUT
===================================================== */

const loginForm = getElement("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", event => {
        event.preventDefault();

        const username = getElement("username").value.trim();
        const password = getElement("password").value;

        if (
            username === COS_USERNAME &&
            password === COS_PASSWORD
        ) {
            sessionStorage.setItem(SESSION_KEY, "ACTIVE");

            showScreen(getElement("main-terminal"));

            loginForm.reset();
            setText("login-error", "");

            addActivity("SESSION STARTED", "COS opened the private terminal.");

            refreshAll();

            showNotification("Executive session opened.");
        } else {
            setText("login-error", "INVALID CREDENTIALS.");
        }
    });
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);

    closeCommandInterface();
    closeRecordForm();

    showScreen(getElement("login-screen"));

    showNotification("Session closed.");
}

const logoutButton = getElement("logout-button");

if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}


/* =====================================================
   06. SESSION RESTORATION
===================================================== */

function restoreSession() {
    const active = sessionStorage.getItem(SESSION_KEY);

    if (active === "ACTIVE") {
        showScreen(getElement("main-terminal"));
        refreshAll();
    } else {
        showScreen(getElement("login-screen"));
    }
}


/* =====================================================
   07. MAIN NAVIGATION
===================================================== */

function navigateToPage(pageName) {
    const target = getElement(`page-${pageName}`);

    if (!target) {
        return;
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    target.classList.add("active");

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    setText(
        "current-section",
        pageName.replaceAll("-", " ").toUpperCase()
    );

    renderModule(pageName);
}

document.addEventListener("click", event => {
    const navigation = event.target.closest("[data-page]");

    if (navigation) {
        navigateToPage(navigation.dataset.page);
    }
});


/* =====================================================
   08. ACTIVITY LOG
===================================================== */

function addActivity(title, description) {
    database.activity.unshift({
        id: createID("ACT"),
        title,
        description,
        timestamp: Date.now()
    });

    database.activity = database.activity.slice(0, 100);

    saveDatabase();

    renderActivity();
    renderTimeline();
}

function addChamberActivity(title, description) {
    database.chamberActivity.unshift({
        id: createID("BC"),
        title,
        description,
        timestamp: Date.now()
    });

    database.chamberActivity =
        database.chamberActivity.slice(0, 100);

    saveDatabase();

    renderChamberActivity();
    renderBlackLedger();
}

function renderActivity() {
    const container = getElement("recent-activity");

    if (!container) return;

    if (!database.activity.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>NO ACTIVITY RECORDED</span>
                <p>New activity will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = database.activity
        .slice(0, 7)
        .map(activity => `
            <div class="activity-item">
                <span class="activity-marker"></span>

                <div class="activity-information">
                    <strong>${escapeHTML(activity.title)}</strong>
                    <p>${escapeHTML(activity.description)}</p>
                </div>

                <span class="activity-date">
                    ${formatTime(activity.timestamp)}
                </span>
            </div>
        `).join("");
}

function renderChamberActivity() {
    const container = getElement("chamber-activity");

    if (!container) return;

    if (!database.chamberActivity.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>NO RECORDS AVAILABLE</span>
                <p>Chamber activity will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = database.chamberActivity
        .slice(0, 8)
        .map(activity => `
            <div class="activity-item">
                <span class="activity-marker"></span>

                <div class="activity-information">
                    <strong>${escapeHTML(activity.title)}</strong>
                    <p>${escapeHTML(activity.description)}</p>
                </div>

                <span class="activity-date">
                    ${formatTime(activity.timestamp)}
                </span>
            </div>
        `).join("");
}


/* =====================================================
   09. RECORD FORM
===================================================== */

function createFormOverlay() {
    if (getElement("record-form-overlay")) {
        return;
    }

    const overlay = document.createElement("div");

    overlay.id = "record-form-overlay";
    overlay.className = "command-overlay hidden";

    overlay.innerHTML = `
        <div class="command-window record-form-window">

            <div class="command-window-header">
                <span id="record-form-heading">NEW RECORD</span>
                <button type="button" id="close-record-form">CLOSE</button>
            </div>

            <form id="record-form">

                <div class="record-form-body">

                    <div class="form-field">
                        <label for="record-title">TITLE</label>
                        <input
                            id="record-title"
                            type="text"
                            maxlength="100"
                            placeholder="Enter record title"
                            required
                        >
                    </div>

                    <div class="form-field">
                        <label for="record-description">DESCRIPTION / CONTENT</label>
                        <textarea
                            id="record-description"
                            rows="6"
                            maxlength="5000"
                            placeholder="Write the record content..."
                        ></textarea>
                    </div>

                    <div class="form-field">
                        <label for="record-status">RECORD STATUS</label>
                        <select id="record-status">
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="PENDING">PENDING</option>
                            <option value="UNDER REVIEW">UNDER REVIEW</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                    </div>

                    <div class="form-field">
                        <label for="record-classification">CLASSIFICATION</label>
                        <select id="record-classification">
                            <option value="PERSONAL">PERSONAL</option>
                            <option value="RESTRICTED">RESTRICTED</option>
                            <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                            <option value="SEALED">SEALED</option>
                        </select>
                    </div>

                    <div class="record-form-footer">
                        <button type="button" id="cancel-record-form">
                            CANCEL
                        </button>

                        <button type="submit" class="primary-action">
                            SAVE RECORD →
                        </button>
                    </div>

                </div>

            </form>

        </div>
    `;

    document.body.appendChild(overlay);

    const form = getElement("record-form");

    form.addEventListener("submit", saveRecordFromForm);

    getElement("close-record-form").addEventListener(
        "click",
        closeRecordForm
    );

    getElement("cancel-record-form").addEventListener(
        "click",
        closeRecordForm
    );

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            closeRecordForm();
        }
    });
}

let currentFormModule = null;
let currentFormType = "main";
let editingRecordID = null;

function openRecordForm(moduleName, type = "main", record = null) {
    createFormOverlay();

    const modules = type === "chamber"
        ? CHAMBER_MODULES
        : MODULES;

    const module = modules[moduleName];

    if (!module) return;

    currentFormModule = moduleName;
    currentFormType = type;
    editingRecordID = record ? record.id : null;

    setText(
        "record-form-heading",
        record ? "EDIT RECORD" : module.title.toUpperCase()
    );

    getElement("record-title").value = record?.title || "";
    getElement("record-description").value = record?.description || "";
    getElement("record-status").value = record?.status || "ACTIVE";
    getElement("record-classification").value =
        record?.classification || "PERSONAL";

    getElement("record-form-overlay").classList.remove("hidden");

    setTimeout(() => {
        getElement("record-title").focus();
    }, 50);
}

function closeRecordForm() {
    const overlay = getElement("record-form-overlay");

    if (overlay) {
        overlay.classList.add("hidden");
    }

    const form = getElement("record-form");

    if (form) {
        form.reset();
    }

    editingRecordID = null;
    currentFormModule = null;
}

function saveRecordFromForm(event) {
    event.preventDefault();

    if (!currentFormModule) return;

    const modules = currentFormType === "chamber"
        ? CHAMBER_MODULES
        : MODULES;

    const module = modules[currentFormModule];

    if (!module) return;

    const title = getElement("record-title").value.trim();
    const description = getElement("record-description").value.trim();
    const status = getElement("record-status").value;
    const classification = getElement("record-classification").value;

    if (!title) {
        showNotification("A title is required.");
        return;
    }

    const isChamber = currentFormType === "chamber";

    const collection = isChamber
        ? database.chamberRecords
        : database.records;

    if (!collection[currentFormModule]) {
        collection[currentFormModule] = [];
    }

    let record;

    if (editingRecordID) {
        record = collection[currentFormModule].find(
            item => item.id === editingRecordID
        );

        if (!record) return;

        record.title = title;
        record.description = description;
        record.status = status;
        record.classification = classification;
        record.updatedAt = Date.now();

        if (isChamber) {
            addChamberActivity(
                "RECORD UPDATED",
                title
            );
        } else {
            addActivity(
                "RECORD UPDATED",
                title
            );
        }

        showNotification("Record updated.");

    } else {
        record = {
            id: createID(isChamber ? "BC" : "COS"),
            module: currentFormModule,
            title,
            description,
            status,
            classification,
            createdAt: Date.now(),
            updatedAt: null
        };

        collection[currentFormModule].unshift(record);

        if (isChamber) {
            addChamberActivity(
                "NEW RECORD CREATED",
                title
            );
        } else {
            addActivity(
                "NEW RECORD CREATED",
                title
            );
        }

        showNotification("Record created successfully.");
    }

    saveDatabase();

    closeRecordForm();

    if (isChamber) {
        renderChamberModule(currentFormModule);
        refreshChamberStats();
    } else {
        renderModule(currentFormModule);
        refreshMainStats();
    }
}


/* =====================================================
   10. RECORD RENDERING
===================================================== */

function getRecordCollection(moduleName, type = "main") {
    const source = type === "chamber"
        ? database.chamberRecords
        : database.records;

    return source[moduleName] || [];
}

function createRecordCard(record, type = "main") {
    const card = document.createElement("article");

    card.className = "record-card";

    const date = formatDate(record.createdAt);

    card.innerHTML = `
        <div class="record-card-header">
            <span class="record-id">${escapeHTML(record.id)}</span>
            <span class="record-status">${escapeHTML(record.status)}</span>
        </div>

        <h3>${escapeHTML(record.title)}</h3>

        <p>${escapeHTML(record.description || "No description provided.")}</p>

        <div class="record-card-footer">
            <span>${date}</span>

            <div class="record-actions">
                <button
                    type="button"
                    data-record-action="view"
                    data-record-id="${escapeHTML(record.id)}"
                    data-record-type="${type}"
                >OPEN</button>

                <button
                    type="button"
                    data-record-action="edit"
                    data-record-id="${escapeHTML(record.id)}"
                    data-record-type="${type}"
                >EDIT</button>

                <button
                    type="button"
                    data-record-action="delete"
                    data-record-id="${escapeHTML(record.id)}"
                    data-record-type="${type}"
                >DELETE</button>
            </div>
        </div>
    `;

    return card;
}

function renderRecordCollection(moduleName, type = "main") {
    const modules = type === "chamber"
        ? CHAMBER_MODULES
        : MODULES;

    const module = modules[moduleName];

    if (!module) return;

    const container = getElement(module.id);

    if (!container) return;

    const records = getRecordCollection(moduleName, type);

    container.innerHTML = "";

    if (!records.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>NO RECORDS FOUND</span>
                <p>Create a new record to populate this register.</p>
            </div>
        `;
    } else {
        records.forEach(record => {
            container.appendChild(
                createRecordCard(record, type)
            );
        });
    }

    setText(
        module.counter,
        `${records.length} ${module.label}S`
    );

    if (module.stat) {
        setText(
            module.stat,
            String(records.length).padStart(2, "0")
        );
    }
}

function renderModule(moduleName) {
    if (MODULES[moduleName]) {
        renderRecordCollection(moduleName, "main");
    }

    if (moduleName === "timeline") {
        renderTimeline();
    }

    if (moduleName === "trash") {
        renderTrash();
    }

    if (moduleName === "unfinished") {
        renderPending();
    }
}

function renderChamberModule(moduleName) {
    if (CHAMBER_MODULES[moduleName]) {
        renderRecordCollection(moduleName, "chamber");
    }
}


/* =====================================================
   11. RECORD ACTIONS
===================================================== */

function findRecord(id, type) {
    const source = type === "chamber"
        ? database.chamberRecords
        : database.records;

    for (const [moduleName, records] of Object.entries(source)) {
        const record = records.find(item => item.id === id);

        if (record) {
            return {
                record,
                moduleName,
                collection: records
            };
        }
    }

    return null;
}

function deleteRecord(id, type) {
    const found = findRecord(id, type);

    if (!found) return;

    const confirmed = window.confirm(
        `Move "${found.record.title}" to Trash / Recovery?`
    );

    if (!confirmed) return;

    const deletedRecord = {
        ...found.record,
        originalModule: found.moduleName,
        originalType: type,
        deletedAt: Date.now()
    };

    database.trash.unshift(deletedRecord);

    found.collection.splice(
        found.collection.findIndex(item => item.id === id),
        1
    );

    saveDatabase();

    if (type === "chamber") {
        addChamberActivity(
            "RECORD MOVED TO RECOVERY",
            found.record.title
        );

        renderChamberModule(found.moduleName);
        refreshChamberStats();
    } else {
        addActivity(
            "RECORD MOVED TO TRASH",
            found.record.title
        );

        renderModule(found.moduleName);
        refreshMainStats();
    }

    renderTrash();

    showNotification("Record moved to recovery.");
}

function openRecordDetails(id, type) {
    const found = findRecord(id, type);

    if (!found) return;

    openRecordForm(
        found.moduleName,
        type,
        found.record
    );
}

document.addEventListener("click", event => {
    const button = event.target.closest("[data-record-action]");

    if (!button) return;

    const action = button.dataset.recordAction;
    const id = button.dataset.recordId;
    const type = button.dataset.recordType;

    if (action === "delete") {
        deleteRecord(id, type);
    }

    if (action === "edit" || action === "view") {
        openRecordDetails(id, type);
    }
});


/* =====================================================
   12. CREATE BUTTONS
===================================================== */

document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;

    const moduleName = Object.keys(MODULES).find(
        key => MODULES[key].action === action
    );

    if (moduleName) {
        openRecordForm(moduleName, "main");
    }
});

document.addEventListener("click", event => {
    const button = event.target.closest("[data-chamber-action]");

    if (!button) return;

    const action = button.dataset.chamberAction;

    const moduleName = Object.keys(CHAMBER_MODULES).find(
        key => CHAMBER_MODULES[key].action === action
    );

    if (moduleName) {
        openRecordForm(moduleName, "chamber");
    }
});


/* =====================================================
   13. TRASH AND RECOVERY
===================================================== */

function renderTrash() {
    const container = getElement("trash-list");

    if (!container) return;

    setText(
        "trash-count",
        `${database.trash.length} ITEMS`
    );

    container.innerHTML = "";

    if (!database.trash.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>RECOVERY REGISTER EMPTY</span>
                <p>Deleted records will appear here.</p>
            </div>
        `;
        return;
    }

    database.trash.forEach(record => {
        const card = document.createElement("article");

        card.className = "record-card";

        card.innerHTML = `
            <div class="record-card-header">
                <span class="record-id">${escapeHTML(record.id)}</span>
                <span class="record-status">DELETED</span>
            </div>

            <h3>${escapeHTML(record.title)}</h3>

            <p>${escapeHTML(record.description || "No description.")}</p>

            <div class="record-card-footer">
                <span>${formatDate(record.deletedAt)}</span>

                <div class="record-actions">
                    <button
                        type="button"
                        data-trash-action="recover"
                        data-record-id="${escapeHTML(record.id)}"
                    >RESTORE</button>

                    <button
                        type="button"
                        data-trash-action="permanent"
                        data-record-id="${escapeHTML(record.id)}"
                    >ERASE</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

document.addEventListener("click", event => {
    const button = event.target.closest("[data-trash-action]");

    if (!button) return;

    const id = button.dataset.recordId;
    const action = button.dataset.trashAction;

    const index = database.trash.findIndex(
        record => record.id === id
    );

    if (index === -1) return;

    const record = database.trash[index];

    if (action === "recover") {
        const collectionName = record.originalModule;
        const type = record.originalType;

        const collection = type === "chamber"
            ? database.chamberRecords
            : database.records;

        if (!collection[collectionName]) {
            collection[collectionName] = [];
        }

        const restored = { ...record };

        delete restored.originalModule;
        delete restored.originalType;
        delete restored.deletedAt;

        collection[collectionName].unshift(restored);

        database.trash.splice(index, 1);

        saveDatabase();

        addActivity(
            "RECORD RESTORED",
            record.title
        );

        renderTrash();
        refreshAll();

        showNotification("Record restored.");
    }

    if (action === "permanent") {
        const confirmed = window.confirm(
            `Permanently erase "${record.title}"?`
        );

        if (!confirmed) return;

        database.trash.splice(index, 1);

        saveDatabase();
        renderTrash();

        showNotification("Record permanently erased.");
    }
});


/* =====================================================
   14. TIMELINE
===================================================== */

function renderTimeline() {
    const container = getElement("timeline-list");

    if (!container) return;

    const activities = database.activity;

    container.innerHTML = "";

    if (!activities.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>NO TIMELINE ENTRIES</span>
                <p>Activity will be recorded here.</p>
            </div>
        `;
        return;
    }

    activities.forEach(activity => {
        const item = document.createElement("div");

        item.className = "activity-item";

        item.innerHTML = `
            <span class="activity-marker"></span>

            <div class="activity-information">
                <strong>${escapeHTML(activity.title)}</strong>
                <p>${escapeHTML(activity.description)}</p>
            </div>

            <span class="activity-date">
                ${formatDate(activity.timestamp)}
                ${formatTime(activity.timestamp)}
            </span>
        `;

        container.appendChild(item);
    });
}

function renderBlackLedger() {
    const container = getElement("black-ledger-list");

    if (!container) return;

    container.innerHTML = "";

    if (!database.chamberActivity.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>LEDGER EMPTY</span>
                <p>Chamber activity will be recorded here.</p>
            </div>
        `;
        return;
    }

    database.chamberActivity.forEach(activity => {
        const item = document.createElement("div");

        item.className = "activity-item";

        item.innerHTML = `
            <span class="activity-marker"></span>

            <div class="activity-information">
                <strong>${escapeHTML(activity.title)}</strong>
                <p>${escapeHTML(activity.description)}</p>
            </div>

            <span class="activity-date">
                ${formatDate(activity.timestamp)}
            </span>
        `;

        container.appendChild(item);
    });
}


/* =====================================================
   15. PENDING MATTERS
===================================================== */

function renderPending() {
    const container = getElement("dashboard-pending");

    if (!container) return;

    const pending = database.records.unfinished || [];

    if (!pending.length) {
        container.innerHTML = `
            <p class="empty-state-text">No pending matters.</p>
        `;
        return;
    }

    container.innerHTML = pending
        .slice(0, 5)
        .map(record => `
            <div class="activity-item">
                <span class="activity-marker"></span>

                <div class="activity-information">
                    <strong>${escapeHTML(record.title)}</strong>
                    <p>${escapeHTML(record.status)}</p>
                </div>
            </div>
        `).join("");
}


/* =====================================================
   16. STATISTICS
===================================================== */

function countRecords(collection, moduleNames) {
    return moduleNames.reduce((total, moduleName) => {
        return total + (collection[moduleName]?.length || 0);
    }, 0);
}

function refreshMainStats() {
    const records = database.records;

    const archive = records.archive || [];
    const files = records["black-files"] || [];
    const projects = records.projects || [];
    const decisions = records.decisions || [];

    setText("stat-archive", String(archive.length).padStart(2, "0"));
    setText("stat-files", String(files.length).padStart(2, "0"));
    setText("stat-projects", String(projects.length).padStart(2, "0"));
    setText("stat-decisions", String(decisions.length).padStart(2, "0"));
}

function refreshChamberStats() {
    const records = database.chamberRecords;

    const dossiers = records["private-dossiers"] || [];
    const documents = records["sealed-documents"] || [];
    const observations = records.observations || [];
    const unresolved = records.unresolved || [];

    setText("stat-dossiers", String(dossiers.length).padStart(2, "0"));
    setText("stat-sealed", String(documents.length).padStart(2, "0"));
    setText("stat-observations", String(observations.length).padStart(2, "0"));
    setText("stat-unresolved", String(unresolved.length).padStart(2, "0"));
}


/* =====================================================
   17. BLACK CHAMBER NAVIGATION
===================================================== */

function navigateChamber(pageName) {
    const target = getElement(pageName);

    if (!target || !target.classList.contains("chamber-page")) {
        return;
    }

    document.querySelectorAll(".chamber-page").forEach(page => {
        page.classList.remove("active");
    });

    target.classList.add("active");

    document.querySelectorAll(".chamber-nav").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.chamberPage === pageName
        );
    });

    setText(
        "chamber-current-section",
        pageName.replaceAll("-", " ").toUpperCase()
    );

    if (CHAMBER_MODULES[pageName]) {
        renderChamberModule(pageName);
    }

    if (pageName === "black-ledger") {
        renderBlackLedger();
    }

    if (pageName === "chamber-dashboard") {
        renderChamberActivity();
        refreshChamberStats();
    }
}

document.addEventListener("click", event => {
    const button = event.target.closest("[data-chamber-page]");

    if (!button) return;

    navigateChamber(button.dataset.chamberPage);
});


/* =====================================================
   18. COMMAND INTERFACE
===================================================== */

const commandOverlay = getElement("command-overlay");
const commandInput = getElement("command-input");

function openCommandInterface() {
    if (!commandOverlay) return;

    commandOverlay.classList.remove("hidden");

    setText(
        "command-feedback",
        "ENTER A COMMAND TO CONTINUE"
    );

    setTimeout(() => {
        commandInput.focus();
    }, 50);
}

function closeCommandInterface() {
    if (!commandOverlay) return;

    commandOverlay.classList.add("hidden");

    if (commandInput) {
        commandInput.value = "";
    }
}

const openCommandButton = getElement("open-command");
const closeCommandButton = getElement("close-command");

if (openCommandButton) {
    openCommandButton.addEventListener(
        "click",
        openCommandInterface
    );
}

if (closeCommandButton) {
    closeCommandButton.addEventListener(
        "click",
        closeCommandInterface
    );
}

if (commandInput) {
    commandInput.addEventListener("keydown", event => {
        if (event.key !== "Enter") return;

        const command = commandInput.value.trim().toUpperCase();

        if (command === CHAMBER_COMMAND) {
            closeCommandInterface();
            openChamberAccess();
            return;
        }

        if (command === "DASHBOARD") {
            closeCommandInterface();
            navigateToPage("dashboard");
            return;
        }

        if (command === "LOGOUT") {
            closeCommandInterface();
            logout();
            return;
        }

        if (command === "HELP") {
            setText(
                "command-feedback",
                "AVAILABLE: BLACKCHAMBER / DASHBOARD / LOGOUT"
            );
            return;
        }

        setText(
            "command-feedback",
            "COMMAND NOT RECOGNIZED"
        );
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCommandInterface();
        closeRecordForm();
    }
});


/* =====================================================
   19. BLACK CHAMBER AUTHENTICATION
===================================================== */

function openChamberAccess() {
    showScreen(getElement("black-chamber-access"));

    const form = getElement("chamber-form");

    if (form) {
        form.reset();
    }

    setText("chamber-error", "");
}

const chamberForm = getElement("chamber-form");

if (chamberForm) {
    chamberForm.addEventListener("submit", event => {
        event.preventDefault();

        const command = getElement("chamber-command")
            .value.trim().toUpperCase();

        const password = getElement("chamber-password")
            .value.trim();

        if (
            command === CHAMBER_COMMAND &&
            password === CHAMBER_PASSWORD
        ) {
            chamberForm.reset();

            showScreen(getElement("black-chamber"));

            addChamberActivity(
                "CHAMBER SESSION OPENED",
                "COS accessed BLACK CHAMBER."
            );

            refreshChamberStats();
            renderChamberActivity();

            showNotification("BLACK CHAMBER opened.");

        } else {
            setText(
                "chamber-error",
                "ACCESS DENIED. INVALID CREDENTIALS."
            );
        }
    });
}

const returnButton = getElement("return-to-terminal");

if (returnButton) {
    returnButton.addEventListener("click", () => {
        showScreen(getElement("main-terminal"));
    });
}

const exitChamberButton = getElement("exit-chamber");

if (exitChamberButton) {
    exitChamberButton.addEventListener("click", () => {
        showScreen(getElement("main-terminal"));

        addActivity(
            "BLACK CHAMBER SESSION CLOSED",
            "COS returned to the private terminal."
        );

        showNotification("Returned to private terminal.");
    });
}


/* =====================================================
   20. CLOCK
===================================================== */

function updateClocks() {
    const now = new Date();

    const time = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const date = now.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    setText("system-clock", time);
    setText("chamber-clock", time);
    setText("dashboard-date", date);
}

updateClocks();
setInterval(updateClocks, 1000);


/* =====================================================
   21. REFRESH ALL MODULES
===================================================== */

function refreshAll() {
    Object.keys(MODULES).forEach(moduleName => {
        renderModule(moduleName);
    });

    renderActivity();
    renderTimeline();
    renderTrash();
    renderPending();

    refreshMainStats();

    Object.keys(CHAMBER_MODULES).forEach(moduleName => {
        renderChamberModule(moduleName);
    });

    renderChamberActivity();
    renderBlackLedger();

    refreshChamberStats();
}


/* =====================================================
   22. INITIALIZATION
===================================================== */

function initializeTerminal() {
    createFormOverlay();

    refreshAll();

    restoreSession();

    console.log(
        "COS // PRIVATE TERMINAL — SYSTEM INITIALIZED"
    );
}

initializeTerminal();
