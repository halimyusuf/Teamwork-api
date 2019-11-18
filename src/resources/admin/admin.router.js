import express from "express";
import adminController from "./admin.controller";
import Auth from "../../middleware/auth";
const adminRouter = express.Router();
const controller = new adminController();
const auth = new Auth();
// const app =  express()

adminRouter.post("/auth/create-user", [...auth.verifySignup()], controller.createUser);
adminRouter.post("/auth/signin", controller.signIn);
adminRouter.get("/users", auth.verifyToken, controller.getEmployees);
adminRouter.delete("/users/:id", [auth.verifyToken, auth.verifyAdmin], controller.removeEmployee);

export default adminRouter;