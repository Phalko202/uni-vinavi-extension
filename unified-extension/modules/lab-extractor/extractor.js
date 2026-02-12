// Popup script for Lab Test Extractor

let extractedText = '';
let allTestResults = []; // Store all results for filtering

// Comprehensive test categorization function
function categorizeTestPopup(testName) {
  const test = testName.toUpperCase().trim();
  
  // 1. HEMATOLOGY
  const cbcCore = ['HEMOGLOBIN', 'HB', 'RBC COUNT', 'RBC', 'HEMATOCRIT', 'HCT', 'PCV', 'PACKED CELL', 'MCV', 'MCH', 'MCHC', 'RDW', 'RED CELL DISTRIBUTION', 'WBC COUNT', 'WBC', 'TOTAL WBC', 'PLATELET COUNT', 'PLATELET', 'PLT', 'NRBC', 'NUCLEATED RBC'];
  const dlc = ['NEUTROPHIL', 'LYMPHOCYTE', 'MONOCYTE', 'EOSINOPHIL', 'BASOPHIL', 'BAND', 'BLAST', 'POLY'];
  const plateletIndices = ['MPV', 'MEAN PLATELET VOLUME', 'PDW', 'PLATELET DISTRIBUTION', 'PCT', 'PLATELETCRIT'];
  
  // 2. ELECTROLYTES
  const electrolytes = ['SERUM SODIUM', 'SERUM NA', 'SODIUM (NA)', 'SERUM POTASSIUM', 'SERUM K', 'POTASSIUM (K)', 'SERUM CHLORIDE', 'SERUM CL', 'CHLORIDE (CL)', 'SERUM BICARBONATE', 'BICARBONATE', 'SERUM CALCIUM', 'SERUM CA', 'CALCIUM', 'SERUM MAGNESIUM', 'SERUM MG', 'MAGNESIUM', 'SERUM PHOSPHOROUS', 'SERUM PHOSPHORUS', 'PHOSPHORUS', 'PHOSPHATE'];
  
  // 11. URINE ANALYSIS
  const urinePhysical = ['COLOUR', 'COLOR', 'APPEARANCE', 'URINE COLOUR', 'URINE APPEARANCE'];
  const urineChemical = ['PH', 'SPECIFIC GRAVITY', 'PROTEIN', 'URINE PROTEIN', 'GLUCOSE', 'URINE GLUCOSE', 'KETONE', 'KETONE BODIES', 'BILIRUBIN', 'URINE BILIRUBIN', 'UROBILINOGEN', 'NITRITE', 'URINE NITRITE', 'LEUKOCYTE', 'URINE LEUKOCYTE', 'URINE BLOOD', 'BLOOD'];
  const urineMicroscopic = ['PUS CELLS', 'PUS CELL', 'RED CELLS', 'RBC', 'EPITHELIAL CELLS', 'EPITHELIAL CELL', 'CRYSTALS', 'CAST', 'CASTS', 'OTHERS'];
  
  // 3. RENAL FUNCTION
  const renalProfile = ['UREA', 'BUN', 'BLOOD UREA NITROGEN', 'CREATININE', 'CREATININE - SERUM', 'CREATININE-SERUM', 'SERUM CREATININE', 'URIC ACID', 'URATE', 'BUN/CREATININE', 'BUN CREATININE RATIO', 'EGFR', 'GFR'];
  
  // 4. LIVER FUNCTION
  const bilirubin = ['BILIRUBIN', 'TOTAL BILIRUBIN', 'DIRECT BILIRUBIN', 'INDIRECT BILIRUBIN', 'CONJUGATED BILIRUBIN', 'UNCONJUGATED BILIRUBIN'];
  const liverEnzymes = ['AST', 'SGOT', 'AST(SGOT)', 'AST (SGOT)', 'ALT', 'SGPT', 'ALT(SGPT)', 'ALT (SGPT)', 'ALP', 'ALKALINE PHOSPHATASE', 'GGT', 'GAMMA GT', 'GAMMA GLUTAMYL', 'GAMMA-GT'];
  const liverProteins = ['TOTAL PROTEIN', 'ALBUMIN', 'GLOBULIN', 'A/G RATIO', 'ALBUMIN GLOBULIN', 'A G RATIO', 'ALBUMIN/GLOBULIN'];
  
  // 5. COAGULATION
  const coagulation = ['PROTHROMBIN', 'PT', 'PT CONTROL', 'INR', 'APTT', 'ACTIVATED PARTIAL', 'THROMBIN TIME', 'D-DIMER', 'D DIMER'];
  
  // 6. INFLAMMATORY & IMMUNOLOGICAL
  const inflammatory = ['ESR', 'ERYTHROCYTE SEDIMENTATION', 'CRP', 'C-REACTIVE', 'C REACTIVE', 'PROCALCITONIN'];
  const autoimmune = ['RHEUMATOID FACTOR', 'RF', 'ANTI-CCP', 'ANTI CCP', 'ANA', 'ANTINUCLEAR', 'ANTI-DSDNA', 'ANTI DSDNA'];
  
  // 7. CARDIAC MARKERS
  const cardiac = ['TROPONIN', 'TROP', 'CK-MB', 'CKMB', 'CK MB', 'BNP', 'NT-PROBNP', 'NT PROBNP', 'PRO BNP'];
  
  // 8. METABOLIC & ENDOCRINE
  const glucose = ['GLUCOSE', 'FASTING GLUCOSE', 'RANDOM GLUCOSE', 'HBA1C', 'GLYCATED HEMOGLOBIN', 'GLYCOSYLATED', 'INSULIN'];
  const thyroid = ['TSH', 'THYROID STIMULATING', 'FREE T3', 'FT3', 'FREE T4', 'FT4', 'T3', 'T4', 'THYROXINE', 'TRIIODOTHYRONINE'];
  
  // 9. LIPID PROFILE
  const lipid = ['CHOLESTEROL', 'LDL', 'LOW DENSITY', 'HDL', 'HIGH DENSITY', 'TRIGLYCERIDE', 'VLDL', 'VERY LOW DENSITY'];
  
  // 10. INFECTIOUS DISEASE
  const infectious = ['HBSAG', 'HBS AG', 'HEPATITIS B', 'ANTI-HCV', 'ANTI HCV', 'HEPATITIS C', 'HIV', 'WIDAL', 'DENGUE', 'NS1', 'IGG', 'IGM'];
  
  // Categorization
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

const extractBtn = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const statusDiv = document.getElementById('status');
const outputDiv = document.getElementById('output');

// Extraction function that runs in the page context
function extractFromPage() {
  const results = [];

  const getCellText = (cell) => (cell?.innerText || cell?.textContent || '').trim();
  const getResultValue = (cell) => {
    if (!cell) return '';
    const input = cell.querySelector('input');
    if (input) return (input.value || '').trim();
    const select = cell.querySelector('select');
    if (select) return (select.value || '').trim();
    return getCellText(cell);
  };

  const isWithinNormal = (result, refRange) => {
    if (!result || !refRange) return false;
    const value = parseFloat(result);
    if (Number.isNaN(value)) return false;

    const range = (refRange || '').trim();

    if (range.startsWith('<')) {
      const limit = parseFloat(range.slice(1).trim());
      return !Number.isNaN(limit) && value < limit;
    }

    if (range.startsWith('>')) {
      const limit = parseFloat(range.slice(1).trim());
      return !Number.isNaN(limit) && value > limit;
    }

    const match = range.match(/([0-9.]+)\s*[-–]\s*([0-9.]+)/);
    if (match) {
      const min = parseFloat(match[1]);
      const max = parseFloat(match[2]);
      if (Number.isNaN(min) || Number.isNaN(max)) return false;
      return value >= min && value <= max;
    }

    return false;
  };

  // Find the correct table by locating a header row containing "Test Name" and "LIS Result"
  const tables = Array.from(document.querySelectorAll('table'));
  let found = null;

  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll('tr'));
    for (let r = 0; r < Math.min(rows.length, 5); r++) {
      const headerCells = Array.from(rows[r].querySelectorAll('th, td'));
      if (headerCells.length === 0) continue;

      const headerTexts = headerCells.map((c) => getCellText(c));
      const testNameIndex = headerTexts.findIndex((t) => t === 'Test Name');
      const lisResultIndex = headerTexts.findIndex((t) => t === 'LIS Result');
      const referenceRangeIndex = headerTexts.findIndex((t) => t === 'Reference Range');

      if (testNameIndex >= 0 && lisResultIndex >= 0) {
        found = {
          table,
          headerRowIndex: r,
          testNameIndex,
          lisResultIndex,
          referenceRangeIndex,
        };
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    return results;
  }

  const tableRows = Array.from(found.table.querySelectorAll('tr')).slice(found.headerRowIndex + 1);

  for (const row of tableRows) {
    const cells = row.querySelectorAll('td');
    if (!cells || cells.length === 0) continue;

    const testName = getCellText(cells[found.testNameIndex]);
    const lisResultRaw = getResultValue(cells[found.lisResultIndex]);
    const referenceRange = found.referenceRangeIndex >= 0 ? getCellText(cells[found.referenceRangeIndex]) : '';

    if (!testName || testName === 'Test Name') continue;
    if (!lisResultRaw || lisResultRaw === 'LIS Result') continue;

    const normal = isWithinNormal(lisResultRaw, referenceRange);
    results.push({
      testName,
      result: lisResultRaw,
      displayValue: normal ? 'WNL' : lisResultRaw,
    });
  }

  return results;
}

// Extract data from page
extractBtn.addEventListener('click', async () => {
  statusDiv.innerHTML = '<p>Extracting data...</p>';
  extractBtn.disabled = true;
  outputDiv.textContent = '';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('dharaka.hmh.mv')) {
      statusDiv.innerHTML = '<p style="color: #f44336;">Please navigate to dharaka.hmh.mv</p>';
      extractBtn.disabled = false;
      return;
    }

    // Inject and execute the extraction script directly
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractFromPage
    });

    if (results && results[0] && results[0].result && results[0].result.length > 0) {
      allTestResults = results[0].result; // Store all results
      
      // Show filter options
      document.getElementById('filterOptions').style.display = 'block';
      
      // Display results
      displayResults(allTestResults);
      
      statusDiv.innerHTML = '<p style="color: #4caf50;">Extracted ' + allTestResults.length + ' tests</p>';
      copyBtn.disabled = false;
    } else {
      statusDiv.innerHTML = '<p style="color: #ff9800;">No test results found</p>';
      outputDiv.textContent = 'No data found';
    }

    extractBtn.disabled = false;
  } catch (error) {
    console.error(error);
    statusDiv.innerHTML = '<p style="color: #f44336;">Error: ' + error.message + '</p>';
    extractBtn.disabled = false;
  }
});

