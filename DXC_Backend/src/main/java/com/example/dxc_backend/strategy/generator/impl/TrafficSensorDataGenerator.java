// path: com.example.dxc_backend.strategy.impl.generator.TrafficSensorDataGenerator.java
package com.example.dxc_backend.strategy.generator.impl;

import com.example.dxc_backend.enums.CongestionLevel;
import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.strategy.sensor.BaseSensorDataGenerator;
import com.example.dxc_backend.strategy.generator.SensorDataGenerator;
import com.example.dxc_backend.model.TrafficSensorData;
import org.springframework.stereotype.Component;


@Component
public class TrafficSensorDataGenerator extends BaseSensorDataGenerator implements SensorDataGenerator<TrafficSensorData> {

    @Override
    public SensorType getSensorType() {
        return SensorType.TRAFFIC;
    }

    @Override
    public TrafficSensorData generateRandomSensorData() {
        TrafficSensorData data = new TrafficSensorData();

        data.setLocation(generateRandomLocation());
        data.setTimestamp(generateCurrentTimestamp());
        data.setTrafficDensity(random.nextInt(501));
        data.setAvgSpeed(random.nextFloat() * 120);
        data.setCongestionLevel(CongestionLevel.values()[random.nextInt(CongestionLevel.values().length)]);

        return data;
    }



}
