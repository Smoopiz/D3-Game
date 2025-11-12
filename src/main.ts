import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import "./_leafletWorkaround.ts";
import luck from "./_luck.ts";
import "./style.css";

const controlPanelDiv = document.createElement("div");
controlPanelDiv.id = "controlPanel";
document.body.append(controlPanelDiv);

const mapDiv = document.createElement("div");
mapDiv.id = "map";
document.body.append(mapDiv);

const statusPanelDiv = document.createElement("div");
statusPanelDiv.id = "statusPanel";
document.body.append(statusPanelDiv);

const CLASSROOM = leaflet.latLng(36.997936938057016, -122.05703507501151);
const GAME_ZOOM = 19;
const TILE_DEG = 1e-4;
const SPAWN_PROB = 0.35;

const map = leaflet.map(mapDiv, {
  center: CLASSROOM,
  zoom: GAME_ZOOM,
  minZoom: GAME_ZOOM,
  maxZoom: GAME_ZOOM,
  zoomControl: false,
  scrollWheelZoom: false,
});

leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  })
  .addTo(map);

leaflet.marker(CLASSROOM).addTo(map).bindTooltip("You");

function ijToBounds(i: number, j: number): leaflet.LatLngBounds {
  const o = CLASSROOM;
  return leaflet.latLngBounds(
    [o.lat + i * TILE_DEG, o.lng + j * TILE_DEG],
    [o.lat + (i + 1) * TILE_DEG, o.lng + (j + 1) * TILE_DEG],
  );
}
function makeLabel(text: string) {
  return leaflet.divIcon({
    className: "cell-label",
    html:
      `<div style="font-size:12px;line-height:1;font-weight:600;text-align:center;">${text}</div>`,
    iconSize: [30, 12],
    iconAnchor: [15, 6],
  });
}
function labelTextFor(v: number) {
  return v > 0 ? String(v) : "·";
}

function baseSpawns(i: number, j: number): boolean {
  return luck(`${i},${j},spawn`) < SPAWN_PROB;
}
function baseValue(i: number, j: number): number {
  if (!baseSpawns(i, j)) return 0;
  const r = luck(`${i},${j},value`);
  if (r < 0.25) return 1;
  if (r < 0.5) return 2;
  if (r < 0.75) return 4;
  return 8;
}

const overrides = new Map<string, number>();
function currentValue(i: number, j: number): number {
  const k = `${i},${j}`;
  return overrides.has(k) ? overrides.get(k)! : baseValue(i, j);
}
function _setCurrentValue(i: number, j: number, v: number) {
  const k = `${i},${j}`;
  if (v === baseValue(i, j)) overrides.delete(k);
  else overrides.set(k, v);
  const d = drawn.get(k);
  if (d) d.label.setIcon(makeLabel(labelTextFor(v)));
}

const drawn: Map<string, { rect: leaflet.Rectangle; label: leaflet.Marker }> =
  new Map();

function drawCell(i: number, j: number) {
  const b = ijToBounds(i, j);
  const rect = leaflet.rectangle(b, { weight: 1, fillOpacity: 0.05 }).addTo(
    map,
  );
  const center = b.getCenter();
  const v = currentValue(i, j);
  const label = leaflet
    .marker(center, { icon: makeLabel(labelTextFor(v)), interactive: false })
    .addTo(map);
  drawn.set(`${i},${j}`, { rect, label });
}

(function drawInitialGrid() {
  const RANGE = 60;
  for (let i = -RANGE; i <= RANGE; i++) {
    for (let j = -RANGE; j <= RANGE; j++) {
      drawCell(i, j);
    }
  }
})();

controlPanelDiv.innerHTML = `<strong>Cache Crafter</strong>`;
statusPanelDiv.textContent = "Holding: (none)";
