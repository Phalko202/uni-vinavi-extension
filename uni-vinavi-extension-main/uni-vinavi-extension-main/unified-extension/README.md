# Vinavi & HMH Universal Extension

**All-in-one Chrome extension** combining three powerful medical workflow tools:

1. **Lab Test Extractor** - Extract lab results from Hulhumale Hospital (dharaka.hmh.mv)
2. **QuickText** - Fast text templates for Vinavi/Aasandha portal
3. **Lab Test Ordering** - Order HMH lab tests through Vinavi portal

---

## 📦 What's Included

### Module 1: Lab Test Extractor (HMH Dharaka)
- One-click extraction of lab test results from Hulhumale Hospital portal
- Automatically categorizes tests (Hematology, Electrolytes, Liver Function, etc.)
- Filter option to hide "Within Normal Limits" (WNL) tests
- Copy to clipboard functionality
- Works on: `dharaka.hmh.mv`

### Module 2: QuickText Templates (Vinavi)
- Create and manage text templates for quick insertion
- Keyboard shortcuts for common medical phrases
- Template management dashboard
- Works on: `vinavi.aasandha.mv` and `auth.aasandha.mv`

### Module 3: Lab Test Ordering (Vinavi HMH Integration)
- Browse 200+ HMH lab tests organized by category
- Search patients by ID, name, NIC, or phone
- Select tests from comprehensive catalog
- Submit lab orders directly to Vinavi
- Works on: `vinavi.aasandha.mv`

---

## 🚀 Installation

### Step 1: Prepare the Extension
1. Navigate to the `unified-extension` folder
2. Ensure all files are present (manifest.json, popup.html, background.js, etc.)

### Step 2: Install in Chrome
1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right corner)
4. Click **"Load unpacked"**
5. Select the `unified-extension` folder
6. The extension icon should appear in your Chrome toolbar

### Step 3: Verify Installation
- Click the extension icon
- You should see a popup with three module cards
- Each card opens a different tool

---

## 📖 How to Use

### Using Lab Test Extractor

1. **Navigate** to Hulhumale Hospital portal (`dharaka.hmh.mv`)
2. **Open** the Results Validation page with lab test data
3. **Click** the extension icon in your toolbar
4. **Select** "Lab Test Extractor" (the orange card with 📊)
5. **Click** "Extract Data" button
6. **Review** the categorized results
7. *Optional:* Check "Hide tests marked as WNL" to filter results
8. **Click** "Copy Text" to copy formatted results to clipboard

**What it extracts:**
- Patient information (Name, BHT, Sample ID, Age, Gender)
- All lab test results with values
- Automatically categorizes tests by type
- Identifies abnormal values

---

### Using QuickText Templates

1. **Navigate** to Vinavi/Aasandha portal (`vinavi.aasandha.mv`)
2. **Click** the extension icon
3. **Select** "QuickText Templates" (the green card with ⚡)
4. **Create** custom text templates in the dashboard
5. **Use** templates by typing shortcuts in text fields
6. Templates auto-expand in supported text areas

**Features:**
- Manage unlimited templates
- Keyboard shortcuts
- Template categories
- Quick insertion

---

### Using Lab Test Ordering

1. **Navigate** to Vinavi portal (`vinavi.aasandha.mv`)
2. **Ensure** you're logged in to your Aasandha account
3. **Click** the extension icon
4. **Select** "Lab Test Ordering" (the blue card with 🔬)
5. **Search** for a patient using ID, name, NIC, or phone
6. **Select** the patient episode
7. **Browse** lab test catalog by category
8. **Select** tests to order
9. **Submit** order directly to Vinavi

**Available test categories:**
- Hematology (CBC, ESR, etc.)
- Clinical Chemistry
- Immunology
- Microbiology
- And many more...

---

## 🎯 Supported Websites

