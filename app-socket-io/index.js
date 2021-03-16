const PORT = process.env.PORT || 7777;
const express = require("express");
const app = express();
const passport = require("passport");
const { Strategy } = require("passport-jwt");
const jwt_token = process.env.jwt_token
const mongodb_token = process.env.mongodb_token

function ExtractJwt(req) {
    let token = null;
    if (req.cookies && req.cookies.token != void 0) {
      token = req.cookies["token"];
    }
    return token;
}


const jwt = {
    jwtFromRequest: ExtractJwt,
    secretOrKey: jwt_token
}

passport.use(
    new Strategy(jwt, function(jwt_payload, done) {
      if (jwt_payload != void 0) {
        return done(false, jwt_payload);
      }
      done();
    })
  );

const mongoose = require("mongoose")

mongoose.connect(mongodb_token, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(()=>{
          console.log("Mongoose connected")})
          .catch((err)=>{console.log(err)})

const server = require("http").Server(app);
const io = require("socket.io")(server, {   
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    },
    serveClient: true 
});

require("./sockets")(io);

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});