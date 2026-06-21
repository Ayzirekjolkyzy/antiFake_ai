CREATE TABLE images
(
    image_id BIGSERIAL PRIMARY KEY,

    product_id BIGINT NOT NULL,

    verification_request_id BIGINT,

    image_url TEXT NOT NULL,

    public_id VARCHAR(500) NOT NULL,

    image_type VARCHAR(50) NOT NULL,

    image_angle VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP,

    CONSTRAINT fk_images_product
        FOREIGN KEY (product_id)
            REFERENCES products(product_id)
            ON DELETE CASCADE,

    CONSTRAINT fk_images_verification_request
        FOREIGN KEY (verification_request_id)
            REFERENCES verification_requests(request_id)
            ON DELETE CASCADE
);