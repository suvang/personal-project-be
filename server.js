const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");

//load env vars
dotenv.config({ path: "./config/config.env" });

//connect to database
connectDB();

//Route files
const allCategories = require("./routes/allCategories");
const userDetails = require("./routes/userDetails");
const highlightStory = require("./routes/highlightStory");
const saveStory = require("./routes/saveStory");
const channelData = require("./routes/channelData");
const corsOptions = {
  origin: true, //included origin as true
  credentials: true, //included credentials as true
};

const app = express();
app.use(cors(corsOptions));

app.use("/uploads", express.static("uploads"));
//Body parser
app.use(express.json());
app.use(cookieParser());

//dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Mount routers
app.use("/api/v1/allcategories", allCategories);
app.use("/api/v1/userdetails", userDetails);
app.use("/api/v1/highlightstory", highlightStory);
app.use("/api/v1/savestory", saveStory);
app.use("/api/v1/channeldata", channelData);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  //close server and exit process
  server.close(() => process.exit(1));
});
