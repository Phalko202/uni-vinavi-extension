// Floating Widget for Lab Test Extractor on dharaka.hmh.mv

let extractedText = '';
let allTestResults = [];

// Comprehensive test categorization function
function categorizeTestPopup(testName) {
  const test = testName.toUpperCase().trim();
  
  const cbcCore = ['HEMOGLOBIN', 'HB', 'RBC COUNT', 'RBC', 'HEMATOCRIT', 'HCT', 'PCV', 'PACKED CELL', 'MCV', 'MCH', 'MCHC', 'RDW', 'RED CELL DISTRIBUTION', 'WBC COUNT', 'WBC', 'TOTAL WBC', 'PLATELET COUNT', 'PLATELET', 'PLT', 'NRBC', 'NUCLEATED RBC'];
  const dlc = ['NEUTROPHIL', 'LYMPHOCYTE', 'MONOCYTE', 'EOSINOPHIL', 'BASOPHIL', 'BAND', 'BLAST', 'POLY'];
  const plateletIndices = ['MPV', 'MEAN PLATELET VOLUME', 'PDW', 'PLATELET DISTRIBUTION', 'PCT', 'PLATELETCRIT'];
  const electrolytes = ['SERUM SODIUM', 'SERUM NA', 'SODIUM (NA)', 'SERUM POTASSIUM', 'SERUM K', 'POTASSIUM (K)', 'SERUM CHLORIDE', 'SERUM CL', 'CHLORIDE (CL)', 'SERUM BICARBONATE', 'BICARBONATE', 'SERUM CALCIUM', 'SERUM CA', 'CALCIUM', 'SERUM MAGNESIUM', 'SERUM MG', 'MAGNESIUM', 'SERUM PHOSPHOROUS', 'SERUM PHOSPHORUS', 'PHOSPHORUS', 'PHOSPHATE'];
  const urinePhysical = ['COLOUR', 'COLOR', 'APPEARANCE', 'URINE COLOUR', 'URINE APPEARANCE'];
  const urineChemical = ['PH', 'SPECIFIC GRAVITY', 'PROTEIN', 'URINE PROTEIN', 'GLUCOSE', 'URINE GLUCOSE', 'KETONE', 'KETONE BODIES', 'BILIRUBIN', 'URINE BILIRUBIN', 'UROBILINOGEN', 'NITRITE', 'URINE NITRITE', 'LEUKOCYTE', 'URINE LEUKOCYTE', 'URINE BLOOD', 'BLOOD'];
  const urineMicroscopic = ['PUS CELLS', 'PUS CELL', 'RED CELLS', 'RBC', 'EPITHELIAL CELLS', 'EPITHELIAL CELL', 'CRYSTALS', 'CAST', 'CASTS', 'OTHERS'];
  const renalProfile = ['UREA', 'BUN', 'BLOOD UREA NITROGEN', 'CREATININE', 'CREATININE - SERUM', 'CREATININE-SERUM', 'SERUM CREATININE', 'URIC ACID', 'URATE', 'BUN/CREATININE', 'BUN CREATININE RATIO', 'EGFR', 'GFR'];
  const bilirubin = ['BILIRUBIN', 'TOTAL BILIRUBIN', 'DIRECT BILIRUBIN', 'INDIRECT BILIRUBIN', 'CONJUGATED BILIRUBIN', 'UNCONJUGATED BILIRUBIN'];
  const liverEnzymes = ['AST', 'SGOT', 'AST(SGOT)', 'AST (SGOT)', 'ALT', 'SGPT', 'ALT(SGPT)', 'ALT (SGPT)', 'ALP', 'ALKALINE PHOSPHATASE', 'GGT', 'GAMMA GT', 'GAMMA GLUTAMYL', 'GAMMA-GT'];
  const liverProteins = ['TOTAL PROTEIN', 'ALBUMIN', 'GLOBULIN', 'A/G RATIO', 'ALBUMIN GLOBULIN', 'A G RATIO', 'ALBUMIN/GLOBULIN'];
  const coagulation = ['PROTHROMBIN', 'PT', 'PT CONTROL', 'INR', 'APTT', 'ACTIVATED PARTIAL', 'THROMBIN TIME', 'D-DIMER', 'D DIMER'];
  const inflammatory = ['ESR', 'ERYTHROCYTE SEDIMENTATION', 'CRP', 'C-REACTIVE', 'C REACTIVE', 'PROCALCITONIN'];
  const autoimmune = ['RHEUMATOID FACTOR', 'RF', 'ANTI-CCP', 'ANTI CCP', 'ANA', 'ANTINUCLEAR', 'ANTI-DSDNA', 'ANTI DSDNA'];
  const cardiac = ['TROPONIN', 'TROP', 'CK-MB', 'CKMB', 'CK MB', 'BNP', 'NT-PROBNP', 'NT PROBNP', 'PRO BNP'];
  const glucose = ['GLUCOSE', 'FASTING GLUCOSE', 'RANDOM GLUCOSE', 'HBA1C', 'GLYCATED HEMOGLOBIN', 'GLYCOSYLATED', 'INSULIN'];
  const thyroid = ['TSH', 'THYROID STIMULATING', 'FREE T3', 'FT3', 'FREE T4', 'FT4', 'T3', 'T4', 'THYROXINE', 'TRIIODOTHYRONINE'];
  const lipid = ['CHOLESTEROL', 'LDL', 'LOW DENSITY', 'HDL', 'HIGH DENSITY', 'TRIGLYCERIDE', 'VLDL', 'VERY LOW DENSITY'];
  const infectious = ['HBSAG', 'HBS AG', 'HEPATITIS B', 'ANTI-HCV', 'ANTI HCV', 'HEPATITIS C', 'HIV', 'WIDAL', 'DENGUE', 'NS1', 'IGG', 'IGM'];
  
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

// Extract data from page
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
        found = { table, headerRowIndex: r, testNameIndex, lisResultIndex, referenceRangeIndex };
        break;
      }
    }
    if (found) break;
  }

  if (!found) return results;

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
    results.push({ testName, result: lisResultRaw, displayValue: normal ? 'WNL' : lisResultRaw });
  }
  return results;
}

