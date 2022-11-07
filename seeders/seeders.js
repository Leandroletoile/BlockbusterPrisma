const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require("axios");

async function fetchMovies() {
  const response = axios.get("https:ghibliapi.herokuapp.com/films");
  const data = await response;

  const COMMON_DATA = {
    stock: 5,
    rentals: 0,
    createdAt: new Date().toLocaleDateString(),
    updatedAt: new Date().toLocaleDateString(),
  };

  let movieArray = data.data?.map((movie) => ({
    code: movie.id,
    title: movie.title,
    ...COMMON_DATA,
  }));
  console.log(movieArray);

  const upload = async () => {
    const a = await prisma.movies.createMany({
      data: movieArray,
    });
    console.log(a);
  };

  upload();
}

fetchMovies();
