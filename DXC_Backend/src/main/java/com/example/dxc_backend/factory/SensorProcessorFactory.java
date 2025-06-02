package com.example.dxc_backend.factory;

import com.example.dxc_backend.factory.processor.AirPollutionSensorProcessor;
import com.example.dxc_backend.factory.processor.SensorProcessor;
import com.example.dxc_backend.factory.processor.StreetLightSensorProcessor;
import com.example.dxc_backend.factory.processor.TrafficSensorProcessor;
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
