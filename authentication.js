const LocalStrategy = require("passport-local");
const passport = require("passport");
const ObjectID = require("mongodb").ObjectID;

module.exports = function (app, myDatabase) {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    myDatabase.findOne({ _id: new ObjectID(id) }, (err, data) => {
      if (err) console.error(err);
      done(null, data);
    });
  });
  const local = new LocalStrategy(function (username, password, done) {
    myDatabase.findOne({ username: username }, function (err, data) {
      console.log(`${username} is trying to authenticate`);
      if (err) {
        return console.error(err);
      }
      if (!data) {
        return done(null, false);
      }
      if (password !== data.password) {
        return done(null, false);
      }
      return done(null, data);
    });
  });
  passport.use(local);
};
