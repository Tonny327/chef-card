package com.chef.card.service;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class ImageStorageService {

    @Value("${storage.s3.endpoint}")
    private String endpoint;

    @Value("${storage.s3.bucket}")
    private String bucket;

    @Value("${storage.s3.access-key}")
    private String accessKey;

    @Value("${storage.s3.secret-key}")
    private String secretKey;

    @Value("${storage.public-base-url:}")
    private String publicBaseUrl;

    private S3Client s3Client;

    private S3Client s3() {
        if (s3Client == null) {
            S3Configuration config = S3Configuration.builder()
                    .pathStyleAccessEnabled(true)
                    .build();

            s3Client = S3Client.builder()
                    .endpointOverride(URI.create(endpoint))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKey, secretKey)
                    ))
                    // регион для R2 не важен, но требование SDK
                    .region(Region.EU_CENTRAL_1)
                    .serviceConfiguration(config)
                    .build();
        }
        return s3Client;
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("Empty image file");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String key = UUID.randomUUID() + extension;

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3().putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        if (publicBaseUrl != null && !publicBaseUrl.isBlank()) {
            String base = publicBaseUrl.endsWith("/") ? publicBaseUrl : publicBaseUrl + "/";
            return base + key;
        }
        // fallback: прямой путь через endpoint + bucket
        String normalizedEndpoint = endpoint.endsWith("/") ? endpoint : endpoint + "/";
        return normalizedEndpoint + bucket + "/" + key;
    }

    public void delete(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        try {
            String key = extractKeyFromUrl(imageUrl);
            if (key == null || key.isBlank()) {
                return;
            }
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();
            s3().deleteObject(deleteRequest);
        } catch (Exception ignored) {
            // игнорируем ошибки удаления, чтобы не ломать основной поток
        }
    }

    private String extractKeyFromUrl(String url) {
        if (publicBaseUrl != null && !publicBaseUrl.isBlank() && url.startsWith(publicBaseUrl)) {
            return url.substring(publicBaseUrl.length());
        }
        // fallback: если в БД сохранился полный endpoint/bucket
        String endpointWithBucket = endpoint.endsWith("/") ? endpoint + bucket + "/" : endpoint + "/" + bucket + "/";
        if (url.startsWith(endpointWithBucket)) {
            return url.substring(endpointWithBucket.length());
        }
        return null;
    }
}

