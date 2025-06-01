// path: com.example.dxc_backend.controller.SensorDataController.java
package com.example.dxc_backend.controller;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.service.SensorDataUnifiedService;
import com.example.dxc_backend.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/sensors")
public class SensorDataController {

    private final SensorDataUnifiedService service;
    private final TokenService tokenService;

    public SensorDataController(SensorDataUnifiedService service, TokenService tokenService) {
        this.service = service;
        this.tokenService = tokenService;
    }

    @PostMapping("/{type}")
    public ResponseEntity<?> createSensorData(
            @PathVariable SensorType type,
            @RequestBody @Valid Object data,
            @RequestHeader("accessToken") String token
    ) {
        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        try {
            Object saved = service.saveSensorData(type, data);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to save sensor data: " + e.getMessage());
        }
    }

    @GetMapping("/{type}")
    public ResponseEntity<?> getAllSensorData(
            @PathVariable SensorType type
    ) {

        List<?> dataList = service.getAll(type);
        return ResponseEntity.ok(dataList);
    }


    @DeleteMapping("/{type}/{id}")
    public ResponseEntity<?> deleteSensorDataById(
            @PathVariable SensorType type,
            @PathVariable UUID id,
            @RequestHeader("accessToken") String token
    ) {
        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        boolean deleted = service.deleteById(type, id);
        if (deleted) {
            return ResponseEntity.ok("Deleted sensor data with ID " + id);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sensor data not found.");
        }
    }
}
