import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config()
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
})


export default class employeeHelper {
    genMsg(info, id, date, title, autId) {
        const message = {
            status: "success",
            data: {}
        }
        if (info != null) message.data.message = info
        if (title != null) message.data.title = title;
        if (id != null) message.data.articleId = id;
        if (date != null) message.data.createdOn = date;
        if (autId != null) message.data.authorId = autId

        return message;
    }

    genErrMsg(err) {
        return {
            status: "error",
            error: err
        }
    }

    upload(file) {
        return new Promise((resolve) => {
            cloudinary.uploader.upload(file, function (response) {
                resolve(response)
            })
        })
    }

    del(file) {
        return new Promise((resolve) => {
            cloudinary.uploader.destroy(file, function (result) {
                resolve(result);
            })
        })
    }
}