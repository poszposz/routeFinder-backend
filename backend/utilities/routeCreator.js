const Route = require('./routeModel');
const Segment = require('./segment');
const uuidv4 = require('./UUIDGenerator');

function mergeRoutes(routes) {
  let mergedRoutes = [];
  let count = 0;
  routes.forEach((route) => {
    // We push the route the the exisitng array
    mergedRoutes.push(route);
    // If it's the last one, we just push it to the array and quit.
    if (route === routes[routes.length - 1]) { 
      return
    }
    // We create a route that will link the end of the current route with the start of the next route from the array.
    let nextRoute = routes[count + 1];
    let linkSegment = new Segment([route.end.longitude, route.end.latitude, nextRoute.start.longitude, nextRoute.start.latitude], 'Link');
    let linkRoute = new Route(uuidv4(), "Link", "link", [linkSegment], false);
    console.log(`Created link route: ${JSON.stringify(linkRoute)}`);
    mergedRoutes.push(linkRoute);
    count += 1;
  });
  return mergedRoutes;
}

module.exports = mergeRoutes;