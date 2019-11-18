const {
    Pool
} = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
    connectionString: process.env.dbPrivatekey
});

pool.on("connect", () => {
    console.log("connected to the db");
});

export function employeeTable() {
    const employeeTable = `CREATE TABLE IF NOT EXISTS
    employee(
        id SERIAL PRIMARY KEY,
        "firstName" text,
        "lastName" text,
        email text UNIQUE NOT NULL,
        password text,
        gender text,
        "jobRole" text,
        department text,
        address text,
        "createdOn" TIMESTAMP NOT NULL,
        "isAdmin" BOOLEAN DEFAULT false
        
    )`;
    pool
        .query(employeeTable)
        .then(() => {
            console.log("Created employee table");
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}

export function gifTable() {
    const gifTable = `CREATE TABLE IF NOT EXISTS
    gif(
        id SERIAL PRIMARY KEY,
        title text NOT NULL,
        image text NOT NULL,
        url text NOT NULL,
        "authorId" int NOT NULL,
        "createdOn" TIMESTAMP NOT NULL,
        spam INT DEFAULT 0

    )`;
    pool
        .query(gifTable)
        .then(() => {
            console.log("created gif table");
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}

export function categoryTable() {
    const articleTable = `CREATE TABLE IF NOT EXISTS
    category(
        id SERIAL PRIMARY KEY,
        name text NOT NULL
    )`;

    pool
        .query(articleTable)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}

export function articleTable() {
    const articleTable = `CREATE TABLE IF NOT EXISTS
    article(
        id SERIAL,
        title text NOT NULL,
        content text NOT NULL,
        "authorId" int NOT NULL,
        "createdOn" TIMESTAMP NOT NULL,
        spam INT DEFAULT 0, 
        category INT REFERENCES category(id),
        PRIMARY KEY (id, category)
    )`;

    pool
        .query(articleTable)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}

export function commentTable() {
    const commentTable = `CREATE TABLE IF NOT EXISTS
    comment(
        id SERIAL PRIMARY KEY,
        comment text NOT NULL,
        "articleId" int,
        "gifId" int,
        "authorId" int NOT NULL ,
        "createdOn" TIMESTAMP NOT NULL
        
    )`;
    pool
        .query(commentTable)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}

export function alterArticleTable() {
    const querystr = `ALTER TABLE article ADD COLUMN spam INT DEFAULT 0`;
    pool
        .query(querystr)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}

export function alterGifTable() {
    const querystr = `ALTER TABLE gif ADD COLUMN spam INT DEFAULT 0`;
    pool
        .query(querystr)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}

export function dropEmployeeTable() {
    const drop = `DROP TABLE IF EXISTS employee`;
    pool
        .query(drop)
        .then(() => {
            console.log("droped employee table");
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}

export function dropGifTable() {
    const drop = `DROP TABLE IF EXISTS gif `;
    pool
        .query(drop)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}

export function dropCommentTable() {
    const drop = `DROP TABLE IF EXISTS comment`;
    pool
        .query(drop)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}

export function dropArticleTable() {
    const drop = `DROP TABLE IF EXISTS article`;
    pool
        .query(drop)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        });
}