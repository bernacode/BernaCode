/**
 * @fileoverview Logic to load and render Markdown articles.
 * Reads the 'post' query parameter, fetches the corresponding .md file,
 * and renders it using the 'marked' library. Also handles post navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const postName = params.get('post');
  const container = document.getElementById('markdown-content');

  // If no post parameter is present, show error or redirect
  if (!postName) {
    if (container) {
      container.innerHTML = `
        <div class="alert alert-warning">
          <strong>Error:</strong> No se especificó ningún artículo.
          <br>
          <a href="index.html" class="alert-link">Volver al inicio</a>
        </div>
      `;
    }
    return;
  }

  // Initial Load
  loadArticle(postName);

  // Listen for language changes to reload content without refresh if possible, 
  // or just to ensure correctness if the user toggles logic in main.js
  // Assuming main.js emits a custom event or we assume reload. 
  // For now, let's just make sure loadArticle is capable.
  
  // We can hook into the language toggle button if we can find it, https://gemini.google.com/app/74e371e4d9386b13?hl=es
  // but main.js seems to handle it. 
  // Best approach: If main.js triggers a page reload or text update, we are good.
  // If we want dynamic md reloading:
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
        // Wait a small moment for main.js to update localStorage/state
        setTimeout(() => loadArticle(postName), 50);
    });
  }
});

/**
 * loads the article based on current language
 */
/**
 * loads the article based on current language
 */
function loadArticle(postName) {
    const container = document.getElementById('markdown-content');
    if (!container) return;

    // Detect language
    const currentLang = localStorage.getItem('lang') || 'es'; // 'es' or 'en'
    const suffix = currentLang === 'en' ? '_en' : '_es';
    const filePath = `articles/${postName}${suffix}.md`;

    // Fetch both the markdown and the manifest to get tags
    Promise.all([
      fetch(filePath).then(r => {
        if (!r.ok) {
           if (currentLang === 'en') {
             console.warn(`Translation for ${postName} not found, falling back to ES.`);
             return fetch(`articles/${postName}_es.md`).then(r => r.text());
           }
           throw new Error(`Article '${postName}' not found (404)`);
        }
        return r.text();
      }),
      fetch('articles/manifest.json').then(r => r.json())
    ])
    .then(([markdown, manifest]) => {
      if (typeof marked !== 'undefined' && container) {
        container.innerHTML = marked.parse(markdown);
        
        // Find metadata in manifest
        const postData = manifest.find(p => p.filename === postName);
        
        // Update document title
        const firstH1 = container.querySelector('h1');
        if (firstH1) {
          document.title = `${firstH1.innerText} | BernaCode`;
          
          // Inject Tags if available
          if (postData && postData.tags && postData.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'tech-tags mb-4 mt-2';
            
            const tagsHtml = postData.tags.map(tag => 
              `<span class="badge-tech">${tag}</span>`
            ).join('');
            
            tagsContainer.innerHTML = tagsHtml;
            firstH1.parentNode.insertBefore(tagsContainer, firstH1.nextSibling);
          }
        }
      }
      // Re-load nav and history to reflect language
      loadArticleNavigation(postName);
      loadArticleHistory(postName);
    })
    .catch(err => {
      if (container) {
        container.innerHTML = `
          <div class="alert alert-danger">
            <h4>Error al cargar el artículo / Error loading article</h4>
            <p>${err.message}</p>
            <a href="index.html" class="btn btn-outline-danger btn-sm mt-2">Volver / Back</a>
          </div>
        `;
      }
      console.error('Loader Error:', err);
    });
}

/**
 * Loads the manifest to determine previous and next posts.
 * @param {string} currentSlug - The filename of the current post.
 */
