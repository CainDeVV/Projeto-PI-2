package com.PI.II.backend.repository;

import com.PI.II.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // O Spring cria o SQL disso aqui sozinho, só pelo nome do método!
    Optional<Usuario> findByCpf(String cpf);
    
    // Caso você use email no futuro:
    // Optional<Usuario> findByEmail(String email);
}