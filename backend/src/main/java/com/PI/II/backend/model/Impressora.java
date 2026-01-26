package com.PI.II.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "IMPRESSORA")
public class Impressora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String modelo;

    @Column(name = "numero_serie", unique = true, length = 100)
    private String numeroSerie;

    @Column(length = 50)
    private String sala;

    @Column(length = 20)
    private String tonel; 

    @Column(length = 50)
    private String contador;

    @Column(length = 20)
    private String status = "Online"; 

    // --- RELACIONAMENTOS ---

    @ManyToOne
    @JoinColumn(name = "id_setor", nullable = false)
    private Setor setor;

    @ManyToOne
    @JoinColumn(name = "id_usuario") 
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_computador_pai") 
    private Computador computador; 

    // --- GETTERS E SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getNumeroSerie() { return numeroSerie; }
    public void setNumeroSerie(String numeroSerie) { this.numeroSerie = numeroSerie; }

    public String getSala() { return sala; }
    public void setSala(String sala) { this.sala = sala; }

    public String getTonel() { return tonel; }
    public void setTonel(String tonel) { this.tonel = tonel; }

    public String getContador() { return contador; }
    public void setContador(String contador) { this.contador = contador; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Setor getSetor() { return setor; }
    public void setSetor(Setor setor) { this.setor = setor; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Computador getComputador() { return computador; }
    public void setComputador(Computador computador) { this.computador = computador; }
}