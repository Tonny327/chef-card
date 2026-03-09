package com.chef.card.controller;

import com.chef.card.dto.RecipeResponse;
import com.chef.card.entity.Recipe;
import com.chef.card.service.RecipeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<RecipeResponse>> getAllRecipes() {
        List<Recipe> recipes = recipeService.getAllRecipes();
        List<RecipeResponse> response = recipes.stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<RecipeResponse>> searchRecipes(@RequestParam("query") String query) {
        List<Recipe> recipes = recipeService.searchRecipes(query);
        List<RecipeResponse> response = recipes.stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    private RecipeResponse toResponse(Recipe recipe) {
        return RecipeResponse.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .imageUrl(recipe.getImageUrl())
                .preparationTime(recipe.getPreparationTime())
                .createdAt(recipe.getCreatedAt())
                .build();
    }
}
