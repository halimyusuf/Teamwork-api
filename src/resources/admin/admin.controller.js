import query from "../../database/db";
import Helper from "./admin.helper";
import {
  validationResult
} from "express-validator";
const helper = new Helper();

export default class AdminController {
  createUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json(helper.genErrMsg(errors.array()));

    if (req.body.isadmin === undefined) req.body.isAdmin = false

    const queryStr = `INSERT INTO employee( "firstName", "lastName", email, password, gender, "jobRole", department, address, "createdOn", "isAdmin")
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *`;
    const hash = helper.hashPassword(req.body.password);
    const values = [
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      hash,
      req.body.gender,
      req.body.jobRole,
      req.body.department,
      req.body.address,
      new Date(),
      req.body.isAdmin
    ];
    query(queryStr, values)
      .then(user => {
        const username = user.rows[0].firstName + " " + user.rows[0].lastName;
        const token = helper.generateToken(user.rows[0].id, username, user.rows[0].isAdmin);
        const msg = "User account successfully created";
        const message = helper.genMsg(msg, token, user.rows[0].id);
        res.header("tw-auth-token", token).status(201).json(message);
      })
      .catch(err => res.status(400).json(helper.genErrMsg(err)));
  }

  signIn(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(helper.genErrMsg(errors.array()));
    }
    const queryStr = `SELECT * FROM employee WHERE email=$1`;
    query(queryStr, [req.body.email])
      .then(user => {
        if (user.rows[0]) {
          helper
            .comparePassword(req.body.password, user.rows[0].password)
            .then(() => {
              const username =
                user.rows[0].firstName + " " + user.rows[0].lastName;
              const token = helper.generateToken(user.rows[0].id, username, user.rows[0].isAdmin);
              const message = helper.genMsg("welcome back");
              message.data.token = token;
              message.data.userId = user.rows[0].id;
              res.header("tw-auth-token", token).status(200).json(message);
            })
            .catch(err => res.status(400).json(helper.genErrMsg("Incorrect email or password ")));
        } else
          res.status(404).json(helper.genErrMsg("Incorrect email or password"));
      })
      .catch(err => res.status(400).json(helper.genErrMsg(err)));
  }

  getEmployees(req, res) {
    const queryStr = `SELECT * FROM employee`;
    query(queryStr)
      .then(user => {
        if (user.rows[0]) res.status(200).json(helper.genMsg(user.rows));
        else res.status(404).json(helper.genErrMsg("No employee found"));
      })
      .catch(err => res.status(400).json(helper.genErrMsg(err)));
  }
  
  getEmployee(req, res) {
    query(`SELECT * FROM employee WHERE id=$1`, [req.user.id])
      .then(user => {
        let message = helper.genMsg(null)
        message.data = user.rows[0]
        if (user.rows[0]) res.status(200).json(message);
      })
      .catch(err => res.status(400).json(helper.genErrMsg(err)))
  }

  removeEmployee(req, res) {
    query("DELETE FROM employee WHERE id= $1 returning *", [req.params.id])
      .then(user => {
        if (user.rows[0]) {
          res.status(200).json(helper.genMsg("User account deleted successfully"));
        } else res.status(404).json(helper.genErrMsg("User not found"));
      })
      .catch(err => {
        res.status(400).json(helper.genErrMsg(err));
      });
  }
}
