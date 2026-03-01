# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm start            # Run Tauri dev mode (frontend + native window)
pnpm dev              # Run Vite frontend only (no Tauri)
pnpm build            # Build frontend only
pnpm dist             # Build full Tauri distributable
```

## Architecture

**Tauri v2 desktop app** — React/Vite frontend with a Rust backend.

### Frontend ↔ Backend Bridge
- `src/lib/api.js` — Unified API layer replacing Electron's `window.electronAPI`. All frontend code calls `api.*` methods, which internally use `@tauri-apps/api/core` `invoke()` for Rust commands and `@tauri-apps/plugin-store` for persistence.
- `src-tauri/src/commands.rs` — All Rust-side Tauri commands (`#[tauri::command]`). Handles template management, invoice saving/PDF generation, file I/O, and export/import.

### Key Data Flow
- **Persistence**: `@tauri-apps/plugin-store` with `store.json` — the JS `api.js` layer manages reads/writes. No direct store access from Rust.
- **Invoice saving**: Frontend reads `customSavePath` from store, passes it to Rust's `save_invoice` command.
- **Templates**: Bundled defaults in `src-tauri/resources/templates/`, user templates in app data dir `/templates/`. Rust copies bundled → user dir on first run.
- **Export/Import**: Rust handles file dialogs + file I/O; JS handles store operations.

### Frontend Structure
- `src/components/SlyceInvoice.jsx` — Main app component, orchestrates all tabs
- `src/components/tabs/` — Tab views: InvoiceTab, BusinessTab, CustomersTab, TagsTab, SettingsTab
- `src/components/TemplateEditor.jsx` — HTML template editor
- `src/components/ui/` — shadcn/ui components (Radix + Tailwind)
- `src/i18n/` — i18next config with `locales/en.json` and `locales/de.json`
- `src/lib/zugferd.js` — ZUGFeRD/XRechnung e-invoice XML generation

### Styling
- Tailwind CSS + shadcn/ui components + styled-components for some custom styling
- Dark/light theme via `next-themes`
