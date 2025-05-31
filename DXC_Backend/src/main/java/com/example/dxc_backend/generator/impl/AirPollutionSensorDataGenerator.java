// path: com.example.dxc_backend.generator.impl.AirPollutionSensorDataGenerator.java
package com.example.dxc_backend.generator.impl;

import com.example.dxc_backend.enums.PollutionLevel;
import com.example.dxc_backend.generator.BaseSensorDataGenerator;
import com.example.dxc_backend.generator.SensorDataGenerator;
import com.example.dxc_backend.model.AirPollutionSensorData;
import org.springframework.stereotype.Component;

@Component
public class AirPollutionSensorDataGenerator extends BaseSensorDataGenerator implements SensorDataGenerator<AirPollutionSensorData> {

    @Override
    public AirPollutionSensorData generateRandomSensorData() {
        AirPollutionSensorData data = new AirPollutionSensorData();

        data.setLocation(generateRandomLocation());
        data.setTimestamp(generateCurrentTimestamp());
        data.setCo(random.nextFloat() * 50);
        data.setSo2(random.nextFloat() * 50);
        data.setNo2(random.nextFloat() * 50);
        data.setOzone(random.nextFloat() * 300);
        data.setPollutionLevel(PollutionLevel.values()[random.nextInt(PollutionLevel.values().length)]);

        return data;
    }
}
