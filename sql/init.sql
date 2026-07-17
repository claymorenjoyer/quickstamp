CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE shops (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    slug             VARCHAR(100) UNIQUE NOT NULL,
    address          TEXT NOT NULL DEFAULT '',
    phone            VARCHAR(30) NOT NULL DEFAULT '',
    points_to_redeem INTEGER NOT NULL DEFAULT 9,
    status           VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rejected')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name          VARCHAR(255) NOT NULL,
    role                VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'staff', 'admin')),
    shop_id             INTEGER REFERENCES shops(id) ON DELETE SET NULL,
    recovery_question   VARCHAR(255) NOT NULL DEFAULT '',
    recovery_answer_hash VARCHAR(255) NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE qr_codes (
    id                  SERIAL PRIMARY KEY,
    shop_id             INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    staff_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token               VARCHAR(64) UNIQUE NOT NULL,
    points              INTEGER NOT NULL DEFAULT 1 CHECK (points > 0),
    used                BOOLEAN NOT NULL DEFAULT false,
    used_by_customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE points (
    id          SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id     INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    amount      INTEGER NOT NULL CHECK (amount > 0),
    source      VARCHAR(20) NOT NULL CHECK (source IN ('earn', 'redeem')),
    qr_code_id  INTEGER REFERENCES qr_codes(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rewards (
    id                    SERIAL PRIMARY KEY,
    customer_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id               INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    status                VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'redeemed')),
    redemption_token      VARCHAR(64) UNIQUE NOT NULL,
    redeemed_by_staff_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    redeemed_at           TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_shop_id ON users(shop_id);
CREATE INDEX idx_qr_codes_token ON qr_codes(token);
CREATE INDEX idx_qr_codes_shop_id ON qr_codes(shop_id);
CREATE INDEX idx_points_customer_shop ON points(customer_id, shop_id);
CREATE INDEX idx_rewards_customer_shop ON rewards(customer_id, shop_id);
CREATE INDEX idx_rewards_token ON rewards(redemption_token);

-- Default admin account (email: admin@quickstamp.local, password: admin123)
-- CHANGE THIS PASSWORD after first login!
INSERT INTO users (email, password_hash, name, role) VALUES (
  'admin@quickstamp.local',
  '$2b$12$LdPfrxRyd13XVSeRSyfmm.svNOdZQyENznO7rheCQvIJtwJEdXpSm',
  'Admin',
  'admin'
) ON CONFLICT (email) DO NOTHING;
