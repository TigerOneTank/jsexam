# Book Haven — JavaScript book search

**Context:** School assignment.

A book-search page that requests Google Books data and renders book cards. This assignment connects a search form to an asynchronous API call.

## Implementation

**Technologies:** HTML, CSS, JavaScript, Fetch API, Google Books API.

- Search by typed book name.
- Display titles, authors, descriptions, and thumbnails from returned results.
- Load a default search when the page opens.

## Run locally

Requires Git, Python 3 for the local server, and a modern browser. No build step is included.

```sh
git clone https://github.com/TigerOneTank/jsexam.git
cd jsexam
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/index.html`. On Windows, `py` can replace `python`. External APIs, fonts, scripts, or embeds require internet access.

## Learning focus

Practices asynchronous requests, JSON data, form events, and DOM updates. The next step is handling incomplete responses and untrusted data.

## Known limitations

- The renderer assumes at least seven results and available thumbnail metadata; empty or short responses can crash it.
- API failures have no useful on-page error state, and queries are not encoded safely.
- External API content is inserted with innerHTML instead of safe text rendering.
- A Google API key is present in the current source and its duplicate repository. It must be restricted/rotated by the key owner; deleting a line does not revoke a key or remove it from history.

## Repository context

The original source is duplicated in [jsterm3exam](https://github.com/TigerOneTank/jsterm3exam), under `week10/`. This repository is the main portfolio reference; both histories are retained.

## Review scope

The November 2026 portfolio review inspected the source and local file references. No browser compatibility or live external-service test is claimed. Existing coursework and contribution history are retained.
