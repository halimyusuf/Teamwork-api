import request from "supertest";
import {
    expect
} from "chai";
import app from "../src/index";
import query from "../src/database/db";
import Helper from "../src/resources/admin/admin.helper";
const helper = new Helper()
let token;

describe("Admin-api/users", () => {
    let tok;
    before(async () => {

        await query(`TRUNCATE TABLE employee RESTART IDENTITY`);
        const values = ["admin", "admin", "admin@gmail.com", "admin12", "male", "developer", "hr deprt", "3, address, state", new Date()]
        await query(`INSERT INTO employee( "firstName", "lastName", email, password, gender, "jobRole", department, address, "createdOn")
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *`, values)
    });

    describe("POST /api/v1/auth/create-user", () => {
        let firstName,
            lastName,
            email,
            password,
            gender,
            jobRole,
            department,
            address;
        const exec = async () =>
            await request(app)
            .post("/api/v1/auth/create-user")
            .send({
                firstName,
                lastName,
                email,
                password,
                gender,
                jobRole,
                department,
                address
            })
            .set("tw-auth-token", tok);

        before(() => {
            tok = helper.generateToken(1, "admin admin", true)
        })
        beforeEach(() => {
            {

                (firstName = "halim"),
                (lastName = "yusuf"),
                (email = "abc@gmail.com"),
                (password = "password1"),
                (gender = "male"),
                (jobRole = "jobrole"),
                (department = "department"),
                (address = "4, janes street");
            }
        });

        it("should create a new user", async () => {
            const res = await exec();
            expect(res.status).to.equal(201);
            token = res.body.data.token;
        });

        it("should  422 if email is invalid", async () => {
            email = "@gmail.com";
            const res = await exec();
            expect(res.status).to.equal(422);
        });

        it("should  422 if lastname or firstname or jobrole or department is less than 3 chars", async () => {
            lastName = "gd";
            const res = await exec();
            expect(res.status).to.equal(422);
        });

        it("should  422 if address is less than 10 chars", async () => {
            address = "address";
            const res = await exec();
            expect(res.status).to.equal(422);
        });

        it("should  422 if password is not at least 7 char long ", async () => {
            password = "pas4";
            const res = await exec();
            expect(res.status).to.equal(422);
        });

        it("should  422 if password doesn't contain digit ", async () => {
            password = "pasyyyd";
            const res = await exec();
            expect(res.status).to.equal(422);
        });

        it("should  400 if email exists", async () => {
            email = "abc@gmail.com";
            const res = await exec();
            expect(res.status).to.equal(400);
        });

        it("should 401 if token is invalid", async () => {
            tok = 33
            const res = await exec();
            expect(res.status).to.equal(401);
        });

        it("should 403 if token is not an admin", async () => {
            tok = helper.generateToken(1, "halim yusuf", false)
            const res = await exec();
            expect(res.status).to.equal(403);
        });
    });

    // login
    describe("POST /api/v1/auth/signin", () => {
        let email, password;
        const exec = async () =>
            await request(app)
            .post("/api/v1/auth/signin")
            .send({
                email,
                password
            });

        beforeEach(() => {
            email = "abc@gmail.com";
            password = "password1";
        });

        it("should  404 if email does not exist", async () => {
            email = "hal@gmail.com";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("should  400 if password is incorrect", async () => {
            password = "passss5";
            const res = await exec();
            expect(res.status).to.equal(400);
        });

        it("should  200 if email and password is correct", async () => {
            const res = await exec();
            expect(res.status).to.equal(200);
        });
    });

    describe("GET /api/v1/users", () => {
        let tok, param;
        const exec = async () =>
            await request(app)
            .get(`/api/v1/${param}`)
            .set("tw-auth-token", tok);
        beforeEach(() => {
            tok = token;
            param = "users"
        });
        it("should return 403 if not an admin", async () => {
            const res = await exec();
            expect(res.status).to.equal(403);
        });
        it("should get all users", async () => {
            tok = helper.generateToken(1, "admin admin", true)
            const res = await exec();
            expect(res.status).to.equal(200);
        });
        it("should  401 if token is invalid", async () => {
            tok = 333333;
            const res = await exec();
            expect(res.status).to.equal(401);
        });

        it("should get all users", async () => {
            param = "user"
            const res = await exec();
            expect(res.status).to.equal(200);
        });
        it("should  401 if token is invalid", async () => {
            param = "user"
            tok = 333333;
            const res = await exec();
            expect(res.status).to.equal(401);
        });
    });
});

describe("Articles, gifs and comments api ", () => {
    before(async () => {
        await query(`TRUNCATE TABLE gif,comment,article,category RESTART IDENTITY`);
    });
    afterEach(async () => {
        await app.close();
    });

    describe("POST /api/v1/gifs ", () => {

        it("create a new gif", done => {
            request(app)
                .post(`/api/v1/gifs`)
                .field("title", "This is the gif title")
                .set("Content-Type", "application/x-www-form-urlencoded")
                .set("tw-auth-token", token)
                .attach("image", "./test/- nofilter.jpg")
                .expect(200, done);
        });
    });


    describe("POST/ /api/v1/category ", () => {
        let name;
        const exec = async () =>
            await request(app)
            .post(`/api/v1/category`)
            .send({
                name
            })
            .set("tw-auth-token", token);

        it("Category => Should  422 if name is less than 3 chars", async () => {
            name = "na";
            const res = await exec();
            expect(res.status).to.equal(422);
        });

        it("Should  201 to create a category", async () => {
            name = "Programming";
            const res = await exec();
            expect(res.status).to.equal(201);
        });

    });


    describe("POST/PATCH /api/v1 for articles ", () => {
        let title, article, id, category;
        const exec = async () =>
            await request(app)
            .post(`/api/v1/articles`)
            .send({
                title,
                article,
                category
            })
            .set("tw-auth-token", token);

        const exec_patch = async () =>
            await request(app)
            .patch(`/api/v1/articles/${id}`)
            .send({
                title,
                article,
                category
            })
            .set("tw-auth-token", token);

        beforeEach(() => {
            article = "Justo nonumy ea amet magna sit aliquyam ipsum et accusam. Takimata amet sed kasd aliqu.";
            title = "Cospetto quel al che e e le cose. Tal cosa furono fosse noi a il di. E e.";
            id = 1;
            category = 1
        });

        it("Should  422 if title is less than 10 chars", async () => {
            title = "title";
            const res = await exec();
            expect(res.status).to.equal(422);
        });

        it("create a new article", async () => {
            const res = await exec();
            expect(res.status).to.equal(201);
        });

        it("Should  404 if id is invalid", async () => {
            id = 363;
            title = "title";
            const res = await exec();
            expect(res.status).to.equal(422);
        });

        it("Should  422 if article is less than 30 chars", async () => {
            article = "this is a article";
            const res = await exec();
            expect(res.status).to.equal(422);
        });

        it("Should  400 if id is not valid type", async () => {
            id = "sh";
            const res = await exec_patch();
            expect(res.status).to.equal(400);
        });

        it("Should  404 if id is invalid", async () => {
            id = 67;
            const res = await exec_patch();
            expect(res.status).to.equal(404);
        });

        it("Should  200 if patch is success", async () => {
            title = "This is the new article title";
            article = "this is the new article article";
            const res = await exec_patch();
            expect(res.status).to.equal(200);
        });

    });

    describe("Report article and gif as spam", () => {
        let type, id;
        const exec = async () =>
            await request(app)
            .patch(`/api/v1/${type}/${id}/spam`)
            .set("tw-auth-token", token);
        beforeEach(() => {
            id = 1;
        });

        it("should  400 if gif id is not a valid type", async () => {
            type = "gifs";
            id = "aa";
            const res = await exec();
            expect(res.status).to.equal(400);
        });

        it("should  400 if employee id is not a valid type", async () => {
            type = "articles";
            id = "aa";
            const res = await exec();
            expect(res.status).to.equal(400);
        });

        it("should  404 if article employee id is invalid", async () => {
            type = "articles";
            id = 64;
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("should  404 if gif employee id is invalid", async () => {
            type = "gifs";
            id = 64;
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("should  200 if gif spam report was successful", async () => {
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(200);
        });

        it("should  200 if articles spam report was successful", async () => {
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(200);
        });
    });

    describe("GET /api/v1 to get articles , category and gifs", () => {
        let type, id;
        const exec = async () =>
            await request(app)
            .get(`/api/v1/${type}/${id}`)
            .set("tw-auth-token", token);
        beforeEach(() => {
            id = 1;
        });

        it("Article => should  400 if id is not of valid data type", async () => {
            id = "gt";
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(400);
        });

        it("Category => should  200 getting all categories ", async () => {
            id = "";
            type = "category";
            const res = await exec();
            expect(res.status).to.equal(200);
        });

        it("Gif => should  400 if id is not of valid data type", async () => {
            id = "gt";
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(400);
        });

        it("Article => should  404 if id invalid", async () => {
            id = 74;
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("Article => should  404 if route isnt valid", async () => {
            type = "article";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("Gif => should  404 if id invalid", async () => {
            id = 7;
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("Gif => should  all gif posts ", async () => {
            id = "";
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(200);
        });

        it("Article => should  all articles", async () => {
            id = "";
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(200);
        });

        it("Gif => should  a gif posts ", async () => {
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(200);
        });

        it("Article => should  an articles", async () => {
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(200);
        });

        it("Article => should  all articles and gifs", async () => {
            id = "";
            type = "feed";
            const res = await exec();
            expect(res.status).to.equal(200);
        });
    });

    describe("POST comment", () => {
        let comment, type, id;
        const exec = async () =>
            await request(app)
            .post(`/api/v1/${type}/${id}/comment`)
            .send({
                comment
            })
            .set("tw-auth-token", token);
        beforeEach(() => {
            id = 1;
            comment = "This is a new comment";
        });
        it("should  404 if article id is invalid", async () => {
            id = 848;
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("should  400 if gif id not of valid data type", async () => {
            id = "yh";
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(400);
        });

        it("should  400 if article id not of valid data type", async () => {
            id = "yh";
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(400);
        });

        it("should  422 if gifs or article comment is less than 10 char", async () => {
            type = "articles";
            comment = "comm";
            const res = await exec();
            expect(res.status).to.equal(422);
        });

        it("should  404 if gif id is invalid", async () => {
            id = 479;
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("Article => should  201 if article comment was successful", async () => {
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(201);
        });

        it("Gif => should  201 if gif comment was successful", async () => {
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(201);
        });
    });

    describe("DELETE gifs and user ", () => {
        let type, id, tok;
        const exec = async () =>
            await request(app)
            .delete(`/api/v1/${type}/${id}`)
            .set("tw-auth-token", tok);

        beforeEach(() => {
            id = 1;
            tok = token;
        });


        it("should  404 if gif id is invalid", async () => {

            id = 73;
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("should  404 if article id is invalid", async () => {
            id = 73;
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("should  400 if gif id is invalid", async () => {
            id = "hd";
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(400);
        });

        it("should  400 if article id is invalid", async () => {
            id = "hd";
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(400);
        });

        it("should  401 if token is invalid", async () => {
            type = "users";
            tok = 5;
            const res = await exec();
            expect(res.status).to.equal(401);
        });

        it("should  403 because only an admin can delete", async () => {
            type = "users";
            const res = await exec();
            expect(res.status).to.equal(403);
        });

        it("should delete an article", async () => {
            type = "articles";
            const res = await exec();
            expect(res.status).to.equal(200);
        });
        it("Delete a gif", async () => {
            type = "gifs";
            const res = await exec();
            expect(res.status).to.equal(200);
        });
    });

    describe("GET /api/v1/ to get deleted articles and gifs", () => {
        let type, id, comment;
        const exec = async () =>
            await request(app)
            .get(`/api/v1/${type}/${id}/${comment}`)
            .set("tw-auth-token", token);
        beforeEach(() => {
            id = 1;
        });

        it("Article => should  404 if id invalid", async () => {
            type = "articles";
            comment = "";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("Gif => should  404 if id invalid", async () => {
            type = "gifs";
            comment = "";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("Comment => should  404 since gif comment was deleted", async () => {
            id = 2;
            type = "gifs";
            comment = "comment";
            const res = await exec();
            expect(res.status).to.equal(404);
        });

        it("comment => should  404 since comment article was deleted", async () => {
            id = 1;
            type = "articles";
            comment = "comment";
            const res = await exec();
            expect(res.status).to.equal(404);
        });
    });

    describe("GET /api/v1/ to get deleted articles and gifs", () => {
        let type, id, comment;
        const exec = async () =>
            await request(app)
            .get(`/api/v1/${type}/${id}/${comment}`)
            .set("tw-auth-token", token);
        beforeEach(() => {
            id = 1;
        });




    })

    describe("GET /api/v1/ to get deleted articles and gifs", () => {
        let id, tok;
        const exec = async () =>
            await request(app)
            .delete(`/api/v1/users/${id}`)
            .set("tw-auth-token", tok);
        before(() => {
            id = 1
            tok = helper.generateToken(1, "halim yusuf", true)
        })
        it("should delete an employee", async () => {
            const res = await exec()
            expect(res.status).to.equal(200)
        })
    })
});