package com.example.dxc_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class PasswordUpdateRequest {


    @NotBlank(message = "Old Password must be entered")
    private String oldPassword;

    @NotBlank(message = "New Password must be entered")
    private String newPassword;


}
