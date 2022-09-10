const channelModel = require("../models/Channel");
const Category = require("../models/Allcategories");

const getUserWithPosts = async (user) => {
  let finaluser = { ...user._doc };

  let tempSavedPosts = [];

  let savedPosts = finaluser.savedPosts;
  for (let i = 0; i < savedPosts.length; i++) {
    if (savedPosts[i].categoryType === "video") {
      const post = await channelModel.findById(savedPosts[i].id);
      tempSavedPosts.push(post);
    }

    if (savedPosts[i].categoryType === "image") {
      const post = await Category.findById(savedPosts[i].id);
      tempSavedPosts.push(post);
    }
  }

  const result = { ...finaluser, savedPosts: tempSavedPosts };

  return result;
};

module.exports = getUserWithPosts;
