// Configure a website-restricted Google Books key in config.local.js.
async function getBooks(books) {
    const key = window.BOOKS_API_KEY;
    if (typeof key !== 'string' || !key.trim()) {
        throw new Error('Add a restricted Google Books API key in config.local.js.');
    }
    const query = new URLSearchParams({ q: books, key: key.trim(), maxResults: '7' });
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${query}`);
    if (!response.ok) throw new Error('Book search failed. Please try again later.');
    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
}

function showMessage(message) {
    const wrapper = document.querySelector('.book-list');
    const text = document.createElement('p');
    text.setAttribute('role', 'status');
    text.textContent = message;
    wrapper.replaceChildren(text);
}

function displaybooks(items) {
    const wrapper = document.querySelector('.book-list');
    wrapper.replaceChildren();
    if (!items.length) return showMessage('No books found. Try another search.');
    for (const item of items.slice(0, 7)) {
        const info = item?.volumeInfo || {};
        const card = document.createElement('div');
        card.className = 'book';
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        try {
            const url = new URL(info.imageLinks?.thumbnail);
            if (url.protocol === 'http:') url.protocol = 'https:';
            if (url.protocol === 'https:') {
                const img = document.createElement('img');
                img.src = url.href;
                img.alt = 'Book cover';
                thumbnail.append(img);
            }
        } catch (_) { /* A cover is optional. */ }
        const details = document.createElement('div');
        details.className = 'book-info';
        const title = document.createElement('h3');
        title.textContent = info.title || 'Untitled book';
        const author = document.createElement('p');
        author.textContent = 'Author: ' + (Array.isArray(info.authors) && info.authors.length ? info.authors.join(', ') : 'Unknown');
        const description = document.createElement('p');
        description.textContent = 'Description: ' + (info.description || 'No description available.');
        details.append(title, author, description);
        card.append(thumbnail, details);
        wrapper.append(card);
    }
}

let latestSearch = 0;
async function searchBooks(query) {
    const request = ++latestSearch;
    if (!query.trim()) return showMessage('Enter a book name.');
    showMessage('Searching…');
    try {
        const books = await getBooks(query.trim());
        if (request === latestSearch) displaybooks(books);
    } catch (_) {
        if (request === latestSearch) {
            showMessage(window.BOOKS_API_KEY?.trim()
                ? 'Unable to load books. Check your connection and API key restrictions, then try again.'
                : 'Configure a restricted Google Books API key in config.local.js to search.');
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#searchForm').addEventListener('submit', event => {
        event.preventDefault();
        searchBooks(document.querySelector('#searchTerm').value);
    });
    searchBooks("can't hurt me");
});
