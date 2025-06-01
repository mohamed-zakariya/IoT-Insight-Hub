package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import com.example.dxc_backend.strategy.generator.SensorDataGenerator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

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


    public boolean deleteById(SensorType type, UUID id) {
        JpaRepository<?, UUID> repo = repositoryMap.get(type);
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return true;
        }
        return false;
    }


    @SuppressWarnings("unchecked")
    public Object saveSensorData(SensorType type, Object data) {
        JpaRepository repository = repositoryMap.get(type);
        if (repository == null) {
            throw new IllegalArgumentException("No repository found for sensor type: " + type);
        }
        return repository.save(data);
    }

}
