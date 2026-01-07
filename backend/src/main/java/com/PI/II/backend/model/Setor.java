package com.PI.II.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "SETOR")
public class Setor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(length = 150)
    private String localizacao;

    @Column(columnDefinition = "TEXT")
    private String observasao;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    // getters e setters

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getLocalizacao() {
        return localizacao;
    }

    public String getObservasao() {
        return observasao;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setLocalizacao(String localizacao) {
        this.localizacao = localizacao;
    }

    public void setObservasao(String observasao) {
        this.observasao = observasao;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

}