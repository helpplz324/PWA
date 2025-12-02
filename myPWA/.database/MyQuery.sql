
CREATE TABLE universe (
universe_id INT PRIMARY KEY NOT NULL,
universe_name VARCHAR(255) NOT NULL,
universe_bio VARCHAR(50)
);

CREATE TABLE character(
character_id INT PRIMARY KEY NOT NULL,
character_universe_id INT NOT NULL,
character_name VARCHAR(255) NOT NULL,
character_bio VARCHAR(255) NOT NULL,
FOREIGN KEY (character_universe_id) REFERENCES universe(universe_id)
);

INSERT INTO universe(universe_id, universe_name, universe_bio) VALUES
(1, 'Pseudoregalia', 'A game universe set in a dream world where players are tasked to save someone from said dream');

INSERT INTO character(character_id, character_universe_id, character_name, character_bio) VALUES
(
/*
DROP TABLE character;
*/