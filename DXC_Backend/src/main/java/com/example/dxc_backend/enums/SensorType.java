package com.example.dxc_backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum SensorType {
    TRAFFIC,
    AIR_POLLUTION, // Correct spelling with two "L"s
    STREET_LIGHT;

    @JsonCreator
    public static SensorType from(String value) {
        return SensorType.valueOf(value.toUpperCase());
    }
}