const mongoose = require("mongoose"),
  bcrypt = require("bcrypt");

let movieSchema = mongoose.Schema({
  movieID: { type: Number, required: true },
  title: { type: String, required: true },
  Description: { type: String, required: true },
  Director: {
    name: String,
    age: Number,
  },
  genre: {
    name: String,
    Description: String,
  },
  actors: [String],
  Imagepath: String,
  Featured: Boolean,
});

let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectID, ref: "Movie" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
