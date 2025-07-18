package com.example.dxc_backend.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String msg) { super(msg); }
}