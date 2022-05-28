const fetch = require("node-fetch");
const passport = require("passport");
module.exports = function (app, myDataBase) {
  app.set("view engine", "pug");
  app.route("/chat").get(checkAuth, (req, res) => {
    res.render("pug\\chat.pug", { username: req.user.username });
  });
  //API for sending the weather info to the user:
  app.post("/api/weathergeo", async (req, res) => {
    const lat = req.body.lat;
    const lon = req.body.lon;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=c7a1806f20dd575ea85126cbee9e9a0f`;
    const response = await fetch(url);
    const json = await response.json();
    res.send(json);
    console.log("Successfully fetched weather info:" + json.name);
  });
  //API for getting ip here
  app.get("/getip", (req, res) => {
    res.send(req.ip + req.method);
  });
  //api for exercising:
  app.get("/sayhello/:helloword/:name", (req, res) => {
    res.send(req.params.helloword + req.params.name);
  });
  //AUthentication routes:
  app.route("/login").post(
    passport.authenticate("local", {
      failureRedirect: "/",
      successRedirect: "/profile",
    })
  );
  app.route("/register").post(
    function (req, res, next) {
      console.log(req);
      myDataBase.findOne(
        { username: req.body.username },
        function (err, result) {
          if (err) next(err);
          else if (result) res.redirect("/");
          else {
            myDataBase.insertOne(
              { username: req.body.username, password: req.body.password },
              function (err, user) {
                if (err) {
                  console.log("Error occured when inserting!");
                  res.redirect("/");
                }
                next(null, user.ops[0]);
              }
            );
          }
        }
      );
    },
    passport.authenticate("local", {
      successRedirect: "/profile",
      failureRedirect: "/",
    })
  );

  //Profile of the user:
  app.route("/profile").get(checkAuth, (req, res) => {
    res.render("pug\\profile.pug", { username: req.user.username });
  });

  //Logging out the user
  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });

  //Function for checking if the user is authorised or not
  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) next();
    else {
      console.log("Someone accessesd page without authentication!");
      res
        .status(401)
        .type("text")
        .send("Not available to access unless login!!!!");
    }
  }

  //IN case the user accesses the page that is not inside the directory/unreachable:
  app.use((req, res) => {
    console.log("someone tried to request unknown page");
    res.status(404).type("text").send("Page not found");
  });
};
