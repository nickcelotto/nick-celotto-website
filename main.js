// ============================================================
// MAIN.JS - Nick Celotto Portfolio
//
// Sections:
// 1. Mobile nav toggle
// 2. Tab switching (projects + photography pages)
// 3. Travel guide cards - expand/collapse
// 4. Legacy filter buttons (kept for compatibility)
// 5. Lightbox (photography gallery)
// 6. Scroll reveal
// 7. Countdown (upcoming trip)
// 8. Scroll-tracking plane (guide page day-by-day)
// 9. Interactive map (travel page - Leaflet)
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
  if (!p) return; // no param - default tab stays active

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

      // Travel page Map tab - lazy-init/resize Leaflet (see section 10)
      if (target === 'map') {
        handleMapTabActivation();
      }
    });
  });
}

// Preview-strip links (e.g. "Full gallery →" on the Travel About tab)
// programmatically click the matching tab button, reusing all the
// logic above instead of duplicating it.
document.querySelectorAll('[data-goto-tab]').forEach(el => {
  el.addEventListener('click', () => {
    const target = document.querySelector(`.tab-btn[data-view="${el.dataset.gotoTab}"]`);
    if (target) target.click();
    // The link sits far down the About tab, so jump back to the top of the page
    // or the new tab would open at whatever scroll position the link was at.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
});


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
  galleryImages = Array.from(visibleImgs.length ? visibleImgs : allImgs)
    .filter(img => !img.closest('.gallery-trip-section[hidden]'));

  // Attach click handlers
  galleryImages.forEach((img, i) => {
    img.parentElement.onclick = () => {
      currentIndex = i;
      openLightbox(img.src, img.alt);
    };
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
  '.skill-card, .project-card, .masonry-item, .project-full, .metric-card, .exp-item, .guide-card, .guide-card-v2, .guide-card-min, .stamp-card, .gear-card, .film-other-card'
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


// ============================================================
// 7. COUNTDOWN (upcoming trip)
// Elements with data-countdown-target="YYYY-MM-DD" show a live
// T-minus countdown instead of static text. Leave the attribute
// empty (as on the placeholder "Next trip" stamp) and it's a
// no-op - the original text stays put.
// ============================================================

const countdownEls = document.querySelectorAll('[data-countdown-target]');

if (countdownEls.length > 0) {
  function updateCountdowns() {
    countdownEls.forEach(el => {
      const dateStr = el.dataset.countdownTarget;
      if (!dateStr) return; // no date set yet

      const target = new Date(dateStr + 'T00:00:00');
      if (isNaN(target.getTime())) return;

      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        el.textContent = 'Departed';
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      el.textContent = days > 0 ? `T-minus ${days}d ${hours}h` : `T-minus ${hours}h`;
      el.classList.remove('stamp-caption-status--muted');
    });
  }

  updateCountdowns();
  setInterval(updateCountdowns, 60000);
}


// ============================================================
// 8. SCROLL-TRACKING PLANE (guide page day-by-day)
// Moves a small plane icon down the .journal-track rail in step
// with how far the reader has scrolled through the entries.
// ============================================================

const journalTrack   = document.querySelector('.journal-track');
const planeTracker    = document.querySelector('.plane-tracker');

if (journalTrack && planeTracker) {
  let planeTicking = false;

  function updatePlanePosition() {
    const rect = journalTrack.getBoundingClientRect();
    const trackHeight = journalTrack.offsetHeight;
    const viewportAnchor = window.innerHeight * 0.5;

    let progress = (viewportAnchor - rect.top) / trackHeight;
    progress = Math.max(0, Math.min(1, progress));

    planeTracker.style.top = (progress * trackHeight) + 'px';
    planeTicking = false;
  }

  function onTrackScroll() {
    if (!planeTicking) {
      requestAnimationFrame(updatePlanePosition);
      planeTicking = true;
    }
  }

  window.addEventListener('scroll', onTrackScroll);
  window.addEventListener('resize', onTrackScroll);
  updatePlanePosition();
}


// ============================================================
// 9. INTERACTIVE MAP (Travel page - Leaflet choropleth)
// Colors in whole countries/states rather than dropping a pin, so
// the map can show everywhere in life - not just trips with a
// written journal. Every place gets the same fill; a journal link
// shows in the popup when one exists, but it's not a separate
// visual category. Lazy-inits the first time the Map tab opens
// (Leaflet can't measure a display:none container correctly), and
// calls invalidateSize() on every reopen so tiles fill it.
//
// Boundary data loads from two public GeoJSON sources at runtime:
//   - World countries: johan/world.geo.json (id = 3-letter ISO code)
//   - US states: PublicaMundi/MappingAPI (properties.name = state name)
//
// ★ TO ADD A PLACE: add an entry to the `TRAVEL_PLACES` array below.
//   - type: 'country' uses a 3-letter ISO code (code) - e.g. Jamaica
//     is 'JAM', Portugal is 'PRT'. Look codes up at
//     https://www.iso.org/obp/ui/#search if unsure.
//   - type: 'state' uses the full US state name as it appears in
//     the census data - e.g. 'Illinois'.
//   - category: 'country' (sovereign nation, counts toward the
//     Countries ring), 'state' (one of the 50 US states, counts
//     toward the US States ring), or 'other' (territories, DC -
//     shown in its own sidebar section, doesn't count toward
//     either ring's percentage).
//   - fallbackCenter: [lat, lng] - for type: 'country' places only.
//     Some small territories aren't included as shapes in the
//     boundary dataset, in which case a plain dot gets dropped
//     here instead so the place is still clickable/zoomable. Worth
//     adding this any time you add a small country/territory -
//     costs nothing if the shape does load fine, and saves you a
//     "why doesn't this one zoom in" moment if it doesn't.
//   - subregions: [{ name, fallbackCenter }] - optional, for a
//     country with an outlying island/region the main dataset
//     tends to drop (Madeira for Portugal is the current example).
//     Each one is fetched from a separate, more detailed dataset
//     and filled in on its own, using the PARENT place's popup and
//     journal link - it's not a separate sidebar entry.
//   - journal: a URL if there's a written journal for this place,
//     otherwise null.
//   Then add a matching .map-trip-item row in travel.html's
//   sidebar (in the right category section) with a matching id
//   for the click-to-fly behavior.
//   Both this array and the sidebar are kept alphabetical within
//   each section (Countries / US States / each territory group) -
//   slot new entries in alphabetically rather than at the end.
// ============================================================

let travelMapInstance = null;

const TRAVEL_PLACES = [
  // ── Countries (sovereign nations, alphabetical) ──
  { name: 'Dominican Republic', flag: '🇩🇴', type: 'country', category: 'country', code: 'DOM', meta: '', fallbackCenter: [18.7, -70.16], journal: null, sidebar: 'sidebar-dr' },
  { name: 'Ireland', flag: '🇮🇪', type: 'country', category: 'country', code: 'IRL', meta: '', fallbackCenter: [53.4, -8.0], journal: null, sidebar: 'sidebar-ireland' },
  {
    name: 'Jamaica', flag: '🇯🇲', type: 'country', category: 'country', code: 'JAM',
    meta: '', fallbackCenter: [18.15, -77.3],
    journal: null, sidebar: 'sidebar-jamaica',
  },
  {
    name: 'Portugal', flag: '🇵🇹', type: 'country', category: 'country', code: 'PRT',
    meta: '', fallbackCenter: [39.5, -8.0],
    journal: 'guide-portugal.html', sidebar: 'sidebar-portugal',
  },
  { name: 'Spain', flag: '🇪🇸', type: 'country', category: 'country', code: 'ESP', meta: '', fallbackCenter: [40.0, -3.7], journal: null, sidebar: 'sidebar-spain' },
  { name: 'United Kingdom', flag: '🇬🇧', type: 'country', category: 'country', code: 'GBR', meta: '', fallbackCenter: [54.0, -2.0], journal: null, sidebar: 'sidebar-uk' },
  { name: 'USA', flag: '🇺🇸', type: 'country', category: 'country', code: 'USA', meta: '', fallbackCenter: [39.8, -98.5], journal: null, sidebar: 'sidebar-usa' },

  // ── US states ──
  { name: 'California', flag: '🇺🇸', type: 'state', category: 'state', code: 'California', meta: '', journal: null, sidebar: 'sidebar-california' },
  { name: 'Connecticut', flag: '🇺🇸', type: 'state', category: 'state', code: 'Connecticut', meta: '', journal: null, sidebar: 'sidebar-connecticut' },
  { name: 'Florida', flag: '🇺🇸', type: 'state', category: 'state', code: 'Florida', meta: '', journal: null, sidebar: 'sidebar-florida' },
  { name: 'Illinois', flag: '🇺🇸', type: 'state', category: 'state', code: 'Illinois', meta: '', journal: null, sidebar: 'sidebar-illinois' },
  { name: 'Kentucky', flag: '🇺🇸', type: 'state', category: 'state', code: 'Kentucky', meta: '', journal: null, sidebar: 'sidebar-kentucky' },
  { name: 'Massachusetts', flag: '🇺🇸', type: 'state', category: 'state', code: 'Massachusetts', meta: '', journal: null, sidebar: 'sidebar-massachusetts' },
  { name: 'New Hampshire', flag: '🇺🇸', type: 'state', category: 'state', code: 'New Hampshire', meta: '', journal: null, sidebar: 'sidebar-new-hampshire' },
  { name: 'New Jersey', flag: '🇺🇸', type: 'state', category: 'state', code: 'New Jersey', meta: '', journal: null, sidebar: 'sidebar-new-jersey' },
  { name: 'New York', flag: '🇺🇸', type: 'state', category: 'state', code: 'New York', meta: '', journal: null, sidebar: 'sidebar-new-york' },
  { name: 'Pennsylvania', flag: '🇺🇸', type: 'state', category: 'state', code: 'Pennsylvania', meta: '', journal: null, sidebar: 'sidebar-pennsylvania' },
  { name: 'Rhode Island', flag: '🇺🇸', type: 'state', category: 'state', code: 'Rhode Island', meta: '', journal: null, sidebar: 'sidebar-rhode-island' },
  { name: 'South Carolina', flag: '🇺🇸', type: 'state', category: 'state', code: 'South Carolina', meta: '', journal: null, sidebar: 'sidebar-south-carolina' },
  { name: 'Texas', flag: '🇺🇸', type: 'state', category: 'state', code: 'Texas', meta: '', journal: null, sidebar: 'sidebar-texas' },
  { name: 'Vermont', flag: '🇺🇸', type: 'state', category: 'state', code: 'Vermont', meta: '', journal: null, sidebar: 'sidebar-vermont' },
  { name: 'Virginia', flag: '🇺🇸', type: 'state', category: 'state', code: 'Virginia', meta: '', journal: null, sidebar: 'sidebar-virginia' },
  { name: 'West Virginia', flag: '🇺🇸', type: 'state', category: 'state', code: 'West Virginia', meta: '', journal: null, sidebar: 'sidebar-west-virginia' },

  // ── Territories & federal district (not sovereign countries or
  //    full states - `group` controls which sidebar section each
  //    lands in, separate from `category` which controls ring math) ──
  { name: 'Aruba', flag: '🇦🇼', type: 'country', category: 'other', group: 'dutch', code: 'ABW', meta: '', fallbackCenter: [12.52, -69.97], journal: null, sidebar: 'sidebar-aruba' },
  { name: 'Bermuda', flag: '🇧🇲', type: 'country', category: 'other', group: 'british', code: 'BMU', meta: '', fallbackCenter: [32.3, -64.75], journal: null, sidebar: 'sidebar-bermuda' },
  { name: 'British Virgin Islands', flag: '🇻🇬', type: 'country', category: 'other', group: 'british', code: 'VGB', meta: '', fallbackCenter: [18.42, -64.64], journal: null, sidebar: 'sidebar-bvi' },
  { name: 'Puerto Rico', flag: '🇵🇷', type: 'country', category: 'other', group: 'us-territory', code: 'PRI', meta: '', fallbackCenter: [18.22, -66.59], journal: null, sidebar: 'sidebar-puerto-rico' },
  { name: 'US Virgin Islands', flag: '🇻🇮', type: 'country', category: 'other', group: 'us-territory', code: 'VIR', meta: '', fallbackCenter: [18.34, -64.90], journal: null, sidebar: 'sidebar-usvi' },
  { name: 'Washington, DC', flag: '🇺🇸', type: 'state', category: 'other', group: 'federal-district', code: 'District of Columbia', meta: '', journal: null, sidebar: 'sidebar-dc' },
];

const TRAVEL_PLACE_STYLE = { fillColor: '#c2622a', fillOpacity: 0.4, color: '#c2622a', weight: 1.5, dashArray: null };

function handleMapTabActivation() {
  const mapEl = document.getElementById('travelMap');
  if (!mapEl || typeof L === 'undefined') return;

  if (!travelMapInstance) {
    setTimeout(initTravelMap, 50);
  } else {
    setTimeout(() => travelMapInstance.invalidateSize(), 50);
  }
}

function initTravelMap() {
  const mapEl = document.getElementById('travelMap');
  if (!mapEl || typeof L === 'undefined' || travelMapInstance) return;

  // Open on the whole world (Been-style). The zoom is chosen so the
  // world's width exactly fills the box, which means no side of the
  // map is ever repeated (no second Alaska or Russia). The map can't
  // be panned past the dateline or zoomed out past this view.
  const map = L.map('travelMap', {
    center: [19, 0],
    zoom: 2,
    zoomSnap: 0.25,
    minZoom: 1,
    maxZoom: 10,
    maxBounds: [[-85, -180], [85, 180]],
    maxBoundsViscosity: 1.0,
  });

  function worldZoom() {
    const w = map.getSize().x;
    return Math.ceil(Math.log2(w / 256) * 4) / 4;
  }
  const worldCenter = [19, 0];

  // Height follows width (about 1 : 2) so the full world, including
  // all of Alaska and Norway, fits at the width-fit zoom on any
  // desktop screen. On phones the CSS sets the height instead.
  const layoutEl = mapEl.parentElement;
  function sizeMap() {
    if (window.innerWidth <= 800) {
      layoutEl.style.height = '';
    } else if (mapEl.clientWidth > 0) {
      const h = Math.max(480, Math.min(Math.round(mapEl.clientWidth * 0.5), Math.round(window.innerHeight * 0.9)));
      layoutEl.style.height = h + 'px';
    }
    map.invalidateSize();
  }

  map.on('resize', () => {
    const z = worldZoom();
    map.setMinZoom(z);
    if (map.getZoom() < z) map.setView(worldCenter, z, { animate: false });
  });
  sizeMap();
  map.setMinZoom(worldZoom());
  map.setView(worldCenter, worldZoom(), { animate: false });
  window.addEventListener('resize', sizeMap);

  // OpenStreetMap's own tiles: no account or API key needed, so they
  // can't be blocked by a provider's auth rules (Stadia and CARTO both
  // return error tiles on the live domain). The CSS in style.css grays
  // them down so the terracotta fills stand out.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    noWrap: true,
  }).addTo(map);

  travelMapInstance = map;

  // Reset button - sits next to the +/- zoom controls (both default
  // to Leaflet's "topleft" position) and flies back to the starting
  // view. Styling is inline since it's a Leaflet-generated control
  // element, not something style.css can target easily.
  const ResetControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function () {
      const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
      btn.innerHTML = '&#8634;';
      btn.title = 'Reset view';
      btn.setAttribute('aria-label', 'Reset map view');
      btn.style.cssText = 'width:30px;height:30px;font-size:16px;background:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#c2622a;line-height:1;';
      btn.onmouseover = () => { btn.style.background = '#f7f7f6'; };
      btn.onmouseout  = () => { btn.style.background = '#fff'; };
      L.DomEvent.on(btn, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        map.closePopup();
        goHome();
      });
      return btn;
    },
  });
  new ResetControl().addTo(map);

  // Two views: Countries (whole-country fills, USA included) and
  // US States (zoomed on the US, only visited states filled). Each
  // view has its own layer group; the toggle swaps which one is on
  // the map.
  const countryGroup = L.layerGroup().addTo(map);
  const stateGroup = L.layerGroup();
  const US_BOUNDS = L.latLngBounds([[24.3, -125.5], [49.8, -66.0]]);
  const modeButtons = {};
  let viewMode = 'country';

  function goHome() {
    if (viewMode === 'state') {
      map.flyToBounds(US_BOUNDS, { duration: 1, padding: [10, 10] });
    } else {
      map.flyTo(worldCenter, worldZoom(), { duration: 1 });
    }
  }

  // Swaps the visible layer group. Returns true if the view changed.
  function setMode(mode) {
    if (mode === viewMode) return false;
    viewMode = mode;
    map.closePopup();
    if (mode === 'state') {
      map.removeLayer(countryGroup);
      stateGroup.addTo(map);
    } else {
      map.removeLayer(stateGroup);
      countryGroup.addTo(map);
    }
    Object.keys(modeButtons).forEach(k => modeButtons[k].classList.toggle('active', k === viewMode));
    return true;
  }

  const ModeControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
      const wrap = L.DomUtil.create('div', 'leaflet-bar map-mode-toggle');
      [['country', 'Countries'], ['state', 'US States']].forEach(([key, label]) => {
        const btn = L.DomUtil.create('button', 'map-mode-btn' + (key === viewMode ? ' active' : ''), wrap);
        btn.type = 'button';
        btn.textContent = label;
        modeButtons[key] = btn;
        L.DomEvent.on(btn, 'click', () => {
          if (setMode(key)) goHome();
        });
      });
      L.DomEvent.disableClickPropagation(wrap);
      return wrap;
    },
  });
  new ModeControl().addTo(map);

  // Shared popup content - used by both real polygon layers and the
  // fallback markers below.
  function popupContent(place) {
    const link = place.journal
      ? `<a href="${place.journal}" class="popup-link">Read the journal &rarr;</a>`
      : '';
    const meta = place.meta
      ? `<div class="popup-meta">${place.meta}</div>`
      : '';
    return `
      <div class="popup-flag">${place.flag}</div>
      <div class="popup-name">${place.name}</div>
      ${meta}
      ${link}
    `;
  }

  // Shared popup/interaction wiring for both the country and state
  // choropleth layers.
  function wireFeatureLayer(layer, place) {
    layer.bindPopup(popupContent(place));

    const baseStyle = TRAVEL_PLACE_STYLE;

    layer.on('mouseover', () => layer.setStyle({ fillOpacity: Math.min(baseStyle.fillOpacity + 0.2, 0.8), weight: baseStyle.weight + 1 }));
    layer.on('mouseout', () => layer.setStyle(baseStyle));

    const flyToLayer = () => {
      setMode(place.type === 'state' ? 'state' : 'country');
      map.flyToBounds(layer.getBounds(), { duration: 1.0, maxZoom: 6 });
      setTimeout(() => layer.openPopup(), 1050);
    };
    layer.on('click', flyToLayer);

    const sidebarEl = document.getElementById(place.sidebar);
    if (sidebarEl) sidebarEl.addEventListener('click', flyToLayer);
  }

  // Fallback for places whose shape isn't in the boundary dataset
  // (some small territories aren't included as separate polygons).
  // Drops a small dot at a fixed center point instead of a filled
  // shape, so the zoom-in/popup behavior still works either way.
  function wireFallbackPlace(place) {
    if (!place.fallbackCenter) return;

    const marker = L.circleMarker(place.fallbackCenter, {
      radius: 7,
      color: TRAVEL_PLACE_STYLE.color,
      weight: 1.5,
      fillColor: TRAVEL_PLACE_STYLE.fillColor,
      fillOpacity: 0.7,
    }).addTo(countryGroup);

    marker.bindPopup(popupContent(place));

    const flyToMarker = () => {
      setMode('country');
      map.flyTo(place.fallbackCenter, 7, { duration: 1.0 });
      setTimeout(() => marker.openPopup(), 1050);
    };
    marker.on('click', flyToMarker);

    const sidebarEl = document.getElementById(place.sidebar);
    if (sidebarEl) sidebarEl.addEventListener('click', flyToMarker);
  }

  // Best-effort matchers for the supplementary fetch below. Rather
  // than guessing which exact property field (NAME? ADMIN?
  // SOVEREIGNT?) holds the text we need - Natural Earth's schema
  // varies by entity and a wrong guess silently fails - this
  // flattens every string property on the feature into one blob
  // and searches that instead. More brute-force, much less brittle.
  function allPropText(props) {
    return Object.values(props || {})
      .filter(v => typeof v === 'string')
      .join(' | ')
      .toLowerCase();
  }

  const NE_SUPPLEMENT_MATCHERS = {
    ABW: (props) => allPropText(props).includes('aruba'),
    VGB: (props) => {
      const t = allPropText(props);
      return t.includes('virgin') && (t.includes('brit') || t.includes('united kingdom') || t.includes('vgb'));
    },
    VIR: (props) => {
      const t = allPropText(props);
      return t.includes('virgin') && (t.includes('united states') || t.includes('u.s.') || t.includes(' vir '));
    },
  };

  function fetchSupplementaryTerritories(places) {
    const withMatchers = places.filter(p => NE_SUPPLEMENT_MATCHERS[p.code]);
    const withoutMatchers = places.filter(p => !NE_SUPPLEMENT_MATCHERS[p.code]);

    // No point fetching a multi-MB file for places we have no way
    // to identify in it - straight to the dot fallback for those.
    withoutMatchers.forEach(wireFallbackPlace);
    if (!withMatchers.length) return;

    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        withMatchers.forEach(place => {
          const matcher = NE_SUPPLEMENT_MATCHERS[place.code];
          const feature = data.features.find(f => matcher(f.properties || {}));

          if (feature) {
            L.geoJSON(feature, {
              style: TRAVEL_PLACE_STYLE,
              onEachFeature: (f, layer) => wireFeatureLayer(layer, place),
            }).addTo(countryGroup);
          } else {
            // Not in this dataset either - dot fallback keeps it
            // clickable regardless.
            wireFallbackPlace(place);
          }
        });
      })
      .catch(() => {
        // Supplementary source failed to load - dots for all of them.
        withMatchers.forEach(wireFallbackPlace);
      });
  }

  // Drops a small clickable dot for an outlying subregion (e.g.
  // Madeira) that shows the PARENT place's popup/journal link, not
  // its own. Deliberately not wired to the sidebar, since the
  // parent place already owns that sidebar row.
  function dropSubregionDot(place, sub) {
    if (!sub.fallbackCenter) return;
    const marker = L.circleMarker(sub.fallbackCenter, {
      radius: 6,
      color: TRAVEL_PLACE_STYLE.color,
      weight: 1.5,
      fillColor: TRAVEL_PLACE_STYLE.fillColor,
      fillOpacity: 0.7,
    }).addTo(countryGroup);
    marker.bindPopup(popupContent(place));
    marker.on('click', () => {
      map.flyTo(sub.fallbackCenter, 8, { duration: 1.0 });
      setTimeout(() => marker.openPopup(), 1050);
    });
  }

  // Fills in outlying islands/regions (e.g. Madeira for Portugal)
  // that the lightweight country-level dataset tends to drop, using
  // Natural Earth's admin-1 (states/provinces) layer instead. Falls
  // back to a plain dot per subregion if no shape is found there
  // either.
  function fetchSubregions(places) {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces_lakes.geojson')
      .then(res => res.json())
      .then(data => {
        places.forEach(place => {
          place.subregions.forEach(sub => {
            const nameLower = sub.name.toLowerCase();
            const feature = data.features.find(f => allPropText(f.properties || {}).includes(nameLower));

            if (feature) {
              L.geoJSON(feature, {
                style: TRAVEL_PLACE_STYLE,
                onEachFeature: (f, layer) => wireFeatureLayer(layer, place),
              }).addTo(countryGroup);
            } else {
              dropSubregionDot(place, sub);
            }
          });
        });
      })
      .catch(() => {
        // Supplementary source failed entirely - dots for every
        // subregion that has a fallback point.
        places.forEach(place => place.subregions.forEach(sub => dropSubregionDot(place, sub)));
      });
  }

  const countryPlaces = TRAVEL_PLACES.filter(p => p.type === 'country');
  const statePlaces = TRAVEL_PLACES.filter(p => p.type === 'state');

  if (countryPlaces.length) {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then(res => res.json())
      .then(data => {
        const countryCodes = countryPlaces.map(p => p.code);
        const matchedCodes = new Set();

        L.geoJSON(data, {
          filter: feature => countryCodes.includes(feature.id),
          style: feature => TRAVEL_PLACE_STYLE,
          onEachFeature: (feature, layer) => {
            matchedCodes.add(feature.id);
            const place = countryPlaces.find(p => p.code === feature.id);
            wireFeatureLayer(layer, place);
          },
        }).addTo(countryGroup);

        // Anything that didn't get a shape from the primary dataset
        // gets one more attempt from a larger, more detailed source
        // that's more likely to include small territories (the
        // johan/world.geo.json file above is lightweight but drops
        // some of these). Only the leftovers get fetched here, and
        // if a place still isn't found even in this dataset, it
        // falls back to a plain dot rather than nothing at all.
        const stillMissing = countryPlaces.filter(p => !matchedCodes.has(p.code));
        if (stillMissing.length) {
          fetchSupplementaryTerritories(stillMissing);
        }

        // Some places (e.g. Portugal/Madeira) have outlying islands
        // that the lightweight country-level dataset above tends to
        // drop - fill those in separately regardless of whether the
        // main country shape matched or not.
        const placesWithSubregions = countryPlaces.filter(p => p.subregions && p.subregions.length);
        if (placesWithSubregions.length) {
          fetchSubregions(placesWithSubregions);
        }
      })
      .catch(() => {
        // Boundary data failed to load entirely - fall back to dots
        // for every country place rather than showing nothing.
        countryPlaces.forEach(wireFallbackPlace);
      });
  }

  if (statePlaces.length) {
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(res => res.json())
      .then(data => {
        const stateNames = statePlaces.map(p => p.code);
        L.geoJSON(data, {
          filter: feature => stateNames.includes(feature.properties.name),
          style: feature => TRAVEL_PLACE_STYLE,
          onEachFeature: (feature, layer) => {
            const place = statePlaces.find(p => p.code === feature.properties.name);
            wireFeatureLayer(layer, place);
          },
        }).addTo(stateGroup);
      })
      .catch(() => { /* boundary data failed to load - map still works, just without fills */ });
  }

  // Fresh container just became visible - make sure Leaflet sizes
  // itself against the real box rather than a 0-height one.
  setTimeout(() => map.invalidateSize(), 100);
}


