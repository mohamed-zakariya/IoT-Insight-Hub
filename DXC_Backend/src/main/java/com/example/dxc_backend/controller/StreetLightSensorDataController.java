package com.example.dxc_backend.controller;

import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.service.StreetLightSensorDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/street-light-sensors")
public class StreetLightSensorDataController {

    private final StreetLightSensorDataService service;

    public StreetLightSensorDataController(StreetLightSensorDataService service) {
        this.service = service;
    }

    @GetMapping
    public List<StreetLightSensorData> getAllSensorData() {
        return service.getAllSensorData();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StreetLightSensorData> getSensorDataById(@PathVariable UUID id) {
        return service.getSensorDataById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public StreetLightSensorData createSensorData(@RequestBody StreetLightSensorData data) {
        return service.saveSensorData(data);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSensorData(@PathVariable UUID id) {
        service.deleteSensorData(id);
        return ResponseEntity.noContent().build();
    }
}
