// pse-sdk

const esc = s => String(s)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const params = new URLSearchParams(location.search);
const lang = params.get('lang') || 'ru';
const pagePath = params.get('page') || 'pse_sdk';

const renderers = {
  text: b => `<p>${b.html}</p>`,
  note: b => `<div class="note">${b.html}</div>`,

  table: b => {
    const align = b.align || [];
    const cell = (tag, val, i) =>
      `<${tag}${align[i] ? ` style="text-align:${align[i]}"` : ''}>${val}</${tag}>`;
    const th = (b.head || []).map((h, i) => cell('th', esc(h), i)).join('');
    const tr = (b.rows || []).map(row =>
      `<tr>${row.map((c, i) => cell('td', c, i)).join('')}</tr>`
    ).join('');
    return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
  },

  code: b =>
    `<pre><code class="lang-${esc(b.lang || '')}">${esc(b.code)}</code></pre>`,

  image: b =>
    `<figure><img src="${esc(b.src)}" alt="${esc(b.alt || '')}">${
      b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''
    }</figure>`,
};

function renderBlock(b) {
  const fn = renderers[b.type];
  if (!fn) { console.warn('Unknown block type:', b.type); return ''; }
  return fn(b);
}

function renderLangs() {
  const el = document.getElementById('langs');
  if (!el) return;
  el.innerHTML = ['ru', 'en'].map(l => {
    const u = new URL(location.href);
    u.searchParams.set('lang', l);
    return `<a href="${u}" class="${l === lang ? 'active' : ''}">${l.toUpperCase()}</a>`;
  }).join('');
}

async function buildNav() {
  const nav = document.getElementById('nav');
  try {
    const res = await fetch('manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const m = await res.json();
    nav.innerHTML = (m.categories || []).map(cat => `
      <div class="cat">
        <div class="cat-title">${esc(cat.title)}</div>
        ${(cat.pages || []).map(p => {
          const u = new URL(location.href);
          u.searchParams.set('page', p.path);
          u.searchParams.set('lang', lang);
          const active = p.path === pagePath ? ' active' : '';
          return `<a class="page${active}" href="${u}">${esc(p.title)}</a>`;
        }).join('')}
      </div>
    `).join('');
  } catch (e) {
    nav.innerHTML = `<div class="error">manifest.json: ${esc(e.message)}</div>`;
  }
}

async function loadPage() {
  const content = document.getElementById('content');
  try {
    const res = await fetch(`data/${pagePath}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const root = await res.json();

    const page = root[lang] || root.ru;
    if (!page) throw new Error(`There is neither "${lang}" or "ru" in the file`);

    document.title = `[PSE SDK] ${page.title}`;
    document.getElementById('page-title').textContent = page.title;
    content.innerHTML = (page.blocks || []).map(renderBlock).join('\n');
  } catch (e) {
    document.getElementById('page-title').textContent = 'Ошибка';
    content.innerHTML =
      `
      <div class="error">Failed to load: <code>${esc(pagePath)}.json</code><br>
      Error message: <code>${esc(e.message)}</code><br>
      `;
  }
}

renderLangs();
buildNav();
loadPage();
