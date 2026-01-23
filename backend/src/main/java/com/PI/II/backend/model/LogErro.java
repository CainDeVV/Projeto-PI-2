package com.PI.II.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LOG_ERRO")
public class LogErro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "codigo_erro", length = 50)
    private String codigoErro;

    @Column(length = 20)
    private String severidade = "Alerta"; 

    @Column(name = "data_hora")
    private LocalDateTime dataHora = LocalDateTime.now();

    private Boolean resolvido = false;

    // Relacionamentos
    @ManyToOne
    @JoinColumn(name = "id_computador")
    private Computador computador;

    @ManyToOne
    @JoinColumn(name = "id_impressora")
    private Impressora impressora;

    @ManyToOne
    @JoinColumn(name = "id_os_gerada")
    private OrdemServico ordemServico;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getCodigoErro() { return codigoErro; }
    public void setCodigoErro(String codigoErro) { this.codigoErro = codigoErro; }
    public String getSeveridade() { return severidade; }
    public void setSeveridade(String severidade) { this.severidade = severidade; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    public Boolean getResolvido() { return resolvido; }
    public void setResolvido(Boolean resolvido) { this.resolvido = resolvido; }
    public Computador getComputador() { return computador; }
    public void setComputador(Computador computador) { this.computador = computador; }
    public Impressora getImpressora() { return impressora; }
    public void setImpressora(Impressora impressora) { this.impressora = impressora; }
    public OrdemServico getOrdemServico() { return ordemServico; }
    public void setOrdemServico(OrdemServico ordemServico) { this.ordemServico = ordemServico; }
}