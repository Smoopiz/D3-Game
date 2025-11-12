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

controlPanelDiv.innerHTML = `<strong>Cache Crafter</strong>`;
statusPanelDiv.textContent = "Holding: (none)";
