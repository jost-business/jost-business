-- Accounts and server-side sessions for the login.
--
-- There is no sign-up: accounts are created with the create-user script.

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Stored lower-cased by the API, so the unique constraint is case-insensitive
  email         TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  -- Argon2id in PHC string format: $argon2id$v=19$m=...,t=...,p=...$salt$hash
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The browser holds a random token in an httpOnly cookie; only its SHA-256
-- hash is stored, so a leaked database cannot be used to log in.
CREATE TABLE sessions (
  id         TEXT        PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);
