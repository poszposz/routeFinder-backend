const Route = require('./routeModel');
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://zikit.cartodb.com/api/v2/',
  timeout: 10000,
  responseType: 'json',
});

async function downloadGraph() {
  const response = await client({
    method: 'get',
    url: `sql?q=SELECT opis, kategoria, ST_AsGeoJson(the_geom) AS cords, ST_AsGeoJson(the_geom) AS cords FROM public.infrastruktura_rowerowa_06_2018`,
  });
  return parseRoutes(response.data);
}

function parseRoutes(json) {
  let id = 0;
  const rows = json["rows"];
  return rows.map((data) => {
    id += 1;
    return new Route(id, data['opis'], data['kategoria'], data['cords']);
  });
}

module.exports = downloadGraph;