package com.example.dxc_backend.repository.base;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.TrafficSensorData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;


@NoRepositoryBean
public interface SensorRepositoryProvider<T> extends JpaRepository<T, UUID> {
    SensorType getSensorType();

    Page<T> findFiltered(LocalDateTime start, LocalDateTime end, Pageable pageable, MultiValueMap<String, ?> filters);

    default Optional<T> findLatest() {
        Pageable pageable = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<T> page = this.findAll(pageable);
        return page.hasContent() ? Optional.of(page.getContent().get(0)) : Optional.empty();
    }
}

