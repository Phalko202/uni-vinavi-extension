// Medical Letter Generator
(function() {
  'use strict';

  let headerImageData = null;
  let footerImageData = null;

  async function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
  }

  async function loadDefaultLetterImages() {
    // These files are shipped with the extension at:
    // unified-extension/modules/lab-vinavi/header.png
    // unified-extension/modules/lab-vinavi/footer.png
    try {
      const cacheBust = `?v=${Date.now()}`;
      const headerRes = await fetch(`header.png${cacheBust}`);
      if (headerRes.ok) {
        const headerBlob = await headerRes.blob();
        headerImageData = await blobToDataUrl(headerBlob);
        const headerImg = document.getElementById('headerImage');
        if (headerImg) {
          headerImg.src = headerImageData;
          headerImg.style.display = 'block';
        }
        const defaultHeader = document.getElementById('defaultHeader');
        if (defaultHeader) defaultHeader.style.display = 'none';
      }
    } catch (e) {
      console.warn('[Medical Letter] Could not load default header image:', e);
    }

    try {
      const cacheBust = `?v=${Date.now()}`;
      const footerRes = await fetch(`footer.png${cacheBust}`);
      if (footerRes.ok) {
        const footerBlob = await footerRes.blob();
        footerImageData = await blobToDataUrl(footerBlob);
        const footerImg = document.getElementById('footerImage');
        if (footerImg) {
          footerImg.src = footerImageData;
          footerImg.style.display = 'block';
        }
      }
    } catch (e) {
      console.warn('[Medical Letter] Could not load default footer image:', e);
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Medical Letter] Initializing...');
    
    // Set today's date
    document.getElementById('letterDate').valueAsDate = new Date();

    // Load default header/footer images (always)
    await loadDefaultLetterImages();
    
    // Load doctor data first (this will fetch from API)
    await loadDoctorData();
    
    // Load patient data
    await loadPatientData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup patient search
    setupPatientSearch();
    
    console.log('[Medical Letter] Initialization complete');
  });

  // Setup patient search
  function setupPatientSearch() {
    const searchInput = document.getElementById('patientSearchInput');
    const searchBtn = document.getElementById('searchPatientBtn');
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => searchPatient());
    }
    
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          searchPatient();
        }
      });
    }
  }

  // Search for patient by ID/Name/NIC/Phone
  async function searchPatient() {
    const searchInput = document.getElementById('patientSearchInput');
    const searchStatus = document.getElementById('searchStatus');
    const query = searchInput?.value?.trim();
    
    if (!query) {
      searchStatus.textContent = 'Please enter a search term';
      searchStatus.className = 'search-status error';
      return;
    }
    
    searchStatus.textContent = 'Searching...';
    searchStatus.className = 'search-status loading';
    
    try {
      // Search patient via Vinavi API
      const searchUrl = `https://vinavi.aasandha.mv/api/patients/search/${encodeURIComponent(query)}`;
      console.log('[Medical Letter] Searching:', searchUrl);
      
      const searchResponse = await fetch(searchUrl, { credentials: 'include' });
      
      if (!searchResponse.ok) {
        throw new Error('Patient not found');
      }
      
      const searchData = await searchResponse.json();
      console.log('[Medical Letter] Search result:', searchData);
      
      if (!searchData.data || !searchData.data.id) {
        throw new Error('Invalid search response');
      }
      
      const patientId = searchData.data.id;
      
      // Fetch detailed patient information
      const detailsUrl = `https://vinavi.aasandha.mv/api/patients/${patientId}?include=address.island.atoll`;
      const detailsResponse = await fetch(detailsUrl, { credentials: 'include' });
      
      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch patient details');
      }
      
      const patientDetails = await detailsResponse.json();
      console.log('[Medical Letter] Patient details:', patientDetails);
      
      // Fill patient data into form
      fillPatientData(patientDetails.data, patientDetails.included);
      
      searchStatus.textContent = '✓ Patient loaded successfully';
      searchStatus.className = 'search-status success';
      
      // Clear status after 3 seconds
      setTimeout(() => {
        searchStatus.textContent = '';
        searchStatus.className = 'search-status';
      }, 3000);
      
    } catch (error) {
      console.error('[Medical Letter] Search error:', error);
      searchStatus.textContent = '✗ ' + error.message;
      searchStatus.className = 'search-status error';
    }
  }

  // Fill patient data from API response
  function fillPatientData(patientData, included = []) {
    const attrs = patientData.attributes;
    
    console.log('[Medical Letter] Filling patient data:', attrs);
    console.log('[Medical Letter] Included data:', included);
    
    // Patient name - API returns 'patient_name'
    const patientNameInput = document.getElementById('patientName');
    const patientName = attrs.patient_name || attrs.name || attrs.patientName || '';
    if (patientNameInput && patientName) {
      patientNameInput.value = patientName;
      console.log('[Medical Letter] Set patient name:', patientName);
    }
    
    // ID Card / National ID - API returns 'national_identification'
    const patientIdInput = document.getElementById('patientId');
    const idCard = attrs.national_identification || attrs['id-card'] || attrs.idCard || attrs.patientId || patientData.id || '';
    if (patientIdInput && idCard) {
      patientIdInput.value = idCard;
      console.log('[Medical Letter] Set patient ID:', idCard);
    }
    
    // Age and Sex - API returns 'birth_date' and 'gender'
    const patientAgeSexInput = document.getElementById('patientAgeSex');
    let ageSex = '';
    const birthDate = attrs.birth_date || attrs.dob || attrs['date-of-birth'] || attrs.birthDate;
    if (birthDate) {
      const age = calculateAge(birthDate);
      ageSex = age + ' years';
    }
    const gender = attrs.gender || attrs.sex || '';
    if (gender) {
      ageSex += (ageSex ? ' / ' : '') + gender;
    }
    if (patientAgeSexInput && ageSex) {
      patientAgeSexInput.value = ageSex;
      console.log('[Medical Letter] Set age/sex:', ageSex);
    }
    
    // Address - build from relationships (API structure: address -> island -> atoll)
    const patientAddressInput = document.getElementById('patientAddress');
    let address = '';
    
    if (included && included.length > 0) {
      const addressRel = patientData.relationships?.address?.data;
      if (addressRel) {
        const addressObj = included.find(item => item.type === 'addresses' && item.id === addressRel.id);
        if (addressObj) {
          // Add address line if available
          const addressLine1 = addressObj.attributes?.address_line_one || '';
          const addressLine2 = addressObj.attributes?.address_line_two || '';
          let addressParts = [];
          if (addressLine1) addressParts.push(addressLine1);
          if (addressLine2) addressParts.push(addressLine2);
          
          // Get island name
          const islandRel = addressObj.relationships?.island?.data;
          if (islandRel) {
            const island = included.find(item => item.type === 'islands' && item.id === islandRel.id);
            if (island) {
              const islandName = island.attributes.latin_name || island.attributes.name || '';
              if (islandName) addressParts.push(islandName);
              
              // Get atoll name
              const atollRel = island.relationships?.atoll?.data;
              if (atollRel) {
                const atoll = included.find(item => item.type === 'atolls' && item.id === atollRel.id);
                if (atoll) {
                  const atollCode = atoll.attributes?.english_code || atoll.attributes?.code || '';
                  const atollName = atoll.attributes?.english_name || atoll.attributes?.name || '';
                  const atollDisplay = atollCode || atollName;
                  if (atollDisplay) addressParts.push(atollDisplay);
                }
              }
            }
          }
          
          address = addressParts.join(', ');
        }
      }
    }
    
    // Fallback to simple address field
    if (!address && attrs.address) {
      address = attrs.address;
    }
    if (!address && attrs.island) {
      address = attrs.island;
    }
    
    if (patientAddressInput && address) {
      patientAddressInput.value = address;
      console.log('[Medical Letter] Set address:', address);
    }
    
    console.log('[Medical Letter] Patient data filled successfully');
  }

  // Load patient data from Vinavi page context
  async function loadPatientData() {
    try {
      // Try to get patient data from chrome.storage (set by content script)
      const result = await chrome.storage.local.get(['hmh_current_patient']);
      
      if (result.hmh_current_patient) {
        const patient = result.hmh_current_patient;
        console.log('[Medical Letter] Patient data loaded:', patient);
        
        document.getElementById('patientName').value = patient.name || '';
        document.getElementById('patientId').value = patient.idCard || patient.patientId || '';
        
        // Calculate age/sex
        let ageSex = '';
        if (patient.age) {
          ageSex = patient.age + ' years';
        } else if (patient.dob) {
          const age = calculateAge(patient.dob);
          ageSex = age + ' years';
        }
        if (patient.sex || patient.gender) {
          ageSex += ' / ' + (patient.sex || patient.gender);
        }
        document.getElementById('patientAgeSex').value = ageSex;
        
        document.getElementById('patientAddress').value = patient.address || patient.island || '';
      } else {
        console.log('[Medical Letter] No patient data in storage');
      }
    } catch (error) {
      console.error('[Medical Letter] Error loading patient data:', error);
    }
  }

  // Load doctor data from Vinavi auth
  async function loadDoctorData() {
    try {
      console.log('[Medical Letter] Loading doctor data...');

      // Load from chrome.storage first (fast + works even when Vinavi API doesn't return specialty)
      let stored = {};
      try {
        stored = await chrome.storage.local.get(['vinavi_doctor_name', 'vinavi_doctor_code', 'vinavi_doctor_specialty']);
      } catch (e) {
        console.warn('[Medical Letter] Could not read doctor data from storage:', e);
        stored = {};
      }

      const doctorNameInput = document.getElementById('doctorName');
      const doctorCodeInput = document.getElementById('doctorCode');
      const doctorSpecialtyInput = document.getElementById('doctorSpecialty');

      const storedName = String(stored.vinavi_doctor_name || '').trim();
      const storedCode = String(stored.vinavi_doctor_code || '').trim();
      const storedSpecialty = String(stored.vinavi_doctor_specialty || '').trim();

      if (storedName && doctorNameInput && (!doctorNameInput.value || doctorNameInput.value.trim() === '')) {
        doctorNameInput.value = storedName;
        const sig = document.getElementById('signatureName');
        if (sig) sig.textContent = 'Dr. ' + storedName;
        console.log('[Medical Letter] Doctor name loaded from storage:', storedName);
      }

      if (storedCode && doctorCodeInput && (!doctorCodeInput.value || doctorCodeInput.value.trim() === '')) {
        doctorCodeInput.value = storedCode;
        console.log('[Medical Letter] Doctor code loaded from storage:', storedCode);
      }

      // Specialty override should ALWAYS win when present
      if (storedSpecialty && doctorSpecialtyInput && (!doctorSpecialtyInput.value || doctorSpecialtyInput.value.trim() === '')) {
        doctorSpecialtyInput.value = storedSpecialty;
        const sig = document.getElementById('signatureSpecialty');
        if (sig) sig.textContent = formatConsultantSpecialty(storedSpecialty) || '[Specialty]';
        console.log('[Medical Letter] Doctor specialty loaded from storage:', storedSpecialty);
      }
      
      // First, try to fetch directly from Vinavi API using session cookies
      // The iframe should inherit the session from the parent Vinavi page

      // If the user has a stored/synced specialty, do NOT let API overwrite it.
      await fetchDoctorFromVinavi({ allowSpecialtyOverwrite: !storedSpecialty });
    } catch (error) {
      console.error('[Medical Letter] Error loading doctor data:', error);
    }
  }

  // Fetch doctor details from Vinavi API
  async function fetchDoctorFromVinavi(options = {}) {
    try {
      console.log('[Medical Letter] Fetching doctor profile from Vinavi API...');

      const allowSpecialtyOverwrite = options?.allowSpecialtyOverwrite !== false;
      
      // Use the same endpoint as dashboard - /api/users/authenticated with includes
      const response = await fetch('https://vinavi.aasandha.mv/api/users/authenticated?include=employee,professional.service-providers,professional.specialities,permissions,roles.permissions', {
        method: 'GET',
        credentials: 'include'
      });

      console.log('[Medical Letter] API response status:', response.status);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      console.log('[Medical Letter] Vinavi API response:', data);
      
      if (data.data) {
        const userAttrs = data.data.attributes;
        const included = data.included || [];
        
        // Get doctor name from user attributes
        const doctorName = userAttrs.full_name || userAttrs.name || '';
        console.log('[Medical Letter] Doctor name from API:', doctorName);
        
        // Get professional details from included data
        let registrationNumber = '';
        let specialty = '';
        let hospitalName = '';
        
        // Find professional data
        const professionalRel = data.data.relationships?.professional?.data;
        if (professionalRel) {
          console.log('[Medical Letter] Professional relationship found:', professionalRel);
          const professional = included.find(item => item.type === 'professionals' && item.id === professionalRel.id);
          if (professional) {
            console.log('[Medical Letter] Professional data:', professional);
            registrationNumber = professional.attributes.registration_number || professional.attributes.registrationNumber || '';
            console.log('[Medical Letter] Registration number from API:', registrationNumber);
            
            // Check for specialities in relationships
            const specialitiesRel = professional.relationships?.specialities?.data;
            if (specialitiesRel && specialitiesRel.length > 0) {
              const specialityObj = included.find(item => item.type === 'specialities' && item.id === specialitiesRel[0].id);
              if (specialityObj) {
                specialty = specialityObj.attributes.name || specialityObj.attributes.english_name || '';
                console.log('[Medical Letter] Specialty from API:', specialty);
              }
            }

            // Fallback: some environments return specialty directly on professional attributes
            if (!specialty) {
              specialty = professional.attributes?.specialty || professional.attributes?.['specialty-name'] || professional.attributes?.designation || '';
              if (specialty) console.log('[Medical Letter] Specialty from API (fallback attrs):', specialty);
            }
            
            // Get service provider (hospital) details
            const serviceProvidersRel = professional.relationships?.['service-providers']?.data;
            if (serviceProvidersRel && serviceProvidersRel.length > 0) {
              const serviceProvider = included.find(item => item.type === 'service-providers' && item.id === serviceProvidersRel[0].id);
              if (serviceProvider) {
                hospitalName = serviceProvider.attributes.name || '';
                console.log('[Medical Letter] Hospital from API:', hospitalName);
              }
            }
          }
        }
        
        // Update UI with fetched data
        if (doctorName) {
          document.getElementById('doctorName').value = doctorName;
          document.getElementById('signatureName').textContent = 'Dr. ' + doctorName;
          await chrome.storage.local.set({ vinavi_doctor_name: doctorName });
          console.log('[Medical Letter] ✓ Set doctor name:', doctorName);
        }
        
        if (registrationNumber) {
          document.getElementById('doctorCode').value = registrationNumber;
          await chrome.storage.local.set({ vinavi_doctor_code: registrationNumber });
          console.log('[Medical Letter] ✓ Set registration number:', registrationNumber);
        }
        
        if (specialty) {
          const input = document.getElementById('doctorSpecialty');
          const existing = (input?.value || '').trim();
          if (allowSpecialtyOverwrite || !existing) {
            if (input) input.value = specialty;
            const sig = document.getElementById('signatureSpecialty');
            if (sig) sig.textContent = formatConsultantSpecialty(specialty) || '[Specialty]';
            await chrome.storage.local.set({ vinavi_doctor_specialty: specialty });
            console.log('[Medical Letter] ✓ Set specialty:', specialty);
          } else {
            console.log('[Medical Letter] Specialty overwrite blocked by stored override');
          }
        }
        
        if (hospitalName) {
          // Only update hospital name if it's different from default
          if (hospitalName !== 'Hulhumale\' Hospital' && hospitalName !== 'Hulhumale Hospital') {
            document.getElementById('hospitalName').value = hospitalName;
          }
          console.log('[Medical Letter] ✓ Hospital:', hospitalName);
        }
        
        console.log('[Medical Letter] ✓ Doctor data successfully fetched and populated');
      }
    } catch (error) {
      console.error('[Medical Letter] Error fetching from Vinavi API:', error);
      console.error('[Medical Letter] Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
  }

  // Calculate age from date of birth
  function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Setup event listeners
  function setupEventListeners() {
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });

    // Update signature when specialty changes
    const doctorSpecialtyInput = document.getElementById('doctorSpecialty');
    if (doctorSpecialtyInput) {
      doctorSpecialtyInput.addEventListener('input', (e) => {
        doctorSpecialtyInput._userEdited = true;
        const el = document.getElementById('signatureSpecialty');
        if (el) el.textContent = formatConsultantSpecialty(e.target.value) || '[Specialty]';
      });
    }

    // If cloud sync pulls doctor details while this page is open, update the form.
    try {
      if (chrome?.storage?.onChanged && !setupEventListeners._storageWired) {
        chrome.storage.onChanged.addListener((changes, areaName) => {
          if (areaName !== 'local') return;

          const specialtyChange = changes?.vinavi_doctor_specialty;
          if (specialtyChange) {
            const newVal = String(specialtyChange.newValue || '').trim();
            const input = document.getElementById('doctorSpecialty');
            if (input && !input._userEdited) {
              if (!input.value || input.value.trim() === '') {
                input.value = newVal;
              }
              const sig = document.getElementById('signatureSpecialty');
              if (sig) sig.textContent = formatConsultantSpecialty(input.value) || '[Specialty]';
            }
          }
        });
        setupEventListeners._storageWired = true;
      }
    } catch (e) {
      console.warn('[Medical Letter] Could not wire storage change listener:', e);
    }

    // Update signature when doctor name changes
    const doctorNameInput = document.getElementById('doctorName');
    if (doctorNameInput) doctorNameInput.addEventListener('input', (e) => {
      const el = document.getElementById('signatureName');
      if (el) el.textContent = e.target.value ? 'Dr. ' + e.target.value : 'Dr. [Name]';
    });

    // Export Word (DOCX template-based)
    const exportWordBtn = document.getElementById('exportWordBtn');
    if (exportWordBtn) exportWordBtn.addEventListener('click', exportToDocxTemplate);
  }

  function formatConsultantSpecialty(value) {
    const specialty = String(value ?? '').trim();
    if (!specialty) return '';
    if (/^consultant\s+in\s+/i.test(specialty)) return specialty;
    return `Consultant in ${specialty}`;
  }

  function xmlEscape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function insertTextIntoParaId(documentXml, paraId, text) {
    const escaped = xmlEscape(text);
    const re = new RegExp(
      `(<w:p[^>]*w14:paraId="${paraId}"[^>]*>\\s*(?:<w:pPr>[\\s\\S]*?<\\/w:pPr>)?)(\\s*<\\/w:p>)`,
      'i'
    );

    if (!re.test(documentXml)) {
      throw new Error(`Template paragraph ${paraId} not found`);
    }

    return documentXml.replace(re, `$1<w:r><w:t xml:space="preserve">${escaped}</w:t></w:r>$2`);
  }

  function insertMultilineIntoParaId(documentXml, paraId, text) {
    const lines = String(text ?? '').split(/\r?\n/);

    const runParts = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line) {
        runParts.push(`<w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r>`);
      }
      if (i !== lines.length - 1) {
        runParts.push('<w:r><w:br/></w:r>');
      }
    }

    const runs = runParts.join('');

    const re = new RegExp(
      `(<w:p[^>]*w14:paraId="${paraId}"[^>]*>\\s*(?:<w:pPr>[\\s\\S]*?<\\/w:pPr>)?)(\\s*<\\/w:p>)`,
      'i'
    );

    if (!re.test(documentXml)) {
      throw new Error(`Template paragraph ${paraId} not found`);
    }

    return documentXml.replace(re, `$1${runs}$2`);
  }

  function insertRunXmlIntoParaId(documentXml, paraId, runXml) {
    const re = new RegExp(
      `(<w:p[^>]*w14:paraId="${paraId}"[^>]*>\\s*(?:<w:pPr>[\\s\\S]*?<\\/w:pPr>)?)(\\s*<\\/w:p>)`,
      'i'
    );

    if (!re.test(documentXml)) {
      throw new Error(`Template paragraph ${paraId} not found`);
    }

    return documentXml.replace(re, `$1${runXml}$2`);
  }

  function tryInsertRunXmlIntoParaId(documentXml, paraId, runXml) {
    try {
      return { ok: true, xml: insertRunXmlIntoParaId(documentXml, paraId, runXml) };
    } catch (e) {
      return { ok: false, xml: documentXml };
    }
  }

  function insertParagraphBeforeParaId(documentXml, beforeParaId, paragraphXml) {
    const re = new RegExp(`(<w:p[^>]*w14:paraId="${beforeParaId}"[^>]*>)`, 'i');
    if (!re.test(documentXml)) {
      throw new Error(`Template paragraph ${beforeParaId} not found`);
    }

    return documentXml.replace(re, `${paragraphXml}$1`);
  }

  function buildGreenSeparatorRunXml() {
    // Uses a long underscore line colored green.
    return `<w:r><w:rPr><w:color w:val="10B981"/></w:rPr><w:t xml:space="preserve">_______________________________________________</w:t></w:r>`;
  }

  function buildParagraphXml(text, { bold = false, italic = false, color = null } = {}) {
    const escaped = xmlEscape(text);
    const rPrParts = [];
    if (bold) rPrParts.push('<w:b/>');
    if (italic) rPrParts.push('<w:i/>');
    if (color) rPrParts.push(`<w:color w:val="${color}"/>`);
    const rPr = rPrParts.length ? `<w:rPr>${rPrParts.join('')}</w:rPr>` : '';
    return `<w:p><w:r>${rPr}<w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
  }

  function buildEmptyParagraphXml() {
    return '<w:p/>';
  }

  function buildMultilineParagraphXml(text) {
    const lines = String(text ?? '').split(/\r?\n/);
    const parts = ['<w:p>'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line) {
        parts.push(`<w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r>`);
      }
      if (i !== lines.length - 1) {
        parts.push('<w:r><w:br/></w:r>');
      }
    }

    parts.push('</w:p>');
    return parts.join('');
  }

  function injectFormattedDate(documentXml, formattedDate) {
    const re = /(<w:t xml:space="preserve">Date: <\/w:t>\s*<\/w:r>)/i;
    if (!re.test(documentXml)) {
      throw new Error('Template Date field not found');
    }
    return documentXml.replace(
      re,
      `$1<w:r><w:t xml:space="preserve">${xmlEscape(formattedDate)}</w:t></w:r>`
    );
  }

  function cleanupTrailingDocxBodyWhitespace(documentXml) {
    const sectIdx = documentXml.lastIndexOf('<w:sectPr');
    if (sectIdx === -1) return documentXml;

    // Find the <w:p ...> that contains the final <w:sectPr>.
    // Important: don't accidentally match <w:pPr> when searching for '<w:p'.
    const beforeSect = documentXml.slice(0, sectIdx);
    const lastOpenPWithSpace = beforeSect.lastIndexOf('<w:p ');
    const lastOpenPExact = beforeSect.lastIndexOf('<w:p>');
    const sectParaStart = Math.max(lastOpenPWithSpace, lastOpenPExact);

    const sectParaEnd = documentXml.indexOf('</w:p>', sectIdx);
    if (sectParaStart === -1 || sectParaEnd === -1) return documentXml;

    const sectParaXml = documentXml.slice(sectParaStart, sectParaEnd + 6);
    const tailXml = documentXml.slice(sectParaEnd + 6);

    let headXml = documentXml.slice(0, sectParaStart);

    const lastParaRe = /(\s*)(<w:p\b[\s\S]*?<\/w:p>|<w:p\s*\/>)\s*$/;

    function paragraphHasNonWhitespaceText(paraXml) {
      const matches = [...paraXml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)];
      if (matches.length === 0) return false;
      // Treat common “invisible” characters as whitespace too.
      const invisibleWsRe = /[\s\u200B\u200C\u200D\u2060\uFEFF]+/g;
      return matches.some((m) => String(m[1] ?? '').replace(invisibleWsRe, '').length > 0);
    }

    function paragraphHasNonTextContent(paraXml) {
      return /<w:(drawing|pict|tbl|object|fldChar|instrText)\b/i.test(paraXml);
    }

    function isRemovableTrailingParagraph(paraXml) {
      if (/<w:sectPr\b/i.test(paraXml)) return false;
      if (paragraphHasNonTextContent(paraXml)) return false;
      if (paragraphHasNonWhitespaceText(paraXml)) return false;

      // Remove empty paragraphs and those that only contain page breaks.
      return true;
    }

    // Strip trailing empty/page-break paragraphs right before the section paragraph.
    while (true) {
      const m = headXml.match(lastParaRe);
      if (!m) break;
      const paraXml = m[2];
      if (!isRemovableTrailingParagraph(paraXml)) break;
      headXml = headXml.slice(0, m.index) + (m[1] || '');
    }

    return headXml + sectParaXml + tailXml;
  }

  function removeEmptyParagraphsAfterBookmarkEnd(documentXml, bookmarkId) {
    const re = new RegExp(`<w:bookmarkEnd\\s+w:id="${bookmarkId}"\\s*\\/\\s*>`, 'i');
    const m = re.exec(documentXml);
    if (!m) return documentXml;

    const head = documentXml.slice(0, m.index + m[0].length);
    let tail = documentXml.slice(m.index + m[0].length);

    function paragraphHasNonWhitespaceText(paraXml) {
      const matches = [...paraXml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)];
      if (matches.length === 0) return false;
      const invisibleWsRe = /[\s\u200B\u200C\u200D\u2060\uFEFF]+/g;
      return matches.some((mm) => String(mm[1] ?? '').replace(invisibleWsRe, '').length > 0);
    }

    function paragraphHasNonTextContent(paraXml) {
      return /<w:(drawing|pict|tbl|object|fldChar|instrText)\b/i.test(paraXml);
    }

    function isEmptyPara(paraXml) {
      if (/<w:sectPr\b/i.test(paraXml)) return false;
      if (paragraphHasNonTextContent(paraXml)) return false;
      if (paragraphHasNonWhitespaceText(paraXml)) return false;
      return true;
    }

    // Remove consecutive empty paragraphs right after the bookmark end.
    // This template contains many styled-but-empty paragraphs which create large selectable whitespace / blank pages.
    for (let i = 0; i < 500; i++) {
      const paraMatch = tail.match(/^\s*(<w:p\b[\s\S]*?<\/w:p>|<w:p\s*\/>)\s*/i);
      if (!paraMatch) break;
      const paraXml = paraMatch[1];
      if (!isEmptyPara(paraXml)) break;
      tail = tail.slice(paraMatch[0].length);
    }

    return head + tail;
  }

  function buildBodyRunsXml(values) {
    const bodyText = String(values.letterBody ?? '');
    const lines = bodyText.split(/\r?\n/);

    const parts = [];

    // Green separator + Details heading, then a blank line
    parts.push(buildGreenSeparatorRunXml());
    parts.push('<w:r><w:br/></w:r>');
    parts.push(`<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Details</w:t></w:r>`);
    parts.push('<w:r><w:br/></w:r>');
    parts.push('<w:r><w:br/></w:r>');

    // Main body (preserve new lines)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line) {
        parts.push(`<w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r>`);
      }
      if (i !== lines.length - 1) {
        parts.push('<w:r><w:br/></w:r>');
      }
    }

    return parts.join('');
  }

  function buildClosingRunsXml() {
    return [
      '<w:r><w:br/></w:r>',
      '<w:r><w:br/></w:r>',
      '<w:r><w:t xml:space="preserve">Kindly do the needful</w:t></w:r>',
      '<w:r><w:br/></w:r>',
      '<w:r><w:t xml:space="preserve">Thank you</w:t></w:r>'
    ].join('');
  }

  function injectIntoMedicalLetterTemplate(documentXml, values) {
    let updated = documentXml;

    // 1) Date
    updated = injectFormattedDate(updated, values.formattedDate);

    // 2) Replace the dynamic blank region after the title with our generated content.
    // This is resilient across template edits (including footer fixes).
    const contentXmlParts = [];

    // Patient details
    contentXmlParts.push(buildParagraphXml(`Name: ${values.patientName}`));
    contentXmlParts.push(buildParagraphXml(`ID Number: ${values.patientId}`));
    contentXmlParts.push(buildParagraphXml(`Age / Sex: ${values.patientAgeSex}`));
    contentXmlParts.push(buildParagraphXml(`Address: ${values.patientAddress}`));
    contentXmlParts.push(buildEmptyParagraphXml());

    // Details section
    contentXmlParts.push(`<w:p>${buildGreenSeparatorRunXml()}</w:p>`);
    contentXmlParts.push(buildParagraphXml('Details', { bold: true }));
    contentXmlParts.push(buildEmptyParagraphXml());
    contentXmlParts.push(buildMultilineParagraphXml(values.letterBody));
    contentXmlParts.push(buildEmptyParagraphXml());

    // Closing
    contentXmlParts.push(buildParagraphXml('Kindly do the needful'));
    contentXmlParts.push(buildParagraphXml('Thank you'));
    contentXmlParts.push(buildEmptyParagraphXml());

    // Signature section
    contentXmlParts.push(`<w:p>${buildGreenSeparatorRunXml()}</w:p>`);
    contentXmlParts.push(buildParagraphXml(`Dr. ${values.doctorName}`));
    if (values.doctorCode) contentXmlParts.push(buildParagraphXml(`Registration No: ${values.doctorCode}`));
    if (values.doctorSpecialty) contentXmlParts.push(buildParagraphXml(formatConsultantSpecialty(values.doctorSpecialty)));
    if (values.hospitalName) contentXmlParts.push(buildParagraphXml(values.hospitalName));

    const insertedXml = contentXmlParts.join('');

    const regionRe = /(<w:p[\s\S]*?<w:t>TO WHOM IT MAY CONCERN<\/w:t>[\s\S]*?<\/w:p>)([\s\S]*?)(<w:bookmarkEnd w:id="0"\s*\/>)/i;
    if (!regionRe.test(updated)) {
      throw new Error('Template dynamic region not found (TO WHOM IT MAY CONCERN → bookmarkEnd)');
    }
    updated = updated.replace(regionRe, `$1${insertedXml}$3`);

    // Remove template's empty placeholder block after the bookmark.
    updated = removeEmptyParagraphsAfterBookmarkEnd(updated, 0);

    // Template files sometimes contain many blank paragraphs/page breaks after the signature.
    // Strip those so exports don't end up with huge whitespace or a blank extra page.
    updated = cleanupTrailingDocxBodyWhitespace(updated);

    return updated;
  }

  // Export to DOCX using the provided template
  async function exportToDocxTemplate() {
    try {
      const loadingOverlay = document.getElementById('loadingOverlay');
      const loadingMessage = document.getElementById('loadingMessage');
      
      if (loadingOverlay && loadingMessage) {
        loadingMessage.textContent = 'Generating DOCX from template...';
        loadingOverlay.style.display = 'flex';
      }

      if (typeof JSZip === 'undefined') {
        throw new Error('JSZip library not loaded. Please refresh and try again.');
      }

      const patientName = document.getElementById('patientName').value || 'Patient';
      const patientId = document.getElementById('patientId').value || '';
      const patientAgeSex = document.getElementById('patientAgeSex').value || '';
      const patientAddress = document.getElementById('patientAddress').value || '';
      const letterBody = document.getElementById('letterBody').value || '';
      const doctorName = document.getElementById('doctorName').value || '';
      const doctorCode = document.getElementById('doctorCode').value || '';
      const doctorSpecialty = document.getElementById('doctorSpecialty').value || '';
      const hospitalName = document.getElementById('hospitalName')?.value || 'Hulhumale Hospital';

      const letterDate = document.getElementById('letterDate').value || '';
      const formattedDate = letterDate
        ? new Date(letterDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

      // Load template DOCX (bundled with extension)
      const templateRes = await fetch('medical-letter-template.docx');
      if (!templateRes.ok) {
        throw new Error('Template DOCX not found (medical-letter-template.docx)');
      }
      const templateBuf = await templateRes.arrayBuffer();

      const zip = await JSZip.loadAsync(templateBuf);
      const docPath = 'word/document.xml';
      const docFile = zip.file(docPath);
      if (!docFile) {
        throw new Error('Invalid template: word/document.xml missing');
      }

      const documentXml = await docFile.async('string');
      const updatedXml = injectIntoMedicalLetterTemplate(documentXml, {
        formattedDate,
        patientName,
        patientId,
        patientAgeSex,
        patientAddress,
        letterBody,
        doctorName,
        doctorCode,
        doctorSpecialty,
        hospitalName
      });

      zip.file(docPath, updatedXml);

      const outBlob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      const url = URL.createObjectURL(outBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Medical_Letter_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
      link.click();
      URL.revokeObjectURL(url);

      if (loadingOverlay) loadingOverlay.style.display = 'none';
      showToast('DOCX downloaded successfully!');
    } catch (error) {
      console.error('[Medical Letter] Export to DOCX error:', error);
      const loadingOverlay = document.getElementById('loadingOverlay');
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
      showToast('Error exporting to DOCX: ' + error.message, 'error');
    }
  }

  // Export to PDF (using html2pdf library)
  async function exportToPdf() {
    try {
      // Check if html2pdf is available
      if (typeof html2pdf === 'undefined') {
        showToast('PDF library not loaded. Please refresh the page and try again.', 'error');
        console.error('[Medical Letter] html2pdf library not found');
        return;
      }
      
      const loadingOverlay = document.getElementById('loadingOverlay');
      const loadingMessage = document.getElementById('loadingMessage');
      
      if (loadingOverlay && loadingMessage) {
        loadingMessage.textContent = 'Generating PDF...';
        loadingOverlay.style.display = 'flex';
      }
      
      const patientName = document.getElementById('patientName').value || 'Patient';
      
      // Clone the letter preview for PDF generation
      const element = document.getElementById('letterPreview');
      const clone = element.cloneNode(true);

      // Remove editor-only elements for export
      const editorOnlyEls = clone.querySelectorAll('.editor-only');
      editorOnlyEls.forEach(el => el.remove());
      
      // Replace input fields with their values for the PDF
      const inputs = clone.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        if (input.tagName.toLowerCase() === 'textarea') {
          const div = document.createElement('div');
          div.textContent = input.value || '';
          div.style.cssText = 'white-space: pre-wrap; padding: 2px 0; font-family: inherit; font-size: inherit; line-height: inherit;';
          input.parentNode.replaceChild(div, input);
          return;
        }

        const span = document.createElement('span');
        span.textContent = input.value || '';
        span.style.cssText = 'display: inline-block; padding: 2px 0; font-family: inherit; font-size: inherit;';
        input.parentNode.replaceChild(span, input);
      });
      
      // Configure PDF options
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `Medical_Letter_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Generate PDF
      await html2pdf().set(opt).from(clone).save();
      
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
      
      showToast('PDF generated successfully!');
    } catch (error) {
      console.error('[Medical Letter] PDF export error:', error);
      const loadingOverlay = document.getElementById('loadingOverlay');
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
      showToast('Error generating PDF: ' + error.message, 'error');
    }
  }

  // Show toast notification
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10001;
      font-size: 14px;
      font-weight: 500;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
})();
