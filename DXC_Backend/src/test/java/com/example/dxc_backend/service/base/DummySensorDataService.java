package com.example.dxc_backend.service.base;

import org.springframework.data.jpa.repository.JpaRepository;

public class DummySensorDataService extends BaseSensorDataService<DummyEntity, Long> {

    public DummySensorDataService(JpaRepository<DummyEntity, Long> repository) {
        super(repository);
    }

    @Override
    protected void preprocessData(DummyEntity data) {
        data.setName(data.getName().toUpperCase()); // sample logic
    }
}
