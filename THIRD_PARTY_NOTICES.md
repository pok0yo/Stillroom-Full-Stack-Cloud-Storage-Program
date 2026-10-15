# Third-party credits and distribution boundaries

Stillroom's own source is MIT-licensed by Yuri Ante; see LICENSE. That grant does not relicense dependencies, third-party trademarks or design references.

## Concept and visuals

The storage-dashboard concept is tutorial-inspired: [JavaScript Mastery / storage_management_solution](https://github.com/adrianhajdin/storage_management_solution). The original commit here contains only a title README. Attribution does not establish permission to copy tutorial assets; do not add its source, images or other assets without checking their upstream terms. This review did not establish the upstream repository's license.

The supplied DESIGN-figma.md describes a Figma-inspired visual reference, not a license to Figma's brand assets. The implementation uses CSS shapes, text glyphs, a Stillroom text wordmark and system font fallbacks. No Figma logo, proprietary font file, external stock photo or tutorial asset is shipped. Included UI screenshots use synthetic example identities/data and remain fixture evidence. No rights to Figma, Google or platform fonts are granted by Stillroom's license; the application is not affiliated with them.

## Dependencies

These identifiers were read from installed package metadata and package-lock.json during the portfolio review. Keep package-supplied LICENSE/NOTICE files with redistributed dependency code or binaries; do not replace them with Stillroom's MIT license.

| Package family | License |
| --- | --- |
| Next.js, React, React DOM, server-only | MIT |
| node-appwrite | BSD-3-Clause |
| Playwright, TypeScript | Apache-2.0 |
| ESLint, tsx, esbuild | MIT |
| sharp / optional libvips binaries | Apache-2.0 and/or LGPL-3.0-or-later; some packages also MIT |
| caniuse-lite data | CC-BY-4.0 |
| axe-core (development accessibility checks) | MPL-2.0 |
| argparse (development tool dependency) | Python-2.0 |

The lockfile also records BSD-2-Clause, ISC, BlueOak-1.0.0, CC0-1.0 and 0BSD dependencies. This table is a summary, not a substitute for their exact license and notice texts. Dependencies are installed separately; node_modules, build outputs and dependency binaries are not included in this source repository/release.

In particular, optional sharp/libvips artifacts are not all MIT. A future binary/container distribution must preserve the actual platform package notices and satisfy applicable LGPL source/relinking obligations; inspect the package contents and corresponding-source instructions before distributing it. Do not describe a packaged build as wholly MIT. No binary/container distribution is part of this portfolio source release. See [sharp's upstream license and third-party notices](https://github.com/lovell/sharp/blob/main/LICENSE) and the installed platform package's license files.
