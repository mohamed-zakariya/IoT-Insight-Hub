package com.example.dxc_backend.validation;

import com.example.dxc_backend.util.Range;

import java.util.Map;
import java.util.Set;

public class SensorMetricValidation {

    // Define valid sensor types and metrics along with their corresponding threshold ranges
    public static final Map<String, Set<String>> SENSOR_METRIC_MAP = Map.of(
            "Traffic", Set.of("trafficDensity", "avgSpeed"),
            "Air_Pollution", Set.of("co", "ozone"),
            "Street_Light", Set.of("brightnessLevel", "powerConsumption")
    );

    // Define valid threshold ranges for each metric
    public static final Map<String, Map<String, Range>> METRIC_VALID_RANGES = Map.of(
            "Traffic", Map.of(
                    "trafficDensity", new Range(0, 500),
                    "avgSpeed", new Range(0f, 120f)
            ),
            "Air_Pollution", Map.of(
                    "co", new Range(0f, 50f),
                    "ozone", new Range(0f, 300f)
            ),
            "Street_Light", Map.of(
                    "brightnessLevel", new Range(0, 100),
                    "powerConsumption", new Range(0f, 5000f)
            )
    );
}
