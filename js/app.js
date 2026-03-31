// ===============================
// CONFIG
// ===============================
const CONFIG = {
  center: [-23.15, 17.25],
  zoom:5.5,
  dataUrl: 'data/namibia_dashboard.geojson',
  nationalUrl: 'data/nam_admin0.geojson',
  boundaryUrl: 'data/nam_admin1.geojson',
  subboundaryUrl: 'data/nam_admin2.geojson'
};

// ===============================
// MAP MANAGER
// ===============================

const MapManager = {
  map: null,
  cluster: null,
  baseLayers: {},
  currentBaseLayer: null,

  nationalLayer: null,
  boundaryLayer: null,
  subboundaryLayer: null,
  facilitiesLayer: null,

  facilityLayers: {},
  facilityVisibility: {
    education: true,
    health: true,
    water: true,
    transport: true,
    religious: true,
    waste: true,
    other: true
  },

  init() {
    this.map = L.map('map', {
      fullscreenControl: false,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0
    }).setView(CONFIG.center, CONFIG.zoom);

    const light = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }
    );

    const Voyager = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }
    ).addTo(this.map);

    const osm = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }
    );

    const esriSat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles © Esri' }
    );

    const esriStreets = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles © Esri' }
    );

    const esriTopo = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles © Esri' }
    );

    const esriLabels = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
    );

    const esriHybrid = L.layerGroup([esriSat, esriLabels]);

    this.baseLayers = {
      voyager: Voyager,
      light: light,
      osm: osm,
      esriSat: esriSat,
      esriHybrid: esriHybrid,
      esriStreets: esriStreets,
      esriTopo: esriTopo
    };

    this.currentBaseLayer = Voyager;

    L.control.scale({ position: 'bottomleft', metric: true }).addTo(this.map);

    const makeCluster = () => L.markerClusterGroup({
      disableClusteringAtZoom: 13,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      animate: true,
      animateAddingMarkers: false,
      chunkedLoading: true,
      chunkInterval: 150,
      chunkDelay: 30
    });

    this.facilityLayers = {
      administration: makeCluster(),
      sanitation: makeCluster(),
      water: makeCluster(),
      education: makeCluster(),
      health: makeCluster(),
      landmark: makeCluster(),
      lighting: makeCluster(),
      market: makeCluster(),
      socialcare: makeCluster(),
      publicspace: makeCluster(),
      transport: makeCluster(),
      religious: makeCluster(),
      waste: makeCluster(),
      other: makeCluster()
    };

    Object.values(this.facilityLayers).forEach(layer => this.map.addLayer(layer));

    this.map.on("zoomend", () => {
      Object.values(this.facilityLayers).forEach(layer => layer.refreshClusters());
    });
  },

  setBaseLayer(key) {
    if (!this.baseLayers[key]) return;

    Object.values(this.baseLayers).forEach(layer => {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });

    this.baseLayers[key].addTo(this.map);
    this.currentBaseLayer = this.baseLayers[key];
  },

  toggleLayer(layer, visible) {
    if (!layer) return;

    if (visible) {
      this.map.addLayer(layer);
    } else {
      this.map.removeLayer(layer);
    }
  },

  fitToBounds(bounds) {
    if (!bounds) return;
    const padded = bounds.pad(0.3);
    this.map.setMaxBounds(padded);
  }
};


