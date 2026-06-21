CREATE TABLE roles (
    role_id INT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role_id INT NOT NULL,
--     provider VARCHAR(50) NOT NULL,
--     enabled BOOLEAN DEFAULT TRUE,
    blocked BOOLEAN DEFAULT FALSE,
--     expired BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

INSERT INTO Roles (role_id, role_name) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_USER');

INSERT INTO users (user_id, username, email,
                   password, role_id, blocked,
                   is_email_verified, created_at, updated_at)
VALUES (1, 'admin', 'admin@gmail.com',
        '$2a$12$P2vwH.C/yCDHPKNXccaUuOjItg3qCpfnMuBjLO56JrvlMUdACJsem',
        1, false, true,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)