import passport from "passport";
import {default as User, UserModel} from "../models/User";
import {Request, Response, NextFunction} from "express";
import {IVerifyOptions} from "passport-local";

//GET /loginfailed : login failed page
export let getLoginFailed = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("failedLogin", {
        title: "Login Failed"
    });
};

//POST /login : Sign in using email and password
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
    console.log("hi");
    req.assert("email", "Email is not valid").isEmail();
    req.assert("password", "Password cannot be blank").notEmpty();
    req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        console.log("1")
        return res.redirect("/loginfailed");
    }

    passport.authenticate("local", (err: Error, user: UserModel, info: IVerifyOptions) => {
        if (err) {
            console.log("2")
            return next(err);
        }
        if (!user) {
            console.log(info.message);
            return res.redirect("/loginfailed");
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log("error over here :)");
                return next(err);
            }
            res.redirect("/");
        });
    })(req, res, next);
};

//GET /logout : Log out
export let logout = (req: Request, res: Response) => {
    req.logout();
    res.redirect("/");
};

//GET /signup : Registration page
export let getSignupFailed = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("failedRegistration", {
        title: "Registration Failed"
    });
};

//POST /signup : Create a new local account
export let postSignup = (req: Request, res: Response, next: NextFunction) => {
    req.assert("email", "Email is not valid").isEmail();
    req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
    req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);
    req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        return res.redirect("/signupfailed");
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            return res.redirect("/signupfailed");
        }
        user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect("/");
            });
        });
    });
};

