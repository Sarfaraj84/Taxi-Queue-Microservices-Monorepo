const grpc = require('@grpc/grpc-js');

class Service {
  constructor() {
    this.vehicles = new Map();
    this.driverVehicles = new Map();
  }

  healthCheck(call, callback) {
    try {
      const response = {
        status: 'OK',
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),

        vehicleCount: this.vehicles.size,
        driverCount: this.driverVehicles.size,
      };
      callback(null, response);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  // Vehicle Service Methods
  registerVehicle(call, callback) {
    try {
      const {
        driverId,
        registrationNumber,
        vehicleType,
        make,
        model,
        year,
        color,
      } = call.request;

      const vehicleId = `veh_${Date.now()}`;
      const vehicle = {
        id: vehicleId,
        driverId,
        registrationNumber,
        vehicleType,
        make,
        model,
        year: parseInt(year),
        color,
        isActive: false,
        isApproved: false,
        createdAt: new Date().toISOString(),
      };

      this.vehicles.set(vehicleId, vehicle);

      // Track driver's vehicles
      if (!this.driverVehicles.has(driverId)) {
        this.driverVehicles.set(driverId, new Set());
      }
      this.driverVehicles.get(driverId).add(vehicleId);

      callback(null, {
        success: true,
        message: 'Vehicle registered successfully',
        vehicleId,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  setActiveVehicle(call, callback) {
    try {
      const { driverId, vehicleId } = call.request;

      const vehicle = this.vehicles.get(vehicleId);
      if (!vehicle || vehicle.driverId !== driverId) {
        return callback(null, {
          success: false,
          message: 'Vehicle not found or not owned by driver',
        });
      }

      // Deactivate all other vehicles for this driver
      const driverVehicles = this.driverVehicles.get(driverId) || new Set();
      for (const vid of driverVehicles) {
        if (vid !== vehicleId) {
          const v = this.vehicles.get(vid);
          if (v) v.isActive = false;
        }
      }

      vehicle.isActive = true;
      this.vehicles.set(vehicleId, vehicle);

      callback(null, {
        success: true,
        message: 'Vehicle set as active',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  getDriverVehicles(call, callback) {
    try {
      const { driverId } = call.request;
      const driverVehicles = this.driverVehicles.get(driverId) || new Set();

      const vehicles = Array.from(driverVehicles).map((vehicleId) => {
        const vehicle = this.vehicles.get(vehicleId);
        return {
          id: vehicle.id,
          registrationNumber: vehicle.registrationNumber,
          vehicleType: vehicle.vehicleType,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          isActive: vehicle.isActive,
          isApproved: vehicle.isApproved,
        };
      });

      callback(null, {
        success: true,
        vehicles,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  updateVehicle(call, callback) {
    try {
      const {
        vehicleId,
        registrationNumber,
        vehicleType,
        make,
        model,
        year,
        color,
        isApproved,
      } = call.request;

      const vehicle = this.vehicles.get(vehicleId);
      if (!vehicle) {
        return callback(null, {
          success: false,
          message: 'Vehicle not found',
        });
      }

      if (registrationNumber) vehicle.registrationNumber = registrationNumber;
      if (vehicleType) vehicle.vehicleType = vehicleType;
      if (make) vehicle.make = make;
      if (model) vehicle.model = model;
      if (year) vehicle.year = parseInt(year);
      if (color) vehicle.color = color;
      if (typeof isApproved !== 'undefined') vehicle.isApproved = isApproved;

      this.vehicles.set(vehicleId, vehicle);

      callback(null, {
        success: true,
        message: 'Vehicle updated successfully',
        vehicle,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  deleteVehicle(call, callback) {
    try {
      const { vehicleId } = call.request;

      const vehicle = this.vehicles.get(vehicleId);
      if (!vehicle) {
        return callback(null, {
          success: false,
          message: 'Vehicle not found',
        });
      }

      // Remove from driver's vehicles
      const driverVehicles = this.driverVehicles.get(vehicle.driverId);
      if (driverVehicles) {
        driverVehicles.delete(vehicleId);
      }

      this.vehicles.delete(vehicleId);

      callback(null, {
        success: true,
        message: 'Vehicle deleted successfully',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }
}

module.exports = Service;