// ===============================
// DATA MANAGER
// ===============================
const DataManager = {
  features: [],

  async load() {
    try {
      const res = await fetch(CONFIG.dataUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.features = data.features;
      console.log(`Loaded ${this.features.length} facilities`);
    } catch (err) {
      console.error("Failed to load facility data:", err);
      this.features = [];
    }
  }
};

// ===============================
// STYLE MANAGER
// ===============================
const StyleManager = {

  getFacilityGroup(facility) {
    const f = (facility || "").toLowerCase().trim();

    if (f.includes("administrative")) return "administration";
    if (f.includes("communal sanitation")) return "sanitation";
    if (f.includes("communal water")) return "water";
    if (f.includes("education")) return "education";
    if (f.includes("health")) return "health";
    if (f.includes("landmark")) return "landmark";
    if (f.includes("lighting")) return "lighting";
    if (f.includes("market")) return "market";
    if (f.includes("orphanage")) return "socialcare";
    if (f.includes("social facility")) return "socialcare";
    if (f.includes("public space")) return "publicspace";
    if (f.includes("public transport")) return "transport";
    if (f.includes("religius")) return "religious";
    if (f.includes("solid waste")) return "waste";

    return "other";
  },

  getConditionClass(condition) {
    const c = (condition || "").toLowerCase();
    if (c.includes("good")) return "good";
    if (c.includes("average")) return "average";
    if (c.includes("poor")) return "poor";
    return "unknown";
  },

  getIconClass(facility) {
    const f = (facility || "").toLowerCase().trim();

    if (f.includes("administrative")) return "fa-building";
    if (f.includes("communal sanitation")) return "fa-toilet";
    if (f.includes("communal water")) return "fa-droplet";
    if (f.includes("education")) return "fa-school";
    if (f.includes("health")) return "fa-hospital";
    if (f.includes("landmark")) return "fa-location-dot";
    if (f.includes("lighting")) return "fa-lightbulb";
    if (f.includes("market")) return "fa-store";
    if (f.includes("orphanage")) return "fa-house";
    if (f.includes("social facility")) return "fa-people-group";
    if (f.includes("public space")) return "fa-tree";
    if (f.includes("public transport")) return "fa-bus";
    if (f.includes("religious")) return "fa-church";
    if (f.includes("solid waste")) return "fa-trash";

    return "fa-circle-dot";
  },

  createMarker(feature) {
    const p = feature.properties;
    const [lng, lat] = feature.geometry.coordinates;

    const conditionClass = this.getConditionClass(p.Condition);
    const iconClass = this.getIconClass(p.Facility);

    return L.marker([lat, lng], {
      icon: L.divIcon({
        className: "",
        html: `
          <div class="marker ${conditionClass}">
            <i class="fa-solid ${iconClass}"></i>
          </div>
        `,
        iconSize: [15, 15],
        iconAnchor: [7.5, 7.5]
      })
    });
  }
};

// ===============================
// RENDERER (MUST BE DEFINED BEFORE APP)
// ===============================
const Renderer = {
  render(features) {
    if (!MapManager.facilityLayers) return;

    Object.values(MapManager.facilityLayers).forEach(layer => layer.clearLayers());

    if (!features || features.length === 0) return;

    const groupedMarkers = {
      administration: [],
      sanitation: [],
      water: [],
      education: [],
      health: [],
      landmark: [],
      lighting: [],
      market: [],
      socialcare: [],
      publicspace: [],
      transport: [],
      religious: [],
      waste: [],
      other: []
    };

    for (const f of features) {
      const marker = StyleManager.createMarker(f);
      marker.bindPopup(() => this.createPopup(f.properties));

      const group = StyleManager.getFacilityGroup(f.properties.Facility);
      groupedMarkers[group].push(marker);
    }

    Object.entries(groupedMarkers).forEach(([group, markers]) => {
      if (markers.length > 0) {
        MapManager.facilityLayers[group].addLayers(markers);
      }
    });
  },

  createPopup(p) {
    const facility = p.Facility || "Unknown";
    const town = p.Town || "—";
    const condition = p.Condition || "—";
    const functional = p["Is the facility functional?"] || "Unknown";

    let imgHtml = "";
    if (p.github_image_url_cdn) {
      imgHtml = `<img src="${p.github_image_url_cdn}" alt="${facility}" width="100%" loading="lazy">`;
    }

    return `
      <div class="popup">
        ${imgHtml}
        <h4>${facility}</h4>
        <p><b>Town:</b> ${town}</p>
        <p><b>Condition:</b> ${condition}</p>
        <p><b>Functional?</b> ${functional}</p>
      </div>
    `;
  }
};

// ===============================
// FILTER MANAGER (with town)
// ===============================
const FilterManager = {
  town: "",
  facility: "",
  condition: "",

  apply(features) {
    return features.filter(f => {
      const townVal = (f.properties.Town || "").toLowerCase();
      const fVal = (f.properties.Facility || "").toLowerCase();
      const cVal = (f.properties.Condition || "").toLowerCase();

      return (!this.town || townVal.includes(this.town)) &&
             (!this.facility || fVal.includes(this.facility)) &&
             (!this.condition || cVal.includes(this.condition));
    });
  }
};

// ===============================
// UI MANAGER (populates dropdowns)
// ===============================
const UIManager = {
  initFilters(features) {
    const townSelect = document.getElementById("townFilter");
    const facilitySelect = document.getElementById("facilityFilter");
    const conditionSelect = document.getElementById("conditionFilter");

    if (!townSelect || !facilitySelect || !conditionSelect) {
      console.warn("One or more filter dropdowns not found in DOM");
      return;
    }

    const towns = new Set();
    const facilities = new Set();
    const conditions = new Set();

    features.forEach(f => {
      if (f.properties.Town) towns.add(f.properties.Town);
      if (f.properties.Facility) facilities.add(f.properties.Facility);
      if (f.properties.Condition) conditions.add(f.properties.Condition);
    });

    [...towns].sort().forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      townSelect.appendChild(opt);
    });

    [...facilities].sort().forEach(f => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f;
      facilitySelect.appendChild(opt);
    });

    [...conditions].sort().forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      conditionSelect.appendChild(opt);
    });

    townSelect.addEventListener("change", (e) => {
      FilterManager.town = e.target.value.toLowerCase();
      App.update();
    });

    facilitySelect.addEventListener("change", (e) => {
      FilterManager.facility = e.target.value.toLowerCase();
      App.update();
    });

    conditionSelect.addEventListener("change", (e) => {
      FilterManager.condition = e.target.value.toLowerCase();
      App.update();
    });
  }
};

