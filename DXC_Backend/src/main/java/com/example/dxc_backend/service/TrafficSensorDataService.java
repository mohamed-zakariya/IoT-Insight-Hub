package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.CongestionLevel;
import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.enums.TrafficSensor;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.TrafficSensorDataRepository;
import com.example.dxc_backend.sensor.SensorProcessor;
import com.example.dxc_backend.sensor.SensorProcessorFactory;
import com.example.dxc_backend.util.Range;
import com.example.dxc_backend.validation.SensorMetricValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TrafficSensorDataService {

    private final TrafficSensorDataRepository repository;
    private final Random random = new Random();

    @Autowired
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
        SensorProcessor processor = SensorProcessorFactory.getProcessor(data);
        processor.processData();  // Validation or preprocessing
        return repository.save(data);
    }




    public boolean deleteTrafficSensorData(UUID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    public TrafficSensorData generateRandomTrafficSensorData() {
        TrafficSensorData data = new TrafficSensorData();

        // Note: UUID should be set externally, e.g. by caller or DB (if auto-generated)
        // data.setId(UUID.randomUUID()); // Uncomment if you want to generate here

        data.setLocation("Location-" + random.nextInt(100));
        data.setTimestamp(LocalDateTime.now());
        data.setTrafficDensity(random.nextInt(501)); // 0 to 500 inclusive
        data.setAvgSpeed(random.nextFloat() * 120); // 0 to 120 km/h approx

        // Assign a random CongestionLevel enum value correctly:
        CongestionLevel[] levels = CongestionLevel.values();
        data.setCongestionLevel(levels[random.nextInt(levels.length)]);

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
        List<TrafficSensor> allowedSortFields = List.of(TrafficSensor.TRAFFIC_DENSITY, TrafficSensor.AVG_SPEED, TrafficSensor.TIME_STAMP);

        if (!allowedSortFields.contains(sortBy)) {
            throw new IllegalArgumentException("Invalid sort field: " + sortBy +
                    ". Allowed fields: trafficDensity, avgSpeed, timestamp.");
        }

        Sort.Direction sortDirectionEnum = Sort.Direction.fromString(sortDirection);
        Sort sort = Sort.by(sortDirectionEnum, sortBy);

        Pageable pageable = PageRequest.of(page, size, sort);
        return repository.findFiltered(location, timestampStart, timestampEnd, congestionLevel, pageable);
    }
}
