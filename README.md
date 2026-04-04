# Nick Celotto — Portfolio Website

## File Structure

```
nickcelotto.com/
├── index.html          ← Homepage
├── projects.html       ← Projects deep-dive page
├── photography.html    ← Photography gallery
├── style.css           ← All styles
├── main.js             ← Nav, filters, lightbox
└── assets/             ← ALL your images go here
    ├── profile.jpg         ← Your profile photo (homepage)
    ├── project1.jpg        ← Sales Dashboard screenshot
    ├── project2.jpg        ← Churn Analysis screenshot
    ├── project3.jpg        ← SQL project screenshot
    ├── photo1.jpg          ← Photography images
    ├── photo2.jpg
    ├── photo3.jpg
    ├── photo4.jpg
    ├── photo5.jpg
    ├── photo6.jpg
    ├── photo7.jpg
    ├── photo8.jpg
    └── photo9.jpg
```

---

## Customizing Your Content

### 1. Profile & Bio (index.html)
Search for the Bio section and update the three `<p class="bio-text">` paragraphs with your actual bio.

### 2. Social Links
All social links have placeholder URLs. Search for `nickcelotto` and replace with your actual usernames/URLs:
- LinkedIn: `https://www.linkedin.com/in/YOUR_USERNAME`
- GitHub: `https://github.com/YOUR_USERNAME`
- Tableau Public: `https://public.tableau.com/app/profile/YOUR_USERNAME`
- Instagram: `https://www.instagram.com/YOUR_USERNAME`
- Email: `mailto:YOUR@EMAIL.com`

### 3. Adding Your Images
Create an `assets/` folder next to your HTML files and add your images with the exact filenames listed above. Supported formats: .jpg, .png, .webp

**Profile photo:** Ideally 480×600px or similar portrait ratio
**Project images:** Screenshots of your work — 800×500px works well
**Photography:** Any size — the gallery handles it

### 4. Adding More Projects (projects.html)
Copy an existing `<article class="project-detail-card">` block and:
- Change the `id` (e.g., `id="project5"`)
- Update `data-tags` to match the filter (tableau, python, sql, excel)
- Add the new image to assets/
- Fill in title, description, highlights, and links

### 5. Adding More Photos (photography.html)
Copy a `<div class="masonry-item">` block and:
- Update `data-category` (street, landscape, portrait, urban)
- Change the img src to your new file
- Add `.tall` class to the `.gallery-img` div for portrait-oriented photos
- Add `.wide` class for very horizontal photos

### 6. Adding New Photo Categories
Add a new filter button in photography.html:
```html
<button class="filter-btn" data-filter="YOURCATEGORY">Your Category</button>
```
Then use `data-category="YOURCATEGORY"` on your masonry items.

---

## Deploying to nickcelotto.com

Since you already own the domain, the simplest options are:

### Option A: Netlify (recommended, free)
1. Go to netlify.com → New site → Deploy manually
2. Drag your entire project folder into the deploy box
3. Connect your domain in Site Settings → Domain Management

### Option B: GitHub Pages (free)
1. Push files to a GitHub repo named `nickcelotto.github.io`
2. Enable Pages in repo Settings → Pages
3. Point your custom domain to GitHub in DNS settings

### Option C: Any web host
Upload all files via FTP to your host's public_html folder.

---

## Making Changes Later

**Style changes:** All visual design lives in `style.css`. The key CSS variables at the top (`--ink`, `--paper`, `--accent`, etc.) control the color palette — change these to retheme the whole site.

**Layout:** The site uses CSS Grid throughout. The `--max-w: 1100px` variable controls the max content width.

**Fonts:** Currently using DM Serif Display + DM Sans from Google Fonts. Change the `<link>` in the `<head>` of each HTML file and the `--serif`/`--sans` variables in style.css.
