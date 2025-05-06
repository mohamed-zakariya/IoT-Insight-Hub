package com.example.dxc_backend.controller;

import com.example.dxc_backend.dto.SettingsDTO;
import com.example.dxc_backend.model.Settings;
import com.example.dxc_backend.model.User;
import com.example.dxc_backend.repository.UserRepository;
import com.example.dxc_backend.service.SettingsService;
import com.example.dxc_backend.service.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Operation(
            summary = "Create or update sensor setting",
            description = "Creates or updates a sensor setting for the authenticated user. Requires valid JWT."
    )
    @PostMapping
    public ResponseEntity<?> createSetting(
            @Valid @RequestBody SettingsDTO dto,
            BindingResult result,
            @RequestHeader("accessToken") String token) {

        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }

        try {
            String username = tokenService.extractUsernameFromToken(token);
            User user = userRepository.getUserByUsername(username); // ensure this method exists

            if (user != null) {
                Settings saved = settingsService.createSetting(
                        dto.getType(),
                        dto.getMetric(),
                        dto.getThresholdValue(),
                        dto.getAlertType()
                );
                return ResponseEntity.ok(saved);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @Operation(
            summary = "Get all settings",
            description = "Fetch all sensor settings for authenticated users only. Requires valid JWT."
    )
    @GetMapping
    public ResponseEntity<?> getAllSettings(@RequestHeader("accessToken") String token) {
        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        try {
            String username = tokenService.extractUsernameFromToken(token);
            User user = userRepository.getUserByUsername(username);

            if (user != null) {
                List<Settings> settingsList = settingsService.getAllSettings()  ; // Use a method to fetch only this user's settings
                return ResponseEntity.ok(settingsList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


}
