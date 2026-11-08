# Changelog

## 0.2.0 — 2026-11-08

### Added

- `PanelSurface` and `PanelPalette`: quiet information panels with a side accent rail.
- `ButtonPrice.layout()`: one centered, fitted row for a measured localized label, currency icon, and amount.
- `tab` button variant for separate portrait selectors, including an active underline.
- `ButtonSurface.segmentTrack()` for one shared rounded segment background and border.
- `ready` option for available reward and claim highlights.
- Regression coverage for panel geometry, selector states, shared tracks, and localized price rows.
- Changelogs in both published npm archives and synchronized release-version validation.

### Changed

- Inactive `nav` items are transparent; active navigation uses a subtle tint and a top rail.
- `segment` paints only its active fill. Draw `segmentTrack()` once around the group.
- Core and SDK adapter versions move together; the adapter now requires core `^0.2.0`.
- Package and workspace README examples describe the new surface hierarchy and price layout.

### Migration

- Keep bottom navigation inside one shared `TerminalGlass` panel.
- Replace individually bordered segments with one `segmentTrack()` and borderless `segment` children.
- Use `tab` for standalone selectors. Text, input, keyboard focus, and application actions remain host-owned.

## 0.1.0

Initial public release: PixiJS 8 surfaces, drawing/effect helpers, vector icons,
host-driven animation lifecycle, and the optional GameDevLand SDK component/action adapter.
