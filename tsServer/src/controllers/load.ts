import {Request, Response, NextFunction} from "express";
import {default as Program, ProgramModel} from "../models/Program";

//POST /load : load a program's data and put 'er in the editor
export let load = (req: Request, res: Response, next: NextFunction) => {
    Program.findOne({identifier: "test"}, "name content", (err, program : ProgramModel) => {
        if (err) {
            return next(err);
        }
        const content = program.content;
        if (typeof req.user !== undefined) {
            console.log(req.user);
        }
        res.end(content);
    })
};