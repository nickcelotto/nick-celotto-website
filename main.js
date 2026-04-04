// ============================================================
// MAIN.JS — Nick Celotto Portfolio
//
// Sections:
// 1. Mobile nav toggle
// 2. Tab switching (projects + photography pages)
// 3. Travel guide cards — expand/collapse
// 4. Legacy filter buttons (kept for compatibility)
// 5. Lightbox (photography gallery)
// 6. Scroll reveal
// ============================================================


// ============================================================
// DEEP LINK HANDLER
// Reads ?p=featured or ?p=other from the URL on page load.
// Used by homepage project cards to land on the right tab.
// Example URLs:
//   projects.html?p=featured       → opens Featured tab
//   projects.html?p=other#project2 → opens Other tab, scrolls to project2
// ============================================================

(function () {
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');
  if (!p) return; // no param — default tab stays active

  // Find the matching tab button and trigger it
  const targetBtn = document.querySelector(`.tab-btn[data-view="${p}"]`);
  if (!targetBtn) return;

  // Activate the tab immediately (before paint, so no flash)
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  targetBtn.classList.add('active');
  document.querySelectorAll('.tab-view').forEach(view => {
    view.style.display = view.id === `view-${p}` ? '' : 'none';
  });

  // If there's a hash (#project2 etc.), scroll to it after the page renders
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
})();

// Also handle ?tab= param (used by photography page back links from guide pages)
(function () {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (!tab) return;

  const targetBtn = document.querySelector(`.tab-btn[data-view="${tab}"]`);
  if (!targetBtn) return;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  targetBtn.classList.add('active');
  document.querySelectorAll('.tab-view').forEach(view => {
    view.style.display = view.id === `view-${tab}` ? '' : 'none';
  });
})();


// ============================================================
// 1. MOBILE NAV TOGGLE
// Hamburger button toggles the .nav-mobile-menu open/closed.
// Clicking anywhere outside closes it.
// ============================================================

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}


// ============================================================
// 2. TAB SWITCHING
// Buttons have data-view="key".
// Content panels have id="view-{key}".
// Clicking a button hides all panels, shows the matching one,
// then re-initializes the lightbox for any newly visible gallery.
// ============================================================

const tabBtns = document.querySelectorAll('.tab-btn');

if (tabBtns.length > 0) {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button state
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show matching view, hide others
      const target = btn.dataset.view;
      document.querySelectorAll('.tab-view').forEach(view => {
        view.style.display = view.id === `view-${target}` ? '' : 'none';
      });

      // Re-init lightbox so it picks up images in the newly visible tab
      initLightbox();
    });
  });
}


// ============================================================
// 3. LEGACY FILTER BUTTONS
// Kept for any page that still uses .filter-btn + data-filter.
// ============================================================

const filterBtns = document.querySelectorAll('.filter-btn');

if (filterBtns.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      document.querySelectorAll('.project-detail-card').forEach(card => {
        card.classList.toggle('hidden', filter !== 'all' && !card.dataset.tags.includes(filter));
      });

      document.querySelectorAll('.masonry-item').forEach(item => {
        item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
      });
    });
  });
}


// ============================================================
// 5. LIGHTBOX
// Collects gallery images from currently visible tab views.
// Re-called after tab switches so it always has the right set.
// Click image → open. ← → arrows or keyboard to navigate. Esc to close.
// ============================================================

const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');

let galleryImages = [];
let currentIndex  = 0;

function openLightbox(src, alt) {
  if (!lightbox) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden'; // prevent background scrolling
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showPrev() {
  if (!galleryImages.length) return;
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  lightboxImg.src = galleryImages[currentIndex].src;
  lightboxImg.alt = galleryImages[currentIndex].alt;
}

function showNext() {
  if (!galleryImages.length) return;
  currentIndex = (currentIndex + 1) % galleryImages.length;
  lightboxImg.src = galleryImages[currentIndex].src;
  lightboxImg.alt = galleryImages[currentIndex].alt;
}

function initLightbox() {
  if (!lightbox) return;

  // Remove old click listeners by resetting onclick handlers
  document.querySelectorAll('.gallery-img').forEach(container => {
    container.onclick = null;
  });

  // Collect images from whichever tab view is currently visible
  // Falls back to all gallery images if no tab system is present
  const visibleImgs = document.querySelectorAll(
    '.tab-view:not([style*="none"]) .gallery-img img'
  );
  const allImgs = document.querySelectorAll('.gallery-img img');
  galleryImages = Array.from(visibleImgs.length ? visibleImgs : allImgs);

  // Attach click handlers
  galleryImages.forEach((img, i) => {
    img.parentElement.addEventListener('click', () => {
      currentIndex = i;
      openLightbox(img.src, img.alt);
    });
  });
}

if (lightbox) {
  initLightbox();

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev)  lightboxPrev.addEventListener('click', showPrev);
  if (lightboxNext)  lightboxNext.addEventListener('click', showNext);

  // Click the dark backdrop to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}


// ============================================================
// 6. SCROLL REVEAL
// Uses IntersectionObserver to fade elements up as they enter
// the viewport. Applies to cards, gallery items, and other
// key content blocks.
// ============================================================

const revealEls = document.querySelectorAll(
  '.skill-card, .project-card, .masonry-item, .project-full, .metric-card, .exp-item, .guide-card, .guide-card-v2'
);

if ('IntersectionObserver' in window && revealEls.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Small stagger delay per element for a wave effect
        entry.target.style.animation = `fadeUp 0.5s ${i * 0.04}s ease both`;
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => {
    el.style.opacity = '0'; // hidden before observer fires
    observer.observe(el);
  });
}
