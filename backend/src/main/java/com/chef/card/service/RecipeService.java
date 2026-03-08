package com.chef.card.service;

import com.chef.card.entity.Recipe;
import com.chef.card.exception.RecipeNotFoundException;
import com.chef.card.repository.RecipeRepository;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;

    @Transactional
    public Recipe saveRecipe(Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    @Transactional(readOnly = true)
    public List<Recipe> searchRecipes(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        return recipeRepository.searchByKeyword(query.trim());
    }

    @Transactional(readOnly = true)
    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    @Transactional
    public Recipe updateRecipe(Long id, Recipe recipe) {
        Recipe existing = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found with id: " + id));
        existing.setTitle(recipe.getTitle());
        existing.setDescription(recipe.getDescription());
        existing.setImageUrl(recipe.getImageUrl());
        existing.setPreparationTime(recipe.getPreparationTime());
        return recipeRepository.save(existing);
    }

    @Transactional
    public void deleteRecipe(Long id) {
        if (!recipeRepository.existsById(id)) {
            throw new RecipeNotFoundException("Recipe not found with id: " + id);
        }
        recipeRepository.deleteById(id);
    }
}
