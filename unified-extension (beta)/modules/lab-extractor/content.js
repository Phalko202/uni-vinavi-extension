// Content script to extract lab test data from the page
console.log('Lab Test Extractor: Content script loaded');

// Comprehensive test categorization system
function categorizeTest(testName) {
  const test = testName.toUpperCase().trim();
  
  // 1. HEMATOLOGY
  // 1.1 Complete Blood Count - Core values
  const cbcCore = ['HEMOGLOBIN', 'HB', 'RBC COUNT', 'RBC', 'HEMATOCRIT', 'HCT', 'PCV', 'PACKED CELL', 'MCV', 'MCH', 'MCHC', 'RDW', 'RED CELL DISTRIBUTION', 'WBC COUNT', 'WBC', 'TOTAL WBC', 'PLATELET COUNT', 'PLATELET', 'PLT', 'NRBC', 'NUCLEATED RBC'];
  
  // 1.2 Differential Leukocyte Count (DLC)
  const dlc = ['NEUTROPHIL', 'LYMPHOCYTE', 'MONOCYTE', 'EOSINOPHIL', 'BASOPHIL', 'BAND', 'BLAST', 'POLY'];
  
  // 1.3 Platelet Indices
  const plateletIndices = ['MPV', 'MEAN PLATELET VOLUME', 'PDW', 'PLATELET DISTRIBUTION', 'PCT', 'PLATELETCRIT'];
  
  // 2. ELECTROLYTES
  const electrolytes = ['SERUM SODIUM', 'SERUM NA', 'SODIUM (NA)', 'SERUM POTASSIUM', 'SERUM K', 'POTASSIUM (K)', 'SERUM CHLORIDE', 'SERUM CL', 'CHLORIDE (CL)', 'SERUM BICARBONATE', 'BICARBONATE', 'SERUM CALCIUM', 'SERUM CA', 'CALCIUM', 'SERUM MAGNESIUM', 'SERUM MG', 'MAGNESIUM', 'SERUM PHOSPHOROUS', 'SERUM PHOSPHORUS', 'PHOSPHORUS', 'PHOSPHATE'];
  
  // 11. URINE ANALYSIS
  // Physical Examination
  const urinePhysical = ['COLOUR', 'COLOR', 'APPEARANCE', 'URINE COLOUR', 'URINE APPEARANCE'];
  
  // Chemical Examination
  const urineChemical = ['PH', 'SPECIFIC GRAVITY', 'PROTEIN', 'URINE PROTEIN', 'GLUCOSE', 'URINE GLUCOSE', 'KETONE', 'KETONE BODIES', 'BILIRUBIN', 'URINE BILIRUBIN', 'UROBILINOGEN', 'NITRITE', 'URINE NITRITE', 'LEUKOCYTE', 'URINE LEUKOCYTE', 'URINE BLOOD', 'BLOOD'];
  
  // Microscopic Examination
  const urineMicroscopic = ['PUS CELLS', 'PUS CELL', 'RED CELLS', 'RBC', 'EPITHELIAL CELLS', 'EPITHELIAL CELL', 'CRYSTALS', 'CAST', 'CASTS', 'OTHERS'];
  
  // 3. RENAL FUNCTION
  // All renal profile tests
  const renalProfile = ['UREA', 'BUN', 'BLOOD UREA NITROGEN', 'CREATININE', 'CREATININE - SERUM', 'CREATININE-SERUM', 'SERUM CREATININE', 'URIC ACID', 'URATE', 'BUN/CREATININE', 'BUN CREATININE RATIO', 'EGFR', 'GFR'];
  
  // 4. LIVER FUNCTION
  // 4.1 Bilirubin Profile
  const bilirubin = ['BILIRUBIN', 'TOTAL BILIRUBIN', 'DIRECT BILIRUBIN', 'INDIRECT BILIRUBIN', 'CONJUGATED BILIRUBIN', 'UNCONJUGATED BILIRUBIN'];
  
  // 4.2 Liver Enzymes
  const liverEnzymes = ['AST', 'SGOT', 'AST(SGOT)', 'AST (SGOT)', 'ALT', 'SGPT', 'ALT(SGPT)', 'ALT (SGPT)', 'ALP', 'ALKALINE PHOSPHATASE', 'GGT', 'GAMMA GT', 'GAMMA GLUTAMYL', 'GAMMA-GT'];
  
  // 4.3 Liver Proteins
  const liverProteins = ['TOTAL PROTEIN', 'ALBUMIN', 'GLOBULIN', 'A/G RATIO', 'ALBUMIN GLOBULIN', 'A G RATIO', 'ALBUMIN/GLOBULIN'];
  
  // 5. COAGULATION / HEMOSTASIS
  const coagulation = ['PROTHROMBIN', 'PT', 'PT CONTROL', 'INR', 'APTT', 'ACTIVATED PARTIAL', 'THROMBIN TIME', 'D-DIMER', 'D DIMER'];
  
  // 6. INFLAMMATORY & IMMUNOLOGICAL
  // 6.1 Inflammatory Markers
  const inflammatory = ['ESR', 'ERYTHROCYTE SEDIMENTATION', 'CRP', 'C-REACTIVE', 'C REACTIVE', 'PROCALCITONIN'];
  
  // 6.2 Autoimmune / Rheumatology
  const autoimmune = ['RHEUMATOID FACTOR', 'RF', 'ANTI-CCP', 'ANTI CCP', 'ANA', 'ANTINUCLEAR', 'ANTI-DSDNA', 'ANTI DSDNA'];
  
  // 7. CARDIAC MARKERS
  const cardiac = ['TROPONIN', 'TROP', 'CK-MB', 'CKMB', 'CK MB', 'BNP', 'NT-PROBNP', 'NT PROBNP', 'PRO BNP'];
  
  // 8. METABOLIC & ENDOCRINE
  // 8.1 Glucose Metabolism
  const glucose = ['GLUCOSE', 'FASTING GLUCOSE', 'RANDOM GLUCOSE', 'HBA1C', 'GLYCATED HEMOGLOBIN', 'GLYCOSYLATED', 'INSULIN'];
  
  // 8.2 Thyroid Function
  const thyroid = ['TSH', 'THYROID STIMULATING', 'FREE T3', 'FT3', 'FREE T4', 'FT4', 'T3', 'T4', 'THYROXINE', 'TRIIODOTHYRONINE'];
  
  // 9. LIPID PROFILE
  const lipid = ['CHOLESTEROL', 'LDL', 'LOW DENSITY', 'HDL', 'HIGH DENSITY', 'TRIGLYCERIDE', 'VLDL', 'VERY LOW DENSITY'];
  
  // 10. INFECTIOUS DISEASE
  const infectious = ['HBSAG', 'HBS AG', 'HEPATITIS B', 'ANTI-HCV', 'ANTI HCV', 'HEPATITIS C', 'HIV', 'WIDAL', 'DENGUE', 'NS1', 'IGG', 'IGM'];
  
  // Categorization logic with hierarchy
  if (plateletIndices.some(p => test.includes(p))) return 'HEMATOLOGY > Platelet Indices';
  if (dlc.some(d => test.includes(d))) return 'HEMATOLOGY > Differential Leukocyte Count';
  if (cbcCore.some(h => test.includes(h))) return 'HEMATOLOGY > Complete Blood Count';
  
  if (electrolytes.some(e => test.includes(e))) return 'ELECTROLYTES';
  
  if (urineMicroscopic.some(u => test.includes(u))) return 'URINE ANALYSIS > Microscopic Examination';
  if (urineChemical.some(u => test.includes(u))) return 'URINE ANALYSIS > Chemical Examination';
  if (urinePhysical.some(u => test.includes(u))) return 'URINE ANALYSIS > Physical Examination';
  
  if (renalProfile.some(r => test.includes(r))) return 'RENAL FUNCTION';
  
  if (liverProteins.some(p => test.includes(p))) return 'LIVER FUNCTION > Liver Proteins';
  if (liverEnzymes.some(e => test.includes(e))) return 'LIVER FUNCTION > Liver Enzymes';
  if (bilirubin.some(b => test.includes(b))) return 'LIVER FUNCTION > Bilirubin Profile';
  
  if (coagulation.some(c => test.includes(c))) return 'COAGULATION';
  
  if (autoimmune.some(a => test.includes(a))) return 'INFLAMMATORY & IMMUNOLOGICAL > Autoimmune';
  if (inflammatory.some(i => test.includes(i))) return 'INFLAMMATORY & IMMUNOLOGICAL > Inflammatory Markers';
  
  if (cardiac.some(c => test.includes(c))) return 'CARDIAC MARKERS';
  
  if (thyroid.some(t => test.includes(t))) return 'METABOLIC & ENDOCRINE > Thyroid Function';
  if (glucose.some(g => test.includes(g))) return 'METABOLIC & ENDOCRINE > Glucose Metabolism';
  
  if (lipid.some(l => test.includes(l))) return 'LIPID PROFILE';
  
  if (infectious.some(i => test.includes(i))) return 'INFECTIOUS DISEASE';
  
  return 'OTHER TESTS';
}

