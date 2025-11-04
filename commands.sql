-- it create a table
create table blogs(
    id SERIAL PRIMARY KEY,
    author VARCHAR(50),
    url VARCHAR(100) NOT NULL,
    title VARCHAR(50) NOT NULL,
    likes INTEGER DEFAULT 0
);

INSERT INTO blogs(author, url, title, likes)
VALUES ('Laxmi Prasad Devkota', 'https://laxmi.prasad.devkota:3000/', 'Muna Madhan', 200);

INSERT INTO blogs(author, url, title, likes)
VALUES ('Bhanu Bhakta Acharya', 'https://bhanu.bhankta.acharya:3012/', 'Bhanubhaktako Ramayan', 300);

SELECT * FROM blogs;

drop table blogs;