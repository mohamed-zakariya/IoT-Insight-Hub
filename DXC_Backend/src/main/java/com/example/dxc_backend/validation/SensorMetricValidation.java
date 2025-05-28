package com.example.dxc_backend.validation;

import com.example.dxc_backend.enums.*;
import com.example.dxc_backend.util.Range;

import java.util.Map;
import java.util.Set;

public class SensorMetricValidation {

    // Define valid sensor types and metrics along with their corresponding threshold ranges
    public static Map<SensorType, Set<Enum>> SENSOR_METRIC_MAP = Map.of(
            SensorType.TRAFFIC, Set.of(TrafficSensor.TRAFFIC_DENSITY, TrafficSensor.AVG_SPEED),
            SensorType.AIR_POLLUTION, Set.of(AirPollutionSensor.CO, AirPollutionSensor.OZONE),
            SensorType.STREET_LIGHT, Set.of(StreetLightSensor.BRIGHTNESS_LEVEL, StreetLightSensor.POWER_CONSUMPTION)
    );

    // Define valid threshold ranges for each metric
    public static Map<SensorType, Map<Enum, Range>> METRIC_VALID_RANGES = Map.of(
            SensorType.TRAFFIC, Map.of(
                    TrafficSensor.TRAFFIC_DENSITY, new Range(0, 500),
                    TrafficSensor.AVG_SPEED, new Range(0f, 120f)
            ),
            SensorType.AIR_POLLUTION, Map.of(
                    AirPollutionSensor.CO, new Range(0f, 50f),
                    AirPollutionSensor.OZONE, new Range(0f, 300f)
            ),
            SensorType.STREET_LIGHT, Map.of(
                    StreetLightSensor.BRIGHTNESS_LEVEL, new Range(0, 100),
                    StreetLightSensor.POWER_CONSUMPTION, new Range(0f, 5000f)
            )
    );
}
