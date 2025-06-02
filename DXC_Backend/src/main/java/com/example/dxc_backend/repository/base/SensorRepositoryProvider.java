package com.example.dxc_backend.repository.base;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.TrafficSensorData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;


@NoRepositoryBean
public interface SensorRepositoryProvider<T> extends JpaRepository<T, UUID> {
    SensorType getSensorType();
//    Page<TrafficSensorData> findFiltered(
////            @Param("locations") List<String> locations,
//            @Param("start") LocalDateTime start,
//            @Param("end") LocalDateTime end,
////            @Param("congestionLevels") List<String> congestionLevels,
//            Pageable pageable
//    );

    Page<T> findFiltered(LocalDateTime start, LocalDateTime end, Pageable pageable);

}


