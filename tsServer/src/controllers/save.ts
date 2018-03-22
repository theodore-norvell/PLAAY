import {Request, Response, NextFunction} from "express";
import {default as Program, ProgramModel} from "../models/Program";
import crypto from "crypto";

//POST /save : save this bad boy
export let save = (req: Request, res: Response, next: NextFunction) => {
    const name : string = req.body.name;
    const content : string = req.body.program;
    let user : string;
    let isPrivate : boolean;
    let version : number;
    if (typeof req.user !== undefined) {
        user = req.user.email;
        isPrivate = req.body.private;
        Program.findOne().where({user: user, name: name}).sort('-LAST_MOD').exec((err, program : ProgramModel) => {
            if (err) {
                return next(err);
            }
            if (program) {
                version = program.version + 1;
            }
            else {
                version = 1;
            }
        });
    }
    else {
        user = 'public';
        isPrivate = false;
        version = 0;
    }
    const timestamp : string = String(Date.now());
    const identifier : string = crypto.createHash('sha256').update(timestamp).digest('base64').substring(0,11);
    const program = new Program({
        name: name,
        content: content,
        user: user,
        private: isPrivate,
        identifier: identifier,
        version: version
    });

    program.save();
    res.end("yes");
};
