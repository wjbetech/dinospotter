# ADR-001: MapLibre globe renderer

Status: accepted 2026-09-06 (renderer only).
Decision: use MapLibre GL JS with the globe projection. Country picking and
labels use the bundled Natural Earth GeoJSON described by ADR-004.
Why: MapLibre supplies the interaction, projection, symbol layers, and camera
behavior without coupling the application to a rendering-specific model.
Alt: three-globe (rejected — heavier and less map-oriented).
Open: this ADR does not choose the production basemap/style provider. D4 must
record the source, license, attribution, and offline/failure behavior before
T2.1. “Default light” is a visual requirement, not a complete style URL.
