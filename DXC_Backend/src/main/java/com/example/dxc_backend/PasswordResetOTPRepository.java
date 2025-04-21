package com.example.dxc_backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetOTPRepository extends JpaRepository<PasswordResetOTP, Long> {
    PasswordResetOTP findByEmail(String email);
}
