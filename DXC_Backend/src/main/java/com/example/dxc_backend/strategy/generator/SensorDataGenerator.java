// path: com.example.dxc_backend.strategy.generator.SensorDataGenerator.java
package com.example.dxc_backend.strategy.generator;

import com.example.dxc_backend.strategy.sensor.SensorTypeStrategy;

public interface SensorDataGenerator<T> extends SensorTypeStrategy {
    T generateRandomSensorData();
}