function loadArticleNavigation(currentSlug) {
  const navContainer = document.getElementById('post-nav');
  if (!navContainer) return;

  const currentLang = localStorage.getItem('lang') || 'es';

  fetch('articles/manifest.json')
    .then(res => res.json())
    .then(posts => {
      const currentIndex = posts.findIndex(p => p.filename === currentSlug);
      
      if (currentIndex === -1) return; // Current post not found

      const prevPost = posts[currentIndex - 1]; 
      const nextPost = posts[currentIndex + 1];

      let navHtml = '';

      // Text for buttons
      const textPrev = currentLang === 'en' ? 'Previous' : 'Anterior';
      const textNext = currentLang === 'en' ? 'Next' : 'Siguiente';

      // PREVIOUS BUTTON (Left)
      if (prevPost) {
        const title = prevPost.title[currentLang] || prevPost.title['es'];
        navHtml += `
          <a href="article.html?post=${prevPost.filename}" class="nav-post-btn text-start">
            <small class="text-muted d-block mb-1"><i class="fas fa-arrow-left me-1"></i> ${textPrev}</small>
            <span class="fw-bold text-accent">${title}</span>
          </a>
        `;
      } else {
        navHtml += `<div></div>`; // Spacer
      }

      // NEXT BUTTON (Right)
      if (nextPost) {
        const title = nextPost.title[currentLang] || nextPost.title['es'];
        navHtml += `
          <a href="article.html?post=${nextPost.filename}" class="nav-post-btn text-end">
            <small class="text-muted d-block mb-1">${textNext} <i class="fas fa-arrow-right ms-1"></i></small>
            <span class="fw-bold text-accent">${title}</span>
          </a>
        `;
      } else {
        navHtml += `<div></div>`; // Spacer
      }

      navContainer.innerHTML = navHtml;
    })
    .catch(err => console.error('Nav Load Error:', err));
}

/**
 * Loads the full article list into the sidebar history.
 * @param {string} currentSlug - current post to highlight or exclude.
 */
/**
 * Loads the full article list into the sidebar history with pagination.
 * @param {string} currentSlug - current post to highlight or exclude.
 */
function loadArticleHistory(currentSlug) {
  const historyList = document.getElementById('article-history-list');
  if (!historyList) return;
  const currentLang = localStorage.getItem('lang') || 'es';
  const ITEMS_PER_PAGE = 5;

  fetch('articles/manifest.json')
    .then(res => res.json())
    .then(posts => {
      // Sort posts by date descending (newest first)
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Initialize pagination state
      let currentPage = 1;
      const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);

      const renderPage = (page) => {
        historyList.innerHTML = '';
        
        if (posts.length === 0) {
          historyList.innerHTML = '<li class="text-muted small">No hay posts disponibles.</li>';
          return;
        }

        // Calculate slice
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pagePosts = posts.slice(start, end);

        // Render posts
        pagePosts.forEach(post => {
          const isActive = post.filename === currentSlug;
          
          // Safer title handling
          let title = "Sin título";
          if (post.title) {
              if (typeof post.title === 'string') {
                  title = post.title;
              } else if (typeof post.title === 'object') {
                  title = post.title[currentLang] || post.title['es'] || post.title['en'] || "Untitled";
              }
          }
          
          const li = document.createElement('li');
          li.className = 'history-item mb-2';
          
          li.innerHTML = `
            <a href="article.html?post=${post.filename}" class="history-link ${isActive ? 'active' : ''}">
              <span class="d-block fw-semibold text-truncate">${title}</span>
              <small class="text-muted">${post.date}</small>
            </a>
          `;
          historyList.appendChild(li);
        });

        // Use standard pagination labels or simple arrows
        const labelPrev = currentLang === 'en' ? 'Prev' : 'Ant';
        const labelNext = currentLang === 'en' ? 'Next' : 'Sig';

        // Render Pagination Controls if needed
        if (totalPages > 1) {
          const controls = document.createElement('li');
          controls.className = 'd-flex justify-content-between align-items-center mt-3 pt-2 border-top small';
          
          // Prev Button
          const prevBtn = document.createElement('button');
          prevBtn.className = 'btn btn-sm btn-link text-decoration-none p-0';
          prevBtn.innerHTML = `<i class="fas fa-chevron-left"></i> ${labelPrev}`;
          prevBtn.disabled = page === 1;
          prevBtn.onclick = () => {
            if (currentPage > 1) {
              currentPage--;
              renderPage(currentPage);
            }
          };

          // Page Indicator
          const indicator = document.createElement('span');
          indicator.className = 'text-muted';
          indicator.innerText = `${page} / ${totalPages}`;

          // Next Button
          const nextBtn = document.createElement('button');
          nextBtn.className = 'btn btn-sm btn-link text-decoration-none p-0';
          nextBtn.innerHTML = `${labelNext} <i class="fas fa-chevron-right"></i>`;
          nextBtn.disabled = page === totalPages;
          nextBtn.onclick = () => {
             if (currentPage < totalPages) {
               currentPage++;
               renderPage(currentPage);
             }
          };

          controls.appendChild(prevBtn);
          controls.appendChild(indicator);
          controls.appendChild(nextBtn);
          historyList.appendChild(controls);
        }
      };

      // Initial Render
      renderPage(currentPage);

    })
    .catch(err => {
      console.error('History Load Error:', err);
      // Show actual error message to user for better debugging
      if (historyList) historyList.innerHTML = `<li class="text-danger small">Error: ${err.message}</li>`;
    });
}
