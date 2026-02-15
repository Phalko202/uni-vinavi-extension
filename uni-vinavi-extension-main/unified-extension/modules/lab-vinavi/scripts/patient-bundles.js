/**
 * Patient-Specific Bundles (Simplified)
 * Uses the existing set builder modal - just marks bundles as patient-specific.
 * 
 * Data shape in localStorage (PATIENT_BUNDLES_KEY):
 * {
 *   "A341510": {
 *     patientName: "Abdulla Faalih",
 *     bundles: [
 *       { id, name, createdAt, tests: [{code,asnd,name,vinaviServiceId}] }
 *     ]
 *   }
 * }
 */

(function () {
  'use strict';

  // ---- state ----
  let _pbCurrentPatient = null;   // { id, name, nationalId }

  // ---- helpers ----
  function esc(s) {
    return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function genId() {
    return 'pb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---- storage (re-use helpers from packages.js) ----
  function getData() {
    return (typeof loadPatientBundles === 'function') ? loadPatientBundles() : {};
  }
  function persist(data) {
    if (typeof savePatientBundles === 'function') savePatientBundles(data);
    if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
  }
  function getPatientEntry(nationalId) {
    const data = getData();
    return data[nationalId] || null;
  }
  function getPatientBundles(nationalId) {
    const entry = getPatientEntry(nationalId);
    return entry ? (entry.bundles || []) : [];
  }
  function setPatientBundles(nationalId, patientName, bundles) {
    const data = getData();
    data[nationalId] = { patientName: patientName || nationalId, bundles };
    persist(data);
    window._patientBundles = data;
  }

  // ---- patient search ----
  async function searchPatient() {
    const input = document.getElementById('pbPatientSearch');
    const status = document.getElementById('pbSearchStatus');
    const q = (input?.value || '').trim();
    if (!q) { status.textContent = 'Enter a search term'; return; }

    status.textContent = 'Searching...';
    status.style.color = '#2563eb';

    try {
      const res = await fetch(`https://vinavi.aasandha.mv/api/patients/search/${encodeURIComponent(q)}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Patient not found');
      const json = await res.json();
      if (!json.data || !json.data.id) throw new Error('Invalid response');

      const pid = json.data.id;
      const detRes = await fetch(`https://vinavi.aasandha.mv/api/patients/${pid}?include=address.island.atoll`, { credentials: 'include' });
      if (!detRes.ok) throw new Error('Could not fetch details');
      const det = await detRes.json();
      const attrs = det.data.attributes;

      const nationalId = attrs.national_identification || attrs['id-card'] || det.data.id || '';
      const name = attrs.patient_name || attrs.name || '';

      _pbCurrentPatient = { id: det.data.id, name, nationalId };

      // show card
      const card = document.getElementById('pbPatientCard');
      if (card) card.style.display = '';
      const av = document.getElementById('pbPatientAvatar');
      if (av) av.textContent = name.charAt(0).toUpperCase() || '?';
      const nm = document.getElementById('pbPatientName');
      if (nm) nm.textContent = name;
      const meta = document.getElementById('pbPatientMeta');
      if (meta) meta.textContent = `ID: ${nationalId}`;

      renderPatientBundles();
      status.textContent = '';
    } catch (err) {
      status.textContent = '✗ ' + err.message;
      status.style.color = '#dc2626';
    }
  }

  function renderPatientBundles() {
    const list = document.getElementById('pbBundlesList');
    if (!list || !_pbCurrentPatient) return;

    const bundles = getPatientBundles(_pbCurrentPatient.nationalId);
    if (bundles.length === 0) {
      list.innerHTML = '<div class="empty-state">No bundles yet. Create one to get started!</div>';
      return;
    }

    list.innerHTML = bundles.map(b => buildBundleCardHTML(b)).join('');
    list.querySelectorAll('.pb-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        const id = btn.dataset.id;
        handlePatientBundleAction(act, id);
      });
    });
  }

  function buildBundleCardHTML(b) {
    const count = (b.tests || []).length;
    return `
    <div class="bundle-card" data-bundle-id="${b.id}">
      <div class="bundle-card-glow"></div>
      <div class="bundle-head">
        <div class="bundle-title-section">
          <div class="bundle-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 2v2H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-2V2H9z" fill="currentColor" opacity="0.3"/>
              <rect x="8" y="1" width="8" height="3" rx="1" fill="currentColor"/>
              <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <strong class="bundle-name">${esc(b.name)}</strong>
            <span class="bundle-count">${count} test${count !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
      <div class="bundle-actions">
        <button class="bundle-btn view-detail pb-action" data-act="view" data-id="${b.id}" title="View tests">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3C4.5 3 1.5 5.5 0 8c1.5 2.5 4.5 5 8 5s6.5-2.5 8-5c-1.5-2.5-4.5-5-8-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          View
        </button>
        <button class="bundle-btn edit pb-action" data-act="edit" data-id="${b.id}" title="Edit">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.146 1.146a.5.5 0 01.708 0l2 2a.5.5 0 010 .708l-9 9a.5.5 0 01-.168.11l-3 1a.5.5 0 01-.65-.65l1-3a.5.5 0 01.11-.168l9-9z"/>
          </svg>
          Edit
        </button>
        <button class="bundle-btn delete pb-action" data-act="delete" data-id="${b.id}" title="Delete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 1a.5.5 0 01.5.5V2h4v-.5a.5.5 0 011 0V2h1.5a.5.5 0 010 1h-.5v10a2 2 0 01-2 2H6a2 2 0 01-2-2V3h-.5a.5.5 0 010-1H5v-.5a.5.5 0 01.5-.5zM6 3v10a1 1 0 001 1h4a1 1 0 001-1V3H6zm2.5 2a.5.5 0 01.5.5v6a.5.5 0 01-1 0v-6a.5.5 0 01.5-.5zm2 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0v-6a.5.5 0 01.5-.5z"/>
          </svg>
          Delete
        </button>
      </div>
    </div>`;
  }

  function handlePatientBundleAction(act, id) {
    if (!_pbCurrentPatient) return;
    const bundles = getPatientBundles(_pbCurrentPatient.nationalId);
    const idx = bundles.findIndex(b => b.id === id);
    if (idx === -1) return;

    if (act === 'view') {
      const b = bundles[idx];
      const items = b.tests.map(t => `<li style="padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${esc(t.name || t.code)} <span style="color:#9ca3af;">(ASND: ${esc(t.asnd || 'N/A')})</span></li>`).join('');
      const overlay = document.createElement('div');
      overlay.className = 'bundle-picker-overlay';
      overlay.innerHTML = `
        <div class="bundle-picker-card" style="max-width:600px;">
          <div class="bundle-picker-header"><h3>${esc(b.name)}</h3><button class="bundle-picker-close">&times;</button></div>
          <div style="padding:24px;"><ul style="list-style:none;padding:0;margin:0;">${items || '<li style="color:#9ca3af;text-align:center;padding:20px;">No tests</li>'}</ul></div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('.bundle-picker-close').addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    }

    if (act === 'delete') {
      if (!confirm(`Delete bundle "${bundles[idx].name}"?`)) return;
      bundles.splice(idx, 1);
      setPatientBundles(_pbCurrentPatient.nationalId, _pbCurrentPatient.name, bundles);
      renderPatientBundles();
      if (typeof showToast === 'function') showToast('Patient bundle deleted', 'success');
    }

    if (act === 'edit') {
      const b = bundles[idx];
      openPatientBundleEditor(b);
    }
  }

  function openPatientBundleEditor(bundle) {
    if (!_pbCurrentPatient) return;
    if (!bundle) return;

    window._creatingPatientBundle = {
      nationalId: _pbCurrentPatient.nationalId,
      patientName: _pbCurrentPatient.name,
      editingBundleId: bundle.id,
      editingBundleName: bundle.name,
      prefillLabs: Array.isArray(bundle.tests) ? bundle.tests : []
    };

    if (typeof openSetBuilder === 'function') {
      openSetBuilder();
    } else if (typeof showToast === 'function') {
      showToast('Set Builder is not available', 'error');
    }
  }

  // ---- create bundle - just opens the existing set builder ----
  function openPatientBundleCreator() {
    if (!_pbCurrentPatient) {
      if (typeof showToast === 'function') showToast('Please search for a patient first', 'error');
      return;
    }
    
    // Set global flag so set builder knows we're creating a patient bundle
    window._creatingPatientBundle = {
      nationalId: _pbCurrentPatient.nationalId,
      patientName: _pbCurrentPatient.name
    };
    
    // Open the existing set builder
    if (typeof openSetBuilder === 'function') {
      openSetBuilder();
    }
  }

  // ---- called by dashboard.js when saving a patient bundle ----
  window._savePatientBundle = function (name, labs) {
    if (!window._creatingPatientBundle) return false;
    
    const { nationalId, patientName, editingBundleId } = window._creatingPatientBundle;
    const bundles = getPatientBundles(nationalId);

    const normalizedTests = (labs || []).map(t => ({
      code: t.code || '',
      asnd: t.asnd || '',
      name: t.name || '',
      vinaviServiceId: t.vinaviServiceId || null
    }));

    if (editingBundleId) {
      const idx = bundles.findIndex(b => b.id === editingBundleId);
      if (idx !== -1) {
        bundles[idx] = {
          ...bundles[idx],
          name,
          tests: normalizedTests,
          updatedAt: Date.now()
        };
      } else {
        bundles.push({
          id: editingBundleId,
          name,
          createdAt: Date.now(),
          tests: normalizedTests
        });
      }
    } else {
      bundles.push({
        id: genId(),
        name,
        createdAt: Date.now(),
        tests: normalizedTests
      });
    }
    
    setPatientBundles(nationalId, patientName, bundles);
    
    // Clear the flag
    delete window._creatingPatientBundle;
    
    // Re-render to show the new bundle
    renderPatientBundles();
    
    return true;
  };

  // ---- export / import ----
  function exportPatientBundles() {
    const data = getData();
    if (!Object.keys(data).length) {
      if (typeof showToast === 'function') showToast('No patient bundles to export', 'warning');
      return;
    }
    const blob = new Blob([JSON.stringify({ version: '1.0', type: 'patient-bundles', exportDate: new Date().toISOString(), patients: data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hmh-patient-bundles-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    if (typeof showToast === 'function') showToast('Patient bundles exported', 'success');
  }

  function importPatientBundles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        let patients = imported.patients || imported;
        if (typeof patients !== 'object' || Array.isArray(patients)) throw new Error('Invalid format');

        const existing = getData();
        for (const [nid, entry] of Object.entries(patients)) {
          if (!entry.bundles || !Array.isArray(entry.bundles)) continue;
          if (!existing[nid]) {
            existing[nid] = { patientName: entry.patientName || nid, bundles: [] };
          }
          entry.bundles.forEach(b => {
            existing[nid].bundles.push({ ...b, id: genId() });
          });
        }
        persist(existing);
        window._patientBundles = existing;
        renderPatientBundles();
        if (typeof showToast === 'function') showToast('Patient bundles imported!', 'success');
      } catch (err) {
        if (typeof showToast === 'function') showToast('Import failed: ' + err.message, 'error');
      }
    };
    input.click();
  }

  // ---- init ----
  document.addEventListener('DOMContentLoaded', () => {
    window._patientBundles = getData();

    const searchBtn = document.getElementById('pbSearchBtn');
    if (searchBtn) searchBtn.addEventListener('click', searchPatient);
    const searchInput = document.getElementById('pbPatientSearch');
    if (searchInput) searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') searchPatient(); });

    const createBtn = document.getElementById('pbCreateNew');
    if (createBtn) createBtn.addEventListener('click', openPatientBundleCreator);

    const exportBtn = document.getElementById('pbExportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportPatientBundles);
    const importBtn = document.getElementById('pbImportBtn');
    if (importBtn) importBtn.addEventListener('click', importPatientBundles);
  });

  // ---- expose for bundle picker integration ----
  window._pbGetBundlesForPatient = function (nationalId) {
    return getPatientBundles(nationalId);
  };
  window._pbGetCurrentPatient = function () {
    return _pbCurrentPatient;
  };

})();
