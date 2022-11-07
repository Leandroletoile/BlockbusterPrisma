const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()



const login = (req, res, next) => {

  try {
    let body = req.body
    prisma.user
      .findUnique({ where: { email: body.email } })
      .then((usuarioDB) => {
        if (!usuarioDB) {
          return res.status(400).json({
            ok: false,
            err: {
              message: "Usuario o contraseña incorrectos",
            },
          });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
          return res.status(400).json({
            ok: false,
            err: {
              message: "Usuario o contraseña incorrectos",
            },
          });
        }
        let token = jwt.sign(
          {
            usuario: usuarioDB,
          },
          process.env.SEED_AUTENTICACION,
          {
            expiresIn: process.env.CADUCIDAD_TOKEN,
          }
        );
        res.json({
          ok: true,
          usuario: usuarioDB,
          token,
        })
      })

  } catch (error) {
    res.status(500).json({ error })
  }
}


const register = async (req, res, next) => {
  try {
    let { email, password, dni, phone } = req.body;

    if (!email || !password || !dni || !phone) {
      res.send.json({
        status: "error",
        error: "All fields must be completed",
      });
    } else {
      const verifyUser = await prisma.user.findMany({
        where: {
          email: email,
          dni: dni,
          phone: phone,
        },
      });
      if (verifyUser.length > 0)
        return res.status(400)
          .json({ errorMessage: "Email, dni or phone is already in use" });
      let usuario = {
        email,
        dni,
        phone,
        password: bcrypt.hashSync(password, 10),
      };

      prisma.user.create({ data: usuario }).then((usuarioDB) => {
        return res
          .status(201)
          .json({
            ok: true,
            usuario: usuarioDB,
          })
          .end();
      });
    }
  } catch (error) {
    res.status(404).json({ status: "404", error: "Bad request, try again" });
  }
}



const logout = (req, res, next) => {

  try {

    req.user = null
    console.log("LoguedOut")
    res.redirect("/login")
    res.status(202).json({ msg: 'Unlogged User' })
  } catch (error) {
    res.status(500).json({ error })
  }
}


module.exports = {
  login,
  register,
  logout,
};
