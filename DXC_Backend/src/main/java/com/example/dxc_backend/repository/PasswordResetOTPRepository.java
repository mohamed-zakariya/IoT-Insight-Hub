package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.PasswordResetOTP;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetOTPRepository extends JpaRepository<PasswordResetOTP, Long> {
    PasswordResetOTP findByEmail(String email);
}
