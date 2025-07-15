-- Estrutura inicial do banco de dados:
DROP TABLE IF EXISTS comments, comments_sanitize, profiles;
CREATE TABLE comments (
	text VARCHAR
);

CREATE TABLE comments_sanitize (
	text VARCHAR
);

CREATE TABLE profiles (
	name VARCHAR,
	description VARCHAR
);