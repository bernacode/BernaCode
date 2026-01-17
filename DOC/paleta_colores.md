# Paleta de Colores - BernaCode

Esta paleta utiliza colores modernos y de alto contraste diseñados para un tema oscuro elegante ("Dark Mode").

## Colores Primarios

| Nombre | Hex | Muestra (Aprox) | Uso Sugerido |
| :--- | :--- | :--- | :--- |
| **Rich Black** | `#000F01` | ⚫ (Negro Profundo) | Fondo Principal (`bg-color`) |
| **Dark Green** | `#032221` | ⚫ (Verde muy oscuro) | Fondos secundarios, tarjetas oscuras |
| **Bangladesh Green** | `#03624C` | 🟢 (Verde Bosque) | Elementos de UI, bordes fuertes |
| **Mountain Meadow** | `#2CC295` | 🟢 (Verde Medio) | Hover states, acentos secundarios |
| **Caribbean Green** | `#00DF81` | 🟢 (Verde Neón) | **Color de Acento Principal**, Links, Botones activos |
| **Anti-Flash White** | `#F1F7F6` | ⚪ (Blanco Hueso) | Texto Principal, Botones de alto contraste |

## Colores Secundarios

| Nombre | Hex | Uso Sugerido |
| :--- | :--- | :--- |
| **Pine** | `#06302B` | Fondos de secciones alternativos |
| **Basil** | `#0B453A` | Bordes (`border-color`) |
| **Forest** | `#095544` | Variaciones de fondo |
| **Frog** | `#17876D` | Acentos apagados |
| **Mint** | `#2FA98C` | Badges, etiquetas |
| **Stone** | `#707D7D` | Texto deshabilitado |
| **Pistachio** | `#AACBC4` | Texto secundario (`text-muted`) |

## Mapeo CSS Actual

```css
:root {
  --bg-color: #000F01;       /* Rich Black */
  --text-main: #F1F7F6;      /* Anti-Flash White */
  --text-muted: #AACBC4;     /* Pistachio */
  --border-color: #0B453A;   /* Basil */
  --btn-bg: #F1F7F6;         /* Anti-Flash White */
  --btn-text: #000F01;       /* Rich Black */
  --accent-color: #00DF81;   /* Caribbean Green */
  --code-bg: #032221;        /* Dark Green (adjusted opacity in logic) */
}
```
