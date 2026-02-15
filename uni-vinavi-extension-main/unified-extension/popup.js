// Unified popup router - opens the appropriate module

function openExtPage(relPath) {
  const url = chrome.runtime.getURL(relPath);
  chrome.tabs.create({ url });
  window.close();
}

// Vinavi Dashboard - Lab Ordering Module (Vinavi HMH Integration)
document.getElementById('openLab')?.addEventListener('click', () => {
  openExtPage('modules/lab-vinavi/dashboard.html');
});

// QuickText Module (Vinavi)
document.getElementById('openQuick')?.addEventListener('click', () => {
  openExtPage('modules/quicktext/dashboard_new.html');
});

// Save File Module
document.getElementById('openSaveFile')?.addEventListener('click', () => {
  openExtPage('save.html');
});

// Note: Lab Extractor now appears automatically as a floating widget
// when you visit dharaka.hmh.mv - no need to open it manually!
