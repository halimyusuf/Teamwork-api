import employeeHelper from "./employee.helper";
import query from "../../database/db";
import {
    validationResult
} from "express-validator";
const helper = new employeeHelper();

export default class EmployeeCategoryController {
    createCategories(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json(helper.genErrMsg(errors.array()));
        const queryStr = `INSERT INTO category(name) VALUES($1) returning *`;
        const values = [req.body.name];
        query(queryStr, values)
            .then(category => {
                res.status(201).json(helper.genMsg("Category successfully posted", category.rows[0].id))
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));
    }

    getCategories(req, res) {
        query(`SELECT * FROM category ORDER BY id ASC`)
            .then(category => {
                let message = helper.genMsg(null)
                message.data = category.rows
                res.status(200).json(message)
            })
            .catch(err => res.status(400).json(helper.genErrMsg(err)));
    }

}