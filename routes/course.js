const express = require("express");
const { getAllCourses, getCourse } = require("../controllers/course");
const router = express.Router();

router.route("/").get(getAllCourses);
router.route("/:url").get(getCourse);

module.exports = router;
