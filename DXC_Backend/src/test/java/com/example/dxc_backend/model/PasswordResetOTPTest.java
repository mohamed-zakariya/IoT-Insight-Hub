package com.example.dxc_backend.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class PasswordResetOTPTest {

    @Test
    void testConstructorAndGetters() {
        LocalDateTime futureTime = LocalDateTime.now().plusMinutes(10);
        PasswordResetOTP otp = new PasswordResetOTP("test@example.com", "123456", futureTime);

        assertEquals("test@example.com", otp.getEmail());
        assertEquals("123456", otp.getOtp());
        assertEquals(futureTime, otp.getExpiryTime());
        assertFalse(otp.isExpired());  // Not expired
    }

    @Test
    void testIsExpiredReturnsTrue() {
        LocalDateTime pastTime = LocalDateTime.now().minusMinutes(5);
        PasswordResetOTP otp = new PasswordResetOTP("expired@example.com", "000000", pastTime);

        assertTrue(otp.isExpired());  // Should be expired
    }

    @Test
    void testNoArgsConstructor() {
        PasswordResetOTP otp = new PasswordResetOTP();
        assertNull(otp.getEmail());
        assertNull(otp.getOtp());
        assertNull(otp.getExpiryTime());
    }
}
