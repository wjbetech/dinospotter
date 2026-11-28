# DinoSpotter visual system

The interface uses a muted field atlas palette. `apps/website/src/styles/theme.css` is the single source for color, type, radius and elevation tokens. Component rules consume those tokens; they do not redefine them.

## Surface and color roles

| Role           | Token                    | Use                                       |
| -------------- | ------------------------ | ----------------------------------------- |
| Canvas         | `--paper`                | Page background                           |
| Raised surface | `--card`                 | Panels, record cards and controls         |
| Inset surface  | `--surface-inset`        | Recessed groups and secondary information |
| Water          | `--sky`                  | Map water and globe context               |
| Selected land  | `--straw`                | Selected country                          |
| Action         | `--moss`, `--moss-hover` | Primary action and active control         |
| Text           | `--ink`, `--ink-soft`    | Primary and supporting copy               |
| Boundary       | `--line`                 | Panel and control dividers                |
| Attention      | `--warning`              | Warning text and state                    |
| Keyboard       | `--focus`                | Visible focus outline                     |

The primary text and muted text contrast against both paper and card. Do not place muted text directly on the selected land or water without an opaque backing. Map labels retain a halo for legibility.

## Type and depth

Space Grotesk is for page and section headings. Atkinson Hyperlegible Next is for body text, controls and data. Use `rem` for type sizes and `clamp()` for responsive headings. The named roles are caption, body, record, section and page. Avoid fixed pixel type sizes in new components.

Flat surfaces group information. Inset surfaces hold secondary controls or context. Raised surfaces are interactive cards and panels; floating elevation is reserved for dialogs and transient overlays. Use `--radius-control`, `--radius-card` and `--radius-pill` consistently.

## Component inventory

| Component             | Default                  | Hover or selected                        | Focus                       | Disabled or loading                   |
| --------------------- | ------------------------ | ---------------------------------------- | --------------------------- | ------------------------------------- |
| Header and navigation | Quiet paper shell        | Current destination has a raised surface | Visible outline             | Not applicable                        |
| Primary button        | Moss fill                | Darker moss                              | Visible outline             | Muted fill; no action                 |
| Quiet button          | Card with boundary       | Tinted inset surface                     | Visible outline             | Muted text; no action                 |
| Field and filter      | Card with boundary       | Selected filter uses moss                | Visible outline             | Muted surface or spinner              |
| Record row            | Flat card or divider     | Raised or tinted selection               | Visible outline             | Skeleton rows while loading           |
| Map badge             | Opaque card over map     | Selected fossil uses stronger border     | Visible outline             | Hidden until data resolves            |
| Status panel          | Card with direct message | Recovery action is explicit              | Recovery action outlined    | Loading text states what is happening |
| Specimen view         | Raised panel             | Selected tab or action uses moss         | Focus remains inside dialog | Skeleton while detail loads           |
| Footer                | Flat paper shell         | Link underline                           | Visible outline             | Not applicable                        |

The shared header, footer, exploration controls, record rows and loading, empty and upstream status states now use component-owned Tailwind styling. Older record selectors remain in the legacy stylesheet and should be removed after review across countries. Keep the token file as the single source for visual roles.
