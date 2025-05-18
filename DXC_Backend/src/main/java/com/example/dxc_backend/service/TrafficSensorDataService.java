package com.example.dxc_backend.service;

import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.TrafficSensorDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;


@Service
public class TrafficSensorDataService {

     @Autowired private TrafficSensorDataRepository repository;

    public TrafficSensorDataService(TrafficSensorDataRepository repository) {
        this.repository = repository;
    }

    public List<TrafficSensorData> getAllTrafficSensorData() {
        return repository.findAll();
    }

    public Optional<TrafficSensorData> getTrafficSensorDataById(UUID id) {
        return repository.findById(id);
    }

    public TrafficSensorData saveTrafficSensorData(TrafficSensorData data) {
        // Print each attribute of the TrafficSensorData object
        System.out.println("Saving Traffic Sensor Data: ");
        System.out.println("ID: " + data.getId());
        System.out.println("Location: " + data.getLocation());
        System.out.println("Timestamp: " + data.getTimestamp());
        System.out.println("Traffic Density: " + data.getTrafficDensity());
        System.out.println("Average Speed: " + data.getAvgSpeed());
        System.out.println("Congestion Level: " + data.getCongestionLevel());

        return repository.save(data);
    }

    public boolean deleteTrafficSensorData(UUID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true; // Indicate successful deletion
        }
        return false; // Indicate that the ID was not found
    }

    //now will make a a new function for the random generation
    private final Random random = new Random();

    public TrafficSensorData generateRandomTrafficSensorData() {
        TrafficSensorData data = new TrafficSensorData();
        //data.setId(UUID.randomUUID()); we generate the uuid from the call dont forget because we cant send it in the random // be well ^_~^_~^_~^_~^_~
        data.setLocation("Location-" + random.nextInt(100)); //  Location-1, Location-2
        data.setTimestamp(LocalDateTime.now());
        data.setTrafficDensity(random.nextInt(501)); // from 0 and 500
        data.setAvgSpeed(random.nextFloat() * 120); // from 0 and 120
        data.setCongestionLevel(new String[]{"Low", "Moderate", "High", "Severe"}[random.nextInt(4)]);
        return data;
    }

    public List<TrafficSensorData> getFilteredData(
            LocalDateTime timestampStart,
            LocalDateTime timestampEnd,
            String location,
            String congestionLevel,
            String sortBy
    ) {
        List<TrafficSensorData> data = repository.findAll();

        if (timestampStart != null) {
            data = data.stream()
                    .filter(d -> d.getTimestamp().isAfter(timestampStart) || d.getTimestamp().isEqual(timestampStart))
                    .toList();
        }

        if (timestampEnd != null) {
            data = data.stream()
                    .filter(d -> d.getTimestamp().isBefore(timestampEnd) || d.getTimestamp().isEqual(timestampEnd))
                    .toList();
        }

        if (location != null && !location.isEmpty()) {

            data = data.stream()
                    .filter(d -> d.getLocation().equalsIgnoreCase(location))
                    .toList();
        }

        if (congestionLevel != null && !congestionLevel.isEmpty()) {
            data = data.stream()
                    .filter(d -> d.getCongestionLevel().equalsIgnoreCase(congestionLevel))
                    .toList();
        }

        if (sortBy != null) {
            switch (sortBy) {
                case "trafficDensity":
                    data = data.stream()
                            .sorted(Comparator.comparingInt(TrafficSensorData::getTrafficDensity).reversed())
                            .toList();
                    break;
                case "avgSpeed":
                    data = data.stream()
                            .sorted(Comparator.comparingDouble(TrafficSensorData::getAvgSpeed).reversed())
                            .toList();
                    break;
                case "timestamp":
                    data = data.stream()
                            .sorted(Comparator.comparing(TrafficSensorData::getTimestamp).reversed())
                            .toList();
                    break;
            }
        }

        return data;
    }
}