CREATE TABLE verification_requests
(
    request_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    barcode_input VARCHAR(255),

    status VARCHAR(50) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_verification_requests_user
        FOREIGN KEY (user_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE,

    CONSTRAINT fk_verification_requests_product
        FOREIGN KEY (product_id)
            REFERENCES products(product_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_verification_requests_user_id
    ON verification_requests(user_id);

CREATE INDEX idx_verification_requests_product_id
    ON verification_requests(product_id);

CREATE INDEX idx_verification_requests_status
    ON verification_requests(status);


CREATE TABLE verification_results
(
    result_id BIGSERIAL PRIMARY KEY,

    request_id BIGINT NOT NULL UNIQUE,

    verdict VARCHAR(50) NOT NULL,

    confidence_score DOUBLE PRECISION,

    barcode_match BOOLEAN,

    reason TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    decision_status VARCHAR(50) NOT NULL,

    image_score DOUBLE PRECISION,

    barcode_score DOUBLE PRECISION,

    model_version VARCHAR(255),

    admin_comment TEXT,

    reviewed_at TIMESTAMP,

    selected_angle VARCHAR(255),

    detected_angle VARCHAR(255),

    ai_message TEXT,

    matched_reference_path TEXT,

    angle_mismatch BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_verification_results_request
        FOREIGN KEY (request_id)
            REFERENCES verification_requests(request_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_verification_results_verdict
    ON verification_results(verdict);

CREATE INDEX idx_verification_results_decision_status
    ON verification_results(decision_status);