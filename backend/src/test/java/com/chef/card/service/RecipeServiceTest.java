package com.chef.card.service;

import com.chef.card.entity.Recipe;
import com.chef.card.exception.RecipeNotFoundException;
import com.chef.card.repository.RecipeRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @InjectMocks
    private RecipeService recipeService;

    @Test
    void saveRecipe_shouldSaveAndReturnRecipe() {
        Recipe recipe = Recipe.builder()
                .title("Test Recipe")
                .description("Test description")
                .preparationTime(30)
                .build();
        Recipe savedRecipe = Recipe.builder()
                .id(1L)
                .title("Test Recipe")
                .description("Test description")
                .preparationTime(30)
                .build();

        when(recipeRepository.save(recipe)).thenReturn(savedRecipe);

        Recipe result = recipeService.saveRecipe(recipe);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Test Recipe");
        verify(recipeRepository).save(recipe);
    }

    @Test
    void searchRecipes_shouldReturnRecipesWhenQueryMatches() {
        String query = "pasta";
        List<Recipe> recipes = List.of(
                Recipe.builder().id(1L).title("Pasta Carbonara").build()
        );

        when(recipeRepository.searchByKeyword(query)).thenReturn(recipes);

        List<Recipe> result = recipeService.searchRecipes(query);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Pasta Carbonara");
        verify(recipeRepository).searchByKeyword(query);
    }

    @Test
    void searchRecipes_shouldReturnEmptyListWhenQueryIsNull() {
        List<Recipe> result = recipeService.searchRecipes(null);

        assertThat(result).isEmpty();
        verify(recipeRepository, never()).searchByKeyword(any());
    }

    @Test
    void searchRecipes_shouldReturnEmptyListWhenQueryIsBlank() {
        List<Recipe> result = recipeService.searchRecipes("   ");

        assertThat(result).isEmpty();
        verify(recipeRepository, never()).searchByKeyword(any());
    }

    @Test
    void updateRecipe_shouldUpdateExistingRecipe() {
        Long id = 1L;
        Recipe existingRecipe = Recipe.builder()
                .id(id)
                .title("Old Title")
                .description("Old description")
                .preparationTime(20)
                .build();
        Recipe updateData = Recipe.builder()
                .title("New Title")
                .description("New description")
                .preparationTime(45)
                .build();

        when(recipeRepository.findById(id)).thenReturn(Optional.of(existingRecipe));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(inv -> inv.getArgument(0));

        Recipe result = recipeService.updateRecipe(id, updateData);

        assertThat(result.getTitle()).isEqualTo("New Title");
        assertThat(result.getDescription()).isEqualTo("New description");
        assertThat(result.getPreparationTime()).isEqualTo(45);
        verify(recipeRepository).findById(id);
        verify(recipeRepository).save(existingRecipe);
    }

    @Test
    void updateRecipe_shouldThrowWhenRecipeNotFound() {
        Long id = 999L;
        Recipe updateData = Recipe.builder()
                .title("Title")
                .preparationTime(30)
                .build();

        when(recipeRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recipeService.updateRecipe(id, updateData))
                .isInstanceOf(RecipeNotFoundException.class)
                .hasMessageContaining("999");

        verify(recipeRepository).findById(id);
        verify(recipeRepository, never()).save(any());
    }

    @Test
    void deleteRecipe_shouldDeleteRecipe() {
        Long id = 1L;
        when(recipeRepository.existsById(id)).thenReturn(true);

        recipeService.deleteRecipe(id);

        verify(recipeRepository).existsById(id);
        verify(recipeRepository).deleteById(id);
    }

    @Test
    void deleteRecipe_shouldThrowWhenRecipeNotFound() {
        Long id = 999L;
        when(recipeRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> recipeService.deleteRecipe(id))
                .isInstanceOf(RecipeNotFoundException.class)
                .hasMessageContaining("999");

        verify(recipeRepository).existsById(id);
        verify(recipeRepository, never()).deleteById(any());
    }
}
