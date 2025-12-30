# Nuxt 4 Template Project Context

## Project Overview

This is a **Nuxt 4** application designed as a template or starter for building administrative interfaces. It is pre-configured with a robust tech stack focusing on developer experience and UI consistency.

### Tech Stack

*   **Framework:** [Nuxt 4](https://nuxt.com) (Vue 3)
*   **UI Library:** [Ant Design Vue](https://antdv.com) (`@ant-design-vue/nuxt`)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com) (`@nuxtjs/tailwindcss`)
*   **State Management:** [Pinia](https://pinia.vuejs.org) (`@pinia/nuxt`) with persistence (`pinia-plugin-persistedstate`)
*   **Icons:** Nuxt Icon (`@nuxt/icon`)
*   **Utilities:** `lodash`, `dayjs`, `crypto-js`, `vueuse`
*   **Package Manager:** Yarn (recommended)

## Getting Started

### Prerequisites

*   Node.js (Ensure compatibility with Nuxt 4, typically Node 18+)
*   Yarn (detected in project)

### Installation

```bash
yarn install
```

### Running Development Server

```bash
yarn dev
```
The application will start at `http://localhost:3000`.

### Building for Production

```bash
yarn build
```

## Project Structure

The project follows the standard Nuxt 4 directory structure with the source code located in the `app/` directory (Nuxt 4 convention).

*   **`app/app.vue`**: The root component. Initializes global loading states and Ant Design configuration (Locale: `vi_VN`).
*   **`app/composables/`**: Auto-imported Vue composables.
    *   **`useApi.ts`**: The centralized entry point for API interactions.
    *   **`useCrudApi.ts`**: A factory for creating standard RESTful CRUD hooks.
    *   **`useRequest.ts`**: Base HTTP request wrapper.
*   **`app/layouts/`**:
    *   **`default.vue`**: Main admin layout with Header, Sidebar (Menu), Breadcrumbs, and content area.
    *   **`auth.vue`**: Layout for authentication pages.
*   **`app/pages/`**: File-based routing.
    *   `admin/`: Admin dashboard routes.
    *   `unit/`: Unit-specific routes.
*   **`app/stores/`**: Pinia state management stores (e.g., `settingStore`, `userStore`).
*   **`nuxt.config.js`**: Main configuration file.

## Development Conventions

### 1. API Interaction
**Do not make raw HTTP requests.** Use the centralized `useApi` composable.

*   **Defining Endpoints:** Add new repositories in `app/composables/useApi.ts` using `useCrudApi`.
    ```typescript
    // app/composables/useApi.ts
    export const useApi = () => ({
      // ... existing
      newEntity: useCrudApi("/admin/new_entities"),
    });
    ```
*   **Using in Components:**
    ```typescript
    const { $api } = useNuxtApp(); // Or simply useApi() if auto-imported
    const api = useApi();
    
    // Example: Fetch list
    const res = await api.newEntity.get({ params: { page: 1 } });
    ```

### 2. UI Development
*   **Components:** Prioritize **Ant Design Vue** components (prefixed with `a-`, e.g., `<a-button>`, `<a-table>`) for complex interactive elements.
*   **Styling:** Use **Tailwind CSS** utility classes for layout, spacing, and typography.
*   **Icons:** Use the `<Icon name="..." />` component from `@nuxt/icon`.

### 3. Layouts & Menus
*   The `default` layout expects a `BaseHeader` and `BaseMenu`.
*   Menu items and logic are likely handled in `app/components/Base/Menu.vue` or managed via `app/composables/useMenu.ts` (investigate if modifying navigation).

### 4. Configuration
*   **Environment Variables:**
    *   `NUXT_PUBLIC_BASE_URL`: API Backend URL.
    *   `NUXT_ENCRYPTION_KEY`: Key for client-side encryption (if used).
*   **Docker:** The project includes a `Dockerfile` and `docker-compose.yml` for containerized deployment.