// Display results
function displayResults(testResults, hideWnl) {
  const filteredResults = hideWnl ? testResults.filter(test => test.displayValue !== 'WNL') : testResults;
  const categories = {};
  filteredResults.forEach(test => {
    const category = categorizeTestPopup(test.testName);
    if (!categories[category]) categories[category] = [];
    categories[category].push(test);
  });

  let output = 'LAB TEST RESULTS\n═══════════════════════════════════\n\n';
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

  const categoryOrder = ['HEMATOLOGY', 'ELECTROLYTES', 'RENAL FUNCTION', 'LIVER FUNCTION', 'COAGULATION', 'INFLAMMATORY & IMMUNOLOGICAL', 'CARDIAC MARKERS', 'METABOLIC & ENDOCRINE', 'LIPID PROFILE', 'INFECTIOUS DISEASE', 'URINE ANALYSIS', 'OTHER TESTS'];
  categoryOrder.forEach(mainCat => {
    if (hierarchy[mainCat]) {
      output += mainCat + '\n';
      const subCats = Object.keys(hierarchy[mainCat]).sort();
      subCats.forEach(subCat => {
        const tests = hierarchy[mainCat][subCat];
        if (subCat !== '_main') {
          output += '  ' + subCat + '\n';
          tests.forEach(test => { output += '    ' + test.testName + ': ' + test.displayValue + '\n'; });
        } else {
          tests.forEach(test => { output += '  ' + test.testName + ': ' + test.displayValue + '\n'; });
        }
      });
      output += '\n';
    }
  });

  return { output, filteredCount: filteredResults.length, totalCount: testResults.length };
}

