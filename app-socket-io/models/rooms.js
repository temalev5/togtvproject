const { Schema, model } = require("mongoose");

const RoomsSchema = new Schema(
  {
    username : [{
      user_id: {type: String},
      status: {type: Boolean},
    }],
    film: {
      name : {type: String},
      film_id: {type: Number},
      description: {type: String},
      rating: {type: Number},
      genres: [String],
      year: {type: Number},
      countries: [String],
      duration: {type: String},
      poster: {type: String}
    },
    status: {type: Number},
    time_start: {type: Date},
    time_pause: {type: Date},
    addedAt: { type: Date, default: Date.now }
  },
  {
    versionKey: false,
    collection: "RoomsCollection"
  }
);

module.exports = model("RoomsModel", RoomsSchema);