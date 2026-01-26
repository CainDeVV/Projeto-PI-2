package com.PI.II.backend.dto;

// Esse é o formato do JSON que o simulador vai mandar
public record DriverStatusRequest(
    String serial,      // Para identificar qual impressora é
    int nivelTinta,     // Ex: 80 (vem sem o %)
    int contador,       // Ex: 500 (vem sem o "pgs")
    String status       // "Online", "Offline", "Erro"
) {}