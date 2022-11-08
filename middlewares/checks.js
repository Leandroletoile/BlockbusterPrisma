const jwt = require("jsonwebtoken");

const checkLoggedIn = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  let decoded = jwt.decode(token, { complete: true });
  if (!decoded) {
    const e = new Error("No se permite");
    next(e);
  } else {
    next();
  }
};

const checkAdmin = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  let decoded = jwt.decode(token, { complete: true });
  if (!decoded || decoded.payload.usuario.role !== "ADMIN") {
    const e = new Error("No se permite");
    next(e);
  } else {
    next();
  }
};

const checkLoggedUser = (req, res, next) => {

  if (req.headers.authorization === undefined) return res.status(401).json({ error: "Authorization is not valid" })

  let token = req.headers.authorization.split(" ")[1]

  let decoded = jwt.decode(token, { complete: true })

  if (!decoded) {

    res.status(401).json({ error: "Authorization is not valid" })

  } else {

    req.user = decoded.payload.usuario;
    next();
  }
};

module.exports = {
  checkAdmin,
  checkLoggedIn,
  checkLoggedUser,
};
