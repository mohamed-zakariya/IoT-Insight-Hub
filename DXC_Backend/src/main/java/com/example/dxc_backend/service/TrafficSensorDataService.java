package com.example.dxc_backend.service;

import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.TrafficSensorDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
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

    public Page<TrafficSensorData> getFilteredData(
            LocalDateTime timestampStart,
            LocalDateTime timestampEnd,
            String location,
            String congestionLevel,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        List<String> allowedSortFields = List.of("trafficDensity", "avgSpeed", "timestamp");

        if (!allowedSortFields.contains(sortBy)) {
            throw new IllegalArgumentException("Invalid sort field: " + sortBy +
                    ". Allowed fields: trafficDensity, avgSpeed, timestamp.");
        }

        Sort.Direction sortDirectionEnum = Sort.Direction.fromString(sortDirection);
        Sort sort = Sort.by(sortDirectionEnum, sortBy);

        Pageable pageable = PageRequest.of(page, size, sort);
        return repository.findFiltered(location, timestampStart, timestampEnd, congestionLevel,  pageable);
    }
}