import employeeHelper from "./employee.helper";
import query from "../../database/db";
import {
    validationResult
} from "express-validator";
const helper = new employeeHelper();

export default class EmployeeArticleController {
    createArticles(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json(helper.genErrMsg(errors.array()));
        const queryStr = `INSERT INTO article(title, content, "authorId", "createdOn", category) VALUES($1, $2, $3, $4, $5) returning *`;
        const values = [req.body.title, req.body.content, req.user.id, new Date(), req.body.category];
        query(queryStr, values)
            .then(article => {
                res.status(201).json(helper.genMsg("Article successfully posted", article.rows[0].id,
                    article.rows[0].createdOn,
                    article.rows[0].title,
                    req.user.id
                ))
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));

    }

    editArticles(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json(helper.genErrMsg(errors.array()));
        const queryStr = `UPDATE article SET title = $1, content = $2, category = $3 WHERE id = $4 returning *`;
        const values = [req.body.title, req.body.content, req.body.category, req.params.id];
        query(queryStr, values)
            .then(article => {
                if (article.rows[0]) {
                    if (article.rows[0].authorId === req.user.id) {
                        const message = helper.genMsg("Article successfully updated");
                        message.data.title = req.body.title;
                        message.data.article = req.body.content;
                        message.data.category = article.rows[0].category
                        res.status(200).json(message);
                    } else res.status(403).json(helper.genErrMsg("Only authorized users can delete"))
                } else
                    res.status(404).json(helper.genErrMsg("Article not found"))
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));
    }

    deleteArticles(req, res) {
        query(`DELETE FROM article WHERE id=($1) returning *`, [req.params.id])
            .then(article => {
                if (article.rows[0])
                    if (req.user.id === article.rows[0].authorId || req.user.isAdmin === true) {
                        query(`DELETE FROM comment WHERE  "articleId"=$1`, [req.params.id])
                            .then(() => {
                                res
                                    .status(200)
                                    .json(helper.genMsg("Article successfully deleted"));
                            })
                            .catch(err => {
                                res.status(400).json(helper.genErrMsg(err))
                            })

                    } else
                        res.status(403).json(helper.genErrMsg("unauhtorized user"))
                else res.status(404).json(helper.genErrMsg("Article not found"));
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)))
    }


    getFeed(req, res) {
        query(`SELECT * FROM article a, category c WHERE a.category = c.id`)
            .then(article => {
                query(`SELECT * FROM gif ORDER BY id ASC`)
                    .then(gif => {
                        if (article.rows[0] || gif.rows[0]) {
                            const message = helper.genMsg(null)
                            message.data = [...gif.rows, ...article.rows]
                            res.status(200).json(message)
                        } else
                            res.status(404).json(helper.genErrMsg("No article or gif found"))
                    })
                    .catch(err => res.status(400).json(helper.genErrMsg(err)))
                    .catch(err => res.status(400).json(helper.genErrMsg(err)))
            })
    }

    getArticles(req, res) {
        query(`SELECT * FROM article a, category c WHERE a.category = c.id`)
            .then(articles => {
                let message = helper.genMsg(null)
                message.data = articles.rows
                res.status(200).json()
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));

    }

    getArticle(req, res) {
        const queryStr = `SELECT * FROM article a, category c WHERE a.id=$1 AND a.category = c.id`;
        query(queryStr, [req.params.id])
            .then(article => {
                if (article.rows[0]) {
                    query(`SELECT * FROM comment WHERE  "articleId" = $1 ORDER BY id ASC`, [req.params.id])
                        .then(comments => {
                            const message = helper.genMsg(
                                null,
                                req.params.id,
                                article.rows[0].createdOn,
                                article.rows[0].title
                            );
                            message.data.article = article.rows[0].content;
                            message.data.comments = comments.rows;
                            message.data.category = article.rows[0].name
                            res.status(200).json(message);
                        })
                        .catch(err => res.status(400).json(helper.genErrMsg(err)));
                } else
                    res.status(404).json(helper.genErrMsg("No article record found"));
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));
    }

}