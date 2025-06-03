package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.repository.base.SensorRepositoryProvider;

public abstract class AbstractSensorAlertHandler<T, E extends Enum<E>> implements SensorAlertHandler {
    private final SensorRepositoryProvider<T> repository;
    private final Class<E> metricEnumType;

    protected AbstractSensorAlertHandler(SensorRepositoryProvider<T> repository, Class<E> metricEnumType) {
        this.repository = repository;
        this.metricEnumType = metricEnumType;
    }

    @Override
    public float getLatestMetricValue(String metricStr) {
        E metric;
        try {
            metric = Enum.valueOf(metricEnumType, metricStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid metric: " + metricStr, e);
        }

        T latest = repository.findLatest()
                .orElseThrow(() -> new IllegalStateException("No data available for sensor type: " + getSensorType()));

        return extractMetricValue(latest, metric);
    }

    protected abstract float extractMetricValue(T data, E metric);

    protected SensorRepositoryProvider<T> getRepository() {
        return repository;
    }
}
