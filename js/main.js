/**
 * @fileoverview Main JavaScript logic for BernaCode portfolio.
 * Handles language toggling and sidebar interactions.
 * 
 * GOOGLE STYLE GUIDELINES:
 * - Indentation: 2 spaces.
 * - Variable declarations: const (preferred), let. No var.
 * - Documentation: JSDoc for functions and major blocks.
 */

/**
 * Initializes the language toggle functionality.
 * Reads saved language from localStorage, updates the <html> tag,
 * and sets up the click event listener for the toggle button.
 */
function initLanguageToggle() {
  const langToggle = document.getElementById('lang-toggle');
  const htmlElement = document.documentElement;
  
  // Set initial language from storage or default to 'es'
  const savedLang = localStorage.getItem('lang') || 'es';
  htmlElement.setAttribute('lang', savedLang);

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = htmlElement.getAttribute('lang');
      const newLang = currentLang === 'es' ? 'en' : 'es';
      
      htmlElement.setAttribute('lang', newLang);
      localStorage.setItem('lang', newLang);
      
      // Reload blog posts if sidebar exists
      loadBlogPosts();
    });
  }
}

/**
 * Initializes the Tech Blog sidebar interactions.
 * Sets up event listeners for opening and closing the sidebar
 * and toggling the visibility of the open button.
 */
function initSidebar() {
  const sidebar = document.getElementById('tech-blog-left');
  const openBtn = document.getElementById('blog-toggle-left');
  const closeBtn = document.getElementById('blog-close-left');

  if (openBtn && sidebar) {
    openBtn.addEventListener('click', () => {
      sidebar.classList.add('active');
      openBtn.classList.add('active', 'hidden');
    });
  }

  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('active');
      if (openBtn) {
        openBtn.classList.remove('active', 'hidden');
      }
    });
  }
}



// Blog State
const blogState = {
  posts: [],
  filtered: [],
  currentPage: 1,
  itemsPerPage: 4, // "no puede excederse el numero de articulos que soporta el espacio" (keeping it small)
  query: '',
  selectedTags: new Set()
};

/**
 * Fetches the blog manifest and initializes the blog sidebar.
 */
function loadBlogPosts() {
  const container = document.getElementById('blog-posts-container');
  if (!container) return;

  fetch('articles/manifest.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load properties');
      return response.json();
    })
    .then(posts => {
      blogState.posts = posts;
      // Extract all unique tags
      const allTags = new Set();
      posts.forEach(post => post.tags.forEach(tag => allTags.add(tag)));
      
      renderTags(allTags);
      applyFilters(); // Initial render
      initSearchListeners();
    })
    .catch(err => {
      console.error('Error loading posts:', err);
      container.innerHTML = '<p class="text-muted small text-center">No posts available.</p>';
    });
}

function initSearchListeners() {
  const searchInput = document.getElementById('tech-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      blogState.query = e.target.value.toLowerCase();
      blogState.currentPage = 1;
      applyFilters();
    });
  }
}

function renderTags(tags) {
  const container = document.getElementById('tech-filter-tags');
  if (!container) return;
  
  container.innerHTML = '';
  tags.forEach(tag => {
    const badge = document.createElement('span');
    badge.className = 'badge-dynamic small cursor-pointer opacity-75';
    badge.style.cursor = 'pointer';
    badge.style.fontSize = '0.7rem'; 
    badge.textContent = tag;
    
    badge.onclick = () => {
      if (blogState.selectedTags.has(tag)) {
        blogState.selectedTags.delete(tag);
        badge.classList.add('opacity-75');
        badge.style.border = '1px solid rgba(32, 201, 151, 0.3)';
      } else {
        blogState.selectedTags.add(tag);
        badge.classList.remove('opacity-75');
        badge.style.border = '1px solid var(--accent-color)';
      }
      blogState.currentPage = 1;
      applyFilters();
    };
    container.appendChild(badge);
  });
}

function applyFilters() {
  blogState.filtered = blogState.posts.filter(post => {
    const matchesQuery = post.title.es.toLowerCase().includes(blogState.query) || 
                         post.title.en.toLowerCase().includes(blogState.query);
    
    const matchesTags = blogState.selectedTags.size === 0 || 
                        post.tags.some(tag => blogState.selectedTags.has(tag));
    
    return matchesQuery && matchesTags;
  });
  
  renderPosts();
  renderPagination();
}

function renderPosts() {
  const container = document.getElementById('blog-posts-container');
  const currentLang = localStorage.getItem('lang') || 'es';
  
  container.innerHTML = '';
  
  if (blogState.filtered.length === 0) {
    container.innerHTML = '<p class="text-muted small text-center mt-5">No matches found.</p>';
    return;
  }

  const start = (blogState.currentPage - 1) * blogState.itemsPerPage;
  const end = start + blogState.itemsPerPage;
  const pageItems = blogState.filtered.slice(start, end);

  pageItems.forEach(post => {
    const article = document.createElement('article');
    article.className = 'tech-card mb-3';
    article.onclick = () => window.location.href = `article.html?post=${post.filename}`;
    
    const title = post.title[currentLang] || post.title['es'];
    const summary = post.summary[currentLang] || post.summary['es'];

    // Tags rendering
    const tagsHtml = post.tags.map(tag => `<span class="badge-tech">${tag}</span>`).join('');

    article.innerHTML = `
      <h5 class="mb-2">${title}</h5>
      <p class="mb-2 small text-muted">${summary}</p>
      <div class="tech-tags">
        ${tagsHtml}
      </div>
    `;
    
    container.appendChild(article);
  });
}

function renderPagination() {
  const container = document.getElementById('tech-pagination');
  if (!container) return;
  
  const totalPages = Math.ceil(blogState.filtered.length / blogState.itemsPerPage);
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <button class="btn btn-sm btn-outline-secondary ${blogState.currentPage === 1 ? 'disabled' : ''}" 
            onclick="changePage(-1)"><i class="fas fa-chevron-left"></i></button>
    <span class="small text-muted">Page ${blogState.currentPage} of ${totalPages}</span>
    <button class="btn btn-sm btn-outline-secondary ${blogState.currentPage === totalPages ? 'disabled' : ''}" 
            onclick="changePage(1)"><i class="fas fa-chevron-right"></i></button>
  `;
}

function changePage(delta) {
  blogState.currentPage += delta;
  renderPosts();
  renderPagination();
}

// Initialize application logic when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
  initLanguageToggle();
  // initSidebar(); // Removed sidebar logic in previous step, checking context... 
  // Wait, I see initSidebar() is still there in the file view, just the HTML elements were removed in article.html.
  // I should keep it for other pages if they use it, but user removed it from article.html.
  // Actually, user said "remove the light mode", so I focus on that.
  initSidebar();
  loadBlogPosts();
});
