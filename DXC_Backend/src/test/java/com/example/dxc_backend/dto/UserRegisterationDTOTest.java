package com.example.dxc_backend.dto;

import jakarta.validation.*;
import org.junit.jupiter.api.Test;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class UserRegisterationDTOTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void testValidUserRegistrationDTO() {
        UserRegisterationDTO dto = new UserRegisterationDTO();
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setUsername("johndoe");
        dto.setPassword("secret123");
        dto.setEmail("john@example.com");
        dto.setGender("Male");
        dto.setDob(Date.valueOf(LocalDate.of(2000, 1, 1)));

        Set<ConstraintViolation<UserRegisterationDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testInvalidEmail() {
        UserRegisterationDTO dto = new UserRegisterationDTO();
        dto.setFirstName("Jane");
        dto.setLastName("Doe");
        dto.setUsername("janedoe");
        dto.setPassword("123456");
        dto.setEmail("invalid-email");
        dto.setGender("Female");
        dto.setDob(Date.valueOf(LocalDate.of(2000, 1, 1)));

        Set<ConstraintViolation<UserRegisterationDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());

        boolean hasEmailViolation = violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email"));
        assertTrue(hasEmailViolation);
    }

    @Test
    void testMissingRequiredFields() {
        UserRegisterationDTO dto = new UserRegisterationDTO(); // all fields null
        Set<ConstraintViolation<UserRegisterationDTO>> violations = validator.validate(dto);
        assertEquals(8, violations.size()); // All required fields missing
    }

    @Test
    void testAgeOutOfRange() {
        UserRegisterationDTO dto = new UserRegisterationDTO();
        dto.setFirstName("Young");
        dto.setLastName("Kid");
        dto.setUsername("youngkid");
        dto.setPassword("test");
        dto.setEmail("young@example.com");
        dto.setGender("Male");
        dto.setDob(Date.valueOf(LocalDate.now().minusYears(5))); // Too young

        Set<ConstraintViolation<UserRegisterationDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());

        boolean ageViolation = violations.stream()
                .anyMatch(v -> v.getMessage().contains("Age must be between"));
        assertTrue(ageViolation);
    }
}
