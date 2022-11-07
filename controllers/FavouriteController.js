const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()


const getAllFavourites = async (req, res, next) => {

    try {

        let { order } = req.query

        order ? (order = order) : (order = "asc");

        const allFavourites = await prisma.favoriteFilms.findMany({});

        if (order === "asc") {

            allFavourites.sort((a, b) => a.id - b.id)

        } else if (order === "desc") {

            allFavourites.sort((a, b) => b.id - a.id)
        }

        allFavourites.length > 0
            ? res.status(200).json(allFavourites)
            : res.status(404).json({ errorMessage: "Favourite not found" });
    } catch (error) {
        res.status(500).json({ error })
    }
}



const addFavourite = async (req, res, next) => {

    try {

        const code = req.params.code
        const { review } = req.body

        const verifyFavouriteFilm = await prisma.favoriteFilms.findMany({
            where: {
                user_id: req.id,
                movie_code: code,
            },
        })

        if (verifyFavouriteFilm.length > 0)
            return res
                .status(400)
                .json({ errorMessage: "Film is already added to favorite" })


        prisma.movies.findUnique({ where: { code: code } }).then((film) => {
            if (!film) {
                throw new Error(" Movie is not avalaible ")
            }
            const newFavouriteFilms = {
                movie_code: film.code,
                user_id: req.user.id,
                review: review,
            };
            prisma.favoriteFilms.create({ data: newFavouriteFilms }).then((newFav) => {
                if (!newFav) throw new Error("FAILED to add favorite movie")
                res.status(201).json({ msg: "Movie Added to Favorites" })
            })
        })

    } catch (error) {
        res.status(500).json({ error })
    }
}


const favouritesByUser = async (req, res, next) => {
    try {

        let { order } = req.query

        order ? (order = order) : (order = "asc");

        const allFilms = await prisma.favoriteFilms.findMany({
            where: { user_id: req.user.id }
        })

        if (order === "asc") {

            allFilms.sort((a, b) => a.id - b.id)

        } else if (order === "desc") {

            allFilms.sort((a, b) => b.id - a.id)
        }

        res.status(200).json(allFilms)

    } catch (error) {
        res.status(500).json({ error })
    }
}


module.exports = {
    addFavourite,
    favouritesByUser,
    getAllFavourites
};
