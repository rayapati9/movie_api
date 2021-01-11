const express = require("express");
const app = express();
const morgan = require("morgan");

//requesting static files(all the files in public)
app.use(express.static("public"));

//using morgan module to get default date and time for every req
app.use(morgan("common"));

let movies = [
  {
    title: "Harry porter",
    Genres: "Fiction",
    Director: {
      name: "chris columbus",
      dob: "09 / 10 / 1958",
      age: 62,
    },
  },
  {
    title: "Lord of Rings",
    Genres: "Fiction",
    Director: {
      name: "peter jackson",
      dob: "10 / 31 / 1961",
      age: 59,
    },
  },
  {
    title: "Twilight",
    Genres: "Horror",
    Director: {
      name: "Bill condon",
      dob: "10 / 22 / 1955",
      age: 65,
    },
  },
];

//get the list of data about all the movies
app.get("/movies", (req, res) => {
  res.json(movies);
});

//get the data about the movie by its title

app.get("/movies/:title", (req, res) => {
  res.json(
    movies.find((movie) => {
      return movie.title === req.params.title;
    })
  );
});

//return data about a genre by its title

app.get("/movies/Genres/:genre", (req, res) => {
  res.send(
    "successful GET request returning data on genre: " + req.params.genre
  );
});

//return data about director by name

app.get("/movies/Directors/:name", (req, res) => {
  res.send(
    "successful GET request returning data about director:  " + req.params.name
  );
});

//add new users to register

app.post("/users", (req, res) => {
  res.send("successfully register the new user");
});

//update user info

app.put("/users/:username", (req, res) => {
  res.send("updated the user info");
});

// users to add list of their fav movies

app.post("/users/:username/movies/:movieID", (req, res) => {
  res.send(
    "successfuly add movie with Id:" +
      req.params.movieID +
      " to favourite list of user:" +
      req.params.username
  );
});

// delete a movie from the list of users fav movies
app.delete("/users/:username/movies/:movieID", (req, res) => {
  res.send("successful DELETE movie with ID: " + req.params.movieID);
});

//deletes a user from database

app.delete("/users/:username", (req, res) => {
  res.send(
    "successfully removed the user: " + req.params.username + "from database"
  );
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("something broke!");
});

//listen for requests

app.listen(8080, () => {
  console.log("your app is listening on port 8080.");
});
