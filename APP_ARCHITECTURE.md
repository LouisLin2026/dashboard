# APP ARCHITECTURE
This document summarizes the current application architecture observed from the existing single-file implementation in [dashboard/index.html](dashboard/index.html). It intentionally documents the present structure without changing behavior, moving code, or introducing new features.

## 1. Navigation Structure

The application is a single-page web app with a login shell and a dynamic app shell.

### Login Flow
- Login screen renders role buttons for managers and departments.
- Manager login requires a password modal before entering the app.
- Department login proceeds directly after selecting a department role.

### Primary Navigation
After authentication, the app renders a sticky header and a tab bar with these navigation targets:
- Board
- Import
- Report
- Depts
- Line
- Dupcheck
- Inbox
- Register

### Navigation Rules
- Manager users see the full set of tabs.
- Department users see the core board experience and limited features.
- Tab visibility is controlled dynamically by the current user role.

## 2. Main UI Sections

### A. Login / Authentication Layer
- Login card with manager and department role selection
- Password modal for manager authentication
- Logout action returns to the login shell

### B. App Shell
- Header with title, sync indicator, and user pill
- Navigation bar for switching major features
- Main content container that is re-rendered for each tab

### C. Board Tab
Main work surface for task management.
- Statistics cards for total/overdue/this-week/done tasks
- Search and filter controls
- Today Console summary section
- Add Task panel
- Meeting Import panel
- Task cards with expandable details and quick progress editing

### D. Import Tab
Used for meeting note intake and Excel-based updates.
- Text paste / file upload for meeting content
- Parsing result list for candidate tasks
- Excel file upload and difference review panel

### E. Report Tab
Used for generating an internal weekly report draft.
- Summary metrics for tasks and deadlines
- One-click report generation
- Report preview and copy/send actions

### F. Depts Tab
Used to manage department information.
- Department cards with workload summary
- Add new department form
- Department edit modal

### G. Line Tab
Used for Line Notify configuration.
- Token entry
- Test push action
- Notification trigger toggles

### H. Dupcheck Tab
Used for scanning for duplicate or similar tasks.
- Pairwise similarity detection
- Merge or skip actions for duplicate candidates

### I. Inbox Tab
Used as an event intake and approval workflow.
- Pending / approved / skipped event views
- Source filters (email, chat, document, meeting, manual)
- Manual event creation modal
- Paste/upload input modal for incoming data
- Approval flow that can fan out into task/risk/decision/schedule records

### J. Register Tab
Used as a PMO-style register center.
- Task / Risk / Decision / Schedule tabs
- Search and sorting controls
- Traceability links back to inbox events

## 3. JavaScript Functional Groups

The script is organized as a single large procedural module with distinct responsibilities.

### A. Firebase & Data Access Layer
- Global Firebase endpoint constants
- Wrapper functions for GET / SET / PATCH / DELETE
- Used for all persistent data access

### B. State & Constants Layer
- Global constants for statuses, categories, department defaults, and managers
- Central state object S storing the current user, tab, task data, department data, filters, and UI flags

### C. Authentication & Session Layer
- initLogin()
- loginAs(), _doLogin(), submitPwd(), closePwdModal(), logout()
- Controls role-based entry and password validation

### D. Data Loading & Visibility Layer
- loadData()
- visibleTasks()
- loadInbox(), loadRegister()
- Filters tasks based on role and department membership

### E. Rendering Layer
- renderTab()
- renderBoard(), renderBoardContent(), renderTaskCard()
- renderImport(), renderReport(), renderDepts(), renderLineSettings(), renderDupCheck(), renderInbox(), renderRegister()
- Renders UI from the current state and data model

### F. Task Management Layer
- addTask()
- saveTask()
- openTaskEditModal(), saveTaskEdit(), deleteTask()
- Quick edit panel for updating status, due date, completion date, and progress

### G. Intake & Parsing Layer
- parseText(), parseMeeting(), parseDocument(), _extractPdfText()
- parseMeetingTasks()
- handleMeetFile(), handleInboxFile()
- Converts text/doc/excel/pdf input into structured intake candidates

### H. Reporting & Export Layer
- genReport()
- exportControlTable(), exportExcel()
- Creates weekly report text and downloadable spreadsheets

### I. Inbox & Approval Layer
- submitManualEvent(), submitPasteEvent(), approveEvent(), skipEvent()
- Supports event normalization, approval, and fan-out into business modules

### J. Register Center Layer
- _migrateRegisters(), loadRegister(), renderRegister()
- Reads and visualizes task, risk, decision, and schedule records

### K. Notifications Layer
- lineNotify(), saveLineToken(), saveLineNotify(), testLineNotify(), manualLineNotify()
- Sends notifications to Line Notify as a secondary workflow

## 4. CSS Structure

The styling is embedded directly in the page head and uses a component-oriented structure.

### A. Theme System
- Root CSS variables define the color palette, border radius, shadows, and semantic colors.
- The design uses a warm neutral base with navy/green/amber/red/purple accents.

### B. Layout Structure
- Login shell styling
- Header styling
- Navigation styling
- Content container styling

### C. Component Styles
- Task card styles
- Stats cards
- Weekly board columns
- Panel styles for add task and meeting import
- Modal styling for edit and filter dialogs
- Department cards and report cards
- Toast and empty/loading states

### D. Utility & Interaction Styles
- Toggle switches
- File drop zones
- Filter chips
- Risk chips and status chips
- Expand/collapse states for task bodies

## 5. Firebase Usage

The application uses Firebase Realtime Database through direct HTTP fetch calls.

