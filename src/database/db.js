import {
    Pool
} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.dbPrivatekey
});



export default function query(text, params) {
    return new Promise((resolve, reject) => {
        pool.query(text, params)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            })
    })
}