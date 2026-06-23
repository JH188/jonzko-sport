package com.jonzko.backend.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.jonzko.backend.entity.User;
import com.jonzko.backend.repository.UserRepository;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Dejar pasar OPTIONS para CORS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtService.isTokenValid(token)) {
                rejectInvalidAdminSession(request, response, filterChain);
                return;
            }

            Claims claims = jwtService.extractClaims(token);

            String email = claims.getSubject();
            String role = claims.get("role", String.class);
            Integer tokenAdminSessionVersion = claims.get("adminSessionVersion", Integer.class);

            if (email == null || email.isBlank()) {
                rejectInvalidAdminSession(request, response, filterChain);
                return;
            }

            if (role == null || role.isBlank()) {
                role = "USER";
            }

            role = role.trim().toUpperCase();

            if (role.startsWith("ROLE_")) {
                role = role.replace("ROLE_", "");
            }

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null || Boolean.FALSE.equals(user.getActive())) {
                rejectInvalidAdminSession(request, response, filterChain);
                return;
            }

            // ==========================
            // INVALIDAR TOKENS ADMIN VIEJOS
            // ==========================
            if ("ADMIN".equalsIgnoreCase(role)) {
                Integer currentVersion = user.getAdminSessionVersion();

                if (currentVersion == null) {
                    currentVersion = 1;
                }

                if (tokenAdminSessionVersion == null || !tokenAdminSessionVersion.equals(currentVersion)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write(
                            "{\"message\":\"Tu sesión venció. Ingresa con la contraseña actualizada.\"}"
                    );
                    return;
                }
            }

            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority(role));          // ADMIN
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role)); // ROLE_ADMIN

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            authorities
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private void rejectInvalidAdminSession(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws IOException, ServletException {

        String path = request.getRequestURI();

        if (path != null && path.startsWith("/api/admin")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                    "{\"message\":\"Tu sesión venció. Ingresa nuevamente.\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }
}