import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import "./_leafletWorkaround.ts";
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

const drawn: Map<string, { rect: leaflet.Rectangle; label: leaflet.Marker }> =
  new Map();

function drawCell(i: number, j: number) {
  const b = ijToBounds(i, j);
  const rect = leaflet.rectangle(b, { weight: 1, fillOpacity: 0.05 }).addTo(
    map,
  );
  const center = b.getCenter();
  const label = leaflet
    .marker(center, { icon: makeLabel("·"), interactive: false })
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
