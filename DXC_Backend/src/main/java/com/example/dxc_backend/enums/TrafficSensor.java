package com.example.dxc_backend.enums;

public enum TrafficSensor {
    TRAFFIC_DENSITY("trafficDensity"),
    AVG_SPEED("avgSpeed"),
    TIME_STAMP("timestamp");

    private final String fieldName;

    TrafficSensor(String fieldName) {
        this.fieldName = fieldName;
    }

    public static TrafficSensor fromFieldName(String name) {
        for (TrafficSensor field : values()) {
            if (field.fieldName.equalsIgnoreCase(name)) {
                return field;
            }
        }
        throw new IllegalArgumentException("Invalid sort field: " + name +
                ". Allowed fields: trafficDensity, avgSpeed, timestamp.");
    }
}