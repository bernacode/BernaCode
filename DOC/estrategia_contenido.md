# Estrategia de Contenido y Arquitectura de Información

**BernaCode** implementa una separación estratégica entre la "Venta" y la "Evidencia Técnica". Este documento detalla cómo coexisten ambos mundos y la infraestructura creada para soportarlos.

## 1. Filosofía Dual

### A. El Showroom (`index.html`)
*   **Objetivo**: Conversión y Ventas.
*   **Audiencia**: Dueños de negocio, gerentes, reclutadores (primer contacto).
*   **Contenido**: Propuesta de valor, servicios de alto nivel, testimonios y llamadas a la acción (CTA).
*   **Diseño**: Alto impacto visual, animaciones "WOW", secciones concisas.

### B. El Taller / Documentación (`blog.html`)
*   **Objetivo**: Transparencia, Autoridad Técnica y Educación.
*   **Audiencia**: CTOs, equipos técnicos, y clientes en fase de "Due Diligence".
*   **Contenido**:
    *   **Casos de Estudio Profundos**: No solo "qué hicimos", sino "cómo lo resolvimos" (arquitectura, retos).
    *   **Cultura**: Cómo trabajamos, filosofía de ingeniería.
    *   **Legal**: Privacidad y términos, tratados con la misma seriedad que el código.
*   **Diseño**: Minimalista, estilo "Read the Docs" o "MDN", enfocado en la lectura y la navegación rápida.

---

## 2. Implementación Técnica

Para soportar el apartado de "Documentación" sin usar un CMS pesado, construimos un **sistema de gestión de contenido (CMS) ligero basado en JSON y Markdown**.

### Componentes Clave

#### 1. `blog.html` (El Contenedor)
*   Funciona como una *Single Page Application* (SPA) simple.
*   No recarga la página al navegar entre artículos.

#### 2. `data/articles.json` (La Base de Datos)
*   Define la estructura del menú lateral (Categorías, Carpetas, Artículos).
*   Asocia IDs de artículos con archivos físicos (`.md`).
*   **Soporte Bilingüe**: Define rutas separadas para español e inglés:
    ```json
    {
      "id": "about",
      "title": "Sobre Nosotros",
      "title_en": "About Us",
      "file": "posts/about.md",
      "file_en": "posts/about_en.md"
    }
    ```

#### 3. `js/blog-module.js` (El Motor)
*   **Renderizado**: Convierte Markdown a HTML en tiempo real usando `marked.js`.
*   **Navegación**: Maneja el historial del navegador (`?post=id`) para permitir compartir enlaces directos.
*   **Inyección Automática**:
    *   Agrega encabezado con fecha de publicación.
    *   Agrega pie de página con Copyright.
    *   Muestra "Breadcrumbs" tipo terminal: `Docs / Título del Artículo`.

### 4. Sistema Bilingüe
*   La web detecta la preferencia de idioma del usuario.
*   Al cambiar de idioma en el Blog, el sistema busca automáticamente el archivo `_en.md` correspondiente y recarga el contenido sin perder el contexto.

---

## 3. Flujos de Navegación

Conectamos ambos mundos de forma estratégica:

1.  **Desde el Index**:
    *   Botón "Ver Casos de Éxito" -> Lleva a la sección visual de portafolio.
    *   Fichas de Proyecto ("Ver Detalles") -> Llevan al artículo técnico específico en el Blog.
    *   Footer (Enlaces de Exploración) -> Llevan al Blog General.

2.  **Desde el Blog**:
    *   Breadcrumb "BernaCode" -> Regresa al Index (Ventas).
    *   Menú Lateral -> Permite exploración profunda de temas relacionados.

---
*Este documento sirve como guía para mantener la coherencia entre la promesa de venta y la entrega técnica.*
