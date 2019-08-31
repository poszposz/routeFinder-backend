const Route = require('./routeModel');
const Polygon = require('./polygon');
const Segment = require('./segment');
const uuidv4 = require('./UUIDGenerator');
const axios = require('axios');
require('../extensions/array');

const client = axios.create({
  baseURL: 'https://zikit.cartodb.com/api/v2/',
  timeout: 10000,
  responseType: 'json',
});

function fullRoutesBikeRouteQuery() {
  return 'SELECT opis, kategoria, ST_AsGeoJson(the_geom) AS cords, ST_AsGeoJson(the_geom) AS cords, ST_AsText(the_geom_webmercator) AS createpoints FROM public.infrastruktura_rowerowa_06_2018';
}

function fullRoutesAllRouteQuery() {
  return 'SELECT description as opis, ST_AsGeoJson(the_geom) AS cords, ST_AsText(the_geom_webmercator) AS createpoints FROM public.sugerowane_trasy';
}

function bikeRouteQuery(polygon) {
  return `SELECT opis, kategoria, ST_AsGeoJson(the_geom) AS cords, ST_AsGeoJson(the_geom) AS cords, ST_AsText(the_geom_webmercator) AS createpoints FROM public.infrastruktura_rowerowa_06_2018 WHERE ST_Intersects(the_geom, ST_MakeEnvelope(${polygon.locationQuery()}, 4326))`;
}

function allRouteQuery(polygon) {
  return `SELECT description as opis, ST_AsGeoJson(the_geom) AS cords, ST_AsText(the_geom_webmercator) AS createpoints FROM public.sugerowane_trasy WHERE ST_Intersects(the_geom, ST_MakeEnvelope(${polygon.locationQuery()}, 4326)) `;
}

async function downloadRestrictedGraph(start, end) {
  const polygon = new Polygon(start, end);
  const bikeQuery = 'sql?q=' + bikeRouteQuery(polygon)
  const bikeRouteresponse = await client({
    method: 'get',
    url: bikeQuery,
  });
  let bikeRoutes = parseRoutes(bikeRouteresponse.data);
  const allRoutesQuery = 'sql?q=' + allRouteQuery(polygon)
  const allRouteResponse = await client({
    method: 'get',
    url: allRoutesQuery,
  });
  let allRoutes = parseRoutes(allRouteResponse.data);
  allRoutes = bikeRoutes.concat(allRoutes);
  let allRoutesSplitted = allRoutes = allRoutes.map((route) => route.split()).flatten();  
  return allRoutesSplitted;
}

async function downloadCompleteGraph() {
  const bikeRoutesQuery = 'sql?q=' + fullRoutesBikeRouteQuery();
  const bikeRoutesResponse = await client({
    method: 'get',
    url: bikeRoutesQuery,
  });
  
  const suggestedRoutesQuery = 'sql?q=' + fullRoutesAllRouteQuery();
  const suggestedRoutesResponse = await client({
    method: 'get',
    url: suggestedRoutesQuery,
  });
  let suggestedRoutes = parseRoutes(suggestedRoutesResponse.data);
  console.log(`Suggested routes length: ${suggestedRoutes.length}`);
  let suggestedRoutesSplitted = suggestedRoutes.map((route) => route.split());
  let childrenCount = suggestedRoutesSplitted.reduce(((current, route) => current + route.children.length), 0)
  console.log(`Suggested routes splitted length: ${childrenCount}`);

  let bikeRoutes = parseRoutes(bikeRoutesResponse.data);
  console.log(`Bike routes length: ${bikeRoutes.length}`);
  let bikeRoutesSplitted = bikeRoutes.map((route) => route.split());
  console.log(`Bike routes splitted length: ${bikeRoutesSplitted.length}`);
  return suggestedRoutesSplitted.concat(bikeRoutesSplitted);
}

function parseRoutes(json) {
  const rows = json["rows"];
  return rows.map((data) => {
    const segmentString = data['cords'];
    const segments = parseSegments(segmentString);
    return new Route(uuidv4(), data['opis'], data['kategoria'], segments);
  });
}

function parseSegments(segmentString) {
  const pointsArray = segmentString.match(/[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/g).chunk(2);
  const segments = pointsArray.slice(1).map((points, index) => {
    return new Segment(pointsArray[index].concat(points), this.name);
  });
  segments[0].isBeginning = true;
  segments[segments.length - 1].isEnding = true;
  return segments;
}

module.exports = {
  downloadCompleteGraph,
  downloadRestrictedGraph,
};