| Module | Website(s) |
|--------|-----------|
| Lab Test Extractor | `dharaka.hmh.mv` |
| QuickText | `vinavi.aasandha.mv`, `auth.aasandha.mv` |
| Lab Ordering | `vinavi.aasandha.mv` |

---

## 🔧 Troubleshooting

### Extension Icon Not Showing
- Ensure extension is installed and enabled in `chrome://extensions/`
- Try reloading the extension
- Restart Chrome browser

### Lab Extractor Not Finding Data
- Verify you're on the correct page (Results Validation page)
- Ensure lab test table is visible on the page
- Check that data has loaded completely before extracting

### QuickText Not Working
- Verify you're on a Vinavi or Aasandha page
- Check that content scripts are enabled
- Try reloading the page

### Lab Ordering Module Can't Find Patient
- Ensure you're logged into Vinavi portal
- Verify patient exists in the system
- Check your authentication session is valid

### General Issues
1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Click the refresh icon on the extension card
2. **Reload the webpage:**
   - Press F5 or Ctrl+R
3. **Clear extension data:**
   - Right-click extension icon → Options → Reset
4. **Reinstall:**
   - Remove and reload the unpacked extension

---

## 📁 Extension Structure

```
unified-extension/
├── manifest.json              # Extension configuration
├── popup.html                 # Main popup selector
├── popup.js                   # Popup router logic
├── background.js              # Background service worker
├── icons/                     # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── modules/
    ├── lab-extractor/         # Lab Test Extractor module
    │   ├── extractor.html
    │   ├── extractor.js
    │   ├── extractor.css
    │   └── content.js
    ├── quicktext/             # QuickText module
    │   ├── dashboard.html
    │   ├── dashboard_new.html
    │   ├── dashboard.js
    │   ├── content.js
    │   └── styles.css
    └── lab-vinavi/            # Lab Ordering module
        ├── dashboard.html
        ├── lab-catalog.html
        ├── content.js
        ├── content.css
        └── scripts/
            ├── api.js
            ├── lab-catalog.js
            ├── medicine-database.js
            └── [more scripts...]
```

---

## 🔐 Permissions Explained

This extension requires the following permissions:

- **storage** - Save templates, auth tokens, and user preferences
- **tabs** - Open module pages in new tabs
- **activeTab** - Access current page data for extraction
- **scripting** - Inject content scripts for QuickText and Lab features
- **Host permissions:**
  - `dharaka.hmh.mv` - Lab test extraction
  - `vinavi.aasandha.mv` - QuickText and lab ordering
  - `auth.aasandha.mv` - Authentication handling

---

## 🆕 Version History

### v2.0.0 (Current)
- ✅ Unified all three modules into one extension
- ✅ New modern popup selector interface
- ✅ Single installation for all tools
- ✅ Shared background worker for better performance
- ✅ Consolidated permissions

### Previous Versions
- v1.x - Separate extensions (Lab Extractor, Vinavi Helper)

---

## 💡 Tips & Best Practices

1. **Pin the Extension** - Right-click the extension icon and select "Pin" for quick access
2. **Use Keyboard Shortcuts** - Set up custom shortcuts in `chrome://extensions/shortcuts`
3. **Keep Browser Updated** - Use the latest Chrome version for best compatibility
4. **Regular Updates** - Check for extension updates periodically
5. **Clear Cache** - If issues occur, clear browser cache and reload extension

---

## ⚠️ Important Notes

- This extension only works on specified hospital/medical portals
- Requires active login session for Vinavi features
- Lab extraction requires proper page structure (Results Validation page)
- QuickText templates are stored locally in your browser
- All data processing happens locally - no external servers involved

---

## 📞 Support

For issues, questions, or feature requests:
1. Check the Troubleshooting section above
2. Verify you're using the latest version
3. Contact your system administrator

---

## 📜 License

For internal medical facility use only.

---

**Made with ❤️ for healthcare professionals**

*Last updated: February 2026*
