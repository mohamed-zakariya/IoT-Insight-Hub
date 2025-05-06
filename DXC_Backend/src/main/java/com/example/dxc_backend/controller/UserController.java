package com.example.dxc_backend.controller;

import com.example.dxc_backend.dto.UserRegisterationDTO;
import com.example.dxc_backend.model.Token;
import com.example.dxc_backend.model.User;
import com.example.dxc_backend.repository.TokenRepository;
import com.example.dxc_backend.repository.UserRepository;
import com.example.dxc_backend.dto.PasswordUpdateRequest;
import com.example.dxc_backend.service.TokenService;
import com.example.dxc_backend.service.UserService;
import com.example.dxc_backend.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200") // or specify http://localhost:4200 explicitly
@RestController
@RequestMapping("/api/users")
@Tag(name = "User API", description = "Endpoints for User Crud and alot of featuers")
public class UserController {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;


    @Operation(summary = "Get all users", description = "Retrieve a list of all users in the system will not use it in production")
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @Operation(summary = "Create a new user", description = "Save a new user in the system with no  any validtion")
    @PostMapping
    public User saveeUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @Operation(summary = "Get user by email", description = "Retrieve a user by their email will use it when we want to change the password ")
    @GetMapping("/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email);
    }


    @Autowired
    private UserRepository userRepository;


    @Operation(summary = "Sign in f1 ", description = "Sign in with email and password ")
    @PostMapping("/signin/email")
    public ResponseEntity<Map<String, String>> signInWithEmail(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        User user = userRepository.findByEmail(email);
        System.out.println("sssssssssssssss" + user);


        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        String accessToken = tokenService.createAccessToken(user.getUsername());
        String refreshToken = tokenService.createRefreshToken(user.getUsername());

        Map<String, String> responseBody = Map.of(
                "message", "Sign-in successful with email!",
                "accessToken", accessToken,
                "refreshToken", refreshToken
        );

        return ResponseEntity.ok(responseBody);
    }



    @Operation(summary = "Sign in f2 ", description = "Sign in with username and password ")
    @PostMapping("/signin/username")
    public ResponseEntity<Map<String, String>> signInWithUsername(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        User user = userRepository.findByUsername(username);

        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid username or password"));
        }


        String accessToken = tokenService.createAccessToken(username);
        String refreshToken = tokenService.createRefreshToken(username);


        Map<String, String> responseBody = Map.of(
                "message", "Sign-in successful with username!",
                "accessToken", accessToken,
                "refreshToken", refreshToken
        );

        return ResponseEntity.ok(responseBody);
    }


    @Operation(summary = "Sign up ", description = "Sign up and create user with validation")
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody @Valid UserRegisterationDTO userRegisterationDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        try {
            User createdUser = userService.createUser(userRegisterationDTO);

            String accessToken = tokenService.createAccessToken(createdUser.getUsername());
            String refreshToken = tokenService.createRefreshToken(createdUser.getUsername());

            // Prepare response body with user and tokens
            Map<String, Object> responseBody = Map.of(
                    "message", "Sign-up successful!",
                    "user", createdUser,
                    "accessToken", accessToken,
                    "refreshToken", refreshToken
            );

            // Return response
            return ResponseEntity.status(HttpStatus.CREATED).body(responseBody);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    @Operation(summary = "Update user", description = "Update user profile by ID. Requires valid JWT.")
    @PutMapping("/{id}")
        public ResponseEntity<?> updateUser(
                @PathVariable Long id,
                @RequestBody User userDetails,
                @RequestHeader("accessToken") String token) {


        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        String username = tokenService.extractUsernameFromToken(token);
        Long tokenUserId = userService.getUserIdByUsername(username);

        if (!tokenUserId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: You can only update your own profile.");
        }

        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(updatedUser);
    }


    @Operation(summary = "Update password", description = "Change password by ID. Requires valid JWT.")
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(
            @PathVariable Long id,
            @RequestBody @Valid PasswordUpdateRequest request,
            @RequestHeader("accessToken") String token) {


        System.out.println("old passwordddddddddddd" + request.getOldPassword());

        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }
        System.out.println("enterreddddddddddddddddd");
        String username = tokenService.extractUsernameFromToken(token);
        System.out.println("usernameeeeeeee" + username);
        Long tokenUserId = userService.getUserIdByUsername(username);
        System.out.println("idddddddddddddddddd" + tokenUserId);


        if (!tokenUserId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: You can only update your own password.");
        }
        try {
            userService.updatePassword(id, request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (RuntimeException e) {
            System.out.println("catchhhhhhh"+e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
