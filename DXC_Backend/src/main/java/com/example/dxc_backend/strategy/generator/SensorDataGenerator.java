// path: com.example.dxc_backend.strategy.generator.SensorDataGenerator.java
package com.example.dxc_backend.strategy.generator;

import com.example.dxc_backend.enums.SensorType;

public interface SensorDataGenerator<T> {
    T generateRandomSensorData();
    SensorType getSensorType(); // add this
}
