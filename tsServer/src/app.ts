import express from "express";
import compression from "compression";
import session from "express-session";
import bodyParser from "body-parser";
import logger from "morgan";
import lusca from "lusca";
import dotenv from "dotenv";
import mongo from "connect-mongo";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import passportLocal from "passport-local"
import expressValidator from "express-validator";
import bluebird from "bluebird";

const MongoStore = mongo(session);
const LocalStrategy = passportLocal.Strategy;

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({path: ".env"});

// Controllers
import * as userController from "./controllers/user";
import * as plaayController from "./controllers/plaay";
import * as saveController from "./controllers/save";
import * as loadController from "./controllers/load";

import User from "./models/User";



//Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = process.env.MONGOLAB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, {useMongoClient: true}).then(
    () => {/** ready to use. The mongoose.connect() promise resolves to undefined. */},
).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
});

//Express config
app.set("port", process.env.PORT || 7529);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: "email"}, (email, password, done) => {
    User.findOne({email: email.toLowerCase()}, (err, user: any) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(undefined, false, {message: `Email ${email} not found.`});
        }
        user.comparePassword(password, (err: Error, isMatch: boolean) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(undefined, user);
            }
            return done(undefined, false, {message: "Invalid email or password."});
        });
    });
}));

passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    if (!req.user &&
        req.path !== "/login" &&
        req.path !== "/signup" &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    }
    else if (req.user && req.path == "/account") {
        req.session.returnTo = req.path;
    }
    next()
});

app.use(
    express.static(path.join(__dirname, "public"), {maxAge: 31557600000})
);

/**
 Primary app routes.
 */
app.get("/", plaayController.newProgram);
app.get("/loginfailed", userController.getLoginFailed);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/signupfailed", userController.getSignupFailed);
app.post("/signup", userController.postSignup);
app.get("/plaay", plaayController.newProgram);
app.post("/save", saveController.save);
app.post("/load", loadController.load);
app.post("/listPrograms", loadController.listPrograms);
app.get("/p/:programId", plaayController.loadProgram);
app.post("/update", saveController.update);

export default app;