// Check if value is within normal range
function isWithinNormal(result, refRange) {
  if (!result || !refRange) return false;
  
  const value = parseFloat(result);
  if (isNaN(value)) return false;
  
  const range = refRange.trim();
  
  // Handle < format
  if (range.startsWith('<')) {
    const limit = parseFloat(range.replace('<', '').trim());
    return value < limit;
  }
  
  // Handle > format
  if (range.startsWith('>')) {
    const limit = parseFloat(range.replace('>', '').trim());
    return value > limit;
  }
  
  // Handle range format (e.g., "4.00-5.50" or "4.0 - 11.0")
  const rangeMatch = range.match(/([0-9.]+)\s*[-–]\s*([0-9.]+)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return value >= min && value <= max;
  }
  
  return false;
}

// Main extraction function
function extractLabTestData() {
  console.log('Starting extraction...');
  
  const data = {
    testResults: [],
    categorizedTests: {},
    extracted: false
  };

  try {
    // Find ALL rows in the page that contain test data
    const allRows = document.querySelectorAll('tr');
    console.log('Found ' + allRows.length + ' table rows');
    
    allRows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      
      // Need at least 4 cells (Test Name, LIS Result, Unit, Reference Range)
      if (cells.length >= 4) {
        const testName = cells[0]?.textContent?.trim();
        const lisResult = cells[1]?.textContent?.trim();
        const unit = cells[2]?.textContent?.trim();
        const refRange = cells[3]?.textContent?.trim();
        
        // Skip header rows or empty rows
        if (!testName || !lisResult || testName === 'Test Name' || testName === '') {
          return;
        }
        
        // Skip if result looks like a header
        if (lisResult === 'LIS Result' || lisResult === 'Result') {
          return;
        }
        
        // Check if it's a valid test (has a numeric result or known test name)
        const hasNumericResult = !isNaN(parseFloat(lisResult));
        if (!hasNumericResult) {
          return;
        }
        
        console.log('Found test: ' + testName + ' = ' + lisResult);
        
        // Determine if WNL or show value
        const isNormal = isWithinNormal(lisResult, refRange);
        const displayValue = isNormal ? 'WNL' : lisResult;
        
        // Categorize
        const category = categorizeTest(testName);
        
        const testData = {
          testName: testName,
          result: lisResult,
          displayValue: displayValue,
          category: category
        };
        
        data.testResults.push(testData);
        
        if (!data.categorizedTests[category]) {
          data.categorizedTests[category] = [];
        }
        data.categorizedTests[category].push(testData);
      }
    });
    
    data.extracted = data.testResults.length > 0;
    console.log('Extracted ' + data.testResults.length + ' tests');
    
  } catch (error) {
    console.error('Extraction error:', error);
  }

  return data;
}

