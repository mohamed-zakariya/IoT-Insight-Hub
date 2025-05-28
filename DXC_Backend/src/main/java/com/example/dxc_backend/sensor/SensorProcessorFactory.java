package com.example.dxc_backend.sensor;

import com.example.dxc_backend.model.*;

public class SensorProcessorFactory {

    public static SensorProcessor getProcessor(Object sensorData) {
        if (sensorData instanceof TrafficSensorData) {
            return new TrafficSensorProcessor((TrafficSensorData) sensorData);
        } else if (sensorData instanceof AirPollutionSensorData) {
            return new AirPollutionSensorProcessor((AirPollutionSensorData) sensorData);
        } else if (sensorData instanceof StreetLightSensorData) {
            return new StreetLightSensorProcessor((StreetLightSensorData) sensorData);
        } else {
            throw new IllegalArgumentException("Unsupported sensor data type: " + sensorData.getClass());
        }
    }
}
