const express = require("express");
const app = express();
const morgan = require("morgan");

let topMovies = [
  {
    title: "Harry porter",
    author: "J.K Rowling",
  },
  {
    title: "Lord of Rings",
    author: "J.R.R Tolkien",
  },
  {
    title: "Twilight",
    author: "stephanie Meyer",
  },
];
//using morgan module to get default date and time for every req
app.use(morgan("common"));

//get requests
app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.get("/", (req, res) => {
  res.send("Welcome to the top movie club");
});

//requesting static files(all the files in public)
app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("something broke!");
});

//listen for requests

app.listen(8080, () => {
  console.log("your app is listening on port 8080.");
});
