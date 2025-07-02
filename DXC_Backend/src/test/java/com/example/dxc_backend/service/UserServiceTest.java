package com.example.dxc_backend.service;

import com.example.dxc_backend.dto.UserRegisterationDTO;
import com.example.dxc_backend.exception.*;
import com.example.dxc_backend.model.PasswordResetOTP;
import com.example.dxc_backend.model.User;
import com.example.dxc_backend.repository.PasswordResetOTPRepository;
import com.example.dxc_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepo;
    private PasswordResetOTPRepository otpRepo;
    private EmailService emailSvc;
    private PasswordEncoder encoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepo  = mock(UserRepository.class);
        otpRepo   = mock(PasswordResetOTPRepository.class);
        emailSvc  = mock(EmailService.class);
        encoder   = mock(PasswordEncoder.class);
        when(encoder.encode(anyString())).thenAnswer(inv -> "ENC(" + inv.getArgument(0) + ")");
        when(encoder.matches(anyString(), anyString())).thenAnswer(inv ->
                Objects.equals("old123", inv.getArgument(0)) &&
                        Objects.equals("ENC(old123)", inv.getArgument(1)));

        userService = new UserService(userRepo, otpRepo, emailSvc, encoder);
    }

    /* ═══════════  createUser  ═══════════ */

    @Test
    void createUser_success() {
        UserRegisterationDTO dto = new UserRegisterationDTO();
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setUsername("jdoe");
        dto.setPassword("pw");
        dto.setEmail("john@ex.com");
        dto.setGender("Male");
        dto.setDob(Date.valueOf("2000-01-01"));

        when(userRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User saved = userService.createUser(dto);

        assertEquals("John", saved.getFirstName());
        assertEquals("ENC(pw)", saved.getPassword());
    }

    @Test
    void createUser_duplicateEmail_throws() {
        when(userRepo.findByEmail("x@y.com")).thenReturn(new User());
        UserRegisterationDTO dto = new UserRegisterationDTO();
        dto.setEmail("x@y.com");
        dto.setUsername("u");
        dto.setGender("Male");
        dto.setDob(Date.valueOf("2000-01-01"));

        assertThrows(DuplicateUserException.class, () -> userService.createUser(dto));
    }

    /* ═══════════  updatePassword  ═══════════ */

    @Test
    void updatePassword_success() {
        User u = new User();
        u.setId(1L);
        u.setPassword("ENC(old123)");
        when(userRepo.findById(1L)).thenReturn(Optional.of(u));
        when(userRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        userService.updatePassword(1L, "old123", "new456");

        assertEquals("ENC(new456)", u.getPassword());
    }

    @Test
    void updatePassword_wrongOldPwd_throws() {
        User u = new User();
        u.setId(2L);
        u.setPassword("ENC(something)");
        when(userRepo.findById(2L)).thenReturn(Optional.of(u));

        assertThrows(InvalidPasswordException.class,
                () -> userService.updatePassword(2L, "bad", "new"));
    }

    /* ═══════════  OTP flow  ═══════════ */

    @Test
    void sendOtpToEmail_persistsOtp_andEmails() {
        User u = new User(); u.setEmail("a@b.c");
        when(userRepo.findByEmail("a@b.c")).thenReturn(u);

        ArgumentCaptor<PasswordResetOTP> cap = ArgumentCaptor.forClass(PasswordResetOTP.class);
        when(otpRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        userService.sendOtpToEmail("a@b.c");

        verify(otpRepo).save(cap.capture());
        PasswordResetOTP saved = cap.getValue();
        assertEquals("a@b.c", saved.getEmail());
        verify(emailSvc).sendEmail(eq("a@b.c"), any(), contains(saved.getOtp()));
    }

    @Test
    void verifyOtpAndResetPassword_success() {
        String otp = "123456";
        PasswordResetOTP rec = new PasswordResetOTP("x@y", otp, LocalDateTime.now().plusMinutes(1));
        when(otpRepo.findByEmail("x@y")).thenReturn(rec);
        User u = new User(); u.setEmail("x@y");
        when(userRepo.findByEmail("x@y")).thenReturn(u);

        boolean ok = userService.verifyOtpAndResetPassword("x@y", otp, "new");

        assertTrue(ok);
        verify(userRepo).save(u);
        verify(otpRepo).delete(rec);
    }

    /* ═══════════  validation helpers  ═══════════ */

    @Test
    void validateGender_acceptsMaleFemale() {
        assertDoesNotThrow(() -> userService.validateGender("Male"));
        assertDoesNotThrow(() -> userService.validateGender("female"));
        assertThrows(IllegalArgumentException.class,
                () -> userService.validateGender("x"));
    }

    @Test
    void validateDob_acceptsValidDate() {
        assertDoesNotThrow(() -> userService.validateDob("1999-12-01"));
        assertThrows(IllegalArgumentException.class,
                () -> userService.validateDob("99-01-01"));
    }
}
