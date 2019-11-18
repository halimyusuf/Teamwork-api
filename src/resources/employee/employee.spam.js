import query from "../../database/db";
import employeeHelper from "./employee.helper";
const helper = new employeeHelper();

export default class PostSpamController {
    spamArticle(req, res) {
        query(`UPDATE article SET spam =spam + 1 where id=$1 returning *`, [
                req.params.id
            ])
            .then(data => {
                if (data.rows[0]) {
                    res
                        .status(200)
                        .json(helper.genMsg("Successfully reported article as spam"));
                } else
                    res.status(404).json(helper.genErrMsg("article not found"));
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));
    }

    spamGif(req, res) {
        query(`UPDATE gif SET spam = spam + 1 where id=$1 returning *`, [
                req.params.id
            ])
            .then(data => {
                if (data.rows[0]) {
                    res
                        .status(200)
                        .json(helper.genMsg("Successfully reported gif as spam"));
                } else
                    res.status(404).json(helper.genErrMsg("gif not found"));
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));
    }
}