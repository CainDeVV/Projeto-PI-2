package com.PI.II.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "COMPUTADOR")
public class Computador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String modelo;

    @Column(name = "numero_serie", unique = true, length = 100)
    private String numeroSerie;

    @Column(length = 100)
    private String nome;

    @Column(length = 50)
    private String sala;

    @Column(length = 20)
    private String status = "Online";

    // Relacionamentos

    @ManyToOne
    @JoinColumn(name = "id_setor", nullable = false)
    private Setor setor;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToMany
    @JoinTable(
        name = "COMPUTADOR_IMPRESSORA",
        joinColumns = @JoinColumn(name = "id_computador"),
        inverseJoinColumns = @JoinColumn(name = "id_impressora")
    )
    private List<Impressora> impressorasConectadas;

    // getters e setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getNumeroSerie() {
        return numeroSerie;
    }

    public void setNumeroSerie(String numeroSerie) {
        this.numeroSerie = numeroSerie;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getSala() {
        return sala;
    }

    public void setSala(String sala) {
        this.sala = sala;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Setor getSetor() {
        return setor;
    }

    public void setSetor(Setor setor) {
        this.setor = setor;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public List<Impressora> getImpressorasConectadas() {
        return impressorasConectadas;
    }

    public void setImpressorasConectadas(List<Impressora> impressorasConectadas) {
        this.impressorasConectadas = impressorasConectadas;
    }
}