// Format output as simple text with hierarchical structure
function formatLabTestData(data) {
  if (!data.extracted || data.testResults.length === 0) {
    return 'No lab test data found on this page.';
  }

  let output = 'LAB TEST RESULTS\n';
  output += '═══════════════════════════════════\n\n';

  // Group by main category and subcategory
  const hierarchy = {};
  
  Object.keys(data.categorizedTests).forEach(fullCategory => {
    const tests = data.categorizedTests[fullCategory];
    
    if (fullCategory.includes(' > ')) {
      const parts = fullCategory.split(' > ');
      const mainCat = parts[0];
      const subCat = parts[1];
      
      if (!hierarchy[mainCat]) hierarchy[mainCat] = {};
      hierarchy[mainCat][subCat] = tests;
    } else {
      if (!hierarchy[fullCategory]) hierarchy[fullCategory] = {};
      hierarchy[fullCategory]['_main'] = tests;
    }
  });
  
  // Sort and format output
  const categoryOrder = [
    'HEMATOLOGY',
    'ELECTROLYTES',
    'RENAL FUNCTION',
    'LIVER FUNCTION',
    'COAGULATION',
    'INFLAMMATORY & IMMUNOLOGICAL',
    'CARDIAC MARKERS',
    'METABOLIC & ENDOCRINE',
    'LIPID PROFILE',
    'INFECTIOUS DISEASE',
    'URINE ANALYSIS',
    'OTHER TESTS'
  ];
  
  categoryOrder.forEach(mainCat => {
    if (hierarchy[mainCat]) {
      output += mainCat + '\n';
      
      const subCats = Object.keys(hierarchy[mainCat]).sort();
      subCats.forEach(subCat => {
        const tests = hierarchy[mainCat][subCat];
        
        if (subCat !== '_main') {
          output += '  ' + subCat + '\n';
          tests.forEach(test => {
            output += '    ' + test.testName + ': ' + test.displayValue + '\n';
          });
        } else {
          tests.forEach(test => {
            output += '  ' + test.testName + ': ' + test.displayValue + '\n';
          });
        }
      });
      
      output += '\n';
    }
  });

  return output;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request.action);
  
  if (request.action === 'extractData') {
    const extractedData = extractLabTestData();
    const formattedText = formatLabTestData(extractedData);
    
    console.log('Sending response with ' + extractedData.testResults.length + ' tests');
    
    sendResponse({
      success: extractedData.extracted,
      data: extractedData,
      formattedText: formattedText
    });
  }
  return true;
});

console.log('Lab Test Extractor: Ready');
