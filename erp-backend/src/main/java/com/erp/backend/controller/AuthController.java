package com.erp.backend.controller;

import com.erp.backend.model.Role;
import com.erp.backend.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        try {

            String message = authService.register(
                    request.username(),
                    request.password(),
                    request.role()
            );

            return ResponseEntity.ok(
                    new AuthResponse(message)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new AuthResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        try {

            AuthService.LoginResult result =
                    authService.login(
                            request.username(),
                            request.password()
                    );

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(401)
                    .body(
                            new AuthResponse(
                                    "Invalid username or password"
                            )
                    );
        }
    }

    public record RegisterRequest(
            String username,
            String password,
            Role role
    ) {
    }

    public record LoginRequest(
            String username,
            String password
    ) {
    }

    public record AuthResponse(
            String message
    ) {
    }
}