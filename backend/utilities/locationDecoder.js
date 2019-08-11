const axios = require('axios');

const client = axios.create({
  baseURL: 'http://nominatim.openstreetmap.org/search',
  timeout: 10000,
  responseType: 'json',
});

async function decodeLocation(location) {
  const response = await client({
    method: 'get',
    params: {
      format: 'json',
      country: 'polska',
      city: 'krakow',
      street: location,
    }
  });
  let locationData = response.data[0];
  if (locationData.length === 0) {
    let errorData = {
      code: 401,
      message: 'No coordinates found for a given location name'
    }
    throw errorData;
  }
  return {
    displayName: locationData['display_name'],
    location: {
      latitude: locationData['lat'],
      longitude: locationData['lon'],
    }
  };
}

module.exports = decodeLocation;