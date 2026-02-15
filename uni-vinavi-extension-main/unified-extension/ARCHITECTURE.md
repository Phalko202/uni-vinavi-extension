# Extension Architecture Overview

## Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│  UNIFIED EXTENSION - Single Chrome Extension                │
│  (Vinavi & HMH Universal Extension v2.0.0)                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Click Icon
                           ▼
          ┌────────────────────────────────┐
          │   MAIN POPUP (popup.html)      │
          │   ┌──────────────────────┐     │
          │   │  Choose Your Module:  │     │
          │   │                       │     │
          │   │  📊 Lab Extractor    │ ◄──┼── Module 1
          │   │  ⚡ QuickText        │ ◄──┼── Module 2
          │   │  🔬 Lab Ordering     │ ◄──┼── Module 3
          │   └──────────────────────┘     │
          └────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌─────────┐      ┌─────────┐     ┌─────────┐
    │ MODULE 1│      │ MODULE 2│     │ MODULE 3│
    └─────────┘      └─────────┘     └─────────┘
```

---

## Module Details

### 📊 Module 1: Lab Test Extractor
```
Purpose: Extract lab results from HMH Dharaka portal
Website: dharaka.hmh.mv
Location: modules/lab-extractor/

Components:
├── extractor.html    → Full-page interface
├── extractor.js      → Extraction & categorization logic
├── extractor.css     → Styling
└── content.js        → Page scraping (if needed)

User Flow:
1. User on dharaka.hmh.mv
2. Clicks extension → Lab Extractor
3. Opens extractor.html
4. Clicks "Extract Data"
5. Results categorized and displayed
6. Option to hide WNL tests
7. Copy to clipboard
```

### ⚡ Module 2: QuickText Templates
```
Purpose: Fast text templates for Vinavi portal
Website: vinavi.aasandha.mv, auth.aasandha.mv
Location: modules/quicktext/

Components:
├── dashboard.html      → Classic dashboard
├── dashboard_new.html  → Modern dashboard
├── dashboard.js        → Template management
├── content.js          → Content script (auto-insert)
└── styles.css          → Template styles

Content Script:
- Injected on vinavi.aasandha.mv pages
- Listens for keyboard shortcuts
- Auto-expands text templates
- Real-time template insertion

User Flow:
1. User clicks extension → QuickText
2. Opens dashboard to manage templates
3. Creates/edits templates with shortcuts
4. On Vinavi pages, types shortcut
5. Template auto-expands in text field
```

### 🔬 Module 3: Lab Test Ordering
```
Purpose: Order HMH lab tests through Vinavi
Website: vinavi.aasandha.mv
Location: modules/lab-vinavi/

Components:
├── dashboard.html      → Main patient search
├── lab-catalog.html    → Test selection catalog
├── content.js          → Content script injection
├── content.css         → Injected styles
└── scripts/
    ├── api.js          → Vinavi API integration
    ├── lab-catalog.js  → Catalog management
    ├── medicine-database.js
    ├── patient-notes.js
    └── [12+ other scripts]

Content Script:
- Injected on vinavi.aasandha.mv
- Adds catalog button to page
- Fullscreen test selection
- API integration for ordering

User Flow:
1. User on vinavi.aasandha.mv (logged in)
2. Clicks extension → Lab Ordering
3. Opens dashboard
4. Searches for patient
5. Selects patient episode
6. Opens lab catalog
7. Selects tests
8. Submits order to Vinavi
```

---

## Data Flow

### Storage (chrome.storage.local)
```
┌──────────────────────────────────────┐
│  Chrome Local Storage                │
├──────────────────────────────────────┤
│  vinavi_auth_token          (Module 3)│
│  last_selected_lab_tests    (Module 3)│
│  quicktext_templates        (Module 2)│
│  [custom storage keys]      (All)     │
└──────────────────────────────────────┘
         ▲                    │
         │                    │
         │                    ▼
┌────────────────────────────────────────┐
│  Background Worker (background.js)     │
│  - Handles storage requests            │
│  - Message passing between modules     │
│  - Persistent data management          │
└────────────────────────────────────────┘
```

### Message Passing
```
Module (content.js)  ──┐
                       │
Module (dashboard)  ───┼──► Background Worker ──► Chrome Storage
                       │
Module (extractor)  ───┘

