package com.chef.card.controller;

import com.chef.card.config.SecurityConfig;
import com.chef.card.entity.Recipe;
import com.chef.card.service.RecipeService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RecipeController.class)
@Import(SecurityConfig.class)
class RecipeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RecipeService recipeService;

    @Test
    @WithAnonymousUser
    void searchRecipes_shouldReturnRecipesWithoutAuth() throws Exception {
        List<Recipe> recipes = List.of(
                Recipe.builder()
                        .id(1L)
                        .title("Pasta")
                        .description("Italian pasta")
                        .preparationTime(30)
                        .build()
        );
        when(recipeService.searchRecipes("pasta")).thenReturn(recipes);

        mockMvc.perform(get("/api/recipes/search")
                        .param("query", "pasta"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Pasta"))
                .andExpect(jsonPath("$[0].description").value("Italian pasta"))
                .andExpect(jsonPath("$[0].preparationTime").value(30));
    }

    @Test
    void searchRecipes_shouldBeAccessibleWithoutAuthentication() throws Exception {
        when(recipeService.searchRecipes(anyString())).thenReturn(List.of());

        mockMvc.perform(get("/api/recipes/search").param("query", "test"))
                .andExpect(status().isOk());
    }
}
