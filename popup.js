// popup.js

let currentPageIndex = null; // Track the current page index
const maxPages = 6; // Maximum number of pages allowed

document.addEventListener('DOMContentLoaded', function () {
    const textArea = document.getElementById('scratchPad');
    const settingsIcon = document.getElementById('settingsIcon');
    const titleInput = document.getElementById('titleInput');
    const pageAddIcon = document.getElementById('pageAddIcon');
    const deletePageButton = document.getElementById('deletePage');
    const noteSquaresContainer = document.getElementById('noteSquares');

    // Load notes and title from storage when the popup is opened
    chrome.storage.local.get(['notes', 'title', 'pages', 'defaultTitle', 'defaultFont', 'pageColor'], function (result) {
        if (result.notes) {
            textArea.value = result.notes;
        }
        if (result.title) {
            titleInput.value = result.title;
        }
        if (result.pages) {
            renderNoteSquares(result.pages);
        }
        if (result.defaultTitle) {
            titleInput.value = result.defaultTitle; // Use the saved default title
        }
        if (result.defaultFont) {
            textArea.style.fontFamily = result.defaultFont; // Set default font
        }
        if (result.pageColor) {
            textArea.style.backgroundColor = result.pageColor; // Set page color
        }
    });

    // Save notes when the content of the text area changes
    textArea.addEventListener('input', function () {
        const notes = textArea.value;
        chrome.storage.local.set({ notes: notes }, function () {
            console.log('Notes saved!');
        });
    });

    // Save title when the input changes
    titleInput.addEventListener('input', function () {
        const title = titleInput.value;
        chrome.storage.local.set({ title: title }, function () {
            console.log('Title saved!');
        });
    });

    // Open options page when the settings icon is clicked
    settingsIcon.addEventListener('click', function () {
        chrome.runtime.openOptionsPage();
    });

    // Add new page
    pageAddIcon.addEventListener('click', function () {
        chrome.storage.local.get(['pages', 'defaultTitle'], function (result) {
            const pages = result.pages || [];
            const defaultTitle = result.defaultTitle || 'Untitled Page'; // Get default title

            // Check if there's space for new pages
            if (pages.length < maxPages) {
                // Save the current note if it's not a new page
                if (currentPageIndex !== null) {
                    saveCurrentPage(currentPageIndex);
                }

                // Create a new page with the default title
                const newPage = {
                    title: defaultTitle, // Use the default title
                    content: ''
                };
                pages.push(newPage);
                chrome.storage.local.set({ pages: pages }, function () {
                    renderNoteSquares(pages);
                    resetNote(newPage.title); // Reset note area and set the new title
                });
            } else {
                alert("Maximum number of pages reached.");
            }
        });
    });

    // Delete current page
    deletePageButton.addEventListener('click', function () {
        if (currentPageIndex !== null) {
            const title = document.getElementById('titleInput').value;
            if (confirm(`Are you sure you want to delete "${title}"?`)) {
                chrome.storage.local.get(['pages'], function (result) {
                    const pages = result.pages || [];
                    if (pages[currentPageIndex]) {
                        pages.splice(currentPageIndex, 1); // Remove the selected page
                        chrome.storage.local.set({ pages: pages }, function () {
                            resetNote(); // Reset note area after deletion
                            renderNoteSquares(pages); // Re-render squares, reflecting the deletion
                        });
                    }
                });
            }
        }
    });
});

// Save the current page
function saveCurrentPage(index) {
    chrome.storage.local.get(['pages'], function (result) {
        const pages = result.pages || [];
        pages[index] = {
            title: document.getElementById('titleInput').value,
            content: document.getElementById('scratchPad').value
        };
        chrome.storage.local.set({ pages: pages });
    });
}

// Render the note squares
function renderNoteSquares(pages) {
    const noteSquaresContainer = document.getElementById('noteSquares');
    noteSquaresContainer.innerHTML = ''; // Clear existing squares
    pages.forEach((page, index) => {
        const noteSquare = document.createElement('div');
        noteSquare.className = 'note-square';
        noteSquare.textContent = page.title || 'Untitled Page';
        noteSquare.onclick = function () {
            loadPage(index);
        };

        // Highlight the currently viewed page
        if (index === currentPageIndex) {
            noteSquare.classList.add('active');
        }

        noteSquaresContainer.appendChild(noteSquare);
    });
}

// Load the selected page
function loadPage(index) {
    chrome.storage.local.get(['pages'], function (result) {
        const pages = result.pages || [];
        const page = pages[index];
        if (page) {
            document.getElementById('titleInput').value = page.title; // Set the title input to the page title
            document.getElementById('scratchPad').value = page.content;
            currentPageIndex = index;
            renderNoteSquares(pages); // Re-render squares to highlight the selected one
        }
    });
}

// Reset the note area for a new note
function resetNote() {
    chrome.storage.local.get(['defaultTitle'], function (result) {
        const defaultTitle = result.defaultTitle || 'Untitled Page'; // Get the default title from storage
        document.getElementById('titleInput').value = defaultTitle; // Set the new title to the default
        document.getElementById('scratchPad').value = '';
        currentPageIndex = null;
        chrome.storage.local.get(['pages'], function (result) {
            renderNoteSquares(result.pages || []); // Re-render squares, clearing the highlighted one
        });
    });
}
