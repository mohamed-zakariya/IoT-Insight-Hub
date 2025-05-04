package com.example.dxc_backend.controller;

import com.example.dxc_backend.dto.SettingsDTO;
import com.example.dxc_backend.model.Settings;
import com.example.dxc_backend.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Settings", description = "Manage user alert settings for sensors")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @Operation(
            summary = "Create or update sensor setting",
            description = "Creates a new setting for a specific sensor type and metric. "
                    + "If a setting for the given type and metric already exists for the user, it is overwritten. "
                    + "Threshold value can be a number or null, depending on the metric type."
    )
    @PostMapping
    public ResponseEntity<?> createSetting(@Valid @RequestBody SettingsDTO dto, BindingResult result) {
        if (result.hasErrors()) {
            // Return bad request if there are validation errors
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }

        try {
            // Pass the full User object and other parameters to the service method
            Settings saved = settingsService.createSetting(
                    dto.getType(),
                    dto.getMetric(),
                    dto.getThresholdValue(),
                    dto.getAlertType()
            );
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            // Handle invalid input, like invalid username, sensor type, etc.
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }


    @Operation(
            summary = "Get all settings",
            description = "Fetch all sensor settings."
    )
    @GetMapping
    public ResponseEntity<List<Settings>> getAllSettings() {
        List<Settings> settingsList = settingsService.getAllSettings();
        return ResponseEntity.ok(settingsList);
    }

}
