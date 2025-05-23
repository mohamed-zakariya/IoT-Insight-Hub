package com.example.dxc_backend.controller;

import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.service.TrafficSensorDataService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/traffic-sensors")
public class TrafficSensorDataController {

    private final TrafficSensorDataService service;

    public TrafficSensorDataController(TrafficSensorDataService service) {
        this.service = service;
    }


    @GetMapping("/new")  // && bassel
    public Page<TrafficSensorData> getFilteredTrafficSensorData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timestampStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timestampEnd,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String congestionLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,    // number of records returned per page
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        return service.getFilteredData(timestampStart, timestampEnd, location, congestionLevel, page, size, sortBy, sortDirection);
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
