import express from "express";
import EmployeeArticleController from "./employee.article.controller";
import EmployeeGifController from "./employee.gif.controller";
import EmployeeCommentController from "./employee.comments.controller";
import Auth from "../../middleware/auth";
import PostSpamController from "./employee.spam";
import EmployeeCategoryController from "./employee.category";
const auth = new Auth();
const categoryController = new EmployeeCategoryController()
const employeeRouter = express.Router();
const articleController = new EmployeeArticleController();
const gifController = new EmployeeGifController();
const commentController = new EmployeeCommentController();
const spamController = new PostSpamController();

// artciles routes
employeeRouter.post("/articles", [auth.verifyToken, ...auth.validateTitle()], articleController.createArticles);

employeeRouter.get("/articles", auth.verifyToken, articleController.getArticles);
employeeRouter.patch("/articles/:id", [auth.verifyToken, ...auth.validateTitle()], articleController.editArticles);
employeeRouter.delete("/articles/:id", auth.verifyToken, articleController.deleteArticles);
employeeRouter.get("/articles/:id", auth.verifyToken, articleController.getArticle);

// comment routes
employeeRouter.post("/articles/:id/comment", [auth.verifyToken, ...auth.validateComment()], commentController.createArticleComment);
employeeRouter.post("/gifs/:id/comment", [auth.verifyToken, ...auth.validateComment()], commentController.createGifComment);

// gifs routes
employeeRouter.post("/gifs", [auth.verifyToken, ...auth.validateGif()], gifController.createGif);
employeeRouter.delete("/gifs/:id", auth.verifyToken, gifController.deleteGif);
employeeRouter.get("/gifs/:id", auth.verifyToken, gifController.getGif);
employeeRouter.get("/gifs", auth.verifyToken, gifController.getGifs);

// gifs spam
employeeRouter.patch("/gifs/:id/spam", auth.verifyToken, spamController.spamGif);
employeeRouter.patch("/articles/:id/spam", auth.verifyToken, spamController.spamArticle);

// feeds
employeeRouter.get("/feed", auth.verifyToken, articleController.getFeed);

// category
employeeRouter.post("/category", [auth.verifyToken, ...auth.validateCategory()], categoryController.createCategories)
employeeRouter.get("/category", auth.verifyToken, categoryController.getCategories)

export default employeeRouter;