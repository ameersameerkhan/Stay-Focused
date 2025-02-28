document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const toggleStatus = document.getElementById('toggle-status');
  const blockedSitesList = document.getElementById('blocked-sites');
  const newSiteInput = document.getElementById('new-site');
  const addBtn = document.getElementById('add-btn');
  const toggleListBtn = document.getElementById('toggle-list');

  // Load initial state
  chrome.storage.sync.get(['blockedSites', 'isBlocking'], (data) => {
    const blockedSites = data.blockedSites || [];
    const isBlocking = data.isBlocking || false;
    toggle.checked = isBlocking;
    toggleStatus.textContent = isBlocking ? 'on' : 'off';
    updateBlockedSitesList(blockedSites);
  });

  // Toggle focus mode
  toggle.addEventListener('change', () => {
    const isBlocking = toggle.checked;
    toggleStatus.textContent = isBlocking ? 'on' : 'off';
    chrome.storage.sync.set({ isBlocking }, () => {
      chrome.runtime.sendMessage({ action: 'updateRules' });
    });
  });

  // Add new site
  addBtn.addEventListener('click', () => {
    const newSite = newSiteInput.value.trim();
    if (newSite) {
      chrome.storage.sync.get('blockedSites', (data) => {
        const blockedSites = data.blockedSites || [];
        if (!blockedSites.includes(newSite)) {
          blockedSites.push(newSite);
          chrome.storage.sync.set({ blockedSites }, () => {
            updateBlockedSitesList(blockedSites);
            chrome.runtime.sendMessage({ action: 'updateRules' });
            newSiteInput.value = '';
          });
        }
      });
    }
  });

  // Delete site
  blockedSitesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const siteToRemove = e.target.parentElement.firstChild.textContent;
      chrome.storage.sync.get('blockedSites', (data) => {
        const blockedSites = data.blockedSites.filter(site => site !== siteToRemove);
        chrome.storage.sync.set({ blockedSites }, () => {
          updateBlockedSitesList(blockedSites);
          chrome.runtime.sendMessage({ action: 'updateRules' });
        });
      });
    }
  });

  // Toggle blocked sites list visibility
  toggleListBtn.addEventListener('click', () => {
    const isHidden = blockedSitesList.style.display === 'none';
    blockedSitesList.style.display = isHidden ? 'block' : 'none';
    toggleListBtn.textContent = isHidden ? 'hide' : 'show';
  });

  // Update blocked sites list
  function updateBlockedSitesList(sites) {
    blockedSitesList.innerHTML = '';
    sites.forEach(site => {
      const li = document.createElement('li');
      li.textContent = site;
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'x';
      deleteBtn.classList.add('delete-btn');
      li.appendChild(deleteBtn);
      blockedSitesList.appendChild(li);
    });
  }
});
