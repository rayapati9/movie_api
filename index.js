const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  //uuid = require("uuid"),
  cors = require("cors"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  { check, validationResult } = require("express-validator"),
  Models = require("./models.js"),
  Users = Models.User,
  Movies = Models.Movie;

require("./passport");

const app = express();

//logs all requests using Morgan, prints in terminal.
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

let auth = require("./auth")(app);

//connects to existing MongoDB database
/*mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); */

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//GET route located at default endpoint / that returns text
app.get("/", (req, res) => {
  res.send("Welcome to myFlix app!");
});

//get the list of data about all the movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//get the data about the movie by its title

app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//return data about a genre by its title

app.get(
  "/movies/genres/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "genre.name": req.params.name })
      .then((movie) => {
        res
          .status(201)
          .json(movie.genre.name + " : " + movie.genre.Description);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//return data about director by name

app.get(
  "/movies/Directors/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.name": req.params.name })
      .then((movie) => {
        res.status(201).json(movie.Director.name + ":" + movie.Director.age);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//get all users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//allow new users to register
app.post(
  "/users",
  [
    check("username", "username is required").isLength({ min: 5 }),
    check(
      "username",
      "username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "password is required").not().isEmpty(),
    check("email", "email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + " already exists.");
        } else {
          Users.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

//update user info

app.put(
  "/users/:username",
  [
    check("username", "username is required").isLength({ min: 5 }),
    check(
      "username",
      "username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "password is required").not().isEmpty(),
    check("email", "email does not appear to be valid").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          birthday: req.body.birthday,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// users to add list of their fav movies

app.post(
  "/users/:username/movies/:movieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $push: { FavouriteMovies: req.params.movieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// delete a movie from the list of users fav movies
app.delete(
  "/users/:username/movies/:movieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $pull: {
          FavouriteMovies: req.params.movieID,
        },
      },
      { new: true },
      (err, updateUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updateUser);
        }
      }
    );
  }
);

//deletes a user from database

app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.username + "was not found");
        } else {
          res.status(200).send(req.params.username + "was deleted");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("something broke!");
});

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
