package com.example.dxc_backend.factory.processor;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.enums.TrafficSensor;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.util.Range;
import com.example.dxc_backend.validation.SensorMetricValidation;

import java.util.Map;

public class TrafficSensorProcessor implements SensorProcessor {

    private final TrafficSensorData data;

    public TrafficSensorProcessor(TrafficSensorData data) {
        this.data = data;
    }

    @Override
    public void processData() {
        validateMetric(SensorType.TRAFFIC, TrafficSensor.TRAFFIC_DENSITY, data.getTrafficDensity());
        validateMetric(SensorType.TRAFFIC, TrafficSensor.AVG_SPEED, data.getAvgSpeed());
    }

    private <T extends Number & Comparable<T>> void validateMetric(SensorType sensorType, Enum<?> metric, T value) {
        Map<Enum, Range> metricRanges = SensorMetricValidation.METRIC_VALID_RANGES.get(sensorType);
        if (metricRanges == null) {
            throw new IllegalArgumentException("No valid metrics configured for sensor type: " + sensorType);
        }

        Range range = metricRanges.get(metric);
        if (range == null) {
            throw new IllegalArgumentException("No valid range configured for metric: " + metric);
        }

        float val = value.floatValue();
        if (!range.isValid(val)) {
            throw new IllegalArgumentException("Value " + val + " for metric " + metric + " is out of range: " + range);
        }
    }
}
