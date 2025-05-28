package com.example.dxc_backend.validation;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.util.Range;

import java.util.Map;
import java.util.Set;

public class SensorMetricValidation {

    // Define valid sensor types and metrics along with their corresponding threshold ranges
    public static Map<SensorType, Set<String>> SENSOR_METRIC_MAP = Map.of(
            SensorType.TRAFFIC, Set.of("trafficDensity", "avgSpeed"),
            SensorType.AIR_POLLUTION, Set.of("co", "ozone"),
            SensorType.STREET_LIGHT, Set.of("brightnessLevel", "powerConsumption")
    );

    // Define valid threshold ranges for each metric
    public static Map<SensorType, Map<String, Range>> METRIC_VALID_RANGES = Map.of(
            SensorType.TRAFFIC, Map.of(
                    "trafficDensity", new Range(0, 500),
                    "avgSpeed", new Range(0f, 120f)
            ),
            SensorType.AIR_POLLUTION, Map.of(
                    "co", new Range(0f, 50f),
                    "ozone", new Range(0f, 300f)
            ),
            SensorType.STREET_LIGHT, Map.of(
                    "brightnessLevel", new Range(0, 100),
                    "powerConsumption", new Range(0f, 5000f)
            )
    );
}
