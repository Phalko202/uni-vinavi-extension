/**
 * General Bundles - Medicine and Advice Templates
 * Allows creating reusable bundles that can be pushed to Vinavi
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'vinavi_general_bundles';
  let generalBundles = [];
  let currentEditingBundle = null;
  let selectedMedicines = [];
  let medicineSearchTimeout = null;

  // Initialize
  function init() {
    loadBundles();
    renderBundlesList();
    attachEventListeners();
  }

  // Load bundles from localStorage
  function loadBundles() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      generalBundles = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading general bundles:', error);
      generalBundles = [];
    }
  }

  // Save bundles to localStorage
  function saveBundles() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(generalBundles));
    } catch (error) {
      console.error('Error saving general bundles:', error);
      alert('Failed to save bundles. Please try again.');
    }
  }

  // Render bundles list
  function renderBundlesList() {
    const container = document.getElementById('gbBundlesList');
    const emptyState = document.getElementById('gbEmptyState');

    if (!container) return;

    if (generalBundles.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = generalBundles.map((bundle, index) => {
      const medicineCount = bundle.medicines ? bundle.medicines.length : 0;
      const adviceCount = bundle.advice ? bundle.advice.split('\n').filter(line => line.trim()).length : 0;
      const lastModified = bundle.lastModified ? new Date(bundle.lastModified).toLocaleDateString() : 'Unknown';

      return `
        <div class="gb-bundle-card" data-bundle-index="${index}">
          <div class="gb-bundle-card-header">
            <div>
              <div class="gb-bundle-card-title">${escapeHtml(bundle.name)}</div>
              <div class="gb-bundle-card-meta">Modified: ${lastModified}</div>
            </div>
          </div>
          <div class="gb-bundle-card-content">
            <div class="gb-bundle-stats">
              <div class="gb-stat">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 3h10v10H3z" opacity="0.3"/>
                  <circle cx="8" cy="8" r="2"/>
                </svg>
                <span>${medicineCount} medicine${medicineCount !== 1 ? 's' : ''}</span>
              </div>
              <div class="gb-stat">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 2h10v12H3z" opacity="0.3"/>
                </svg>
                <span>${adviceCount} advice point${adviceCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <div class="gb-bundle-card-actions">
            <button class="gb-action-btn primary gb-use-btn" data-bundle-index="${index}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Use Bundle
            </button>
            <button class="gb-action-btn gb-edit-btn" data-bundle-index="${index}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                <path d="M11 1l2 2-8 8H3v-2l8-8z"/>
              </svg>
              Edit
            </button>
            <button class="gb-action-btn danger gb-delete-btn" data-bundle-index="${index}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style="display: inline-block; vertical-align: middle;">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners
    container.querySelectorAll('.gb-use-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.bundleIndex);
        useBundle(index);
      });
    });

    container.querySelectorAll('.gb-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.bundleIndex);
        editBundle(index);
      });
    });

    container.querySelectorAll('.gb-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.bundleIndex);
        deleteBundle(index);
      });
    });
  }

  // Use bundle (push to Vinavi)
  function useBundle(index) {
    const bundle = generalBundles[index];
    if (!bundle) return;

    // Check if patient is selected
    if (!window.currentPatient || !window.currentEpisodeId) {
      alert('Please select a patient and episode first from the Search Patient view.');
      return;
    }

    if (confirm(`Apply "${bundle.name}" to current patient episode?`)) {
      pushBundleToVinavi(bundle);
    }
  }

  // Push bundle to Vinavi
  async function pushBundleToVinavi(bundle) {
    if (!window.currentEpisodeId) {
      alert('No episode selected. Please select a patient episode first.');
      return;
    }

    const results = {
      medicines: { success: 0, failed: 0 },
      advice: { success: 0, failed: 0 }
    };

    // Push medicines
    if (bundle.medicines && bundle.medicines.length > 0) {
      for (const medicine of bundle.medicines) {
        try {
          await pushMedicineToVinavi(medicine);
          results.medicines.success++;
        } catch (error) {
          console.error('Failed to push medicine:', medicine.name, error);
          results.medicines.failed++;
        }
      }
    }

    // Push advice
    if (bundle.advice && bundle.advice.trim()) {
      const adviceLines = bundle.advice.split('\n').filter(line => line.trim());
      for (const advice of adviceLines) {
        try {
          await pushAdviceToVinavi(advice.trim());
          results.advice.success++;
        } catch (error) {
          console.error('Failed to push advice:', advice, error);
          results.advice.failed++;
        }
      }
    }

    // Show results
    const message = `
      Bundle "${bundle.name}" applied:
      
      Medicines: ${results.medicines.success} succeeded, ${results.medicines.failed} failed
      Advice: ${results.advice.success} succeeded, ${results.advice.failed} failed
    `;
    
    alert(message);

    // Refresh episode if dashboard function exists
    if (typeof window.refreshCurrentEpisode === 'function') {
      window.refreshCurrentEpisode();
    }
  }

  // Push medicine to Vinavi
  async function pushMedicineToVinavi(medicine) {
    console.log('[GB] Pushing medicine to Vinavi:', medicine);
    
    // Vinavi expects the medicine ID as a string
    const medicineId = String(medicine.vinaviId || medicine.id);
    
    const medicineData = {
      data: {
        type: 'prescriptions',
        attributes: {
          instructions: medicine.instructions || '',
          quantity: 1
        },
        relationships: {
          medicine: {
            data: {
              type: 'medicines',
              id: medicineId
            }
          }
        }
      }
    };

    console.log('[GB] Medicine payload:', JSON.stringify(medicineData, null, 2));

    const response = await fetch(`https://api.aasandha.mv/episodes/${window.currentEpisodeId}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
      },
      credentials: 'include',
      body: JSON.stringify(medicineData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GB] Failed to push prescription:', response.status, errorText);
      throw new Error(`Failed to push medicine: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[GB] Medicine pushed successfully:', result);
    return result;
  }

  // Push advice to Vinavi
  async function pushAdviceToVinavi(adviceText) {
    console.log('[GB] Pushing advice to Vinavi:', adviceText);
    
    const adviceData = {
      data: {
        type: 'advices',
        attributes: {
          advice: adviceText
        }
      }
    };

    console.log('[GB] Advice payload:', JSON.stringify(adviceData, null, 2));

    const response = await fetch(`https://api.aasandha.mv/episodes/${window.currentEpisodeId}/advices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
      },
      credentials: 'include',
      body: JSON.stringify(adviceData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GB] Failed to push advice:', response.status, errorText);
      throw new Error(`Failed to push advice: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[GB] Advice pushed successfully:', result);
    return result;
  }

  // Edit bundle
  function editBundle(index) {
    const bundle = generalBundles[index];
    if (!bundle) return;

    currentEditingBundle = index;
    selectedMedicines = Array.isArray(bundle.medicines) ? [...bundle.medicines] : [];

    // Open modal
    openBundleModal();

    // Populate form
    document.getElementById('gbBundleName').value = bundle.name || '';
    document.getElementById('gbAdviceInput').value = bundle.advice || '';
    document.getElementById('gbModalTitle').textContent = 'Edit General Bundle';

    // Render selected medicines
    renderSelectedMedicines();
  }

  // Delete bundle
  function deleteBundle(index) {
    const bundle = generalBundles[index];
    if (!bundle) return;

    if (confirm(`Delete bundle "${bundle.name}"?`)) {
      generalBundles.splice(index, 1);
      saveBundles();
      renderBundlesList();
    }
  }

  // Open bundle modal
  function openBundleModal() {
    const modal = document.getElementById('generalBundleModal');
    if (modal) {
      modal.classList.remove('hidden');
      resetModalForm();
    }
  }

  // Close bundle modal
  function closeBundleModal() {
    const modal = document.getElementById('generalBundleModal');
    if (modal) {
      modal.classList.add('hidden');
      currentEditingBundle = null;
      selectedMedicines = [];
      resetModalForm();
    }
  }

  // Reset modal form
  function resetModalForm() {
    document.getElementById('gbBundleName').value = '';
    document.getElementById('gbAdviceInput').value = '';
    document.getElementById('gbMedicineSearch').value = '';
    document.getElementById('gbMedicineSearchResults').innerHTML = '';
    document.getElementById('gbModalTitle').textContent = 'Create General Bundle';
    switchToTab('medicines');
    renderSelectedMedicines();
  }

  // Switch tabs
  function switchToTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.gb-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      }
    });

    // Update tab contents
    document.querySelectorAll('.gb-tab-content').forEach(content => {
      content.classList.remove('active');
    });

    const activeContent = document.getElementById(`gb${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`);
    if (activeContent) {
      activeContent.classList.add('active');
    }
  }

  // Search medicines from Vinavi API
  async function searchMedicines(query) {
    if (!query || query.length < 2) {
      const resultsContainer = document.getElementById('gbMedicineSearchResults');
      resultsContainer.innerHTML = `
        <div class="gb-search-empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor">
            <circle cx="20" cy="20" r="16" stroke-width="2"/>
            <path d="M32 32l12 12" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>Type at least 2 characters to search</p>
        </div>
      `;
      return;
    }

    const resultsContainer = document.getElementById('gbMedicineSearchResults');
    resultsContainer.innerHTML = `
      <div class="gb-search-loading">
        <div class="spinner"></div>
        <p>Searching medicines...</p>
      </div>
    `;

    try {
      // Use the correct API endpoint with proper headers to avoid 406
      const response = await fetch(`https://api.aasandha.mv/medicines?filter[is_active]=true&filter[name]=${encodeURIComponent(query)}&page[size]=25&sort=-created_at`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        console.error('Medicine search failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('Medicine search results:', data);
      
      // Filter medicines: products first, then prescribable generics
      const medicines = data.data || [];
      const productMedicines = medicines.filter(m => m.attributes && m.attributes.type === 'product');
      const genericMedicines = medicines.filter(m => m.attributes && m.attributes.type === 'generic' && m.attributes.is_prescribable);
      
      const filteredResults = [...productMedicines, ...genericMedicines];
      
      if (filteredResults.length === 0) {
        resultsContainer.innerHTML = `
          <div class="gb-search-empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor">
              <circle cx="24" cy="24" r="20" stroke-width="2"/>
              <path d="M24 16v16M16 24h16" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p>No medicines found for "${escapeHtml(query)}"</p>
            <small>Try a different search term</small>
          </div>
        `;
      } else {
        renderMedicineSearchResults(filteredResults);
      }
    } catch (error) {
      console.error('Medicine search error:', error);
      resultsContainer.innerHTML = `
        <div class="gb-search-error">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor">
            <circle cx="24" cy="24" r="20" stroke-width="2"/>
            <path d="M24 14v14M24 34v2" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>Failed to search medicines</p>
          <small>Please ensure you're logged into Vinavi</small>
          <small style="color: #9ca3af; margin-top: 8px;">${error.message}</small>
        </div>
      `;
    }
  }

  // Render medicine search results
  function renderMedicineSearchResults(medicines) {
    const container = document.getElementById('gbMedicineSearchResults');
    
    container.innerHTML = `
      <div class="gb-search-results-header">
        <span class="result-count">${medicines.length} medicine${medicines.length !== 1 ? 's' : ''} found</span>
      </div>
      <div class="gb-search-results-list">
        ${medicines.map((med, index) => {
          const attrs = med.attributes;
          const name = attrs.name || 'Unknown';
          const strength = attrs.strength || '';
          const preparation = attrs.preparation || '';
          const code = attrs.code || '';
          const type = attrs.type || 'product';
          const genericName = attrs.generic_medicine_name || attrs.name;
          const mfdaCode = attrs.mfda_code || '';

          // Icon based on type
          const icon = type === 'product' 
            ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="#10b981"><circle cx="10" cy="10" r="8" opacity="0.2"/><path d="M10 6v8M6 10h8" stroke="#10b981" stroke-width="2" stroke-linecap="round"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 20 20" fill="#6b7280"><circle cx="10" cy="10" r="8" opacity="0.2"/></svg>';

          const badge = type === 'product' 
            ? '<span class="med-badge med-badge-brand">Brand</span>'
            : '<span class="med-badge med-badge-generic">Generic</span>';

          return `
            <div class="gb-search-result-card" data-medicine='${JSON.stringify(med).replace(/'/g, '&apos;')}' data-index="${index}">
              <div class="med-card-icon">${icon}</div>
              <div class="med-card-content">
                <div class="med-card-header">
                  <span class="med-card-name">${escapeHtml(name)}</span>
                  ${badge}
                </div>
                <div class="med-card-generic">${escapeHtml(genericName)}</div>
                <div class="med-card-details">
                  ${strength ? `<span><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.5"/></svg>${escapeHtml(strength)}</span>` : ''}
                  ${preparation ? `<span><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="5" opacity="0.3"/></svg>${escapeHtml(preparation)}</span>` : ''}
                  ${code ? `<span class="med-code">${escapeHtml(code)}</span>` : ''}
                  ${mfdaCode ? `<span class="med-code-mfda">${escapeHtml(mfdaCode)}</span>` : ''}
                </div>
              </div>
              <div class="med-card-action">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 5v10M5 10h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Attach click listeners
    container.querySelectorAll('.gb-search-result-card').forEach(item => {
      item.addEventListener('click', () => {
        const medicineData = JSON.parse(item.dataset.medicine);
        addMedicine(medicineData);
        
        // Visual feedback
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.transform = '';
        }, 150);
      });
    });
  }

  // Add medicine to selection
  function addMedicine(medicineData) {
    const attrs = medicineData.attributes;
    
    const medicine = {
      id: medicineData.id,
      vinaviId: medicineData.id,
      code: attrs.code || '',
      name: attrs.name || 'Unknown',
      generic: attrs.generic_medicine_name || attrs.name,
      strength: attrs.strength || '',
      preparation: attrs.preparation || '',
      type: attrs.type || 'product',
      genericId: attrs.generic_id || null,
      instructions: ''
    };

    // Check if already added
    if (selectedMedicines.some(m => m.vinaviId === medicine.vinaviId)) {
      alert('This medicine is already added');
      return;
    }

    selectedMedicines.push(medicine);
    renderSelectedMedicines();
    
    // Clear search
    document.getElementById('gbMedicineSearch').value = '';
    document.getElementById('gbMedicineSearchResults').innerHTML = '';
  }

  // Render selected medicines
  function renderSelectedMedicines() {
    const container = document.getElementById('gbMedicinesList');
    const countElement = document.getElementById('gbMedicineCount');

    if (countElement) {
      countElement.textContent = selectedMedicines.length;
    }

    if (selectedMedicines.length === 0) {
      container.innerHTML = `
        <div class="gb-empty-state">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#e5e7eb" stroke-width="2"/>
            <path d="M24 16v16M16 24h16" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>No medicines added yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = selectedMedicines.map((medicine, index) => `
      <div class="gb-medicine-item">
        <div class="gb-medicine-item-header">
          <div>
            <div class="gb-medicine-item-name">${escapeHtml(medicine.name)}</div>
            <div class="gb-medicine-item-generic">${escapeHtml(medicine.generic)}</div>
            <div class="gb-medicine-item-details">
              ${medicine.strength} ${medicine.preparation}${medicine.code ? ` • ${medicine.code}` : ''}
            </div>
          </div>
          <button class="gb-medicine-remove-btn" data-index="${index}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="gb-medicine-instructions">
          <label>Dosage Instructions</label>
          <textarea data-index="${index}" placeholder="e.g., Take 1 tablet twice daily after meals">${escapeHtml(medicine.instructions || '')}</textarea>
        </div>
      </div>
    `).join('');

    // Attach remove listeners
    container.querySelectorAll('.gb-medicine-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        selectedMedicines.splice(index, 1);
        renderSelectedMedicines();
      });
    });

    // Attach instruction update listeners
    container.querySelectorAll('textarea').forEach(textarea => {
      textarea.addEventListener('input', () => {
        const index = parseInt(textarea.dataset.index);
        if (selectedMedicines[index]) {
          selectedMedicines[index].instructions = textarea.value;
        }
      });
    });
  }

  // Save bundle
  function saveBundle() {
    const name = document.getElementById('gbBundleName').value.trim();
    const advice = document.getElementById('gbAdviceInput').value.trim();

    if (!name) {
      alert('Please enter a bundle name');
      return;
    }

    const bundle = {
      name: name,
      medicines: selectedMedicines,
      advice: advice,
      lastModified: new Date().toISOString()
    };

    if (currentEditingBundle !== null) {
      // Update existing
      generalBundles[currentEditingBundle] = bundle;
    } else {
      // Create new
      generalBundles.push(bundle);
    }

    saveBundles();
    renderBundlesList();
    closeBundleModal();
  }

  // Export bundles
  function exportBundles() {
    if (generalBundles.length === 0) {
      alert('No bundles to export');
      return;
    }

    const dataStr = JSON.stringify(generalBundles, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `general-bundles-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Import bundles
  function importBundles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (!Array.isArray(imported)) {
            throw new Error('Invalid format');
          }

          if (confirm(`Import ${imported.length} bundle(s)? This will add to your existing bundles.`)) {
            generalBundles.push(...imported);
            saveBundles();
            renderBundlesList();
            alert('Bundles imported successfully!');
          }
        } catch (error) {
          alert('Failed to import bundles. Please check the file format.');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  // Attach event listeners
  function attachEventListeners() {
    // Create buttons
    const createBtns = ['gbCreateNewBtn', 'gbCreateFirstBtn'];
    createBtns.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          currentEditingBundle = null;
          selectedMedicines = [];
          openBundleModal();
        });
      }
    });

    // Modal close
    const closeBtn = document.getElementById('closeGeneralBundleModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeBundleModal);
    }

    // Cancel button
    const cancelBtn = document.getElementById('gbCancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeBundleModal);
    }

    // Save button
    const saveBtn = document.getElementById('gbSaveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveBundle);
    }

    // Tab switching
    document.querySelectorAll('.gb-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        switchToTab(tab.dataset.tab);
      });
    });

    // Medicine search
    const searchInput = document.getElementById('gbMedicineSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(medicineSearchTimeout);
        medicineSearchTimeout = setTimeout(() => {
          searchMedicines(e.target.value);
        }, 300);
      });
    }

    // Advice templates
    document.querySelectorAll('.gb-template-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const template = btn.dataset.template;
        const textarea = document.getElementById('gbAdviceInput');
        if (textarea) {
          const current = textarea.value.trim();
          textarea.value = current ? current + '\n' + template : template;
        }
      });
    });

    // Export/Import
    const exportBtn = document.getElementById('gbExportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportBundles);
    }

    const importBtn = document.getElementById('gbImportBtn');
    if (importBtn) {
      importBtn.addEventListener('click', importBundles);
    }

    // Close modal on overlay click
    const modal = document.getElementById('generalBundleModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeBundleModal();
        }
      });
    }
  }

  // Helper function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for external use
  window.GeneralBundles = {
    refresh: renderBundlesList,
    loadBundles: loadBundles
  };
})();
