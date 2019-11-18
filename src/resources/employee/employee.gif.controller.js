import query from '../../database/db';
import employeeHelper from './employee.helper';
import {
    validationResult
} from "express-validator";
const helper = new employeeHelper();
const upload = helper.upload
const destroy = helper.del



export default class EmployeeGifController {
    createGif(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json(helper.genErrMsg(errors.array()));
        const gif = req.files.gif
        if (gif.mimetype.split("/")[0] != 'image') {
            res.status(400).json(helper.genErrMsg("Only image and gifs are allowed"))
        }
        upload(gif.tempFilePath)
            .then(result => {
                const values = [req.body.title, result.original_filename, result.url, req.user.id, new Date()]
                query(`INSERT INTO gif(title, image, url, "authorId", "createdOn") VALUES($1, $2, $3, $4, $5) returning *`, values)
                    .then(gif => {
                        const message = helper.genMsg("GIF image successfully posted", null, gif.rows[0].createdOn, gif.rows[0].title);
                        message.data.gifId = gif.rows[0].id;
                        message.data.imageUrl = gif.rows[0].url;
                        res.status(200).json(message)
                    })
                    .catch(err => res.status(400).json(helper.genErrMsg(err)))
            })
    }

    deleteGif(req, res) {
        query(`DELETE FROM gif WHERE id=$1 returning *`, [req.params.id])
            .then(gif => {
                if (!gif.rows[0])
                    return res.status(404).json(helper.genErrMsg("Gif not found"))
                if (gif.rows[0].authorId == req.user.id || req.user.isAdmin == true) {
                    query(`DELETE FROM comment WHERE "gifId"=$1 `, [req.params.id])
                        .then(() => {
                            const url = gif.rows[0].url.split('/')
                            const public_id = url[url.length - 1].split('.')[0]
                            destroy(public_id)
                                .then((data) => {
                                    res.status(200).json(helper.genMsg("gif post successfully deleted"))
                                })
                        })
                        .catch(err => res.status(400).json(helper.genErrMsg(err)))
                } else res.status(403).json(helper.genErrMsg("Only owner or admin of gif can delete gif"))

            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)))
    }


    getGif(req, res) {
        const queryStr = `SELECT * FROM gif WHERE id=$1`;
        query(queryStr, [req.params.id])
            .then(gif => {
                if (gif.rows[0]) {
                    query(`SELECT * FROM comment WHERE "gifId"=$1 ORDER BY id ASC`, [req.params.id])
                        .then(comment => {
                            const message = helper.genMsg(200)
                            message.data.id = gif.rows[0].id
                            message.data.title = gif.rows[0].title
                            message.data.createdOn = gif.rows[0].createdOn
                            message.data.url = gif.rows[0].url
                            message.data.comments = comment.rows
                            res.status(200).json(message)
                        })
                } else
                    res.status(404).json(helper.genErrMsg("No gif found"))
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)))
    }

    getGifs(req, res) {
        query(`SELECT * FROM gif ORDER BY id ASC`)
            .then(data => {
                let message = helper.genMsg(null)
                message.data = data.rows
                res.status(200).json(helper.genMsg(message))

            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));
    }
}