const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  //uuid = require("uuid"),
  mongoose = require("mongoose"),
  Models = require("./models.js"),
  Users = Models.User,
  Movies = Models.Movie;
const app = express();

//logs all requests using Morgan, prints in terminal.
app.use(morgan("common"));
//app.use(cors());
app.use(bodyParser.json());
//connects to existing MongoDB database
mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//connects to existing MongoDB database
mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//GET route located at default endpoint / that returns text
app.get("/", (req, res) => {
  res.send("Welcome to myFlix app!");
});

//get the list of data about all the movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//get the data about the movie by its title

app.get("/movies/:title", (req, res) => {
  Movies.findOne({ title: req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//return data about a genre by its title

app.get("/movies/genres/:name", (req, res) => {
  Movies.findOne({ "genre.name": req.params.name })
    .then((movie) => {
      res.status(201).json(movie.genre.name + " : " + movie.genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//return data about director by name

app.get("/movies/Directors/:name", (req, res) => {
  Movies.findOne({ "Director.name": req.params.name })
    .then((movie) => {
      res.status(201).json(movie.Director.name + ":" + movie.Director.age);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//get all users
app.get("/users", (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//allow new users to register
app.post("/users", (req, res) => {
  Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + " already exists.");
      } else {
        Users.create({
          username: req.body.username,
          password: req.body.password,
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
});

//update user info

app.put("/users/:username", (req, res) => {
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
});

// users to add list of their fav movies

app.post("/users/:username/movies/:movieID", (req, res) => {
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
});

// delete a movie from the list of users fav movies
app.delete("/users/:username/movies/:movieID", (req, res) => {
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
});

//deletes a user from database

app.delete("/users/:username", (req, res) => {
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
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("something broke!");
});

//listen for requests

app.listen(8080, () => {
  console.log("your app is listening on port 8080.");
});
