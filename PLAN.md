# D3: Cache Crafter (D3.a)

## Game Design Vision

A tiny map-crafting game around the classroom. Grid cells may contain tokens (deterministic). You can hold one at a time. Place your held token onto a nearby cell with an equal value to craft (double). Hit a target value to “win”.

## Technologies

TypeScript, Leaflet, Deno/Vite build, GH Actions + Pages, deterministic hashing via luck().

## D3.a Steps

Map scaffold — fixed zoom map centered on classroom; UI panels.
Grid skeleton — draw a grid that fills the viewport; per-cell labels visible.
Deterministic board — spawn + value via luck(); current value resolution.
Interaction gating — only allow clicks within ~3 cells of player.
Inventory & actions — pick up, place, craft; status panel updates.
Polish & win — nearby highlighting, instructions, win check (value ≥ 16), CSS tidy.

## Checklist

[x] Map scaffold
[X] Grid skeleton
[X] Deterministic board
[X] Interaction gating
[] Inventory & actions
[] Polish & win
