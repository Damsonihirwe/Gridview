// ---- Live Data Simulation ----

// utility: random float
function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// update dashboard cards
function updateCards() {
  document.querySelector('#card-demand .value').textContent = randomFloat(35, 40);
  document.querySelector('#card-renewable .value').textContent = randomFloat(15, 20);
  document.querySelector('#card-co2 .value').textContent = randomFloat(190, 230, 0);
  document.querySelector('#card-frequency .value').textContent = randomFloat(49.95, 50.05, 3);
}

// update table (keep last 3 entries)
function updateTable() {
  const tbody = document.getElementById('table-body');
  if (tbody.rows.length >= 3) tbody.deleteRow(0);

  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                  now.getMinutes().toString().padStart(2, '0');

  const row = tbody.insertRow();
  row.insertCell(0).textContent = timeStr;
  row.insertCell(1).textContent = randomFloat(35, 40);
  row.insertCell(2).textContent = randomFloat(15, 20);
  row.insertCell(3).textContent = randomFloat(190, 230, 0);
}

// initial & interval
updateCards();
updateTable();
setInterval(() => {
  updateCards();
  updateTable();
}, 5000);


// ---- Leaflet Map + Search ----

let mapMarkers = [];

// initialize map
const map = L.map('map').setView([1.9441, 30.0619], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// default marker
L.marker([1.9441, 30.0619]).addTo(map)
  .bindPopup('Kigali, Rwanda')
  .openPopup();

// place search handler
document.getElementById('searchBtn').addEventListener('click', () => {
  const query = document.getElementById('placeInput').value.trim();
  if (!query) return alert('Please enter a place name.');

  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`)
    .then(res => res.json())
    .then(results => {
      // clear old markers
      mapMarkers.forEach(m => map.removeLayer(m));
      mapMarkers = [];

      if (results.length === 0) {
        return alert('No results found.');
      }

      // add new markers & fit bounds
      const bounds = [];
      results.forEach(place => {
        const lat = parseFloat(place.lat), lon = parseFloat(place.lon);
        const m = L.marker([lat, lon]).addTo(map)
          .bindPopup(place.display_name);
        mapMarkers.push(m);
        bounds.push([lat, lon]);
      });
      map.fitBounds(bounds, { padding: [50, 50] });
    })
    .catch(err => {
      console.error(err);
      alert('Error fetching place data.');
    });
});
