CREATE TABLE Dependencies {
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    nameAndVersion TEXT GENERATED ALWAYS AS (CONCAT(name, '@', version)) VIRTUAL,
    createdAt DATETIME NOT NULL DEFAULT current_timestamp,
    status INTEGER NOT NULL,
    statusDate DATETIME NOT NULL,
    source TEXT NOT NULL,
    UNIQUE(name, version)
}