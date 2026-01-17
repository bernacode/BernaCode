/**
 * blog-module.js
 * Handles logic for the Documentation/Blog Module.
 * - Fetches articles.json
 * - Renders Sidebar
 * - Loads Markdown content dynamically
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize State
    const state = {
        lang: localStorage.getItem('selectedLanguage') || 'es',
        articlesData: null,
        currentPostId: new URLSearchParams(window.location.search).get('post')
    };

    // 2. Elements
    const sidebarContainer = document.getElementById('sidebar-nav');
    const contentContainer = document.getElementById('module-content');
    const langBtn = document.getElementById('lang-toggle-btn');
    const breadcrumbActive = document.getElementById('breadcrumb-active');
    const contentHeader = document.getElementById('content-header');

    // 3. Update Language UI
    updateLangUI();

    // 4. Fetch Data
    try {
        const response = await fetch('data/articles.json');
        state.articlesData = await response.json();
        renderSidebar();
        
        // Load initial post if present
        if (state.currentPostId) {
            loadPost(state.currentPostId);
        }
    } catch (error) {
        console.error('Error loading articles data:', error);
        sidebarContainer.innerHTML = '<p class="text-danger small px-3">Error loading menu.</p>';
    }

    // 5. Sidebar Rendering Logic (Supports Folders)
    function renderSidebar() {
        if (!state.articlesData) return;

        let html = '';
        state.articlesData.categories.forEach(cat => {
            const catTitle = state.lang === 'es' ? cat.title : cat.title_en;
            
            html += `
                <div class="mb-3">
                    <div class="px-3 py-2 text-muted small fw-bold text-uppercase d-flex align-items-center gap-2">
                        <i class="${cat.icon || 'fas fa-folder'} opacity-50"></i>
                        ${catTitle}
                    </div>
                    <ul class="nav flex-column ps-2">
            `;

            // Render Items (Articles or Folders)
            cat.articles.forEach(item => {
                if (item.type === 'folder') {
                    // Folder Item
                    const folderTitle = state.lang === 'es' ? item.title : item.title_en;
                    const folderId = `folder-${item.title.replace(/\s+/g, '-').toLowerCase()}`;
                    
                    html += `
                        <li class="nav-item">
                            <a class="nav-link text-light opacity-75 py-1 px-3 small d-flex align-items-center justify-content-between collapsed" 
                               data-bs-toggle="collapse" href="#${folderId}" role="button" aria-expanded="false" aria-controls="${folderId}">
                               <span><i class="${item.icon || 'fas fa-folder'} me-2 small text-muted"></i>${folderTitle}</span>
                               <i class="fas fa-chevron-right small opacity-50 rotate-icon"></i>
                            </a>
                            <div class="collapse ps-3" id="${folderId}">
                                <ul class="nav flex-column border-start border-secondary border-opacity-25 ms-2">
                    `;
                    
                    // Folder Sub-items
                    item.articles.forEach(subItem => {
                         html += renderLink(subItem);
                    });

                    html += `
                                </ul>
                            </div>
                        </li>
                    `;

                } else {
                    // Direct Item
                    html += renderLink(item);
                }
            });

            html += `
                    </ul>
                </div>
            `;
        });

        sidebarContainer.innerHTML = html;

        attachEventListeners();
    }

    function renderLink(article) {
        const articleTitle = state.lang === 'es' ? article.title : article.title_en;
        const isActive = article.id === state.currentPostId ? 'active-module-link' : '';
        
        return `
            <li class="nav-item w-100">
                <a href="?post=${article.id}" 
                   class="nav-link module-link text-light opacity-75 py-1 px-3 small ${isActive}"
                   data-post-id="${article.id}"
                   data-file="${article.file}">
                   ${articleTitle}
                </a>
            </li>
        `;
    }

    function attachEventListeners() {
        // Toggle Arrows on Collapse
        document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const icon = this.querySelector('.rotate-icon');
                if (icon) {
                    if (this.getAttribute('aria-expanded') === 'true') {
                        icon.style.transform = 'rotate(90deg)';
                    } else {
                        icon.style.transform = 'rotate(0deg)';
                    }
                }
            });
            // Init default state
            if (toggle.getAttribute('aria-expanded') === 'true') {
                 const icon = toggle.querySelector('.rotate-icon');
                 if(icon) icon.style.transform = 'rotate(90deg)';
            }
        });

        // Link Clicks
        document.querySelectorAll('.module-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = link.getAttribute('data-post-id');
                // state.currentPostId = postId; // Set in highlightActiveLink or logic
                
                state.currentPostId = postId;
                history.pushState(null, '', `?post=${postId}`);
                
                highlightActiveLink();
                loadPost(postId);
            });
        });
        
        // Auto-expand folder if active link is inside
        if (state.currentPostId) {
             const activeLink = document.querySelector(`.module-link[data-post-id="${state.currentPostId}"]`);
             if (activeLink) {
                 const collapseParent = activeLink.closest('.collapse');
                 if (collapseParent) {
                     new bootstrap.Collapse(collapseParent, { show: true });
                     // Rotate arrow
                     const toggle = document.querySelector(`[href="#${collapseParent.id}"]`);
                     if(toggle) {
                         const icon = toggle.querySelector('.rotate-icon');
                         if(icon) icon.style.transform = 'rotate(90deg)';
                         toggle.setAttribute('aria-expanded', 'true');
                     }
                 }
             }
        }
    }

    // 6. Highlight Active Link
    function highlightActiveLink() {
        document.querySelectorAll('.module-link').forEach(link => {
            link.classList.remove('active-module-link', 'opacity-100', 'fw-bold', 'text-accent');
            link.classList.add('opacity-75', 'text-light');
            
            if (link.getAttribute('data-post-id') === state.currentPostId) {
                link.classList.add('active-module-link', 'opacity-100', 'fw-bold', 'text-accent');
                link.classList.remove('opacity-75', 'text-light');
            }
        });
    }

    // 7. Load Post Content
    async function loadPost(postId) {
        // Find article data using helper
        const result = findArticle(postId);

        if (!result) {
            console.error('Article not found:', postId);
            contentContainer.innerHTML = '<div class="alert alert-warning">Artículo no encontrado.</div>';
            return;
        }

        const { article, cat } = result;

        // Update Breadcrumb
        contentHeader.classList.remove('d-none');
        const title = state.lang === 'es' ? article.title : article.title_en;
        breadcrumbActive.textContent = `Docs / ${title}`;

        // Show Loading
        contentContainer.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-accent" role="status"></div>
            </div>
        `;

        // Determine file to load
        let targetFile = article.file;
        if (state.lang === 'en' && article.file_en) {
            targetFile = article.file_en;
        }

        try {
            const res = await fetch(targetFile);
            if (!res.ok) throw new Error('File not found');
            const markdown = await res.text();
            
            // Render Markdown
            let htmlContent = marked.parse(markdown);

             // Inject Meta Header (Date)
            if (article.date) {
                htmlContent = `
                    <div class="mb-4 text-muted small border-bottom pb-2">
                        <i class="far fa-calendar-alt me-2"></i>
                        <span data-lang-content="es">Publicado: ${article.date}</span>
                        <span data-lang-content="en">Published: ${article.date}</span>
                    </div>
                    ${htmlContent}
                `;
            }

            // Inject Copyright Footer
            htmlContent += `
                <div class="mt-5 pt-4 border-top text-center text-muted small">
                    <p class="mb-0">
                        &copy; ${new Date().getFullYear()} BernaCode. <span data-lang-content="es">Todos los derechos reservados.</span><span data-lang-content="en">All rights reserved.</span>
                    </p>
                </div>
            `;

            contentContainer.innerHTML = htmlContent;

            // Re-run language check for injected elements
            updateLangUI();
            
            // Scroll to top
            document.querySelector('.custom-scrollbar').scrollTop = 0;

        } catch (error) {
            contentContainer.innerHTML = `
                <div class="alert alert-danger">Error loading content: ${error.message}</div>
            `;
        }
    }

    // 8. Language Toggle Logic
    langBtn.addEventListener('click', () => {
        state.lang = state.lang === 'es' ? 'en' : 'es';
        localStorage.setItem('selectedLanguage', state.lang);
        updateLangUI();
        renderSidebar(); // Re-render titles
        
        // Determine current breadcrumb text again if a post is open
        if (state.currentPostId) {
             const found = findArticle(state.currentPostId);
             if (found) {
                 const title = state.lang === 'es' ? found.article.title : found.article.title_en;
                 breadcrumbActive.textContent = `Docs / ${title}`;
                 loadPost(state.currentPostId); // Reload content in new language
             }
        }
    });

    function updateLangUI() {
        const spanEs = langBtn.querySelector('span:first-child');
        const spanEn = langBtn.querySelector('span:last-child');
        
        if (state.lang === 'es') {
            spanEs.classList.remove('opacity-50');
            spanEn.classList.add('opacity-50');
        } else {
            spanEn.classList.remove('opacity-50');
            spanEs.classList.add('opacity-50');
        }
        
        // Update static UI elements
        document.querySelectorAll('[data-lang-content]').forEach(el => {
            const es = el.parentElement.querySelector('[data-lang-content="es"]');
            const en = el.parentElement.querySelector('[data-lang-content="en"]');
            if (es && en) {
                if (state.lang === 'es') {
                    es.style.display = 'inline';
                    en.style.display = 'none';
                } else {
                    es.style.display = 'none';
                    en.style.display = 'inline';
                }
            }
        });
    }

    // Helper: Find Article (Recursive-ish for 1 level depth folder)
    function findArticle(id) {
        if (!state.articlesData) return null;
        
        for (const cat of state.articlesData.categories) {
             // Check direct items
             const direct = cat.articles.find(a => a.id === id && a.type !== 'folder');
             if (direct) return { cat, article: direct };

             // Check folders
             const folders = cat.articles.filter(a => a.type === 'folder');
             for (const folder of folders) {
                 const match = folder.articles.find(a => a.id === id);
                 if (match) return { cat, article: match, folder };
             }
        }
        return null;
    }
});
