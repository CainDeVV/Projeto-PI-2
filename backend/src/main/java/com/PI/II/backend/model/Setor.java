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
    private String observacao; 

    @ManyToOne
    @JoinColumn(name = "id_empresa", nullable = false)
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

    public String getObservacao() {
        return observacao;
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

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }
}