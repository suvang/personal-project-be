const express = require("express");
const {
  getAllCategories,
  addCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/allCategories");
const { isAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const router = express.Router();
const fs = require("fs");

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    dir = `./uploads/categories/${
      req.body.videoId ? req.body.videoId : req.body.topicName
    }`;
    if (!fs.existsSync(dir)) {
      await fs.mkdirSync(dir);
      cb(null, dir);
      return;
    }
    cb(null, dir);
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
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
  preservePath: true,
});

const type = upload.any();

router
  .route("/")
  .get(getAllCategories)
  .post(isAuthenticated, type, addCategory)
  .put(updateCategory);

// router.route("/:name").get(getCategory).delete(isAuthenticated, deleteCategory);

module.exports = router;
