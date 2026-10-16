-- Checkout without sign-in creates a credential-less guest account owned by the
-- browser session. Signing up upgrades it in place; signing in to an existing
-- account moves its balance there and records the target in merged_into.
ALTER TABLE users ADD COLUMN guest INTEGER NOT NULL DEFAULT 0 CHECK(guest IN (0,1));
ALTER TABLE users ADD COLUMN merged_into TEXT REFERENCES users(id);
CREATE INDEX users_merged_into ON users(merged_into);