### Core Paths
- /yilan/tasks
- /yilan/depts
- /yilan/meta
- /yilan/reports
- /yilan/inbox
- /yilan/risks
- /yilan/decisions
- /yilan/schedule

### Access Pattern
The app uses three basic operations for persistence:
- fbGet() for reading JSON data
- fbSet() for replacing a path
- fbPatch() for partial updates
- fbDel() for deleting a path

### Data Model Characteristics
- Data is stored as JSON objects keyed by record ID.
- Tasks are represented as object entries with metadata like status, dueDate, progress, and owner.
- Inbox events are modeled as approval items that can later fan out into other collections.
- Register-center collections are stored separately from the core task list.

### Migration Behavior
- On login, the app initializes inbox and register-related paths if they are absent.
- These are idempotent bootstrap steps that do not overwrite existing data.

## 6. Global Variables

### Constants
- FB: Firebase base URL
- P_TASKS, P_DEPTS, P_META, P_REPORTS
- P_INBOX, P_RISKS, P_DECISIONS, P_SCHEDULE
- STATUS_OPTS: allowed task states
- STATUS_BG / STATUS_TC: visual state mapping
- DONE_ST: complete-state set
- CAT_OPTS: category options
- DEFAULT_DEPTS: default department catalog
- MANAGERS: known manager role names
- MGR_PASSWORD: manager password constant

### Main State Object
The global S object contains the runtime state:
- me: current user name
- isMgr: whether the current user is a manager
- tasks: task records
- depts: department records
- meta: metadata records
- tab: active tab name
- addOpen / meetOpen: UI panel open state
- lineToken / lineNotify: Line Notify settings
- parsedTasks: meeting import candidates
- generatedReport: weekly report draft
- todayStr / weekLabel: date context
- searchQ / filterStatus / filterDept: board filtering state
- boardView: board display mode
- inboxTab / inboxSrcFilter / inbox: inbox workflow state
- registerTab / registerSearch / registerSort / risks / decisions / schedule: register center state

## 7. Event Flow

### A. Application Startup
1. The page loads and calls initLogin().
2. Department and manager roles are rendered into the login screen.
3. User selects a role and enters the app.
4. _doLogin() sets the session state and loads data.

### B. Data Load and Bootstrapping
1. loadData() loads tasks and meta from Firebase.
2. _runMigration() ensures inbox exists.
3. _migrateRegisters() ensures register collections exist.
4. renderTab() displays the initial board tab.

### C. Board Interaction Flow
1. User opens the board tab.
2. renderBoard() summarizes visible tasks and renders board widgets.
3. User can search/filter tasks, expand task cards, and open quick edit.
4. saveTask() writes updated progress and status back to Firebase.
5. addTask() creates new task records and persists them.

### D. Meeting Intake Flow
1. User pastes meeting content or uploads a file.
2. parseMeetingTasks() or parseDocument() converts the content to candidate tasks.
3. Parsed candidates are displayed for review.
4. importParsedTasks() writes selected items into the task store.

### E. Inbox Approval Flow
1. Incoming text or file content is parsed into a normalized event.
2. The event is stored in the inbox with pending status.
3. A manager reviews it in the Inbox tab.
4. approveEvent() updates the inbox record and fans out into task/risk/decision/schedule outputs when selected.
5. skipEvent() marks the item as skipped and archives it.

### F. Report Flow
1. User opens the Report tab.
2. genReport() assembles a report draft from current task data.
3. The generated report is stored in Firebase and rendered in the UI.

## 8. Business Modules

### Task Management Module
- Create, update, complete, delete, and filter tasks
- Supports statuses, due dates, owners, categories, progress notes, and completion dates
- Provides risk scoring and prioritization for board display

### Department Management Module
- Maintains a department catalog
- Associates tasks with departments
- Supports department-level reporting and visualization

### Weekly Reporting Module
- Aggregates task status and timeline information into a weekly summary
- Exports to clipboard, email, or Excel

### Meeting Intake Module
- Parses meeting-style content into action items
- Supports import of tasks from raw meeting notes

### Excel Import / Sync Module
- Reads exported control-table Excel files
- Compares rows against existing tasks
- Applies new tasks or updates existing ones

### Duplicate Detection Module
- Finds probable duplicate tasks by title/content similarity
- Supports merge and skip decisions

### Inbox Intake / Approval Module
- Normalizes events from multiple sources into a unified inbox item
- Supports approval gating before creating downstream records

### Register Center Module
- Maintains task/risk/decision/schedule records as PMO-style registers
- Supports search, sorting, and traceability to source inbox events

### Line Notification Module
- Sends notifications for task creation, inbox import, report generation, and overdue reminders

## 9. Candidate Modules for Future Extraction

The current implementation is a single monolithic file, but the following areas are strong candidates for future extraction into dedicated modules:

- Authentication module
  - Login, password validation, role handling, and session state

- Data access module
  - Firebase wrappers, local caching, and persistence helpers

- Task domain module
  - Task CRUD, visibility rules, risk scoring, and board filtering

- Inbox intake engine
  - Parsing, normalization, deduplication, approval workflow, and fan-out logic

- Register center module
  - Risk/decision/schedule lifecycle and presentation logic

- Reporting module
  - Weekly report generation, export formatting, and communication actions

- Import adapters module
  - Meeting text parsing, document parsing, Excel comparison, and import execution

- Notification module
  - Line Notify integration, message templates, and delivery handling

- UI shell module
  - Header, navigation, tab orchestration, modal management, and toast handling

- Filter/search module
  - Shared filtering and search behavior for board and register views
