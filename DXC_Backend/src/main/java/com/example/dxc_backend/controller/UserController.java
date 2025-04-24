package com.example.dxc_backend.controller;

import com.example.dxc_backend.model.Token;
import com.example.dxc_backend.model.User;
import com.example.dxc_backend.repository.TokenRepository;
import com.example.dxc_backend.repository.UserRepository;
import com.example.dxc_backend.dto.PasswordUpdateRequest;
import com.example.dxc_backend.service.UserService;
import com.example.dxc_backend.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<String> signInWithEmail(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        User user = userRepository.findByEmail(email);

        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        return ResponseEntity.ok("Sign-in successful with email!");
    }


    @Operation(summary = "Sign in f2 ", description = "Sign in with username and password ")
    @PostMapping("/signin/username")
    public ResponseEntity<String> signInWithUsername(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        User user = userRepository.findByUsername(username);

        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }


        String accessToken = jwtUtil.generateAccessToken(user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());


        Token tokenEntity = new Token();
        tokenEntity.setUserId(user.getId());
        tokenEntity.setToken(refreshToken);
        tokenRepository.save(tokenEntity);

        Map<String, String> responseBody = Map.of(
                "message", "Sign-in successful with username!",
                "accessToken", accessToken,
                "refreshToken", refreshToken
        );

        return ResponseEntity.ok(responseBody);
    }


    @Operation(summary = "Sign up ", description = "Sign up and create user with validation  ")
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @Operation(summary = "Update up ", description = "Updates using the id and options not all to enter  ")
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(updatedUser);

    }

    @Operation(summary = "Update the password  ", description = "Updates using the id and options not all to enter and check the old new password ")
    @PutMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(@PathVariable Long id, @RequestBody PasswordUpdateRequest request) {
        userService.updatePassword(id, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password updated successfully");
    }





}
