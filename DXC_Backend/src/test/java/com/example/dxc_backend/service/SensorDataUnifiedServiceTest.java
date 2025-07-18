package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import com.example.dxc_backend.strategy.generator.SensorDataGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.domain.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SensorDataUnifiedServiceTest {

    @Mock
    private SensorRepositoryProvider<Object> mockRepository;

    @Mock
    private SensorDataGenerator<Object> mockGenerator;

    private SensorDataUnifiedService service;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        when(mockRepository.getSensorType()).thenReturn(SensorType.TRAFFIC);
        when(mockGenerator.getSensorType()).thenReturn(SensorType.TRAFFIC);


        // Create service instance with mocks
        service = new SensorDataUnifiedService(
                List.of(mockRepository),
                List.of(mockGenerator)
        );

    }

    @Test
    void testGenerateAndSave() {
        Object generatedData = new Object();
        when(mockGenerator.generateRandomSensorData()).thenReturn(generatedData);
        when(mockRepository.save(generatedData)).thenReturn(generatedData);

        Object saved = service.generateAndSave(SensorType.TRAFFIC);
        assertEquals(generatedData, saved);

        verify(mockGenerator).generateRandomSensorData();
        verify(mockRepository).save(generatedData);
    }

    @Test
    void testGetAll() {
        List<Object> list = List.of(new Object(), new Object());
        when(mockRepository.findAll()).thenReturn(list);

        List<?> all = service.getAll(SensorType.TRAFFIC);
        assertEquals(2, all.size());
        verify(mockRepository).findAll();
    }

    @Test
    void testGetFilteredData() {
        // Prepare Pageable and filters
        int page = 0, size = 5;
        String sortBy = "timestamp";
        String sortDirection = "DESC";

        MultiValueMap<String, String> filters = new LinkedMultiValueMap<>();
        filters.add("location", "main street");

        // Prepare mocked Page result
        Page<Object> mockedPage = Page.empty();
        when(mockRepository.findFiltered(
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                any(Pageable.class),
                eq(filters)
        )).thenReturn(mockedPage);

        // Cast repository to SensorRepositoryProvider<Object> since your method expects that
        SensorRepositoryProvider<Object> repo = (SensorRepositoryProvider<Object>) mockRepository;

        // Replace in service repositoryMap to our mocked repo for type safety
        service = new SensorDataUnifiedService(List.of(repo), List.of(mockGenerator));

        Page<Object> pageResult = service.getFilteredData(
                SensorType.TRAFFIC,
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now(),
                filters,
                page,
                size,
                sortBy,
                sortDirection
        );

        assertNotNull(pageResult);
        verify(mockRepository).findFiltered(
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                any(Pageable.class),
                eq(filters)
        );
    }

    @Test
    void testGetLocations() {
        int page = 0;
        int size = 5;
        String sortDirection = "ASC";

        Page<String> mockedPage = Page.empty();

        when(mockRepository.getLocations(any(Pageable.class))).thenReturn(mockedPage);

        SensorRepositoryProvider<Object> repo = (SensorRepositoryProvider<Object>) mockRepository;
        service = new SensorDataUnifiedService(List.of(repo), List.of(mockGenerator));

        Page<String> locations = service.getLocations(page, SensorType.TRAFFIC, size, sortDirection);

        assertNotNull(locations);
        verify(mockRepository).getLocations(any(Pageable.class));
    }


    @Test
    void testGetFilteredData_noRepository() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            service.getFilteredData(
                    SensorType.AIR_POLLUTION,
                    null,
                    null,
                    new LinkedMultiValueMap<>(),
                    0,
                    10,
                    "timestamp",
                    "ASC"
            );
        });

        assertTrue(ex.getMessage().contains("No repository found"));
    }

    @Test
    void testGetLocations_noRepository() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            service.getLocations(0, SensorType.AIR_POLLUTION, 10, "DESC");
        });

        assertTrue(ex.getMessage().contains("No repository found"));
    }
}
