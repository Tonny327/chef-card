package com.chef.card.repository;

import com.chef.card.entity.Recipe;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @Query("SELECT r FROM Recipe r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(COALESCE(r.description, '')) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Recipe> searchByKeyword(@Param("query") String query);
}
