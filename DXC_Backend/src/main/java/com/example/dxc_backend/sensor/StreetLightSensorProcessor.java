package com.example.dxc_backend.sensor;

import com.example.dxc_backend.model.StreetLightSensorData;

public class StreetLightSensorProcessor implements SensorProcessor{


    private final StreetLightSensorData data;

    public StreetLightSensorProcessor(StreetLightSensorData data) {
        this.data = data;
    }

    @Override
    public void processData() {


    }
}