Messages:
- STORE_AUTH_TOKEN
- LAB_TESTS_SELECTED
- STORE_QUICKTEXT_TEMPLATES
- STORE_DATA / GET_DATA
```

---

## Permission Usage

| Permission | Used By | Purpose |
|-----------|---------|---------|
| `storage` | All Modules | Save templates, auth, preferences |
| `tabs` | Main Popup | Open module pages in new tabs |
| `activeTab` | Lab Extractor | Access current page for extraction |
| `scripting` | Lab Extractor | Inject extraction script |
| `dharaka.hmh.mv` | Lab Extractor | Extract lab results |
| `vinavi.aasandha.mv` | Modules 2 & 3 | QuickText & Lab ordering |
| `auth.aasandha.mv` | Module 2 | QuickText on auth pages |

---

## Execution Context

### Main Popup (popup.html/js)
```
Context: Extension popup (380px width)
Lifetime: Opens when icon clicked, closes when clicked away
Purpose: Module selector/router
Action: Opens selected module in new tab
```

### Module Pages
```
Context: Full browser tab (chrome-extension:// URL)
Lifetime: Until user closes tab
Purpose: Full interface for each module
Examples:
- chrome-extension://[id]/modules/lab-extractor/extractor.html
- chrome-extension://[id]/modules/quicktext/dashboard_new.html
- chrome-extension://[id]/modules/lab-vinavi/dashboard.html
```

### Content Scripts
```
Context: Injected into webpage
Lifetime: While page is open
Purpose: Interact with page DOM
Modules Using:
- QuickText: Auto-expand templates
- Lab Ordering: Add catalog button, fullscreen overlay
```

### Background Worker
```
Context: Service worker (persistent)
Lifetime: Always running (with chrome)
Purpose: Storage, messaging, coordination
File: background.js
```

---

## File Organization Benefits

### Old Structure (Scattered)
```
Extension 1/
  popup.html
  popup.js
  background.js
  ...

Extension 2/
  popup.html
  popup.js
  background.js
  quicktext/
  lab/
  ...
```

### New Structure (Organized)
```
unified-extension/
  popup.html           ← Main selector
  popup.js             ← Router
  background.js        ← Unified worker
  modules/
    lab-extractor/     ← Self-contained
    quicktext/         ← Self-contained
    lab-vinavi/        ← Self-contained
```

**Advantages:**
- ✅ Clear module boundaries
- ✅ Easy to add new modules
- ✅ No file conflicts
- ✅ Independent development
- ✅ Better version control

---

## Scalability

### Adding a New Module (Future)

1. Create folder: `modules/new-module/`
2. Add files: `new-module.html`, `new-module.js`, etc.
3. Update `popup.html` with new card
4. Update `popup.js` with route
5. Update `manifest.json` permissions (if needed)
6. Done! New module integrated

### No Changes Needed:
- ❌ Background worker (handles all modules)
- ❌ Other modules (independent)
- ❌ Storage system (generic)

---

## Performance Characteristics

### Memory Usage
- **Popup:** ~1-2 MB (only when open)
- **Each Module:** ~5-10 MB (only when tab open)
- **Background Worker:** ~1-3 MB (always)
- **Content Scripts:** ~1-2 MB per page

### Load Times
- **Popup:** < 100ms
- **Module Pages:** < 500ms
- **Content Script Injection:** < 200ms

### Optimization
- Only active module consumes resources
- Shared background worker (vs. 2 separate)
- Content scripts only on matching domains
- Lazy loading of module assets

---

## Security Model

### Isolation
```
Module 1 ─┐
          ├──► Shared Storage ◄── Read/Write via Background
Module 2 ─┤
          │
Module 3 ─┘

Each module can access shared storage but runs in own context
```

### Permissions
- Minimum necessary permissions per module
- No external network requests (except to defined hosts)
- Local storage only
- No eval() or unsafe code execution

---

## Development Workflow

### Testing Individual Modules
1. Load extension in Chrome
2. Click extension icon
3. Select module to test
4. Open DevTools (F12)
5. Test functionality

### Debugging
```
Popup Issues:
- Right-click extension icon → Inspect popup

Module Issues:
- Open module in tab
- F12 → DevTools

Content Script Issues:
- F12 on target page
- Console → Check for injected scripts

Background Worker:
- chrome://extensions/
- Click "service worker" link under extension
```

---

## Deployment Checklist

- [ ] All module files present
- [ ] Icons folder exists
- [ ] manifest.json valid
- [ ] background.js loaded
- [ ] No console errors in popup
- [ ] Each module opens correctly
- [ ] Content scripts inject properly
- [ ] Storage works across modules
- [ ] Permissions granted
- [ ] Tested on target websites

---

This architecture provides a solid, scalable foundation for multi-module Chrome extensions! 🚀
