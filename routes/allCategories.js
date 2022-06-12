const express = require("express");
const {
  getAllCategories,
  addCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  likeAndUnlikePost,
  getPostOfFollowing,
  addComment,
  updateComment,
} = require("../controllers/allCategories");
const { isAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
    fileFilter: fileFilter,
  },
});

const type = upload.any();

router.route("/followingposts").get(isAuthenticated, getPostOfFollowing);

router
  .route("/")
  .get(getAllCategories)
  .post(isAuthenticated, type, addCategory);

router
  .route("/comment/:id")
  .post(isAuthenticated, addComment)
  .put(isAuthenticated, updateComment);

router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(isAuthenticated, deleteCategory);

router.route("/likeorunlikepost/:id").get(isAuthenticated, likeAndUnlikePost);

module.exports = router;
