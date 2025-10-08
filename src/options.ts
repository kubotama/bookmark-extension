const saveButton = document.getElementById('save') as HTMLButtonElement;
const urlInput = document.getElementById('url') as HTMLInputElement;

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('bookmarkUrl', (data) => {
    if (data.bookmarkUrl) {
      urlInput.value = data.bookmarkUrl;
    }
  });
});

saveButton.addEventListener('click', () => {
  const url = urlInput.value;
  if (url) {
    chrome.storage.local.set({ bookmarkUrl: url }, () => {
      console.log('URL saved:', url);
    });
  }
});