// ============================================================
// 10. MAP COMPLETION RINGS (Travel page)
// Draws the two progress rings in the Map sidebar (Countries /
// US States) from TRAVEL_PLACES - doesn't depend on Leaflet or
// the map being initialized, so it runs immediately rather than
// waiting for the Map tab to be opened.
//
// Denominators are fixed real-world totals: 195 countries, 50
// US states. Update WORLD_COUNTRY_TOTAL below if that ever
// changes (a country splits, merges, etc.) - unlikely, but cheap
// to keep correct.
// ============================================================

const WORLD_COUNTRY_TOTAL = 195;
const US_STATE_TOTAL = 50;

function setCompletionRing(prefix, count, total) {
  const fillEl = document.getElementById(`ring${prefix}Fill`);
  const numEl = document.getElementById(`num${prefix}`);
  const subEl = document.getElementById(`sub${prefix}`);
  if (!fillEl || !numEl) return;

  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(count / total, 1));

  fillEl.style.strokeDasharray = `${circumference}`;
  fillEl.style.strokeDashoffset = `${circumference * (1 - pct)}`;
  numEl.textContent = count;
  if (subEl) subEl.textContent = `${Math.round(pct * 100)}% of ${total}`;
}

(function initMapCompletionRings() {
  if (typeof TRAVEL_PLACES === 'undefined') return;
  const countryCount = TRAVEL_PLACES.filter(p => p.category === 'country').length;
  const stateCount = TRAVEL_PLACES.filter(p => p.category === 'state').length;
  setCompletionRing('Countries', countryCount, WORLD_COUNTRY_TOTAL);
  setCompletionRing('States', stateCount, US_STATE_TOTAL);
})();



