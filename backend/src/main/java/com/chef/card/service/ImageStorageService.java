package com.chef.card.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageStorageService {

    private static final String UPLOAD_DIR = "uploads";

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("Empty image file");
        }

        Path uploadPath = Paths.get(System.getProperty("user.dir"), UPLOAD_DIR)
                .toAbsolutePath()
                .normalize();
        Files.createDirectories(uploadPath);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String filename = UUID.randomUUID() + extension;
        Path destination = uploadPath.resolve(filename);
        file.transferTo(destination.toFile());

        return "/uploads/" + filename;
    }

    public void delete(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        try {
            String filename = imageUrl.replaceFirst("^/uploads/", "");
            if (filename.isBlank()) {
                return;
            }
            Path uploadPath = Paths.get(System.getProperty("user.dir"), UPLOAD_DIR)
                    .toAbsolutePath()
                    .normalize();
            Path target = uploadPath.resolve(filename);
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // игнорируем ошибки удаления, чтобы не ломать основной поток
        }
    }
}

