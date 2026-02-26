# General Bundles Feature - Implementation Guide

## 🎉 Overview

The Vinavi Extension has been modernized with a new **drawer-based navigation system** and a powerful **General Bundles** feature that allows you to create reusable medicine and advice templates.

## ✨ What's New

### 1. **Modern Drawer Navigation**
   - The sidebar navigation now uses a collapsible drawer system
   - "Lab Bundles" and "Patient Bundles" are now organized under a single "Bundles" drawer
   - Click on "Bundles" to expand and see all bundle options
   - More intuitive and space-efficient design

### 2. **General Bundles (NEW!)**
   - Create reusable templates combining medicines and advice
   - Great for common conditions like:
     - Common cold treatment
     - Hypertension management
     - Diabetes care
     - Post-op instructions
     - And more!

### 3. **Live Medicine Search from Vinavi**
   - Search medicines directly from the Vinavi database
   - Real-time search as you type
   - Shows medicine name, strength, preparation, and code
   - Automatically fetches the latest medicine database

### 4. **Medical Advice Templates**
   - Quick templates for common conditions
   - Orthopedic and physiotherapy templates included
   - Custom advice editing
   - Each line becomes a separate advice point when pushed to Vinavi

## 📖 How to Use

### Creating a General Bundle

1. **Navigate to General Bundles**
   - Click on "Bundles" in the sidebar
   - Select "General Bundles" (marked with "New" badge)

2. **Click "Create Bundle"**
   - Enter a descriptive name (e.g., "Common Cold Treatment")

3. **Add Medicines**
   - Click on the "Medicines" tab
   - Type the medicine name in the search box
   - Click on a search result to add it
   - Enter dosage instructions for each medicine
   - Remove medicines using the X button if needed

4. **Add Medical Advice**
   - Click on the "Advice" tab
   - Type your advice or use quick templates
   - Each line will be a separate advice point
   - Templates include:
     - General Fever
     - Sore Throat
     - Cold/Cough
     - Gastric issues
     - Orthopedic conditions (Shoulder, Knee, Back pain, etc.)

5. **Save the Bundle**
   - Click "Save Bundle"
   - Your bundle is now ready to use!

### Using a Bundle

1. **Search for a Patient**
   - Use the "Search Patient" view
   - Find and select your patient
   - Select an episode

2. **Apply the Bundle**
   - Go to "General Bundles"
   - Click "Use Bundle" on the bundle you want to apply
   - Confirm the action
   - All medicines and advice will be pushed to Vinavi automatically!

### Managing Bundles

- **Edit**: Click the "Edit" button on any bundle card
- **Delete**: Click the trash icon to remove a bundle
- **Export**: Save all bundles to a JSON file for backup
- **Import**: Load bundles from a JSON file

## 🔧 Technical Details

### Medicine Search API
The extension uses the official Vinavi medicines API:
```
https://vinavi.aasandha.mv/api/medicines?filter[is_active]=true&filter[name]={query}
```

The API returns medicine data in JSON API format with attributes:
- `id`: Medicine ID for Vinavi
- `name`: Brand name
- `code`: Medicine code (M-code)
- `strength`: Dosage strength
- `preparation`: Form (Tablet, Capsule, Injection, etc.)
- `is_active`: Active status
- `is_prescribable`: Can be prescribed

### Data Storage
- Bundles are stored in browser localStorage
- Storage key: `vinavi_general_bundles`
- Data format: JSON array of bundle objects
- Each bundle contains: name, medicines[], advice, lastModified

### Pushing to Vinavi

**Medicines** are pushed using:
```
POST https://vinavi.aasandha.mv/api/episodes/{episodeId}/prescriptions
```

**Advice** is pushed using:
```
POST https://vinavi.aasandha.mv/api/episodes/{episodeId}/advices
```

Both use JSON API format with proper credentials.

## 🎨 UI/UX Improvements

### Color Scheme
- **General Bundles**: Green gradient (#10b981 → #059669)
- **Lab Bundles**: Blue gradient (#2563eb → #1e40af)
- **Patient Bundles**: Purple gradient (#7c3aed → #a855f7)

### Animations
- Smooth drawer expand/collapse
- Card hover effects with elevation
- Button interactions
- Search result animations

### Responsive Design
- Grid layout adapts to screen size
- Minimum card width: 320px
- Auto-fill grid columns
- Scrollable medicine cart

## 📋 Bundle Structure Example

```json
{
  "name": "Common Cold Treatment",
  "medicines": [
    {
      "id": "10281",
      "vinaviId": "10281",
      "code": "M3901",
      "name": "Alcet",
      "generic": "Levocetirizine",
      "strength": "5 mg",
      "preparation": "Tablet",
      "instructions": "Take 1 tablet once daily at bedtime for 5 days"
    }
  ],
  "advice": "Avoid cold water and spicy food.\nDrink plenty of water/ORS.\nGet proper rest.\nFollow up (as needed).",
  "lastModified": "2026-02-17T10:30:00.000Z"
}
```

## 🚀 Future Enhancements

Potential features for future versions:
- Share bundles with colleagues
- Cloud sync across devices
- Usage statistics
- Favorite bundles
- Bundle categories
- Search within bundles
- Bulk apply to multiple patients
- Template recommendations based on diagnosis

## 🐛 Troubleshooting

### Medicine search not working
- Ensure you're logged into Vinavi
- Check internet connection
- Try refreshing the page

### Bundle not applying
- Verify a patient and episode are selected
- Check that medicines are still active in Vinavi
- Review browser console for errors

### Data loss
- Export your bundles regularly as backup
- Don't clear browser data without backup
- Use the Export feature before major updates

## 📝 Notes

- All data is stored locally in your browser
- Bundles are specific to each computer/browser
- Use Export/Import to transfer between devices
- The extension requires active Vinavi session
- Medicine database is fetched live from Vinavi

## 🙏 Credits

Developed for HMH Vinavi Integration
Version: 2.0 - General Bundles Update
Date: February 2026

---

**Enjoy the new General Bundles feature! Create once, use many times! 🎉**
