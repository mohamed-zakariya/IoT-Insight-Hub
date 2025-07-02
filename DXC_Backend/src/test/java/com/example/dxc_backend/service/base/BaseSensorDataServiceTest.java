package com.example.dxc_backend.service.base;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BaseSensorDataServiceTest {

    private JpaRepository<DummyEntity, Long> repository;
    private DummySensorDataService service;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(JpaRepository.class);
        service = new DummySensorDataService(repository);
    }

    @Test
    void testGetAllSensorData() {
        DummyEntity entity = new DummyEntity();
        entity.setName("sensor");
        when(repository.findAll()).thenReturn(List.of(entity));

        List<DummyEntity> result = service.getAllSensorData();
        assertEquals(1, result.size());
        assertEquals("sensor", result.get(0).getName());
    }

    @Test
    void testGetSensorDataById() {
        DummyEntity entity = new DummyEntity();
        entity.setId(1L);
        entity.setName("sensor");

        when(repository.findById(1L)).thenReturn(Optional.of(entity));

        Optional<DummyEntity> result = service.getSensorDataById(1L);
        assertTrue(result.isPresent());
        assertEquals("sensor", result.get().getName());
    }

    @Test
    void testSaveSensorData_withPreprocessing() {
        DummyEntity entity = new DummyEntity();
        entity.setName("lowercase");

        DummyEntity savedEntity = new DummyEntity();
        savedEntity.setName("LOWERCASE");

        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        DummyEntity result = service.saveSensorData(entity);
        assertEquals("LOWERCASE", result.getName());
    }

    @Test
    void testDeleteSensorData_exists() {
        when(repository.existsById(1L)).thenReturn(true);

        boolean result = service.deleteSensorData(1L);
        assertTrue(result);
        verify(repository).deleteById(1L);
    }

    @Test
    void testDeleteSensorData_notExists() {
        when(repository.existsById(1L)).thenReturn(false);

        boolean result = service.deleteSensorData(1L);
        assertFalse(result);
        verify(repository, never()).deleteById(any());
    }
}