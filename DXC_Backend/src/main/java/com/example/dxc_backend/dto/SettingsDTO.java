package com.example.dxc_backend.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;


@Getter
public class SettingsDTO {

    @Pattern(
            regexp = "Traffic|Air_Pollution|Street_Light",
            message = "Type must be one of: Traffic, Air_Pollution, Street_Light"
    )
    @NotBlank(message = "Type is required")
    private String type;


    @NotBlank(message = "Metric is required")
    private String metric;

    @NotNull(message = "Threshold value is required")
    private Float thresholdValue;

    @NotBlank(message = "Alert type is required")
    @Pattern(regexp = "ABOVE|BELOW", message = "Alert type must be 'ABOVE' or 'BELOW'")
    private String alertType;

    // Getters and setters
}
