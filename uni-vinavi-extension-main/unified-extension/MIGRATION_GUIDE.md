# Module Comparison & Migration Guide

## What Changed?

### BEFORE (2 Separate Extensions)

**Extension 1:** Lab Test Data Extractor
- Install separately
- Only works on dharaka.hmh.mv
- Single purpose: extract lab results

**Extension 2:** Vinavi Universal Helper
- Install separately  
- Works on vinavi.aasandha.mv
- Two features: QuickText + Lab Ordering

**Problems:**
- ❌ Need to install 2 different extensions
- ❌ Two icons in toolbar taking up space
- ❌ Manage updates separately
- ❌ Separate permissions and settings

---

### AFTER (Unified Extension) ✅

**ONE Extension:** Vinavi & HMH Universal Extension
- Single installation
- One icon in toolbar
- All 3 modules in one place
- Unified management

**Benefits:**
- ✅ Install once, get all features
- ✅ Single icon with clean popup selector
- ✅ One update location
- ✅ Organized module structure
- ✅ Better performance with shared background worker

---

## Feature Mapping

| Old Extensions | New Unified Extension | Location |
|---------------|----------------------|----------|
| Lab Test Data Extractor (full extension) | Lab Test Extractor module | Orange card 📊 |
| Vinavi Helper → QuickText | QuickText Templates module | Green card ⚡ |
| Vinavi Helper → Lab Integration | Lab Test Ordering module | Blue card 🔬 |

---

## Migration Steps

If you're currently using the old separate extensions:

### Step 1: Uninstall Old Extensions
1. Go to `chrome://extensions/`
2. Find "Lab Test Data Extractor"
3. Click "Remove"
4. Find "Vinavi Universal Helper"
5. Click "Remove"

### Step 2: Install Unified Extension
1. Stay on `chrome://extensions/`
2. Click "Load unpacked"
3. Select the `unified-extension` folder
4. Done!

### Step 3: Test Each Module
1. Click the new extension icon
2. Try each of the 3 modules
3. Verify they work as expected

**Note:** Your QuickText templates should migrate automatically if they were using the same storage keys. If not, you'll need to recreate them in the new extension.

---

## What Works the Same?

### Lab Test Extractor
- ✅ Same extraction functionality
- ✅ Same categorization
- ✅ Same WNL filter
- ✅ Same copy-to-clipboard
- ✅ Works on same site (dharaka.hmh.mv)

### QuickText
- ✅ Same template system
- ✅ Same dashboard interface
- ✅ Same keyboard shortcuts
- ✅ Works on same sites (vinavi.aasandha.mv)

### Lab Test Ordering
- ✅ Same 200+ test catalog
- ✅ Same patient search
- ✅ Same ordering workflow
- ✅ Works on same site (vinavi.aasandha.mv)

---

## What's Different?

### User Interface
- **OLD:** Click extension → Direct to single function
- **NEW:** Click extension → Choose module → Open module

### File Structure
- **OLD:** Each extension has its own files
- **NEW:** All organized under `modules/` folder

### Background Script
- **OLD:** Two separate background workers
- **NEW:** One unified background worker for better resource usage

---

## Advantages of Unified Approach

### For Users
1. **Less Clutter** - One icon instead of two
2. **Easier Updates** - Update one extension instead of two
3. **Better Organization** - Clear module selector
4. **Consistent Experience** - Same UI patterns across modules

### For Developers
1. **Single Codebase** - Easier maintenance
2. **Shared Resources** - Background worker, storage, utilities
3. **Unified Permissions** - Manage once
4. **Better Structure** - Modular architecture

### For IT/Deployment
1. **Single Installation** - Deploy once to all users
2. **Single Policy** - One extension to whitelist
3. **Easier Support** - One extension to troubleshoot
4. **Version Control** - Single version number

---

## Frequently Asked Questions

**Q: Will my QuickText templates transfer?**
A: Depends on storage keys. You may need to recreate them, but the functionality is identical.

**Q: Do I need to update my workflows?**
A: Minimal changes. Just select the module from the popup instead of having separate icons.

**Q: Can I still use the old extensions?**
A: Yes, but the unified extension is recommended for better performance and easier management.

**Q: What if I only need one module?**
A: The unified extension includes all three, but you can just use the one you need. The others don't consume resources unless opened.

**Q: Are there any performance differences?**
A: The unified extension should perform the same or better due to shared background worker.

**Q: What about permissions?**
A: The unified extension requests all permissions needed for all modules. This is the same total as having both old extensions installed.

---

## Rollback Instructions

If you need to go back to the old extensions:

1. Remove unified extension from `chrome://extensions/`
2. Reinstall the old "Lab Test Data Extractor" extension
3. Reinstall the old "Vinavi Universal Helper" extension
4. Your old settings should still be in storage

---

## Support & Feedback

The unified extension is designed to be a seamless upgrade. If you encounter any issues:

1. Check the [README.md](README.md) troubleshooting section
2. Verify all files are present in the `unified-extension` folder
3. Try reloading the extension
4. Contact your system administrator

---

**Recommended:** Use the unified extension for the best experience! 🚀
