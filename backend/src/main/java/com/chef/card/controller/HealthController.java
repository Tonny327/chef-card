package com.chef.card.controller;

import com.chef.card.repository.RecipeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final RecipeRepository recipeRepository;

    // Внедрение репозитория через конструктор
    public HealthController(RecipeRepository recipeRepository) {
        this.recipeRepository = recipeRepository;
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        // Выполняем запрос к БД (SELECT COUNT(*) FROM recipe)
        long count = recipeRepository.count();
        // Возвращаем OK и количество записей для наглядности
        return ResponseEntity.ok("OK, recipes count: " + count);
    }
}

