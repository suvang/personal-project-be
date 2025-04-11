const mongoose = require("mongoose");

// Define the PricePack schema
const PricePackSchema = new mongoose.Schema({
  accessYears: {
    type: Number,
    required: true,
  },
  accessYearsText: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  fullPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: String,
    required: true,
  },
});

module.exports = PricePackSchema; // Export PricePackSchema
