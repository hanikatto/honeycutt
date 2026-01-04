// /js/projects.js
const DATA_URL = "/projects/projects.json";

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function projectUrl(slug) {
  // Works with your folder structure: /projects/<slug>/
  return `/projects/${slug}/`;
}

function renderProjectCard(p) {
  const tags = (p.tags || [])
    .map(t => `<span class="tag">${escapeHtml(t)}</span>`)
    .join("");

  const links = p.links || {};
  const linkItems = [
    links.paper ? `<a href="${escapeHtml(links.paper)}">Paper</a>` : "",
    links.code ? `<a href="${escapeHtml(links.code)}">Code</a>` : "",
    links.demo ? `<a href="${escapeHtml(links.demo)}">Demo</a>` : ""
  ].filter(Boolean).join(`<span aria-hidden="true"> · </span>`);

  return `
    <article class="project-card">
      <h2 class="project-title">
        <a href="${projectUrl(p.slug)}">${escapeHtml(p.title)}</a>
      </h2>

      <p class="project-meta">
        ${p.year ? escapeHtml(p.year) : ""}${p.status ? ` · ${escapeHtml(p.status)}` : ""}
      </p>

      <p class="project-summary">${escapeHtml(p.summary || "")}</p>

      ${tags ? `<div class="tags">${tags}</div>` : ""}

      ${linkItems ? `<p class="project-links">${linkItems}</p>` : ""}
    </article>
  `;
}

function matchesQuery(p, q) {
  if (!q) return true;
  const hay = [
    p.title,
    p.summary,
    (p.tags || []).join(" "),
    p.year,
    p.status
  ].join(" ").toLowerCase();
  return hay.includes(q);
}

async function loadProjects() {
  const res = await fetch(DATA_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL}: ${res.status}`);
  return await res.json();
}

function sortProjects(projects) {
  // Sort newest first, then title
  return [...projects].sort((a, b) => {
    const ya = Number(a.year || 0);
    const yb = Number(b.year || 0);
    if (yb !== ya) return yb - ya;
    return String(a.title || "").localeCompare(String(b.title || ""));
  });
}

(async function init() {
  const listEl = document.getElementById("projects-list");
  const emptyEl = document.getElementById("projects-empty");
  const searchEl = document.getElementById("project-search");

  if (!listEl) return;

  let projects = [];
  try {
    projects = sortProjects(await loadProjects());
  } catch (err) {
    listEl.innerHTML = `<p>Could not load projects right now.</p>`;
    console.error(err);
    return;
  }

  function render() {
    const q = (searchEl?.value || "").trim().toLowerCase();
    const filtered = projects.filter(p => matchesQuery(p, q));
    listEl.innerHTML = filtered.map(renderProjectCard).join("");
    const isEmpty = filtered.length === 0;
    emptyEl.style.display = isEmpty ? "" : "none";
  }

  searchEl?.addEventListener("input", render);
  render();
})();