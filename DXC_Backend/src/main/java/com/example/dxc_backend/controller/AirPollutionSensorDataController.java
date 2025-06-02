package com.example.dxc_backend.controller;

import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.service.AirPollutionSensorDataService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/air-pollution-sensors")
public class AirPollutionSensorDataController {

    private final AirPollutionSensorDataService service;

    public AirPollutionSensorDataController(AirPollutionSensorDataService service) {
        this.service = service;
    }

    @GetMapping
    public List<AirPollutionSensorData> getAllSensorData() {
        return service.getAllSensorData();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AirPollutionSensorData> getSensorDataById(@PathVariable UUID id) {
        return service.getSensorDataById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public AirPollutionSensorData createSensorData(@RequestBody AirPollutionSensorData data) {
        return service.saveSensorData(data);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSensorData(@PathVariable UUID id) {
        boolean isDeleted = service.deleteSensorData(id);
        if (isDeleted) {
            return ResponseEntity.ok("Sensor data with ID " + id + " successfully deleted.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sensor data with ID " + id + " does not exist.");
        }
    }

}
