document.getElementById('autofillBtn').addEventListener('click', () => {
  const statusEl = document.getElementById('status');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      statusEl.style.color = 'red';
      statusEl.textContent = 'No active tab found';
      statusEl.style.display = 'block';
      return;
    }
    const url = tabs[0].url || '';
    if (!url.startsWith('https://docs.google.com/forms/')) {
      statusEl.style.color = 'red';
      statusEl.textContent = 'Not a Google Form page!';
      statusEl.style.display = 'block';
      setTimeout(() => { statusEl.style.display = 'none'; }, 2000);
      return;
    }
    chrome.tabs.sendMessage(tabs[0].id, { action: 'autofill' }, (response) => {
      // Safely handle the error if content.js is missing
      if (chrome.runtime.lastError) {
        statusEl.style.color = 'red';
        statusEl.textContent = 'Autofill script not found on this page.';
      } else {
        statusEl.style.color = 'green';
        statusEl.textContent = 'Autofill sent!';
      }
      statusEl.style.display = 'block';
      setTimeout(() => { statusEl.style.display = 'none'; }, 2000);
    });
  });
});
