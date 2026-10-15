# Design implementation

## Contract

The user-supplied `DESIGN-figma.md` controls this visual revision. Stillroom remains a working file-management surface: uploading, finding and managing files are the main actions. The original brief's security requirements and approval boundaries remain authoritative. No marketing pricing, promotional CTAs, marquee, or unrelated features were added. The supplied design file is unchanged.

- White canvas, black text/controls, black selected navigation, pill CTAs, 8px inputs, 24px panels, no decorative shadows or gradients.
- One dominant lime storage block on Overview; lilac block on authentication. White space separates major surfaces. Semantic feedback uses the document's mint/cream/pink palette with explicit text.
- Responsive sans-serif headings (44–86px according to available space), black body copy, uppercase mono labels. Proprietary Figma fonts were not supplied; the documented system-font fallback is used. No fonts or dependencies were installed.
- Desktop sidebar preserves the application brief. Below 960px, navigation opens in a full-canvas native dialog. Below 768px, the main color panel loses rounded outer corners and reaches the viewport edges. Forms remain at least 48px high and buttons at least 44px.
- File rows and type-summary controls retain practical application density rather than imitating a long-form marketing page. All text CTAs are pills; list-row controls retain row geometry.

## Scope and functional fixes

Changes reach `app/globals.css`, `app/workspace.tsx`, the shared API helper, browser tests and documentation. Shared CSS covers authentication, setup, verification, errors and file dialogs. Backend authorization, file validation, storage lifecycle and schema are unchanged.

The workspace now handles file and totals responses independently. If totals fail, the available file list remains usable and a retry notice appears. Expired sessions present a sign-in link. Navigation clears stale operation messages. Mobile navigation uses the existing native dialog's focus management and Escape behavior.

## Evidence and limitations

Target viewports: 1440x1050, 390x844 and 320x800. Browser fixtures exercise the real workspace component with explicitly simulated HTTP responses. They verify desktop/mobile reflow, dialog focus restoration and Escape, escaped previews, upload failure/success, loading, empty, partial and permission states. Production-page checks cover unconfigured setup/login and anonymous API denial.

Screenshots and a machine-checkable record live in `docs/design-evidence/`. These remain fixture UI evidence, not a formal WCAG audit. No new packages were installed to run the design document's optional `npx` lint command. Subsequent authenticated live-browser checks at 1440, 390 and 320 pixels are recorded in `docs/VERIFICATION.md`; desktop and narrow mobile renders were inspected. Their screenshots remain local in ignored `docs/live-evidence/` because they contain live test-account details; they are not publication assets.
