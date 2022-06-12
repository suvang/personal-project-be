const Category = require("../models/Allcategories");

const fetchIdNumber = async () => {
  const category = await Category.find();
  const idNumber = category.length + 1;
  return idNumber;
};

module.exports = fetchIdNumber;
