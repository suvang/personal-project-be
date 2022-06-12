const User = require("../models/User");

const fetchUserIdNumber = async () => {
  const user = await User.find();
  const idNumber = user.length + 1;
  return idNumber;
};

module.exports = fetchUserIdNumber;
