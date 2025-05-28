package com.example.dxc_backend.repository;

import com.example.dxc_backend.enums.AirPollutionSensor;
import com.example.dxc_backend.enums.AlertType;
import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.Settings;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import javax.swing.text.html.Option;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class SettingsRepositoryTest {

    @Autowired private SettingsRepository settingsRepository;


    @BeforeEach
    void cleanDatabase() {
        settingsRepository.deleteAll();
    }


    @Test
    public void testFindByTypeAndMetric(){
        Settings settings = new Settings();
        settings.setType(SensorType.AIR_POLLUTION);
        settings.setMetric(AirPollutionSensor.CO.name());  // <-- convert enum to String here
        settings.setThresholdValue(30f);  // should be Float
        settings.setAlertType(AlertType.ABOVE);

        settingsRepository.save(settings);

        Optional<Settings> result = settingsRepository.findByTypeAndMetric(SensorType.AIR_POLLUTION, AirPollutionSensor.CO.name()); // <-- String again
        assertTrue(result.isPresent());
    }

}
