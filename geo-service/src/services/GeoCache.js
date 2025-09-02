const cache = require('../config/redis');

class GeoCache {
  constructor() {
    this.prefix = 'geo:';
    this.ttl = 86400; // 24 hours for geofence data
  }

  async getGeofence(geofenceId) {
    const key = this.prefix + 'geofence:' + geofenceId;
    return await cache.get(key);
  }

  async setGeofence(geofenceId, geofenceData) {
    const key = this.prefix + 'geofence:' + geofenceId;
    await cache.set(key, geofenceData, this.ttl);
  }

  async getDistanceCache(from, to) {
    const key = this.prefix + 'distance:' + this.hashCoordinates(from, to);
    return await cache.get(key);
  }

  async setDistanceCache(from, to, distance) {
    const key = this.prefix + 'distance:' + this.hashCoordinates(from, to);
    await cache.set(key, distance, this.ttl);
  }

  hashCoordinates(from, to) {
    return `${from.lat}:${from.lng}:${to.lat}:${to.lng}`.replace(
      /[^a-zA-Z0-9:.-]/g,
      ''
    );
  }

  async invalidateGeofence(geofenceId) {
    const key = this.prefix + 'geofence:' + geofenceId;
    await cache.del(key);
  }
}

module.exports = new GeoCache();
