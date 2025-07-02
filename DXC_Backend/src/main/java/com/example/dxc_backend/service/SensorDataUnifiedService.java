package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import com.example.dxc_backend.strategy.generator.SensorDataGenerator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SensorDataUnifiedService {

    private final Map<SensorType, JpaRepository<?, UUID>> repositoryMap = new EnumMap<>(SensorType.class);
    private final Map<SensorType, SensorDataGenerator<?>> generatorMap = new EnumMap<>(SensorType.class);

    public SensorDataUnifiedService(
            List<SensorRepositoryProvider<?>> repositories,
            List<SensorDataGenerator<?>> generators
    ) {
        for (SensorRepositoryProvider<?> repo : repositories) {
            repositoryMap.put(repo.getSensorType(), repo);
        }
        for (SensorDataGenerator<?> gen : generators) {
            generatorMap.put(gen.getSensorType(), gen);
        }
    }


    public Object generateAndSave(SensorType type) {
        SensorDataGenerator<?> generator = generatorMap.get(type);
        JpaRepository repository = repositoryMap.get(type);

        Object data = generator.generateRandomSensorData();
        return repository.save(data);
    }

    public List<?> getAll(SensorType type) {
        JpaRepository repository = repositoryMap.get(type);
        return repository.findAll();
    }



public <T> Page<T> getFilteredData(
        SensorType type,
        LocalDateTime timestampStart,
        LocalDateTime timestampEnd,
        MultiValueMap<String, ?> filters,
        int page,
        int size,
        String sortBy,
        String sortDirection
) {
    // Single retrieval + cast, throws immediately if no repo found or cast fails
    SensorRepositoryProvider<T> repo = Optional.ofNullable(repositoryMap.get(type))
            .filter(r -> r instanceof SensorRepositoryProvider)
            .map(r -> (SensorRepositoryProvider<T>) r)
            .orElseThrow(() -> new IllegalArgumentException("No repository found for sensor type: " + type));

    Sort.Direction direction = Sort.Direction.fromString(sortDirection); // single point of failure

    Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

    return repo.findFiltered(timestampStart, timestampEnd, pageable, filters);
}

    public Page<String> getLocations(
            int page,
            SensorType type,
            int size,
            String sortDirection
    ) {
        SensorRepositoryProvider<?> repo = Optional.ofNullable(repositoryMap.get(type))
                .filter(r -> r instanceof SensorRepositoryProvider)
                .map(r -> (SensorRepositoryProvider<?>) r)
                .orElseThrow(() -> new IllegalArgumentException("No repository found for sensor type: " + type));

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "location")); // hardcoded

        return repo.getLocations(pageable);
    }

}
