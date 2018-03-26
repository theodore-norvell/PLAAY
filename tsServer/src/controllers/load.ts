import {Request, Response, NextFunction} from "express";
import {default as Program, ProgramModel} from "../models/Program";

//POST /load : load a program's data and put 'er in the editor
export let load = (req: Request, res: Response, next: NextFunction) => {
    Program.findOne({identifier: req.body.identifier}, (err, program : ProgramModel) => {
        if (err) {
            return next(err);
        }
        if (program.private) {
            if (typeof req.user !== undefined && req.user !== undefined){
                if (typeof req.user.email !== undefined && program.user === req.user.email) {
                    res.end(program.content);
                }
                else {
                    req.flash("errors", {msg: "No such program exists."});
                }
            }
        }
        else {
            res.end(program.content);
        }
    })
};

//POST /listPrograms : get the list of all programs belonging to a specific user
export let listPrograms = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.user.email);
    Program.find({"user": req.user.email}, (err, programs) => {
        if (err) {
            return next(err);
        }
        res.write(JSON.stringify(programs));
        res.end();
    })
};