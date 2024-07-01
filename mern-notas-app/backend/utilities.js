const jwt = require("jsonwebtoken");

function authenticationToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.sendStatus(401).json({
      error: true,
      message: "Token de autenticación no proporcionado.",
    });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return res.status(401).json({
        error: true,
        message: "Token de autenticación inválido.",
      });
    req.user = user;
    next();
  });
}

module.exports = {
  authenticationToken,
};
