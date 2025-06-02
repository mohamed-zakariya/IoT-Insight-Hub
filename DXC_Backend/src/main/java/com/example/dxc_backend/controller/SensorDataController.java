// path: com.example.dxc_backend.controller.SensorDataController.java
package com.example.dxc_backend.controller;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.service.SensorDataUnifiedService;
import com.example.dxc_backend.service.TokenService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @GetMapping("/{type}")
    public ResponseEntity<?> getFilteredSensorData(
            @PathVariable SensorType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timestampStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timestampEnd,
            @RequestParam Map<String, String> allRequestParams,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestHeader("accessToken") String token
    ) {
        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        // Remove pagination and sorting params before passing filters
        allRequestParams.remove("page");
        allRequestParams.remove("size");
        allRequestParams.remove("sortBy");
        allRequestParams.remove("sortDirection");

        Page<?> result = service.getFilteredData(type, timestampStart, timestampEnd, allRequestParams, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(result);
    }
}
