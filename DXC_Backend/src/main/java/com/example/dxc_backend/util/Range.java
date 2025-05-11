package com.example.dxc_backend.util;


import lombok.Getter;

@Getter
public class Range {
    private final float min;
    private final float max;

    // Constructor for integer ranges (used for trafficDensity and brightnessLevel)
    public Range(int min, int max) {
        this.min = min;
        this.max = max;
    }

    // Constructor for float ranges (used for avgSpeed, co, ozone, powerConsumption)
    public Range(float min, float max) {
        this.min = min;
        this.max = max;
    }

    // Validate if a given value is within the range
    public boolean isValid(float value) {
        return value >= min && value <= max;
    }

    // Overloaded method to validate an integer value
    public boolean isValid(int value) {
        return value >= min && value <= max;
    }
}
