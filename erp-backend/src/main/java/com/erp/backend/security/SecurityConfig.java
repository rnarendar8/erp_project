package com.erp.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomUserDetailsService userDetailsService) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // AUTHENTICATION
                        // =========================

                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()


                        // =========================
                        // DASHBOARD
                        // =========================

                        .requestMatchers(
                                "/api/dashboard/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "SALES_EXECUTIVE",
                                "PURCHASE_MANAGER",
                                "INVENTORY_MANAGER",
                                "ACCOUNTANT"
                        )


                        // =========================
                        // PRODUCTS
                        // =========================

                        .requestMatchers(
                                "/api/products/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "SALES_EXECUTIVE",
                                "PURCHASE_MANAGER",
                                "INVENTORY_MANAGER",
                                "ACCOUNTANT"
                        )


                        // =========================
                        // CUSTOMERS
                        // =========================

                        .requestMatchers(
                                "/api/customers/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "SALES_EXECUTIVE",
                                "ACCOUNTANT"
                        )


                        // =========================
                        // SUPPLIERS
                        // =========================

                        .requestMatchers(
                                "/api/suppliers/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "PURCHASE_MANAGER",
                                "INVENTORY_MANAGER",
                                "ACCOUNTANT"
                        )


                        // =========================
                        // SALES ORDERS
                        // =========================

                        .requestMatchers(
                                "/api/sales-orders/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "SALES_EXECUTIVE",
                                "ACCOUNTANT"
                        )


                        // =========================
                        // PURCHASE ORDERS
                        // =========================

                        .requestMatchers(
                                "/api/purchase-orders/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "PURCHASE_MANAGER",
                                "INVENTORY_MANAGER",
                                "ACCOUNTANT"
                        )


                        // =========================
                        // GRN
                        // =========================

                        .requestMatchers(
                                "/api/grn/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "PURCHASE_MANAGER",
                                "INVENTORY_MANAGER",
                                "ACCOUNTANT"
                        )


                        // =========================
                        // INVOICES
                        // =========================

                        .requestMatchers(
                                "/api/invoices/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "SALES_EXECUTIVE",
                                "ACCOUNTANT"
                        )


                        // =========================
                        // REPORTS
                        // =========================

                        .requestMatchers(
                                "/api/reports/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "SALES_EXECUTIVE",
                                "PURCHASE_MANAGER",
                                "INVENTORY_MANAGER",
                                "ACCOUNTANT"
                        )


                        // =========================
                        // SWAGGER
                        // =========================

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()


                        // =========================
                        // EVERYTHING ELSE
                        // =========================

                        .anyRequest().authenticated()
                )

                .authenticationProvider(
                        authenticationProvider()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );

        provider.setPasswordEncoder(
                passwordEncoder()
        );

        return provider;
    }


    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        frontendUrl,
                        "http://localhost:3000"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}