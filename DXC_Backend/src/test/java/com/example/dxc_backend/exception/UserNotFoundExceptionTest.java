package com.example.dxc_backend.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserNotFoundExceptionTest {

    @Test
    void testExceptionMessage() {
        String message = "User not found";
        UserNotFoundException ex = new UserNotFoundException(message);

        assertEquals(message, ex.getMessage());
    }
}
