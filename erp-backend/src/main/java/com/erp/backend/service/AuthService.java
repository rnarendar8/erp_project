package com.erp.backend.service;

import com.erp.backend.model.Role;
import com.erp.backend.model.User;
import com.erp.backend.repository.UserRepository;
import com.erp.backend.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public String register(
            String username,
            String password,
            Role role) {

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException(
                    "Username already exists"
            );
        }

        User user = new User();

        user.setUsername(username);
        user.setPassword(
                passwordEncoder.encode(password)
        );
        user.setRole(role);
        user.setEnabled(true);

        userRepository.save(user);

        return "User registered successfully";
    }

    public LoginResult login(
            String username,
            String password) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        username,
                        password
                )
        );

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        UserDetails userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        user.getPassword(),
                        user.isEnabled(),
                        true,
                        true,
                        true,
                        java.util.List.of(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                        "ROLE_" +
                                                user.getRole().name()
                                )
                        )
                );

        String token =
                jwtService.generateToken(userDetails);

        return new LoginResult(
                token,
                user.getUsername(),
                user.getRole().name()
        );
    }

    public record LoginResult(
            String token,
            String username,
            String role
    ) {
    }
}