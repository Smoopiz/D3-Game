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
const NEARBY_RADIUS = 3;
const WIN_THRESHOLD = 16;

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
    html: `<div class="cell-label-inner">${text}</div>`,
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
function setCurrentValue(i: number, j: number, v: number) {
  const k = `${i},${j}`;
  if (v === baseValue(i, j)) overrides.delete(k);
  else overrides.set(k, v);
  const d = drawn.get(k);
  if (d) d.label.setIcon(makeLabel(labelTextFor(v)));
}

function cellOfLatLng(latlng: leaflet.LatLng) {
  const i = Math.floor((latlng.lat - CLASSROOM.lat) / TILE_DEG);
  const j = Math.floor((latlng.lng - CLASSROOM.lng) / TILE_DEG);
  return { i, j };
}
const playerCell = cellOfLatLng(CLASSROOM);
function manhattan(a: { i: number; j: number }, b: { i: number; j: number }) {
  return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
}
function nearby(i: number, j: number) {
  return manhattan({ i, j }, playerCell) <= NEARBY_RADIUS;
}

let holding = 0;
function renderStatus() {
  statusPanelDiv.textContent = holding
    ? `Holding: ${holding}`
    : "Holding: (none)";
}
renderStatus();

const drawn: Map<string, { rect: leaflet.Rectangle; label: leaflet.Marker }> =
  new Map();

function styleCell(i: number, j: number) {
  const item = drawn.get(`${i},${j}`);
  if (!item) return;
  item.rect.setStyle({
    color: nearby(i, j) ? "#000" : "#888",
    weight: nearby(i, j) ? 2 : 1,
    fillOpacity: 0.05,
  });
}

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

  rect.on("click", () => {
    if (!nearby(i, j)) return;
    const here = currentValue(i, j);

    if (holding === 0 && here > 0) {
      holding = here;
      setCurrentValue(i, j, 0);
      renderStatus();
      if (holding >= WIN_THRESHOLD) alert(`Nice! You’re holding ${holding}.`);
      return;
    }

    if (holding > 0 && here === holding) {
      setCurrentValue(i, j, holding * 2);
      holding = 0;
      renderStatus();
      return;
    }

    if (holding > 0 && here === 0) {
      setCurrentValue(i, j, holding);
      holding = 0;
      renderStatus();
    }
  });

  drawn.set(`${i},${j}`, { rect, label });
  styleCell(i, j);
}

(function drawInitialGrid() {
  const RANGE = 60;
  for (let i = -RANGE; i <= RANGE; i++) {
    for (let j = -RANGE; j <= RANGE; j++) {
      drawCell(i, j);
    }
  }
})();

controlPanelDiv.innerHTML = `
  <div><strong>Cache Crafter</strong></div>
  <div>Click nearby cells (≤ ${NEARBY_RADIUS}). Pick up one token. Place onto an <em>equal</em> token to craft (double)!</div>
`;
