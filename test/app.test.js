const { expect } = require("chai");
const { response } = require("express");
const request = require("supertest");
const assert = require("chai").assert;
const { app } = require("../app")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const MovieController = require("../controllers/MovieController")
const RentController = require("../controllers/RentController")
const UserController = require("../controllers/UserController")
const FavouriteController = require("../controllers/FavouriteController")

const { server } = require("../app")

const bcrypt = require("bcrypt")

// beforeEach(() => {
//   prisma.user.delete()
//   prisma.rents.delete()
//   prisma.movies.delete()
//   prisma.favoriteFilms.delete()
// });

describe("POST /register", () => {

  const userExample = {
    email: "cristian@gmail.com",
    password: "avalith",
    phone: "555-555-555",
    dni: "43123453",
  }

  it("should user register", (done) => {
    request(app)
      .post("/register")
      .send(userExample)
      .expect(201)
      .then(async (response) => {
        assert.isTrue(response._body.ok)
        assert.isNotEmpty(response._body);
        assert.isNotArray(response._body);
        assert.containsAllKeys(response._body.usuario, [
          "email",
          "password",
          "phone",
          "dni",
          "createdAt",
          "updatedAt",
        ])
        const userDB = await prisma.user.findUnique({
          where: { email: userExample.email },
        })
        assert.exists(userDB);
        assert.isTrue(
          bcrypt.compareSync(
            userExample.password,
            response._body.usuario.password
          )
        );
      })
      .then(() => done(), done);
  })


  it("Should not allowed user to register twice", (done) => {
    request(app)
      .post("/register")
      .send(userExample)
      .expect(400)
      .then((response) => {
        assert.equal(response._body.errorMessage, "Email, dni or phone is already in use");
        assert.isNotEmpty(response._body);
      })
      .then(() => done(), done);
  })
})


describe("POST /login  --  GET /logout", () => {

  const userExample = {
    nombre: "Cristian",
    email: "cristian@gmail.com",
    password: "avalith",
    phone: "555-555-555",
    dni: "43123453",
  };

  it("should return 200 and a token", (done) => {
    request(app)
      .post("/register")
      .send(userExample)
      .then((user) => {
        request(app)
          .post("/login")
          .send({ email: userExample.email, password: userExample.password })
          .expect(200)
          .then((res) => {
            assert.isNotEmpty(res._body.token);
          })
          .then(() => done(), done);
      })
  })


  it("Should logued out", (done) => {
    request(app)
      .post("/login")
      .send(userExample)
      .expect(200)
      .then((user) => {

        request(app)
          .get("/logout")
          .set({ Authorization: `Bearer ${user._body.token}` })
          .expect(202)
          .then((res) => {
            assert.equal(res._body.msg, 'Unlogged User')
            assert.notExists(res._body.token)
          })
          .then(() => done(), done)
      })
  })


})


describe('POST /favourite/:code', () => {

  const userExample = {
    nombre: "Cristian",
    email: "cristian@gmail.com",
    password: "avalith",
    phone: "555-555-555",
    dni: "43123453",
  }
  const movieExample = {
    codeExample: "2baf70d1-42bb-4437-b551-e5fed5a87abe",
    codeExample2: "0440483e-ca0e-4120-8c50-4c8cd9b965d6",
    review: "Colocar Review"
  }

  it("Should return 201 and set movie as favourite for logged user with review", done => {

    request(app)
      .post(`/login`)
      .send(userExample)
      .expect(200)
      .then((user) => {
        request(app)
          .post(`/favourite/${movieExample.codeExample}`)
          .send({ review: movieExample.review })
          .set({ Authorization: `Bearer ${user._body.token}` })
          .expect(201)
          .then((response) => {


            assert.equal(response._body.msg, "Movie Added to Favorites");

          })
          .then(() => done(), done);
      })
  })

  it("Should return 201 and set movie as favourite for logged user without review", done => {

    request(app)
      .post(`/login`)
      .send(userExample)
      .expect(200)
      .then((user) => {
        request(app)
          .post(`/favourite/${movieExample.codeExample2}`)
          .set({ Authorization: `Bearer ${user._body.token}` })
          .expect(201)
          .then((response) => {
            assert.equal(response._body.msg, "Movie Added to Favorites");
          })
          .then(() => done(), done);
      })
  });


  it("Should not allow to favourite the same movie twice", done => {

    request(app)
      .post(`/login`)
      .send(userExample)
      .expect(200)
      .then((user) => {
        request(app)
          .post(`/favourite/${movieExample.codeExample}`)
          .send({ review: movieExample.review })
          .set({ Authorization: `Bearer ${user._body.token}` })
          .expect(400)
          .then((response) => {
            assert.equal(response._body.errorMessage, "Film is already added to favorite")
          })
          .then(() => done(), done)
      })
  })


})
// TO-DO
// Check status
// Check si se registro el cambio en la DB
// Check si el registro en la DB es correcto


