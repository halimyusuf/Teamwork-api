import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import query from "../database/db";
import Helper from "../resources/admin/admin.helper";
import {
  check
} from "express-validator";
const helper = new Helper();
dotenv.config();

export default class Auth {
  verifyToken(req, res, next) {
    const token = req.headers["tw-auth-token"];
    if (!token) {
      return res.status(401).send(helper.genErrMsg("Unauthorized user"));
    }
    jwt.verify(token, process.env.jwtPrivateKey, function (err, decoded) {
      if (err)
        return res
          .status(401)
          .send(helper.genErrMsg("The token you provided is invalid"));
      const queryStr = "SELECT * FROM employee WHERE id= $1";
      query(queryStr, [decoded.id])
        .then(response => {
          if (response.rows[0]) {
            req.user = {
              id: decoded.id,
              user: decoded.username,
              isAdmin: decoded.isAdmin
            };
            next();
          } else
            res
            .status(401)
            .send(helper.genErrMsg("The token you provided is invalid"));
        })
        .catch(err => res.status(400).send(err));
    });
  }




  verifySignup() {
    return [
      check("email")
      .isEmail()
      .withMessage("Enter a valid email"),

      check("password")
      .trim()
      .isLength({
        min: 7
      })
      .withMessage("must be at least 7 chars long")
      .matches(/\d/)
      .withMessage("must contain a number"),

      check("firstName")
      .trim()
      .isString()
      .isLength({
        min: 3
      })
      .withMessage("must be at least 3 chars long"),

      check("lastName")
      .trim()
      .isString()
      .isLength({
        min: 3
      })
      .withMessage("must be at least 3 chars long"),

      check("jobRole")
      .trim()
      .isLength({
        min: 3
      })
      .isString()
      .withMessage("must be at least 3 chars long"),

      check("department")
      .trim()
      .isString()
      .isLength({
        min: 3
      })
      .withMessage("must be at least 3 chars long"),

      check("address")
      .trim()
      .isString()
      .isLength({
        min: 10
      })
      .withMessage("address too short, please enter a valid address")
    ];
  }

  validateTitle() {
    return [
      check("title")
      .trim()
      .isString()
      .isLength({
        min: 10
      })
      .withMessage("must be at least 10 chars long"),

      check("article")
      .trim()
      .isString()
      .isLength({
        min: 30
      })
      .withMessage("must be at least 30 chars long")
    ];
  }

  validateGif() {
    return [
      check("title")
      .trim()
      .isString()
      .isLength({
        min: 10
      })
      .withMessage("must be at least 10 chars long")
    ];
  }

  validateComment() {
    return [
      check("comment")
      .trim()
      .isString()
      .isLength({
        min: 10
      })
      .withMessage("must be at least 10 chars long")
    ]

  }

  validateCategory() {
    return [
      check("name")
      .trim()
      .isString()
      .isLength({
        min: 3
      })
      .withMessage("must be at least 3 chars long")
    ]

  }

}