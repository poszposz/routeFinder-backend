var fetch = require('node-fetch');
var Polygon = require('../model/polygon');
var Route = require('../model/route');

var baseURL = "https://zikit.cartodb.com/api/v2/sql?q=";

async function downloadRoute(start, end) {
  const polygon = new Polygon(start, end);
  const query = `SELECT opis, kategoria, ST_AsGeoJson(the_geom) AS cords, ST_AsGeoJson(the_geom) AS cords, ST_AsText(the_geom_webmercator) AS createpoints FROM public.infrastruktura_rowerowa_06_2018 WHERE ST_Intersects(the_geom, ST_MakeEnvelope(${polygon.locationQuery()}, 4326))`;
  const url = baseURL + query;
  const response = await fetch(url);
  let json = await response.json();
  return parseRoutes(json);
}

function parseRoutes(json) {
  const rows = json["rows"];
  return rows.map((data) => {
    return new Route(data['opis'], data['kategoria'], data['cords']);;
  });
}

module.exports.downloadRoute = downloadRoute;