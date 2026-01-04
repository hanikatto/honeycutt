// /js/components.js

const SITE = {
  name: "David Honeycutt",
  email: "dhoney88@hawaii.edu",
  orcidId: "0009-0006-3880-898X",
  githubUrl: "https://github.com/hanikatto",
  schoolPage: "https://www.hawaii.edu/sls/people/david-honeycutt/",
};

function normalizePath(pathname) {
  return pathname.endsWith("/") ? pathname : pathname + "/";
}

function setActiveNav(rootEl) {
  const current = normalizePath(window.location.pathname);

  rootEl.querySelectorAll("a[data-nav]").forEach((a) => {
    const href = a.getAttribute("href") || "/";
    const linkPath = normalizePath(new URL(href, window.location.origin).pathname);

    const isActive =
      current === linkPath ||
      (linkPath !== "/" && current.startsWith(linkPath));

    a.classList.toggle("active", isActive);
    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a class="site-title" href="/">${SITE.name}</a>

          <nav class="site-nav" aria-label="Primary">
            <a data-nav href="/projects/">Projects</a>
            <a data-nav href="/publications/">Publications</a>
            <a data-nav href="/cv/">CV</a>
            <a data-nav href="/about/">About</a>
          </nav>
        </div>
      </header>
    `;

    setActiveNav(this);
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-inner">
          <p>© ${year} ${SITE.name}</p>
          <p class="footer-links">
            <a href="mailto:${SITE.email}">${SITE.email}</a>
            <span aria-hidden="true"> · </span>
            <a href="${SITE.scholarUrl}" rel="me">Google Scholar</a>
            <span aria-hidden="true"> · </span>
            <a href="${SITE.githubUrl}" rel="me">GitHub</a>
          </p>
        </div>
      </footer>
    `;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);