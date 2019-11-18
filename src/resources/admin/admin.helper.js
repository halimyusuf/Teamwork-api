import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config()

export default class Helper {

  hashPassword(password) {
    const hash = bcrypt.hashSync(password, 10)
    return hash
  }

  comparePassword(password, hash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash)
        .then(response => {
          if (response == true) resolve(response)
          else reject(response)
        })
    })
  }

  generateToken(id, user, isAdmin) {
    const token = jwt.sign({
      id: id,
      username: user,
      isAdmin: isAdmin
    }, process.env.jwtPrivateKey, {
      expiresIn: '1d'
    });
    return token
  }

  genMsg(info, tok, id) {
    const details = {
      status: "success",
      data: {}
    }
    if (info != null) details.data.message = info
    if (tok != null) details.data.token = tok;
    if (id != null) details.data.userId = id;
    return details;
  }

  genErrMsg(err) {
    return {
      status: "error",
      error: err
    }
  }



}