// ============================================================
// 11. GALLERY TRIP FILTER
// Builds a chip row (All + one per .gallery-trip-section) and
// shows/hides trip sections when a chip is clicked.
// To add a trip: add a new .gallery-trip-section with a data-trip
// attribute in travel.html. A chip appears automatically.
// ============================================================

(function initGalleryFilter() {
  const bar = document.getElementById('galleryFilter');
  if (!bar) return;
  const sections = Array.from(document.querySelectorAll('.gallery-trip-section[data-trip]'));
  if (!sections.length) return;

  const chips = [{ key: 'all', label: 'All' }].concat(sections.map(s => {
    const flag  = s.querySelector('.gallery-trip-flag');
    const title = s.querySelector('.gallery-trip-title');
    return {
      key: s.dataset.trip,
      label: ((flag ? flag.textContent + ' ' : '') + (title ? title.textContent : s.dataset.trip)).trim()
    };
  }));

  chips.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-chip' + (i === 0 ? ' active' : '');
    btn.dataset.trip = c.key;
    btn.textContent = c.label;
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.gallery-chip').forEach(b => b.classList.toggle('active', b === btn));
      sections.forEach(s => { s.hidden = !(c.key === 'all' || s.dataset.trip === c.key); });
      if (typeof initLightbox === 'function') initLightbox();
    });
    bar.appendChild(btn);
  });
})();
