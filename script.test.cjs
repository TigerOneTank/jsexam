const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup(fetchImpl) {
    class Element {
        constructor(tag) { this.tag = tag; this.children = []; this.textContent = ''; this.value = ''; }
        append(...children) { this.children.push(...children); }
        replaceChildren(...children) { this.children = children; }
        setAttribute() {}
        addEventListener(name, handler) { this[name] = handler; }
        set innerHTML(_) { throw new Error('Unsafe HTML insertion'); }
    }
    const wrapper = new Element('div');
    const form = new Element('form');
    const input = new Element('input');
    const window = { BOOKS_API_KEY: 'test-placeholder', addEventListener(name, handler) { this[name] = handler; } };
    const document = { createElement: tag => new Element(tag), querySelector: s => ({'.book-list': wrapper, '#searchForm': form, '#searchTerm': input})[s] };
    const context = vm.createContext({window, document, URL, URLSearchParams, fetch: fetchImpl});
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8'), context);
    return { context, window, wrapper, form, input };
}
const ok = items => ({ ok: true, json: async () => ({ items }) });
test('query characters are encoded and result count is bounded', async () => {
    let url;
    const s = setup(async u => { url = new URL(u); return ok([]); });
    await s.context.getBooks('cats & dogs?');
    assert.equal(url.searchParams.get('q'), 'cats & dogs?');
    assert.equal(url.searchParams.get('maxResults'), '7');
});
test('missing key prevents a network request', async () => {
    const s = setup(() => { throw new Error('network must not run'); });
    s.window.BOOKS_API_KEY = '';
    await assert.rejects(s.context.getBooks('book'), /restricted/);
});
test('empty API results render a clear message', async () => {
    const s = setup(async () => ok(undefined));
    await s.context.searchBooks('book');
    assert.match(s.wrapper.children[0].textContent, /No books/);
});
test('short responses and absent metadata render without crashing', () => {
    const s = setup(); s.context.displaybooks([{}]);
    assert.equal(s.wrapper.children.length, 1);
    assert.equal(s.wrapper.children[0].children[1].children[0].textContent, 'Untitled book');
});
test('API markup is plain text and unsafe cover protocols are rejected', () => {
    const s = setup(); const text = '<img src=x onerror=alert(1)>';
    s.context.displaybooks([{ volumeInfo: { title: text, imageLinks: { thumbnail: 'javascript:alert(1)' } } }]);
    assert.equal(s.wrapper.children[0].children[1].children[0].textContent, text);
    assert.equal(s.wrapper.children[0].children[0].children.length, 0);
});
test('HTTP errors become an on-page error without leaking request details', async () => {
    const s = setup(async () => ({ ok: false }));
    await s.context.searchBooks('book');
    assert.match(s.wrapper.children[0].textContent, /Unable to load/);
    assert.ok(!s.wrapper.children[0].textContent.includes('test-placeholder'));
});
test('older request cannot replace newer search results', async () => {
    let resolveOld;
    const s = setup(u => new URL(u).searchParams.get('q') === 'old' ? new Promise(r => { resolveOld = r; }) : Promise.resolve(ok([{volumeInfo:{title:'New'}}])));
    const old = s.context.searchBooks('old');
    await s.context.searchBooks('new');
    resolveOld(ok([{volumeInfo:{title:'Old'}}])); await old;
    assert.equal(s.wrapper.children[0].children[1].children[0].textContent, 'New');
});
test('form listener is registered before the initial request completes', () => {
    const s = setup(() => new Promise(() => {}));
    s.window.DOMContentLoaded();
    assert.equal(typeof s.form.submit, 'function');
});
