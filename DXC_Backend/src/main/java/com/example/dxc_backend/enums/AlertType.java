package com.example.dxc_backend.enums;

public enum AlertType {
    ABOVE,
    BELOW;

    public String getDisplayText() {
        return this == ABOVE ? "Above" : "Below";
    }
}