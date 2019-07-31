Array.prototype.chunk = function(chunkSize) {
    if (!this.length) {
        return [];
    }
    return [this.slice(0, chunkSize)].concat(this.slice(chunkSize).chunk(chunkSize));
};

Array.prototype.flatten = function() {
  return this.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? toFlatten.flatten() : toFlatten);
  }, []);
};
