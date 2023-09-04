/* eslint-disable */

export const displayMap = (locations) => {
  let map = L.map('map', { zoomControl: false });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]])
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
      })
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  map.scrollWheelZoom.disable();
};

// 1) then we put in tour.pug:
// block append head
// link(rel='stylesheet' href='https://unpkg.com/leaflet@1.6.0/dist/leaflet.css')
// script(src='https://unpkg.com/leaflet@1.6.0/dist/leaflet.js')
// script(src='/js/leaflet.js' defer)
// 2) then  instead of app.use(helmet());
// const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
// const styleSrcUrls = [
//   'https://unpkg.com/',
//   'https://tile.openstreetmap.org',
//   'https://fonts.googleapis.com/',
// ];
// const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
// const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", 'blob:'],
//       objectSrc: [],
//       imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );
// 3) is the lines in that file
