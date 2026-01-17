/**
 * components.js
 * Loads reusable HTML components (navbar, footer) dynamically.
 */

document.addEventListener("DOMContentLoaded", async () => {
    await loadComponent("navbar-placeholder", "components/navbar.html");
    await loadComponent("footer-placeholder", "components/footer.html");

    // After loading, we need to re-initialize certain UI logic
    initActiveLink();
    
    // Dispatch a custom event to signal that components are loaded
    // This allows main.js or other scripts to know when DOM hooks (like language toggle) are ready
    document.dispatchEvent(new Event("componentsLoaded"));
});

async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const html = await response.text();
            element.innerHTML = html;
        } else {
            console.error(`Error loading ${filePath}: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
}


function initActiveLink() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href");
        if (linkPath === currentPath) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}
