require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bcrypt = require("bcryptjs");
// MongoDB
const debug = require("debug")("http");
const mongoose = require("mongoose");
// Authentication with PassportJs
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/users");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const jwt = require("jsonwebtoken");
const session = require("express-session");
//Allow cache
const apicache = require("apicache");
const cors = require("cors");
const methodOverride = require("method-override");
// Production
const compression = require("compression");
const helmet = require("helmet");

//Set up default mongoose connection
const mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const allPostsRouter = require("./routes/get_posts")
const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");
const commentsRouter = require("./routes/comments");
const { authenticate } = require("passport");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT));
app.use(express.static(path.join(__dirname, "public")));

let cache = apicache.middleware;
//app.use(cache("5 minutes"));

app.use(
  session({
    secret: process.env.JWT,
    cookie: {},
    resave: false,
    saveUninitialized: true,
  })
);

app.use(helmet());
app.use(compression()); //Compress all routes

app.options("*", cors()); // include before other routes
app.use(
  cors({
    origin: ["http://localhost:3000", "https://mtavares21.github.io/TOP-Blog_adm/", "https://mtavares21.github.io/TOP-BlogPublic/"],
    credentials: true,
    preflightContinue: true,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(passport.initialize());
app.use(passport.session());

// Setting up the LocalStrategy
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          return done(null, user);
        } else {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" });
        }
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// Setting up JWT Strategy
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT,
    },
    function (jwtPayload, cb) {
      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
      return User.findById(jwtPayload._id)
        .then((user) => {
          return cb(null, user);
        })
        .catch((err) => {
          return cb(err);
        });
    }
  )
);

app.use("/v1/users", usersRouter);

app.use(
  "/v1/posts",
  passport.authenticate("jwt", { session: false }),
  postsRouter
);

app.use("/v1/allPosts", allPostsRouter);

app.use(
  "/v1/comments",
  passport.authenticate("jwt", { session: false }),
  commentsRouter
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