// Create floating widget
function createWidget() {
  // Check if widget already exists
  if (document.getElementById('lab-extractor-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'lab-extractor-widget';
  widget.innerHTML = `
    <div class="widget-header">
      <div class="widget-title">
        <div class="widget-icon">🏥</div>
        <div class="widget-text">
          <div class="widget-main-title">Lab Test Extractor</div>
          <div class="widget-subtitle">Hulhumale Hospital Portal</div>
        </div>
      </div>
      <button class="widget-toggle" id="widget-toggle">
        <span class="toggle-icon">−</span>
      </button>
    </div>
    <div class="widget-content" id="widget-content">
      <div class="widget-status" id="widget-status">Click "Extract Data" to begin</div>
      <div class="widget-actions">
        <button class="widget-btn widget-btn-extract" id="widget-extract">
          <span class="btn-icon">📊</span>
          Extract Data
        </button>
        <button class="widget-btn widget-btn-copy" id="widget-copy" disabled>
          <span class="btn-icon">📋</span>
          Copy Text
        </button>
      </div>
      <div class="widget-filter" id="widget-filter" style="display: none;">
        <label class="widget-checkbox">
          <input type="checkbox" id="widget-hide-wnl">
          <span>Hide tests marked as WNL</span>
        </label>
      </div>
      <div class="widget-results" id="widget-results">
        <pre id="widget-output">No data extracted yet</pre>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #lab-extractor-widget {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 420px;
      max-height: 85vh;
      background: linear-gradient(135deg, #1e3a2f 0%, #0f2419 100%);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      z-index: 999999;
      overflow: hidden;
      backdrop-filter: blur(10px);
      animation: slideIn 0.25s ease-out;
    }

    /* Compact circular minimized state */
    #lab-extractor-widget.is-collapsed {
      width: 64px;
      height: 64px;
      border-radius: 999px;
      max-height: none;
      cursor: pointer;
    }

    @keyframes slideIn {
      from { transform: translateX(450px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .widget-header {
      background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    #lab-extractor-widget.is-collapsed .widget-header {
      padding: 0;
      height: 64px;
      justify-content: center;
      cursor: pointer;
      border-bottom: none;
      box-shadow: none;
    }

    .widget-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .widget-icon {
      font-size: 32px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    #lab-extractor-widget.is-collapsed .widget-icon {
      font-size: 30px;
    }

    .widget-text {
      line-height: 1.3;
    }

    #lab-extractor-widget.is-collapsed .widget-text {
      display: none;
    }

    .widget-main-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      letter-spacing: -0.02em;
    }

    .widget-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
      margin-top: 2px;
    }

    .widget-toggle {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      transition: all 0.2s ease;
      position: relative;
      z-index: 2;
      pointer-events: auto;
    }

    #lab-extractor-widget.is-collapsed .widget-toggle {
      display: none;
    }

    .widget-toggle:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }

    .widget-content {
      padding: 18px;
      max-height: calc(85vh - 80px);
      overflow-y: auto;
      background: rgba(255, 255, 255, 0.03);
    }

    .widget-content.collapsed {
      display: none;
    }

    .widget-status {
      padding: 12px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      text-align: center;
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      margin-bottom: 14px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .widget-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }

    .widget-btn {
      padding: 14px 16px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: inherit;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .widget-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .widget-btn-extract {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      color: white;
    }

    .widget-btn-extract:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
    }

    .widget-btn-copy {
      background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
      color: white;
    }

    .widget-btn-copy:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
    }

    .btn-icon {
      font-size: 18px;
    }

    .widget-filter {
      margin-bottom: 14px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .widget-checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      cursor: pointer;
      user-select: none;
    }

    .widget-checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .widget-results {
      max-height: 350px;
      overflow-y: auto;
      background: rgba(255, 255, 255, 0.92);
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.12);
    }

    #widget-output {
      margin: 0;
      padding: 16px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      color: #111;
    }

    .widget-content::-webkit-scrollbar,
    .widget-results::-webkit-scrollbar {
      width: 8px;
    }

    .widget-content::-webkit-scrollbar-track,
    .widget-results::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }

    .widget-content::-webkit-scrollbar-thumb,
    .widget-results::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    .widget-content::-webkit-scrollbar-thumb:hover,
    .widget-results::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(widget);

  // Cache widget elements (scope queries to widget to avoid host-page ID collisions)
  const headerEl = widget.querySelector('.widget-header');
  const toggleBtn = widget.querySelector('#widget-toggle');
  const content = widget.querySelector('#widget-content');
  const toggleIcon = widget.querySelector('.toggle-icon');
  const statusDiv = widget.querySelector('#widget-status');
  const outputDiv = widget.querySelector('#widget-output');
  const filterDiv = widget.querySelector('#widget-filter');
  const hideWnlCheckbox = widget.querySelector('#widget-hide-wnl');
  const extractBtn = widget.querySelector('#widget-extract');
  const copyBtn = widget.querySelector('#widget-copy');

  // Default state: minimized (collapsed)
  content.classList.add('collapsed');
  widget.classList.add('is-collapsed');
  toggleIcon.textContent = '+';

  const copyTextToClipboard = async (text) => {
    if (!text) return false;

    // 1) Preferred modern API (may fail on insecure HTTP pages)
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {
      // fall through
    }

    // 2) Fallback: execCommand('copy')
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (_) {
      ok = false;
    } finally {
      document.body.removeChild(textarea);
    }

    return ok;
  };

  // Make draggable
  let isDragging = false;
  let currentX, currentY, initialX, initialY;
  let didMoveWhileDragging = false;

  headerEl.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  function dragStart(e) {
    if (e.target.closest('.widget-toggle')) return;
    initialX = e.clientX - widget.offsetLeft;
    initialY = e.clientY - widget.offsetTop;
    isDragging = true;
    didMoveWhileDragging = false;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      if (Math.abs(currentX - widget.offsetLeft) > 2 || Math.abs(currentY - widget.offsetTop) > 2) {
        didMoveWhileDragging = true;
      }

      widget.style.left = currentX + 'px';
      widget.style.top = currentY + 'px';
      widget.style.right = 'auto';
    }
  }

  function dragEnd() {
    isDragging = false;
  }

  // Toggle collapse
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    content.classList.toggle('collapsed');
    const isCollapsed = content.classList.contains('collapsed');
    widget.classList.toggle('is-collapsed', isCollapsed);
    toggleIcon.textContent = isCollapsed ? '+' : '−';
  });

  // Allow click on minimized circle to expand
  widget.addEventListener('click', (e) => {
    if (!widget.classList.contains('is-collapsed')) return;
    if (didMoveWhileDragging) {
      didMoveWhileDragging = false;
      return;
    }
    // Avoid interfering with drag start; only respond to simple click.
    if (e.target && e.target.closest && e.target.closest('.widget-header')) {
      content.classList.remove('collapsed');
      widget.classList.remove('is-collapsed');
      toggleIcon.textContent = '−';
    }
  });

  // Extract button
  extractBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Extracting data...';
    extractBtn.disabled = true;
    outputDiv.textContent = '';

    try {
      const results = extractFromPage();
      if (results && results.length > 0) {
        allTestResults = results;
        filterDiv.style.display = 'block';
        const displayData = displayResults(allTestResults, false);
        extractedText = displayData.output;
        outputDiv.textContent = displayData.output;
        statusDiv.textContent = `Extracted ${displayData.totalCount} tests`;
        statusDiv.style.background = 'rgba(76, 175, 80, 0.2)';
        statusDiv.style.borderColor = 'rgba(76, 175, 80, 0.4)';
        copyBtn.disabled = false;
      } else {
        statusDiv.textContent = 'No test results found';
        statusDiv.style.background = 'rgba(255, 152, 0, 0.2)';
        statusDiv.style.borderColor = 'rgba(255, 152, 0, 0.4)';
        outputDiv.textContent = 'No data found';
      }
      extractBtn.disabled = false;
    } catch (error) {
      console.error(error);
      statusDiv.textContent = 'Error: ' + error.message;
      statusDiv.style.background = 'rgba(244, 67, 54, 0.2)';
      statusDiv.style.borderColor = 'rgba(244, 67, 54, 0.4)';
      extractBtn.disabled = false;
    }
  });

  // Copy button
  copyBtn.addEventListener('click', async () => {
    if (extractedText) {
      const ok = await copyTextToClipboard(extractedText);
      if (ok) {
        statusDiv.textContent = 'Copied to clipboard!';
        statusDiv.style.background = 'rgba(76, 175, 80, 0.2)';
        statusDiv.style.borderColor = 'rgba(76, 175, 80, 0.4)';
        setTimeout(() => {
          const hideWnl = hideWnlCheckbox.checked;
          const displayData = displayResults(allTestResults, hideWnl);
          statusDiv.textContent = hideWnl 
            ? `Showing ${displayData.filteredCount} tests (${displayData.totalCount - displayData.filteredCount} WNL hidden)`
            : `Extracted ${displayData.totalCount} tests`;
          statusDiv.style.background = 'rgba(255, 255, 255, 0.08)';
          statusDiv.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }, 2000);
      } else {
        statusDiv.textContent = 'Copy failed (try selecting text and Ctrl+C)';
        statusDiv.style.background = 'rgba(244, 67, 54, 0.2)';
        statusDiv.style.borderColor = 'rgba(244, 67, 54, 0.4)';
      }
    }
  });

  // Filter checkbox
  hideWnlCheckbox.addEventListener('change', () => {
    if (allTestResults.length > 0) {
      const hideWnl = hideWnlCheckbox.checked;
      const displayData = displayResults(allTestResults, hideWnl);
      extractedText = displayData.output;
      outputDiv.textContent = displayData.output;
      statusDiv.textContent = hideWnl 
        ? `Showing ${displayData.filteredCount} tests (${displayData.totalCount - displayData.filteredCount} WNL hidden)`
        : `Extracted ${displayData.totalCount} tests`;
    }
  });
}

// Initialize widget when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createWidget);
} else {
  createWidget();
}
