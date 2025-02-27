// Predefined list of sites to block
const DEFAULT_BLOCKED_SITES = [
  "youtube.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "bbc.co.uk",
  "facebook.com",
  "tiktok.com",
  "bbc.com",
  "techcrunch.com",
  "ndtv.com",
  "netflix.com",
  "web.whatsapp.com",
  "web.telegram.org",
  "open.spotify.com",
];

// Function to update blocking rules
function updateRules() {
  chrome.storage.sync.get(["blockedSites", "isBlocking"], (data) => {
    let blockedSites = data.blockedSites || [];
    const isBlocking = data.isBlocking || false;

    // If the block list is empty, preload the default sites
    if (blockedSites.length === 0) {
      blockedSites = DEFAULT_BLOCKED_SITES;
      chrome.storage.sync.set({ blockedSites }, () => {
        console.log("Default blocked sites loaded.");
      });
    }

    // Step 1: Get all existing rules to find their IDs
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const removeRuleIds = existingRules.map((rule) => rule.id);

      // Step 2: Remove all existing rules
      chrome.declarativeNetRequest.updateDynamicRules(
        {
          removeRuleIds: removeRuleIds,
        },
        () => {
          // Step 3: Add new rules if blocking is enabled
          if (isBlocking) {
            const rules = blockedSites.map((site, index) => ({
              id: index + 1, // IDs start from 1 and are now unique
              priority: 1,
              action: {
                type: "redirect",
                redirect: { extensionPath: "/blocked.html" },
              },
              condition: {
                urlFilter: `||${site}^`,
                resourceTypes: ["main_frame"],
              },
            }));

            // Step 4: Add the new rules
            chrome.declarativeNetRequest.updateDynamicRules(
              {
                addRules: rules,
              },
              () => {
                if (chrome.runtime.lastError) {
                  console.error(
                    "Error adding rules:",
                    chrome.runtime.lastError
                  );
                } else {
                  console.log("Rules updated successfully:", rules);
                }
              }
            );
          } else {
            console.log("Blocking is off, no rules added.");
          }
        }
      );
    });
  });
}

// Listen for messages from the popup to update rules
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateRules") {
    updateRules();
  }
});

// Run initialization on extension startup
updateRules();