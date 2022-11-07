const fetch = (url) =>
  import("node-fetch").then(({ default: fetch }) => fetch(url));
const GHIBLI_APP = "https://ghibliapi.herokuapp.com/films/";
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const jwt = require("jsonwebtoken");


async function getFilmFromAPIByName(name) {

  try {

    let films = await fetch("https://ghibliapi.herokuapp.com/films")
    films = await films.json();
    return prisma.films.findUnique((film) => film.title.includes(name))

  } catch (error) {
    res.status(500).json({ error })
  }
}


const getMovies = async (req, res) => {

  try {
    const { order } = req.query
    const response = await fetch("https://ghibliapi.herokuapp.com/films")
    const movies = await response.json()
    if (order === "desc") {

      movies.sort().reverse()

    } else if (order === "asc") {

      movies.sort((a, b) => -a.release_date - b.release_date)
    }

    movies.length > 0
      ? res.status(200).json(movies)
      : res.status(404).json({ errorMessage: "Movies not found" })
  } catch (error) {
    res.status(500).json({ error })
  }
}


const getMoviesByRuntime = async (req, res) => {

  try {

    const maxRuntime = req.params.max
    let movies = await fetch("https://ghibliapi.herokuapp.com/films")
    movies = await movies.json()
    movies = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      description: movie.description,
      director: movie.director,
      producer: movie.producer,
      release_date: movie.producer,
      running_time: movie.running_time,
      rt_score: movie.rt_score,
    }));

    if (maxRuntime < 137)
      movies = movies.filter((movie) => movie.running_time <= maxRuntime)
    res.status(200).send(movies)

  } catch (error) {
    res.status(500).json({ error })
  }

}



const getMovieDetails = async (req, res) => {

  try {

    const { id } = req.params
    let movies = await fetch("https://ghibliapi.herokuapp.com/films")
    movies = await movies.json()
    movies = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      description: movie.description,
      director: movie.director,
      producer: movie.producer,
      release_date: movie.producer,
      running_time: movie.running_time,
      rt_score: movie.rt_score,
    }));
    const movie = movies.find((movie) => movie.id === id)
    res.status(200).send(movie)

  } catch (error) {
    res.status(500).json({ error })
  }
}


const getMovieByTitle = async (req, res) => {

  try {

    const { title } = req.params
    const titleFormated = title.split("-").join(" ")
    console.log(titleFormated)
    const response = await fetch("https://ghibliapi.herokuapp.com/films")
    const movies = await response.json()
    const movie = movies.find((movie) => movie.title === titleFormated)
    movie
      ? res.status(200).json(movie)
      : res.status(404).json({ errorMessage: "Movie not found" })

  } catch (error) {

    res.status(500).json({ error })
  }
}

const addMovie = (req, res, next) => {

  try {

    const movie = getFilmFromAPIByName(req.body.title)
    const newMovie = {
      code: movie.id,
      title: movie.title,
      stock: 5,
      rentals: 0,
    };
    prisma.movies.create(newMovie)
      .then((movie) => res.status(201).send("Movie Stocked"))
      .catch((err) => next(err));

  } catch (error) {
    res.status(500).json({ error })
  }
}



module.exports = {
  getMovies,
  getMovieDetails,
  getMoviesByRuntime,
  addMovie,
  getMovieByTitle
}
