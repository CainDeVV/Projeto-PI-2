package com.PI.II.backend.dto;

public record UsuarioCreateDTO(
    Long id,
    String nome,
    String cpf,
    String senha,
    String tipo,
    Long id_setor // O front manda isso
) {}