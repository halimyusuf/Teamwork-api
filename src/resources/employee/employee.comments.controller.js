import query from '../../database/db';
import employeeHelper from './employee.helper';
import {
    validationResult
} from "express-validator";
const helper = new employeeHelper()

export default class EmployeeCommentController {

    createArticleComment(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json(helper.genErrMsg(errors.array()));
        query(`SELECT * FROM article WHERE id=$1`, [req.params.id])
            .then(article => {
                if (article.rows[0]) {
                    const queryStr = `INSERT INTO comment(comment, "articleId", "gifId",  "authorId" , "createdOn") VALUES($1, $2, $3, $4, $5) returning *`
                    const values = [req.body.comment, req.params.id, null, req.user.id, new Date()]
                    query(queryStr, values)
                        .then(row => {
                            const message = helper.genMsg("Comment successfully created", req.params.id, row.rows[0].createdOn)
                            message.data.comment = row.rows[0].comment
                            message.data.article = article.rows[0].content
                            message.data.articleTitle = article.rows[0].title
                            res.status(201).json(message);
                        })
                        .catch(err => res.status(400).json(helper.genErrMsg(err)));
                } else
                    res.status(404).json(helper.genErrMsg("Article not found"))
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));

    }

    createGifComment(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json(helper.genErrMsg(errors.array()));
        query(`SELECT * FROM gif WHERE id=$1`, [req.params.id])
            .then(gif => {
                if (gif.rows[0]) {
                    const queryStr = `INSERT INTO comment(comment, "articleId", "gifId", "authorId" , "createdOn") VALUES($1, $2, $3, $4,$5) returning *`
                    const values = [req.body.comment, null, req.params.id, req.user.id, new Date()]
                    query(queryStr, values)
                        .then(row => {
                            const message = helper.genMsg("Comment successfully created", null, row.rows[0].createdOn)
                            message.data.gifTitle = gif.rows[0].title
                            message.data.gifId = req.params.id
                            message.data.comment = row.rows[0].comment
                            res.status(201).json(message);
                        })
                        .catch(err => res.status(400).json(helper.genErrMsg(err)));
                } else res.status(404).json(helper.genErrMsg("Gif not found"))
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));
    }
}