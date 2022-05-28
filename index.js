const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;
const passport = require("passport");
const session = require("express-session");
const passportSocketIO = require("passport.socketio");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const DB = require("./connection");
const routes = require("./routes");
const authentication = require("./authentication.js");

//setting up socket io and http server
const http = require("http").createServer(app);
const io = require("socket.io")(http);

//Setting up passportSokcet
io.use(
  passportSocketIO.authorize({
    store: new MongoStore({ mongoUrl: process.env.MONGO_URI }),
    key: "express.sid",
    secret: "hola",
    cookieParser: cookieParser,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
  })
);
function onAuthorizeSuccess(data, accept) {
  console.log("Success to authorize socket!");
  accept(null, true);
}
function onAuthorizeFail(data, message, error, accept) {
  if (error) {
    console.log(error + message);
    console.log("failed to connect socket");
  }
  accept(null, false);
}

//Reading the request body and serving static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(
  session({
    secret: "hola",
    key: "express.sid",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongoUrl: process.env.MONGO_URI }),
  })
);

//Initialize passport and passport session
app.use(passport.initialize());
app.use(passport.session());

//startng the server database is connected
DB(async (conn) => {
  const myDataBase = await conn.db("personal").collection("users");
  authentication(app, myDataBase);
  routes(app, myDataBase);

  io.on("connection", (socket) => {
    console.log("User connected: " + socket.request.user.username);
    io.emit("sending", "Halo mata");
    socket.on("message", (data) => {
      console.log("message came from: " + socket.request.user.username);
      io.emit("sending", data);
    });
  });
}).catch((e) => {
  console.log("Error occured in DB async:" + e);
});

http.listen(port, () => {
  console.log("Listening on the server side to port:" + port);
});
