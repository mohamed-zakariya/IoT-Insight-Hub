// path: com.example.dxc_backend.strategy.impl.generator.StreetLightSensorDataGenerator.java
package com.example.dxc_backend.strategy.generator.impl;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.enums.Status;
import com.example.dxc_backend.strategy.sensor.BaseSensorDataGenerator;
import com.example.dxc_backend.strategy.generator.SensorDataGenerator;
import com.example.dxc_backend.model.StreetLightSensorData;
import org.springframework.stereotype.Component;

@Component
public class StreetLightSensorDataGenerator extends BaseSensorDataGenerator implements SensorDataGenerator<StreetLightSensorData> {

    @Override
    public SensorType getSensorType() {
        return SensorType.STREET_LIGHT;
    }

    @Override
    public StreetLightSensorData generateRandomSensorData() {
        StreetLightSensorData data = new StreetLightSensorData();

        data.setLocation(generateRandomLocation());
        data.setTimestamp(generateCurrentTimestamp());
        data.setBrightnessLevel(random.nextInt(101));
        data.setPowerConsumption(random.nextFloat() * 5000);
        data.setStatus(Status.values()[random.nextInt(Status.values().length)]);

        return data;
    }




}
