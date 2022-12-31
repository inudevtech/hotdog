CREATE TABLE IF NOT EXISTS `fileData` (id CHAR(32) PRIMARY KEY, dir CHAR(32) NOT NULL, fileName VARCHAR(256) NOT NULL, uid VARCHAR(36), displayName VARCHAR(256), description TEXT(65535), expiration DATETIME, uploadDate DATETIME NOT NULL, icon BOOLEAN NOT NULL, favorite INT UNSIGNED DEFAULT 0, download INT UNSIGNED DEFAULT 0, private BOOLEAN NOT NULL DEFAULT false, password CHAR(60), tmp BOOLEAN NOT NULL DEFAULT false);
CREATE TABLE IF NOT EXISTS `user` (uid VARCHAR(36) PRIMARY KEY, official BOOLEAN NOT NULL DEFAULT false);
CREATE TABLE IF NOT EXISTS `tags` (id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, tag VARCHAR(16) NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS `filetags` (id CHAR(32), tag INT UNSIGNED NOT NULL, PRIMARY KEY (id, tag));