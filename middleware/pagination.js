exports.pagination = async (req, res, next, model, type = null) => {
  let query;

  //copy req.query
  const reqQuery = { ...req.query };

  //fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  //loop over removeFields and delete the reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);

  //create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  let tempQuery = { ...JSON.parse(queryStr) };

  if (tempQuery.title) {
    tempQuery.title = { $regex: `${tempQuery.title}`, $options: "i" };
  }

  if (tempQuery.topicName) {
    tempQuery.topicName = { $regex: `${tempQuery.topicName}`, $options: "i" };
  }

  //Finding resource
  // query = model.find(JSON.parse(queryStr)).populate("question");

  if (type === "allcategory") {
    query = model.find(tempQuery);
  } else {
    query = model.find(tempQuery).populate("question");
  }

  //select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort({ createdAt: 1 });
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //executing query
  const data = await query;

  //pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  return {
    success: true,
    count: data.length,
    pagination: pagination,
    data,
  };
};