// ===============================
// APP CONTROLLER
// ===============================
const App = {
  async init() {
    MapManager.init();
    await DataManager.load();
    if (DataManager.features.length === 0) {
      console.error("No facility data loaded – map will be empty.");
      return;
    }
    UIManager.initFilters(DataManager.features);
    await this.loadNationalBoundary();
    await this.loadBoundary();
    await this.loadSubBoundary();
    this.update();
  },

  update() {
    const filtered = FilterManager.apply(DataManager.features);
    Renderer.render(filtered);
  },

  async loadNationalBoundary() {
    try {
      const res = await fetch(CONFIG.nationalUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      MapManager.nationalLayer = L.geoJSON(data, {
        style: {
          color: "white",
          weight: 3,
          opacity: 1,
          dashArray: "3,3",
          fillOpacity: 0
        }
      }).addTo(MapManager.map);

      MapManager.fitToBounds(MapManager.nationalLayer.getBounds());
    } catch (err) {
      console.warn("Could not load national boundary layer:", err);
    }
  },

  

  async loadBoundary() {
    try {
      const res = await fetch(CONFIG.boundaryUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      MapManager.boundaryLayer = L.geoJSON(data, {
        style: {
          color: "red",
          weight: 1,
          opacity: 1,
          dashArray: "3,3",
          fillOpacity: 0
        }
      }).addTo(MapManager.map);

    } catch (err) {
      console.warn("Could not load boundary layer:", err);
    }
  },

  async loadSubBoundary() {
    try {
      const res = await fetch(CONFIG.subboundaryUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      MapManager.subboundaryLayer = L.geoJSON(data, {
        style: {
          color: "#ff6b6b",
          weight: 1,
          opacity: 0.9,
          dashArray: "2,4",
          fillOpacity: 0
        }
      }).addTo(MapManager.map);

    } catch (err) {
      console.warn("Could not load subboundary layer:", err);
    }
  }

};


// Start the app
App.init();



