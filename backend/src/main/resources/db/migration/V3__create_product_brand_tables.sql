CREATE TABLE brands (
    brand_id BIGSERIAL PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    country_id BIGINT NOT NULL,
    official_website VARCHAR(500),
    logo_url TEXT,
    description TEXT,
    is_high_risk BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(country_id)
);

CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(255) NOT NULL UNIQUE,
    main_image_url TEXT,
    main_image_public_id VARCHAR(500),
    description TEXT,
    volume VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    brand_id BIGINT NOT NULL,
    country_id BIGINT NOT NULL,
    FOREIGN KEY (country_id) REFERENCES countries(country_id),
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id)


);