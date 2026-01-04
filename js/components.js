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

    // Auto-size collapsed width to the title text (plus padding)
    const titleEl = this.querySelector(".site-title");
    if (titleEl) {
      // Wait a frame so layout is accurate (fonts/styles applied)
      requestAnimationFrame(() => {
        const rect = titleEl.getBoundingClientRect();

        // Add room for left/right padding inside the pill + a little breathing space
        const extra = 64; // px (tweak if you want tighter/looser)
        const collapsedWidth = Math.ceil(rect.width + extra);

        this.style.setProperty("--nav-collapsed-width", `${collapsedWidth}px`);
      });
    }


    setActiveNav(this);

    // Default: collapsed
    this.dataset.expanded = "false";

    // On touch / coarse pointers, keep expanded so navigation is usable.
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!finePointer) {
      this.dataset.expanded = "true";
      return;
    }

    // Expand when mouse enters top quarter of viewport.
    // Keep expanded while hovering/focusing the header/nav so it doesn't collapse mid-click.
    let collapseTimer = null;

    const setExpanded = (val) => {
      this.dataset.expanded = val ? "true" : "false";
    };

    const isInteractingWithHeader = () =>
      this.matches(":hover") || this.matches(":focus-within");

    const maybeExpandOrCollapse = (y) => {
      const hotZone = window.innerHeight * 0.25;
      const inHotZone = y <= hotZone;

      if (inHotZone || isInteractingWithHeader()) {
        if (collapseTimer) {
          clearTimeout(collapseTimer);
          collapseTimer = null;
        }
        setExpanded(true);
      } else {
        // Slight delay prevents jitter while moving the mouse around
        if (!collapseTimer) {
          collapseTimer = setTimeout(() => {
            collapseTimer = null;
            if (!isInteractingWithHeader()) setExpanded(false);
          }, 300);
        }
      }
    };

    let lastY = null;
    let raf = 0;

    window.addEventListener(
      "mousemove",
      (e) => {
        lastY = e.clientY;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          maybeExpandOrCollapse(lastY ?? 99999);
        });
      },
      { passive: true }
    );

    // If user tabs into the nav, keep it open.
    this.addEventListener("focusin", () => setExpanded(true));

    // If mouse leaves and isn't in hot zone, allow collapse.
    this.addEventListener("mouseleave", () => {
      maybeExpandOrCollapse(window.innerHeight); // force "not in hot zone"
    });
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