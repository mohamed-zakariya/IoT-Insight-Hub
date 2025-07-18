package com.example.dxc_backend.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordUpdateRequestTest {

    @Test
    void testPasswordUpdateRequestFields() {
        PasswordUpdateRequest request = new PasswordUpdateRequest();

        // Use reflection to set private fields (because there's no constructor or setters)
        try {
            var oldField = PasswordUpdateRequest.class.getDeclaredField("oldPassword");
            oldField.setAccessible(true);
            oldField.set(request, "oldPass123");

            var newField = PasswordUpdateRequest.class.getDeclaredField("newPassword");
            newField.setAccessible(true);
            newField.set(request, "newPass456");

            assertEquals("oldPass123", request.getOldPassword());
            assertEquals("newPass456", request.getNewPassword());

        } catch (Exception e) {
            fail("Reflection failed: " + e.getMessage());
        }
    }
}
