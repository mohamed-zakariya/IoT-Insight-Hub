package com.example.dxc_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SettingsDTO {

    @NotBlank(message = "Username must not be blank")
    private String username;

    @NotBlank(message = "Type must not be blank")
    private String type;

    @NotBlank(message = "Metric must not be blank")
    private String metric;

    @NotBlank(message = "AlertType is required")
    private String alertType;

    @NotNull(message = "Threshold value must be provided")
    private Float thresholdValue;

}

