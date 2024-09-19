// options.js

document.addEventListener('DOMContentLoaded', function () {
    const defaultTitleInput = document.getElementById('defaultTitle');
    const defaultFontSelect = document.getElementById('defaultFont');
    const pageColorInput = document.getElementById('pageColor');
    const saveSettingsButton = document.getElementById('saveSettings');

    // Load existing settings
    chrome.storage.local.get(['defaultTitle', 'defaultFont', 'pageColor'], function (result) {
        if (result.defaultTitle) {
            defaultTitleInput.value = result.defaultTitle;
        }
        if (result.defaultFont) {
            defaultFontSelect.value = result.defaultFont;
        }
        if (result.pageColor) {
            pageColorInput.value = result.pageColor;
        }
    });

    // Save settings
    saveSettingsButton.addEventListener('click', function () {
        const settings = {
            defaultTitle: defaultTitleInput.value,
            defaultFont: defaultFontSelect.value,
            pageColor: pageColorInput.value
        };
        chrome.storage.local.set(settings, function () {
            alert('Settings saved!');
        });
    });
});
