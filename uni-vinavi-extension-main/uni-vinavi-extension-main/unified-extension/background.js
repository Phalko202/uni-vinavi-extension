// Unified Background Service Worker
// Handles storage and messaging for all modules:
// 1. Lab Test Extractor (HMH Dharaka)
// 2. QuickText (Vinavi)
// 3. Lab Ordering (Vinavi HMH Integration)

chrome.runtime.onInstalled.addListener(() => {
  console.log('Vinavi & HMH Universal Extension installed');
});

// Handle messages from all modules
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    // Vinavi Auth Token Storage
    if (request?.action === 'STORE_AUTH_TOKEN' && typeof request.token === 'string') {
      chrome.storage.local.set({ vinavi_auth_token: request.token });
      sendResponse?.({ ok: true });
      return true;
    }

    // Lab Tests Selection Storage
    if (request?.action === 'LAB_TESTS_SELECTED' && Array.isArray(request.tests)) {
      chrome.storage.local.set({ last_selected_lab_tests: request.tests });
      sendResponse?.({ ok: true });
      return true;
    }

    // QuickText Templates Storage
    if (request?.action === 'STORE_QUICKTEXT_TEMPLATES' && request.templates) {
      chrome.storage.local.set({ quicktext_templates: request.templates });
      sendResponse?.({ ok: true });
      return true;
    }

    // Generic storage for any module
    if (request?.action === 'STORE_DATA' && request.key && request.value) {
      const data = {};
      data[request.key] = request.value;
      chrome.storage.local.set(data);
      sendResponse?.({ ok: true });
      return true;
    }

    if (request?.action === 'GET_DATA' && request.key) {
      chrome.storage.local.get([request.key], (result) => {
        sendResponse?.({ ok: true, data: result[request.key] });
      });
      return true; // Keep channel open for async response
    }

  } catch (e) {
    console.error('Background script error:', e);
    sendResponse?.({ ok: false, error: e.message });
  }
  
  return true; // Keep message channel open for async responses
});
