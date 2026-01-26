package com.PI.II.backend.controller;

import com.PI.II.backend.model.Setor;
import com.PI.II.backend.repository.SetorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/setores")
public class SetorController {

    @Autowired
    private SetorRepository setorRepo;

    @GetMapping
    public List<Setor> listarTodos() {
        return setorRepo.findAll();
    }
}