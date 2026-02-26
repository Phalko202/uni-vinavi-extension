// Unified popup router - opens the appropriate module with enhanced functionality

// Utility function to open extension page with error handling and visual feedback
function openExtPage(relPath, elementId) {
  try {
    const url = chrome.runtime.getURL(relPath);
    
    // Add visual feedback
    const element = document.getElementById(elementId);
    if (element) {
      element.style.transform = 'scale(0.95)';
      element.style.opacity = '0.7';
    }
    
    // Open the page
    chrome.tabs.create({ url }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error opening page:', chrome.runtime.lastError);
        // Reset visual state
        if (element) {
          element.style.transform = '';
          element.style.opacity = '';
        }
        return;
      }
      // Close popup after successful navigation
      setTimeout(() => window.close(), 100);
    });
  } catch (error) {
    console.error('Error in openExtPage:', error);
  }
}

// Initialize all event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Vinavi Dashboard - Lab Ordering Module (Vinavi HMH Integration)
  const labBtn = document.getElementById('openLab');
  if (labBtn) {
    labBtn.addEventListener('click', () => {
      openExtPage('modules/lab-vinavi/dashboard.html', 'openLab');
    });
  }

  // QuickText Module (Vinavi)
  const quickBtn = document.getElementById('openQuick');
  if (quickBtn) {
    quickBtn.addEventListener('click', () => {
      openExtPage('modules/quicktext/dashboard_new.html', 'openQuick');
    });
  }

  // Save File Module
  const saveBtn = document.getElementById('openSaveFile');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      openExtPage('save.html', 'openSaveFile');
    });
  }

  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === '1') labBtn?.click();
    if (e.key === '2') quickBtn?.click();
    if (e.key === 's' || e.key === 'S') saveBtn?.click();
  });

  // Add ripple effect on click
  document.querySelectorAll('.moduleCard, .saveFileBtn').forEach(card => {
    card.addEventListener('click', function(e) {
      const ripple = document.createElement('div');
      ripple.style.position = 'absolute';
      ripple.style.width = ripple.style.height = '100px';
      ripple.style.left = e.clientX - this.offsetLeft - 50 + 'px';
      ripple.style.top = e.clientY - this.offsetTop - 50 + 'px';
      ripple.style.background = 'rgba(255,255,255,0.3)';
      ripple.style.borderRadius = '50%';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s ease-out';
      ripple.style.pointerEvents = 'none';
      
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
});

// Note: Lab Extractor now appears automatically as a floating widget
// when you visit dharaka.hmh.mv - no need to open it manually!

// Check for updates or system messages
chrome.storage.local.get(['lastUpdateCheck'], (result) => {
  const now = Date.now();
  const lastCheck = result.lastUpdateCheck || 0;
  
  // Check once per day
  if (now - lastCheck > 24 * 60 * 60 * 1000) {
    chrome.storage.local.set({ lastUpdateCheck: now });
    console.log('Extension loaded successfully');
  }
});
