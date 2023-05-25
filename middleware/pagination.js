exports.pagination = async (req, res, next, model, type = null) => {
  let query;

  //copy req.query
  const reqQuery = { ...req.query };

  console.log();

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

  if (tempQuery.filter) {
    tempQuery.tags = tempQuery.filter;
    delete tempQuery.filter;
  }

  //Finding resource
  // query = model.find(JSON.parse(queryStr)).populate("question");

  if (type === "popular") {
    if (tempQuery.popularType) {
      tempQuery.topicName = {
        $regex: `${tempQuery.popularType}`,
        $options: "i",
      };
    }

    tempQuery.popular = true;

    let category = await model[0].find(tempQuery);

    delete tempQuery.topicName;

    if (tempQuery.popularType) {
      tempQuery.title = {
        $regex: `${tempQuery.popularType}`,
        $options: "i",
      };
    }

    tempQuery.popular = true;

    let videos = await model[1].find(tempQuery);

    delete tempQuery.title;

    query = [...category, ...videos];
  } else if (type === "allcategory") {
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
    if (type === "popular") {
      //because query when type is popular doesnt have reference to mongodb model, hence we have to perform a manual sort
      query.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    } else {
      query = query.sort({ createdAt: -1 });
    }
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  let total;

  if (type === "popular") {
    total = query.length;
  } else {
    total = await model.countDocuments();
  }

  if (type === "popular") {
    query = query.slice(startIndex, startIndex + limit);
  } else {
    query = query.skip(startIndex).limit(limit);
  }

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
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data,
  };
};