describe('POST /rent/:code', () => {

  const userExample = {
    nombre: "Cristian",
    email: "cristian@gmail.com",
    password: "avalith",
    phone: "555-555-555",
    dni: "43123453"
  }

  const movieExample = {
    code: "2baf70d1-42bb-4437-b551-e5fed5a87abe"
  }

  const movieWhithoutStock = {
    code: "112c1e67-726f-40b1-ac17-6974127bb9b9"
  }

  it("Should return 201 and successfully rent a movie", done => {

    request(app)
      .post('/login')
      .send(userExample)
      .expect(200)
      .then((user) => {
        request(app)
          .post(`/rent/${movieExample.code}`)
          .set({ Authorization: `Bearer ${user._body.token}` })
          .expect(201)
          .then(async (response) => {
            const rent = await prisma.rents.findMany()
            const movie = await prisma.movies.findUnique({ where: { code: movieExample.code } })
            assert.equal(response._body.msg, "Rented movie")
            assert.operator(rent[0].id_rent, ">", 0)
            assert.operator(movie.rentals, ">", 0)
          })
          .then(() => done(), done)
      })
  })


  it.only("Should not allow rent if there is no stock", done => {

    request(app)
      .post('/login')
      .send(userExample)
      .expect(200)
      .then(async (user) => {
        const withoutStock = await prisma.movies.update({
          data: { stock: 0 },
          where: { code: movieWhithoutStock.code }
        })
        request(app)
          .post(`/rent/${withoutStock}`)
          .set({ Authorization: `Bearer ${user._body.token}` })
          .expect(404)
          .then(async (response) => {

            console.log(response);

            // const withoutStock = await prisma.movies.update({
            //   data: { stock: 0 },
            //   where: { code: movieWhithoutStock.code }
            // })
            // console.log(withoutStock);

            // const rent = await prisma.rents.findMany()
            // const movie = await prisma.movies.findUnique({ where: { code: movieExample.code } })
            // assert.equal(response._body.msg, "Rented movie")
            // assert.operator(rent[0].id_rent, ">", 0)
            // assert.operator(movie.rentals, ">", 0)

          })
          .then(() => done(), done);
      })
  })



  it("Should not allow rent if movie does not exist", done => {
    request(app)
      .post('/login')
      .send(userExample)
      .expect(200)
      .then((user) => {
        request(app)
          .post(`/rent/nonexistentcode`)
          .set({ Authorization: `Bearer ${user._body.token}` })
          .expect(404)
          .then((response) => {
            assert.equal(response._body.error, "Movie Not Found")
          })
          .then(() => done(), done);
      })
  })


  it("Should not allow non logged user to rent a movie", done => {

    request(app)
      .post(`/rent/${movieExample.codeExample}`)
      .expect(401)
      .then((response) => {
        assert.equal(response._body.error, "Authorization is not valid")
      })
      .then(() => done(), done);
  })


})

describe("POST /return/:id", done => {


  it("Should return a rental on time", done => {
    //TO-DO
    //Chequear status code 200
    //Chequear que se devuelva correctamente el precio
    //Chequear que se restockee correctamente la pelicula
    //Chequear que se persitio la fecha de devolucion
  })
  it("Should return late rental", done => {
    //TO-DO
    //Chequear status code 200
    //Chequear que se devuelva correctamente el precio con el agregado
    //Chequear que se restockee correctamente la pelicula
    //Chequear que se persitio la fecha de devolucion
  })
  it("Should return a movie that was rented a second time", done => {
    //TO-DO
  })
  it("Should not allow to rent movie twice simultaneously", done => {
    //TO-DO
  })
  it("Should not allow to return already returned movie", done => {
    //TO-DO
  })
  it("Should not allow to return non rented movie", done => {
    //TO-DO
  })
  it("Should not allow non logged user to return a movie", done => {
    //TO-DO
  })
})


describe('GET /favourites', () => {

  const userExample = {
    nombre: "Cristian",
    email: "cristian@gmail.com",
    password: "avalith",
    phone: "555-555-555",
    dni: "43123453"
  }

  it("Should return 200 status and logged user favourite list", done => {

    request(app)
      .post('/login')
      .send(userExample)
      .expect(200)
      .then((user) => {
        request(app)
          .get(`/favourites/user`)
          .set({ Authorization: `Bearer ${user._body.token}` })
          .expect(200)
          .then(async (response) => {
            assert.isArray(response._body)
            assert.containsAllKeys(response._body[0], [
              "id",
              "movie_code",
              "user_id",
              "review"
            ])
            const favourite = await prisma.favoriteFilms.findMany()

            assert.deepEqual(response._body, favourite)
          })
          .then(() => done(), done);
      })
  })


  it("Should forbid access to non logged user", done => {

    request(app)
      .get(`/favourites/user`)
      .expect(401)
      .then(async (response) => {
        assert.equal(response._body.error, "Authorization is not valid")
      })
      .then(() => done(), done);
  })

})


describe("GET /movies", () => {
  it("Should return status 200", (done) => {
    request(app).get("/movies").expect(200).end(done);
  });

  it("Should return json", (done) => {
    request(app)
      .get("/movies")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(done);
  });

  it("Should return movies", (done) => {
    request(app)
      .get("/movies")
      .expect(200)
      .then((response) => {
        assert.isNotEmpty(response._body);
        assert.isArray(response._body);
        response._body.forEach((movie) =>
          assert.containsAllKeys(movie, [
            "title",
            "description",
            "director",
            "producer",
            "release_date",
            "running_time",
            "rt_score",
          ])
        );
      })
      .then(() => done(), done)
  });
});

describe("GET /movies/:id", () => {
  it("Get Movie Details By ID", (done) => {
    request(app)
      .get("/movies/58611129-2dbc-4a81-a72f-77ddfc1b1b49")
      .expect(200)
      .then((response) => {
        assert.isNotEmpty(response._body)
        assert.isNotArray(response._body)
        assert.containsAllKeys(response._body, [
          "title",
          "description",
          "director",
          "producer",
          "release_date",
          "running_time",
          "rt_score",
        ]);
      })
      .then(() => done(), done);
  });
});



describe("Not Found handling", () => {
  it("Should return status 404", (done) => {
    request(app)
      .get("/")
      .expect(404)
      .then((response) => {
        assert.equal(response.res.statusMessage, "Not Found");
      })
      .then(() => done(), done);
  });
});


