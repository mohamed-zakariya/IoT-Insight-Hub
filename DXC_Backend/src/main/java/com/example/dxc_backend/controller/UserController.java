package com.example.dxc_backend.controller;

import com.example.dxc_backend.dto.UserRegisterationDTO;
import com.example.dxc_backend.dto.PasswordUpdateRequest;
import com.example.dxc_backend.model.User;
import com.example.dxc_backend.repository.UserRepository;
import com.example.dxc_backend.service.TokenService;
import com.example.dxc_backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/users")
@Tag(name = "User API", description = "Endpoints for User CRUD and features")
public class UserController {

    private static final String MESSAGE_KEY = "message";
    private static final String ACCESS_TOKEN_KEY = "accessToken";
    private static final String REFRESH_TOKEN_KEY = "refreshToken";
    private static final String USER_KEY = "user";


    private final UserService userService;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserController(
            UserService userService,
            TokenService tokenService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Operation(summary = "Get all users", description = "Retrieve a list of all users (debug only)")
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @Operation(summary = "Create a new user (unsafe)", description = "Create a user without validation")
    @PostMapping
    public User saveUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @Operation(summary = "Get user by email", description = "Fetch a user by email")
    @GetMapping("/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email);
    }

    @Operation(summary = "Sign in with email", description = "Authenticate via email and password")
    @PostMapping("/signin/email")
    public ResponseEntity<Map<String, String>> signInWithEmail(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        User user = userRepository.findByEmail(email);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(MESSAGE_KEY, "Invalid email or password"));
        }

        String accessToken = tokenService.createAccessToken(user.getUsername());
        String refreshToken = tokenService.createRefreshToken(user.getUsername());

        Map<String, String> response = Map.of(
                MESSAGE_KEY, "Sign-in successful with email!",
                ACCESS_TOKEN_KEY, accessToken,
                REFRESH_TOKEN_KEY, refreshToken
        );

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Sign in with username", description = "Authenticate via username and password")
    @PostMapping("/signin/username")
    public ResponseEntity<Map<String, String>> signInWithUsername(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        User user = userRepository.findByUsername(username);
        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(MESSAGE_KEY, "Invalid username or password"));
        }

        String accessToken = tokenService.createAccessToken(username);
        String refreshToken = tokenService.createRefreshToken(username);

        Map<String, String> response = Map.of(
                MESSAGE_KEY, "Sign-in successful with username!",
                ACCESS_TOKEN_KEY, accessToken,
                REFRESH_TOKEN_KEY, refreshToken
        );

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Sign up", description = "Register a new user with validation")
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createUser(
            @RequestBody @Valid UserRegisterationDTO dto,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(Collections.singletonMap("errors", errors));
        }

        try {
            User createdUser = userService.createUser(dto);
            String accessToken = tokenService.createAccessToken(createdUser.getUsername());
            String refreshToken = tokenService.createRefreshToken(createdUser.getUsername());

            Map<String, Object> response = Map.of(
                    MESSAGE_KEY, "Sign-up successful!",
                    USER_KEY, createdUser,
                    ACCESS_TOKEN_KEY, accessToken,
                    REFRESH_TOKEN_KEY, refreshToken
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(MESSAGE_KEY, e.getMessage()));
        }
    }

    @Operation(summary = "Update user", description = "Update your user profile (requires JWT)")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody User userDetails,
            @RequestHeader("accessToken") String token) {

        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(MESSAGE_KEY, "Invalid or expired token."));
        }

        String username = tokenService.extractUsernameFromToken(token);
        Long tokenUserId = userService.getUserIdByUsername(username);

        if (!tokenUserId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(MESSAGE_KEY, "Access denied: You can only update your own profile."));
        }

        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(Map.of("user", updatedUser));
    }

    @Operation(summary = "Update password", description = "Change your password (requires JWT)")
    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @PathVariable Long id,
            @RequestBody @Valid PasswordUpdateRequest request,
            @RequestHeader("accessToken") String token) {

        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(MESSAGE_KEY, "Invalid or expired token."));
        }

        String username = tokenService.extractUsernameFromToken(token);
        Long tokenUserId = userService.getUserIdByUsername(username);

        if (!tokenUserId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(MESSAGE_KEY, "Access denied: You can only update your own password."));
        }

        try {
            userService.updatePassword(id, request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of(MESSAGE_KEY, "Password updated successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(MESSAGE_KEY, e.getMessage()));
        }
    }
}
