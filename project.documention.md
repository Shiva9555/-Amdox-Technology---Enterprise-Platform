# Amdox Technology: Technical Documentation

## 1. System Architecture
The platform is built on a **Zero-Dependencies, Multi-Page Application (MPA)** architecture.
* **Structure:** Each module represents a distinct HTML file, linked together via a unified CSS design system (`styles.css`) and a central logic core (`main.js`).
* **Styling:** Vanilla CSS3 utilizing CSS Variables (Custom Properties) for rapid theme management and consistent Glassmorphism rendering.
* **Logic:** Modular Vanilla JavaScript wrapped in a DOMContentLoaded event listener to ensure safe execution targeting.

## 2. Core JavaScript Engine (`main.js`)
The `main.js` file contains the `AMDOX` global object, serving as the brain of the platform.

### Key Functions
* `AMDOX.showToast(msg, type)`: Generates high z-index, animated notification flares for all user interactions.
* `AMDOX.initDiagnostics()`: Spawns the bottom-left health metric overlay.
* `AMDOX.getCurrentPage()`: OS-agnostic regex parser to determine the active module regardless of local folder names.
* `AMDOX.save()` / `AMDOX.get()`: A dual-layer storage wrapper. Attempts `localStorage` first, and safely falls back to `window.name` session storage if the browser implies heavy security blocks.

## 3. Module Specifications

### 3.1 Authentication (`login.html` / `register.html`)
* **Mechanism:** Simulates an auth-token handshake. Validates user input and sets `amdox_user` in local storage.
* **Security:** Employs an `Auth Guard` on protected routes. If `amdox_user` is null, it forcefully redirects the user back to `login.html`.

### 3.2 Kanban Board (`kanban.html`)
* **State Generation:** Uses template literals to dynamically inject new `.task-card` DOM nodes.
* **Drag and Drop:** Listeners attached to `.task-card` (ondragstart) and `.kanban-column` (ondragover, appendChild) for real-time task transition.

### 3.3 Dashboard Settings (`settings.html`)
* **Navigation:** Event-delegated tab switching manipulates the `.active` class with `display: block !important` to guarantee panel visibility.

### 3.4 Integration Simulation (`scanner.html`)
* **Technology:** Integrates `qrcode.min.js` (via CDN) to dynamically render SVG/Canvas QR codes based on select-box values.
* **Feedback:** Uses CSS `@keyframes` and temporary `.flash-active` body classes to simulate native camera shutter feedback.

## 4. Design System Tokens
All styling is driven by the Root CSS Variable config:
* `--bg-dark`: `#050614`
* `--accent-magenta`: `#ff007a`
* `--accent-orange`: `#ff6b00`
* `--glass-blur`: `blur(16px)`

## 5. Deployment
As an intentionally native application, deployment requires only standard static hosting. It can be instantly deployed to:
1. GitHub Pages
2. Vercel
3. Netlify
4. Standard Apache/Nginx web directories.
