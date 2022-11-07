const { PrismaClient } = require("@prisma/client")
const { rentPrice } = require("../helpers/rentPrice")
const prisma = new PrismaClient()



const getAllRents = async (req, res) => {
  try {
    let { order } = req.query;

    order ? (order = order) : (order = "asc");

    let rents = await prisma.rents.findMany();

    if (order === "asc") {

      rents.sort((a, b) => a.id_rent - b.id_rent)

    } else if (order === "desc") {

      rents.sort((a, b) => b.id_rent - a.id_rent)
    }

    rents.length > 0
      ? res.status(200).json(rents)
      : res.status(404).json({ errorMessage: "Rent not found" });
  } catch (error) {
    res.status(500).json({ error })
  }
}

const rentMovie = (req, res, next) => {

  try {
    const { code } = req.params

    prisma.movies.findUnique({ where: { code: code } }).then((rental) => {
      if (!rental) throw new Error(" Movie Not Found ")
      if (rental.stock === 0) {
        return res.status(400).json({ error: "BAD REQUEST" })
      }
      prisma.rents
        .create({
          data: {
            code: rental.code,
            id_user: req.user.id,
            rent_date: new Date(Date.now()),
            refund_date: new Date(Date.now() + 3600 * 1000 * 24 * 7),
          },
        })
        .then((data) => {
          prisma.movies
            .update({
              data: { stock: rental.stock - 1, rentals: rental.rentals + 1 },
              where: { code: rental.code },
            })
            .then(() => res.status(201).json({ msg: "Rented movie" }))
        });
    });

  } catch (error) {
    res.status(500).json({ error })
  }

}


const rentsByUser = async (req, res, next) => {

  try {

    return prisma.rents
      .findMany({ where: { id_user: req.user.id } })
      .then((data) => {
        data
          ? res.status(201).send(data)
          : res.status(404).send("Movie Not Found")
      })
  } catch (error) {

    res.status(500).send("Service unavailable")
  }
}



const returnRent = async (req, res) => {

  try {

    let { id } = req.params
    id = parseInt(id)

    const rent = await prisma.rents.findUnique({
      where: {
        id_rent: id,
      },
    })

    if (!rent) return res.status(404).json({ errorMessage: "Rent not found" });

    rent.userRefund_date = new Date();

    const movie = await prisma.movies.findUnique({
      where: {
        code: rent.code,
      },
    });

    movie.stock++;

    await prisma.movies.update({
      where: {
        code: movie.code,
      },
      data: {
        stock: movie.stock,
      },
    });

    await prisma.rents.update({
      where: {
        id_rent: id,
      },
      data: {
        userRefund_date: rent.userRefund_date,
      },
    })

    await prisma.rents.delete({ where: { id_rent: id } })

    res.status(200).json({
      message: "The movie was returned",
      price: rentPrice(rent.userRefund_date, rent.refund_date),
    })

  } catch (error) {
    res.status(500).json({ error });
  }
}


module.exports = {
  rentMovie,
  rentsByUser,
  returnRent,
  getAllRents
};
