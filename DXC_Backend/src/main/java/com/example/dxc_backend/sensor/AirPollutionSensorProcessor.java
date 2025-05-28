package com.example.dxc_backend.sensor;

import com.example.dxc_backend.enums.AirPollutionSensor;
import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.util.Range;
import com.example.dxc_backend.validation.SensorMetricValidation;

import java.util.Map;

public class AirPollutionSensorProcessor implements SensorProcessor {

    private final AirPollutionSensorData data;

    public AirPollutionSensorProcessor(AirPollutionSensorData data) {
        this.data = data;
    }

    @Override
    public void processData() {
        Map<Enum, Range> validRanges =
                SensorMetricValidation.METRIC_VALID_RANGES.get(SensorType.AIR_POLLUTION);

        Range coRange = validRanges.get(AirPollutionSensor.CO);
        Range ozoneRange = validRanges.get(AirPollutionSensor.OZONE);

        float co = data.getCo();
        float ozone = data.getOzone();

        if (!coRange.isValid(co)) {
            throw new IllegalArgumentException("CO value out of valid range: " + co);
        }

        if (!ozoneRange.isValid(ozone)) {
            throw new IllegalArgumentException("Ozone value out of valid range: " + ozone);
        }


        // You can optionally add logic for SO2, NO2, etc., if needed.
    }
}
