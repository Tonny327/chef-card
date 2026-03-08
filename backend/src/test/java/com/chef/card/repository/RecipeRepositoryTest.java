package com.chef.card.repository;

import com.chef.card.entity.Recipe;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class RecipeRepositoryTest {

    @Autowired
    private RecipeRepository recipeRepository;

    @Test
    void searchByKeyword_shouldFindRecipesByTitle() {
        Recipe recipe = Recipe.builder()
                .title("Pasta Carbonara")
                .description("Classic Italian dish")
                .preparationTime(30)
                .build();
        recipeRepository.save(recipe);

        List<Recipe> result = recipeRepository.searchByKeyword("pasta");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Pasta Carbonara");
    }

    @Test
    void searchByKeyword_shouldFindRecipesByDescription() {
        Recipe recipe = Recipe.builder()
                .title("Simple Salad")
                .description("Fresh vegetables with olive oil")
                .preparationTime(15)
                .build();
        recipeRepository.save(recipe);

        List<Recipe> result = recipeRepository.searchByKeyword("vegetables");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Simple Salad");
    }

    @Test
    void searchByKeyword_shouldReturnEmptyWhenNoMatch() {
        Recipe recipe = Recipe.builder()
                .title("Pasta")
                .description("Italian")
                .preparationTime(20)
                .build();
        recipeRepository.save(recipe);

        List<Recipe> result = recipeRepository.searchByKeyword("sushi");

        assertThat(result).isEmpty();
    }

    @Test
    void searchByKeyword_shouldBeCaseInsensitive() {
        Recipe recipe = Recipe.builder()
                .title("PASTA")
                .description("UPPERCASE")
                .preparationTime(10)
                .build();
        recipeRepository.save(recipe);

        List<Recipe> result = recipeRepository.searchByKeyword("pasta");

        assertThat(result).hasSize(1);
    }
}
