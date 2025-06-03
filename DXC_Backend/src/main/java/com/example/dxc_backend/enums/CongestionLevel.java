package com.example.dxc_backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CongestionLevel {
    LOW,
    MODERATE,
    HIGH,
    SEVERE;

    @JsonCreator
    public static CongestionLevel from(String value) {
        return CongestionLevel.valueOf(value.toUpperCase());
    }
}



