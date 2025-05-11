package com.example.dxc_backend.controller;

import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.service.TrafficSensorDataService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/traffic-sensors")
public class TrafficSensorDataController {

    private final TrafficSensorDataService service;

    public TrafficSensorDataController(TrafficSensorDataService service) {
        this.service = service;
    }

    @GetMapping
    public List<TrafficSensorData> getAllTrafficSensorData() {
        return service.getAllTrafficSensorData();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrafficSensorData> getTrafficSensorDataById(@PathVariable UUID id) {
        return service.getTrafficSensorDataById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TrafficSensorData createTrafficSensorData(@RequestBody TrafficSensorData data) {

        return service.saveTrafficSensorData(data);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTrafficSensorData(@PathVariable UUID id) {
        boolean isDeleted = service.deleteTrafficSensorData(id);
        if (isDeleted) {
            return ResponseEntity.ok("Traffic sensor data with ID " + id + " successfully deleted.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Traffic sensor data with ID " + id + " does not exist.");
        }
    }
}
