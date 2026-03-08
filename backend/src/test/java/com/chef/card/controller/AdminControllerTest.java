package com.chef.card.controller;

import com.chef.card.config.SecurityConfig;
import com.chef.card.dto.RecipeRequest;
import com.chef.card.entity.Recipe;
import com.chef.card.service.RecipeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private RecipeService recipeService;

    private RecipeRequest createValidRequest() {
        return RecipeRequest.builder()
                .title("Test Recipe")
                .description("Test description")
                .imageUrl("http://example.com/image.jpg")
                .preparationTime(30)
                .build();
    }

    @Test
    void createRecipe_shouldReturn401WithoutAuth() throws Exception {
        RecipeRequest request = createValidRequest();

        mockMvc.perform(post("/admin/recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createRecipe_shouldCreateWithAdminRole() throws Exception {
        RecipeRequest request = createValidRequest();
        Recipe savedRecipe = Recipe.builder()
                .id(1L)
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .preparationTime(request.getPreparationTime())
                .build();

        when(recipeService.saveRecipe(any(Recipe.class))).thenReturn(savedRecipe);

        mockMvc.perform(post("/admin/recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Recipe"))
                .andExpect(jsonPath("$.preparationTime").value(30));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateRecipe_shouldUpdateWithAdminRole() throws Exception {
        RecipeRequest request = createValidRequest();
        Recipe updatedRecipe = Recipe.builder()
                .id(1L)
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .preparationTime(request.getPreparationTime())
                .build();

        when(recipeService.updateRecipe(eq(1L), any(Recipe.class))).thenReturn(updatedRecipe);

        mockMvc.perform(put("/admin/recipes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Recipe"));
    }

    @Test
    void updateRecipe_shouldReturn401WithoutAuth() throws Exception {
        RecipeRequest request = createValidRequest();

        mockMvc.perform(put("/admin/recipes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteRecipe_shouldDeleteWithAdminRole() throws Exception {
        doNothing().when(recipeService).deleteRecipe(1L);

        mockMvc.perform(delete("/admin/recipes/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteRecipe_shouldReturn401WithoutAuth() throws Exception {
        mockMvc.perform(delete("/admin/recipes/1"))
                .andExpect(status().isUnauthorized());
    }
}
