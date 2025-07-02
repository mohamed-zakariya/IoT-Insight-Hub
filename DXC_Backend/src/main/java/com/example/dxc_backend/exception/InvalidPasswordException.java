package com.example.dxc_backend.exception;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException(String msg) { super(msg); }
}