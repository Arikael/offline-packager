CREATE TABLE IF NOT EXISTS Dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version TEXT GENERATED ALWAYS AS (major || '.' || minor || '.' || patch || (CASE WHEN preRelease IS NULL OR preRelease = '' THEN '' ELSE '-' || preRelease END) || build),
    rawVersion TEXT NOT NULL,
    major NUMBER NOT NULL,
    minor NUMBER NOT NULL,
    patch NUMBER NOT NULL,
    preRelease TEXT NOT NULL DEFAULT '',
    build TEXT NOT NULL DEFAULT '',
    isLatest BOOLEAN NOT NULL DEFAULT FALSE,
    nameAndVersion TEXT GENERATED ALWAYS AS (name || '@' || version),
    createdAt DATETIME NOT NULL DEFAULT current_timestamp,
    status INTEGER NOT NULL,
    statusDate DATETIME NOT NULL,
    source TEXT NOT NULL,
    runId INTEGER NOT NULL,
    UNIQUE(name, version)
);