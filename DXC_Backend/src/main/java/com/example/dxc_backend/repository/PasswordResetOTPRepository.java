package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.PasswordResetOTP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetOTPRepository extends JpaRepository<PasswordResetOTP, Long> {
    PasswordResetOTP findByEmail(String email);
    PasswordResetOTP findByOtp(String otp);
}
