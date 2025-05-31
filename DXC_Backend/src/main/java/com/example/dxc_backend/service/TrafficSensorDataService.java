package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.TrafficSensor;
import com.example.dxc_backend.generator.SensorDataGenerator;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.factory.processor.SensorProcessor;
import com.example.dxc_backend.factory.SensorProcessorFactory;
import com.example.dxc_backend.repository.TrafficSensorDataRepository;
import com.example.dxc_backend.service.base.BaseSensorDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TrafficSensorDataService extends BaseSensorDataService<TrafficSensorData, UUID> {

    @Autowired private TrafficSensorDataRepository repository;
    @Autowired private SensorDataGenerator<TrafficSensorData> trafficSensorDataGenerator;
    private final Random random = new Random();


    public TrafficSensorDataService(TrafficSensorDataRepository repository) {
        super(repository);
        this.repository = repository;
    }


    @Override
    protected void preprocessData(TrafficSensorData data) {
        SensorProcessor processor = SensorProcessorFactory.getProcessor(data);
        processor.processData();
    }


    public TrafficSensorData generateRandomTrafficSensorData() {
        return trafficSensorDataGenerator.generateRandomSensorData();
    }


    public Page<TrafficSensorData> getFilteredData(
            LocalDateTime timestampStart,
            LocalDateTime timestampEnd,
            List<String> locations,
            List<String> congestionLevels,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        Sort.Direction sortDirectionEnum = Sort.Direction.fromString(sortDirection);
        Sort sort = Sort.by(sortDirectionEnum, sortBy);

        if (locations != null) {
            locations = locations.stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());
        }
        if (congestionLevels != null) {
            congestionLevels = congestionLevels.stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        return repository.findFiltered(locations, timestampStart, timestampEnd, congestionLevels, pageable);
    }
}
