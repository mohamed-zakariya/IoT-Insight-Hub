// path: com.example.dxc_backend.strategy.generator.SensorDataGenerationStrategy.java
package com.example.dxc_backend.strategy.generator;

import com.example.dxc_backend.enums.SensorType;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class SensorDataGenerationStrategy {

    private final Map<SensorType, SensorDataGenerator<?>> generatorMap = new EnumMap<>(SensorType.class);

    public SensorDataGenerationStrategy(List<SensorDataGenerator<?>> generators) {
        for (SensorDataGenerator<?> generator : generators) {
            generatorMap.put(generator.getSensorType(), generator);
        }
    }

    @SuppressWarnings("unchecked")
    public <T> SensorDataGenerator<T> getGenerator(SensorType type) {
        return (SensorDataGenerator<T>) generatorMap.get(type);
    }
}
