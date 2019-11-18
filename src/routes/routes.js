import adminRouter from '../resources/admin/admin.router';
import employeeRouter from '../resources/employee/employee.router';
import createError from 'http-errors';
import express from 'express';
import fileUpload from 'express-fileupload';




export function route(app) {
    app.use(express.json())
    app.use(fileUpload({
        useTempFiles: true
    }))
    app.use('/api/v1', adminRouter);
    app.use('/api/v1', employeeRouter);
    app.use((req, res, next) => {
        next(createError(404));
    })
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            status:  "error",
            error: err.message
        });
    });
}