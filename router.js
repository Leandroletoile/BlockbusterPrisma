const express = require("express");
const router = express.Router();
const MovieController = require("./controllers/MovieController");
const UsersController = require("./controllers/UserController");
const FavouriteController = require("./controllers/FavouriteController");
const { checkLoggedIn, checkLoggedUser } = require("./middlewares/checks");
const errorHandler = require("./middlewares/errorHandler");
const RentController = require("./controllers/RentController");


//GET
router.get("/movies/:id", MovieController.getMovieDetails);
router.get("/movies", MovieController.getMovies);
router.get("/movies/title/:title", MovieController.getMovieByTitle);
router.get("/runtime/:max", MovieController.getMoviesByRuntime);
router.get("/favourites", checkLoggedUser, FavouriteController.getAllFavourites);
router.get("/favourites/user", checkLoggedUser, FavouriteController.favouritesByUser);
router.get("/logout", checkLoggedUser, UsersController.logout);
router.get("/login", (req, res) => res.send("You must to logued in"));
router.get('/rents', checkLoggedUser, RentController.getAllRents)
router.get('/rents/user', checkLoggedUser, RentController.rentsByUser)
//POST
router.post("/login", UsersController.login);
router.post("/register", UsersController.register);
router.post("/movie", checkLoggedIn, MovieController.addMovie);
router.post("/rent/:code", checkLoggedUser, RentController.rentMovie);
router.post("/favourite/:code", checkLoggedUser, FavouriteController.addFavourite);
//PUT
router.put("/returnrent/:id", checkLoggedUser, RentController.returnRent);
//ERROR HANDLER
router.use(errorHandler.notFound);

module.exports = router;
