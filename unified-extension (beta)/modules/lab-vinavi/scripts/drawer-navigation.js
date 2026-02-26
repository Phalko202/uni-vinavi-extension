/**
 * Drawer Navigation System
 * Handles expanding/collapsing of navigation drawer menus
 */

(function() {
  'use strict';

  function initDrawerNavigation() {
    const drawerToggles = document.querySelectorAll('.nav-drawer-toggle');

    drawerToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        const drawerId = this.dataset.drawer;
        const drawerContent = document.querySelector(`[data-drawer-content="${drawerId}"]`);
        
        if (!drawerContent) return;

        // Toggle expanded state
        const isExpanded = drawerContent.classList.contains('expanded');
        
        // Close all other drawers first
        document.querySelectorAll('.nav-drawer-content').forEach(content => {
          content.classList.remove('expanded');
        });
        document.querySelectorAll('.nav-drawer-toggle').forEach(btn => {
          btn.classList.remove('expanded');
        });

        // Toggle current drawer
        if (!isExpanded) {
          drawerContent.classList.add('expanded');
          this.classList.add('expanded');
        }
      });
    });

    // Handle drawer item clicks
    const drawerItems = document.querySelectorAll('.nav-drawer-item');
    drawerItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all nav items and drawer items
        document.querySelectorAll('.nav-item, .nav-drawer-item').forEach(navItem => {
          navItem.classList.remove('active');
        });
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Also mark parent drawer toggle as active
        const parentDrawer = this.closest('.nav-drawer');
        if (parentDrawer) {
          const toggle = parentDrawer.querySelector('.nav-drawer-toggle');
          if (toggle) {
            toggle.classList.add('active');
          }
        }
        
        // Handle view switching
        const viewName = this.dataset.view;
        if (viewName) {
          switchView(viewName);
        }
      });
    });

    // Keep existing nav-item functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active from all items
        document.querySelectorAll('.nav-item, .nav-drawer-item').forEach(navItem => {
          navItem.classList.remove('active');
        });
        
        // Remove active from drawer toggles
        document.querySelectorAll('.nav-drawer-toggle').forEach(toggle => {
          toggle.classList.remove('active');
        });
        
        // Close all drawers
        document.querySelectorAll('.nav-drawer-content').forEach(content => {
          content.classList.remove('expanded');
        });
        
        // Add active to clicked item
        this.classList.add('active');
        
        // Handle view switching
        const viewName = this.dataset.view;
        if (viewName) {
          switchView(viewName);
        }
      });
    });
  }

  function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
      view.style.display = 'none';
    });

    // Show selected view
    const viewMap = {
      'search': 'searchView',
      'packages': 'packagesView',
      'patientBundles': 'patientBundlesView',
      'generalBundles': 'generalBundlesView',
      'catalog': 'catalogView',
      'medicalLetter': 'medicalLetterView',
      'failLog': 'failLogView',
      'quickLinks': 'quickLinksView'
    };

    const viewId = viewMap[viewName];
    if (viewId) {
      const view = document.getElementById(viewId);
      if (view) {
        view.classList.add('active');
        view.style.display = 'block';
        updatePageTitle(viewName);
      }
    }
  }

  function updatePageTitle(viewName) {
    const titleMap = {
      'search': 'Search Patient',
      'packages': 'Lab Bundles',
      'patientBundles': 'Patient Bundles',
      'generalBundles': 'General Bundles',
      'catalog': 'Lab Catalog',
      'medicalLetter': 'Medical Letter',
      'failLog': 'Activity Log',
      'quickLinks': 'Quick Links'
    };

    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && titleMap[viewName]) {
      pageTitle.textContent = titleMap[viewName];
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrawerNavigation);
  } else {
    initDrawerNavigation();
  }

  // Export for external use
  window.DrawerNavigation = {
    switchView: switchView
  };
})();