// Function to display results with optional filtering
function displayResults(testResults) {
  const hideWnl = document.getElementById('hideWnlCheckbox').checked;
  
  // Filter results if checkbox is checked
  const filteredResults = hideWnl 
    ? testResults.filter(test => test.displayValue !== 'WNL')
    : testResults;
  
  // Categorize tests using comprehensive system
  const categories = {};
  filteredResults.forEach(test => {
    const category = categorizeTestPopup(test.testName);
    if (!categories[category]) categories[category] = [];
    categories[category].push(test);
  });
  
  // Format output with hierarchical structure
  let output = 'LAB TEST RESULTS\n';
  output += '═══════════════════════════════════\n\n';
  
  // Group by main category and subcategory
  const hierarchy = {};
  Object.keys(categories).forEach(fullCategory => {
    const tests = categories[fullCategory];
    
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
  
  // Sort and format
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
  
  extractedText = output;
  outputDiv.textContent = output;
  
  // Update status
  if (hideWnl) {
    statusDiv.innerHTML = '<p style="color: #4caf50;">Showing ' + filteredResults.length + ' tests (' + (testResults.length - filteredResults.length) + ' WNL hidden)</p>';
  } else {
    statusDiv.innerHTML = '<p style="color: #4caf50;">Extracted ' + testResults.length + ' tests</p>';
  }
}

// Add event listener for the checkbox
document.getElementById('hideWnlCheckbox').addEventListener('change', () => {
  if (allTestResults.length > 0) {
    displayResults(allTestResults);
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', () => {
  if (extractedText) {
    navigator.clipboard.writeText(extractedText).then(() => {
      statusDiv.innerHTML = '<p style="color: #4caf50;">Copied to clipboard!</p>';
      setTimeout(() => {
        const hideWnl = document.getElementById('hideWnlCheckbox').checked;
        if (hideWnl) {
          const filteredCount = allTestResults.filter(t => t.displayValue !== 'WNL').length;
          statusDiv.innerHTML = '<p style="color: #4caf50;">Showing ' + filteredCount + ' tests (' + (allTestResults.length - filteredCount) + ' WNL hidden)</p>';
        } else {
          statusDiv.innerHTML = '<p style="color: #4caf50;">Extracted ' + allTestResults.length + ' tests</p>';
        }
      }, 2000);
    });
  }
});
