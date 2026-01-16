package com.PI.II.backend.repository;

import com.PI.II.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByCpf(String cpf);

    // Optional<Usuario> findByEmail(String email);
}