const Polygon = require('./polygon');
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://zikit.cartodb.com/api/v2/',
  timeout: 10000,
  responseType: 'json',
});

async function downloadGraph(start, end) {
  const polygon = new Polygon(start, end);
  const response = await client({
    method: 'get',
    url: `sql?q=SELECT opis, kategoria, ST_AsGeoJson(the_geom) AS cords, ST_AsGeoJson(the_geom) AS cords, ST_AsText(the_geom_webmercator) AS createpoints FROM public.infrastruktura_rowerowa_06_2018 WHERE ST_Intersects(the_geom, ST_MakeEnvelope(${polygon.locationQuery()}, 4326))`,
  });
  return response.data;
}

function parseRoutes(json) {
  const rows = json["rows"];
  return rows.map((data) => {
    return  {
      description: data['opis'],
      category: data['kategoria'],
      location: data['cords'],
    }
  });
}

module.exports = downloadGraph;