package com.PI.II.backend.dto;

public record SetorCreateDTO(
    Long id,
    String nome,
    String localizacao,
    String observacao,
    Long id_empresa // O frontend envia apenas o ID
) {}