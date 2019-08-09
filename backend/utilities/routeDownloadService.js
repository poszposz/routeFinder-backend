const Route = require('./routeModel');
const Polygon = require('./polygon');
const Segment = require('./segment');
const uuidv4 = require('./UUIDGenerator');
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://zikit.cartodb.com/api/v2/',
  timeout: 10000,
  responseType: 'json',
});

async function downloadRestrictedGraph(start, end) {
  const polygon = new Polygon(start, end);
  const query = `sql?q=SELECT opis, kategoria, ST_AsGeoJson(the_geom) AS cords, ST_AsGeoJson(the_geom) AS cords, ST_AsText(the_geom_webmercator) AS createpoints FROM public.infrastruktura_rowerowa_06_2018 WHERE ST_Intersects(the_geom, ST_MakeEnvelope(${polygon.locationQuery()}, 4326))`
  const response = await client({
    method: 'get',
    url: query,
  });
  return parseRoutes(response.data);
}

async function downloadGraph() {
  const response = await client({
    method: 'get',
    url: `sql?q=SELECT opis, kategoria, ST_AsGeoJson(the_geom) AS cords, ST_AsGeoJson(the_geom) AS cords FROM public.infrastruktura_rowerowa_06_2018`,
  });
  return parseRoutes(response.data);
}

function parseRoutes(json) {
  const rows = json["rows"];
  return rows.map((data) => {
    const segmentString = data['cords'];
    const segments = parseSegments(segmentString);
    return new Route(uuidv4(), data['opis'], data['kategoria'], segments);
  });

  function parseSegments(segmentString) {
    const pointsArray = segmentString.match(/[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/g).chunk(2);
    const segments = pointsArray.slice(1).map((points, index) => {
      return new Segment(pointsArray[index].concat(points), this.name);
    });
    segments[0].isBeginning = true;
    segments[segments.length - 1].isEnding = true;
    return segments;
  }
}

module.exports = {
  "downloadGraph": downloadGraph,
  "downloadRestrictedGraph": downloadRestrictedGraph,
};