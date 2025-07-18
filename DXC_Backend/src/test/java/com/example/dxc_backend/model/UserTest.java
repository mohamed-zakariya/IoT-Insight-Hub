package com.example.dxc_backend.model;

import org.junit.jupiter.api.Test;

import java.sql.Date;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testUserSettersAndGetters() {
        User user = new User();

        user.setId(1L);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("password123");
        user.setUsername("johndoe");
        user.setDob(Date.valueOf("2000-01-01"));
        user.setCurrent_postion("Engineer");
        user.setLocation("New York");
        user.setDescription("A test user.");
        user.setGender("Male");

        assertEquals(1L, user.getId());
        assertEquals("John", user.getFirstName());
        assertEquals("Doe", user.getLastName());
        assertEquals("john.doe@example.com", user.getEmail());
        assertEquals("password123", user.getPassword());
        assertEquals("johndoe", user.getUsername());
        assertEquals(Date.valueOf("2000-01-01"), user.getDob());
        assertEquals("Engineer", user.getCurrent_postion());
        assertEquals("New York", user.getLocation());
        assertEquals("A test user.", user.getDescription());
        assertEquals("Male", user.getGender());
    }

    @Test
    void testSetGenderWithValidValue() {
        User user = new User();
        user.setGender("Female");
        assertEquals("Female", user.getGender());
    }

    @Test
    void testSetGenderWithInvalidValueThrowsException() {
        User user = new User();
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            user.setGender("Unknown");
        });

        String expectedMessage = "Invalid gender";
        String actualMessage = exception.getMessage();
        assertTrue(actualMessage.contains(expectedMessage));
    }
}
