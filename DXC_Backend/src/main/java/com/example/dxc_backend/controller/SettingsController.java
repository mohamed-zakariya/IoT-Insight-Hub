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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Settings", description = "Manage user alert settings for sensors")
public class SettingsController {

    private final SettingsService settingsService;
    private final TokenService tokenService;
    private final UserRepository userRepository;


    public SettingsController(SettingsService settingsService,
                              TokenService tokenService,
                              UserRepository userRepository) {
        this.settingsService = settingsService;
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    @Operation(
            summary = "Create or update sensor setting",
            description = "Creates or updates a sensor setting for the authenticated user. Requires valid JWT."
    )
    @PostMapping
    public ResponseEntity<Object> createSetting(
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
            User user = userRepository.getUserByUsername(username);

            if (user != null) {
                Settings saved = settingsService.createSetting(
                        dto.getType(),
                        dto.getMetric().toUpperCase(),
                        dto.getThresholdValue(),
                        dto.getAlertType()
                );
                return ResponseEntity.ok(saved); // returns ResponseEntity<Settings>
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
    public ResponseEntity<Object> getAllSettings(@RequestHeader("accessToken") String token) {
        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        try {
            String username = tokenService.extractUsernameFromToken(token);
            User user = userRepository.getUserByUsername(username);

            if (user != null) {
                List<Settings> settingsList = settingsService.getAllSettings();
                return ResponseEntity.ok(settingsList); // ResponseEntity<List<Settings>>
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
