console.log("content.js loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "autofill") {
    chrome.storage.sync.get(["userProfile"], ({ userProfile }) => {
      if (!userProfile) return;

      // Find all Google Form items that look like questions
      [...document.querySelectorAll('div[role="listitem"], .freebirdFormviewerViewItemsItem')].forEach(item => {
        const labelText = item.innerText.toLowerCase();

        for (const key in userProfile) {
          if (key && userProfile[key]) {
            // Match form question label to profile key in a case-insensitive manner
            if (labelText.includes(key.toLowerCase())) {
              const inputs = item.querySelectorAll('input, textarea');
              inputs.forEach(input => {
                if (input.type !== 'radio' && input.type !== 'checkbox') {
                  input.value = userProfile[key];
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                }
              });
            }
          }
        }
      });

      sendResponse({ status: "success" });
    });
    // Keep the message channel open for async response
    return true;
  }
});
