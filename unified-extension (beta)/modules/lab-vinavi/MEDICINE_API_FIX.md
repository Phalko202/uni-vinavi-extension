# Medicine Search & Push API Fix

## 🔧 Issues Fixed

### Problem
The medicine search and push functionality was failing because:
1. **Wrong API endpoint** - Using `vinavi.aasandha.mv/api/medicines` instead of `api.aasandha.mv/medicines`
2. **Incorrect medicine filtering** - Not distinguishing between product (brand) and generic medicines
3. **Missing error logging** - Hard to debug when pushes failed

### Solution
Updated the implementation to use the correct Vinavi/Aasandha API endpoints and improved medicine handling.

## 📡 API Endpoints

### 1. Medicine Search
```
GET https://api.aasandha.mv/medicines?filter[is_active]=true&filter[name]={query}&page[size]=20&sort=-created_at
```

**Response Format:**
```json
{
  "meta": {
    "total": 9,
    "per_page": 20,
    "current_page": 1
  },
  "data": [
    {
      "type": "medicines",
      "id": "3636",
      "attributes": {
        "code": "M1148",
        "name": "Fexofen",
        "type": "product",          // "product" = Brand name, "generic" = Generic
        "generic_id": 6686,
        "parent_id": 6686,
        "mfda_code": "P2264",
        "strength": "180 mg",
        "preparation": "Tablet",
        "is_active": true,
        "is_prescribable": true,
        "generic_medicine_name": "Fexofenadine"
      }
    }
  ]
}
```

### 2. Push Prescription
```
POST https://api.aasandha.mv/episodes/{episodeId}/prescriptions
```

**Request Format:**
```json
{
  "data": {
    "type": "prescriptions",
    "attributes": {
      "instructions": "Take 1 tablet twice daily after meals",
      "quantity": 1
    },
    "relationships": {
      "medicine": {
        "data": {
          "type": "medicines",
          "id": "3636"
        }
      }
    }
  }
}
```

### 3. Push Advice
```
POST https://api.aasandha.mv/episodes/{episodeId}/advices
```

**Request Format:**
```json
{
  "data": {
    "type": "advices",
    "attributes": {
      "advice": "Avoid cold water and get proper rest"
    }
  }
}
```

## 🎯 Medicine Types

Vinavi has two types of medicines:

### Product (Brand Medicines)
- **Type:** `"product"`
- **Has:** Medicine code (e.g., "M1148")
- **Has:** Brand name (e.g., "Fexofen")
- **Example:** Fexofen (M1148) - Brand name for Fexofenadine
- **Preferred:** YES - These are the actual prescribable medicines

### Generic Medicines
- **Type:** `"generic"`
- **Has:** Generic name only (e.g., "Fexofenadine")
- **No:** Medicine code
- **Used:** As categories/groupings for products
- **Preferred:** Only if no product available

## 🔍 Search Behavior

The updated search now:
1. Fetches both product and generic medicines
2. **Filters and prioritizes:**
   - Shows **product medicines first** (these are brands like "Fexofen")
   - Then shows **generic medicines** (only if prescribable)
3. Displays type badges:
   - 🟢 **Brand** badge for products
   - ⚪ **Generic** badge for generics

## 💊 Medicine Data Structure

When a medicine is selected, we store:

```javascript
{
  id: "3636",                    // Medicine ID from API
  vinaviId: "3636",              // Same as ID (for consistency)
  code: "M1148",                 // Medicine code (M-code)
  name: "Fexofen",               // Brand/Product name
  generic: "Fexofenadine",       // Generic name
  strength: "180 mg",            // Strength
  preparation: "Tablet",         // Form (Tablet, Capsule, etc.)
  type: "product",               // Type (product/generic)
  genericId: 6686,               // Generic medicine ID
  instructions: "..."            // Dosage instructions
}
```

## 🔐 Authentication

All API calls require:
- **Credentials:** `include` (sends cookies)
- **Headers:**
  - `Content-Type: application/vnd.api+json`
  - `Accept: application/vnd.api+json`

The user must be logged into Vinavi portal for the API calls to work.

## 📊 Example Flow

### 1. User searches "fexofen"
```
GET https://api.aasandha.mv/medicines?filter[is_active]=true&filter[name]=fexofen&page[size]=20
```

### 2. API returns multiple medicines
- **Fexofen 180mg (M1148)** - Product ✅
- **Fexofen 120mg (M1149)** - Product ✅
- **Fexofenadine 180mg** - Generic
- **Fexofenadine 120mg** - Generic

### 3. User selects "Fexofen 180mg (M1148)"
Medicine with ID "3636" is added to bundle

### 4. User applies bundle to patient episode
```
POST https://api.aasandha.mv/episodes/12345/prescriptions
{
  "data": {
    "type": "prescriptions",
    "attributes": {
      "instructions": "Take 1 tablet once daily",
      "quantity": 1
    },
    "relationships": {
      "medicine": {
        "data": {
          "type": "medicines",
          "id": "3636"
        }
      }
    }
  }
}
```

### 5. Prescription appears in patient's episode ✅

## 🐛 Debugging

Enhanced logging now shows:
- Medicine search queries and results
- Medicine push payloads
- API response status and errors
- Detailed error messages

Check browser console for:
```
[GB] Medicine search results: {...}
[GB] Pushing medicine to Vinavi: {...}
[GB] Medicine payload: {...}
[GB] Medicine pushed successfully: {...}
```

## ✅ Testing Checklist

1. ✅ Search for a medicine (e.g., "paracetamol")
2. ✅ Results show with "Brand" and "Generic" badges
3. ✅ Products appear first in results
4. ✅ Clicking a medicine adds it to cart
5. ✅ Save bundle with medicine
6. ✅ Select a patient and episode
7. ✅ Click "Use Bundle"
8. ✅ Check Vinavi portal - prescription should appear
9. ✅ Check console - no errors

## 📝 Key Changes Made

### general-bundles.js
1. Changed API endpoint from `vinavi.aasandha.mv/api/medicines` to `api.aasandha.mv/medicines`
2. Added medicine type filtering (product vs generic)
3. Added type badges in search results
4. Enhanced error handling with detailed messages
5. Added console logging for debugging
6. Fixed prescription push to use correct endpoint

### api.js
1. Updated `searchMedicines()` to use `api.aasandha.mv`
2. Updated `getMedicineDetails()` to use `api.aasandha.mv`
3. Increased default page size to 20 results

## 🎉 Result

Now you can:
- ✅ Search medicines directly from Vinavi database
- ✅ See brand names (products) first
- ✅ Add medicines to bundles
- ✅ Push medicines to patient episodes
- ✅ Track success/failure of each medicine
- ✅ Debug issues with detailed logging

## 📖 References

- **Vinavi Portal:** https://vinavi.aasandha.mv
- **API Base:** https://api.aasandha.mv
- **Medicine Menu:** Image 2 (Medicines table in Vinavi)
- **Prescription Menu:** Image 3 (Create Prescription dialog)

---

**Status:** ✅ Fixed and Working
**Date:** February 17, 2026
**Version:** 2.1
