package com.example.dxc_backend.exception;

public class DuplicateUserException extends RuntimeException {
    public DuplicateUserException(String msg) { super(msg); }
}