package com.example.dxc_backend.dto;

import com.example.dxc_backend.enums.AlertType;
import com.example.dxc_backend.enums.SensorType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SettingsDTO {

    @NotNull(message = "Type is required")
    private SensorType type;

    @NotNull(message = "Alert type is required")
    private AlertType alertType;

    @NotBlank(message = "Metric is required")
    private String metric;

    @NotNull(message = "Threshold value is required")
    private Float thresholdValue;
}
