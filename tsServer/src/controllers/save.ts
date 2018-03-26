import {Request, Response, NextFunction} from "express";
import {default as Program, ProgramModel} from "../models/Program";
import crypto from "crypto";

function performSave(res : Response, name : string, content : string, user : string, isPrivate : boolean, version : number)
{
    const timestamp = String(Date.now());
    const identifier : string = crypto.createHash('sha256')
        .update(timestamp + user + content)
        .digest('base64')
        .substring(0,11)
        .replace(/\//g, "-"); //need to replace slashes because they mess up loading by URL
    const program = new Program({
        name: name,
        content: content,
        user: user,
        private: isPrivate,
        identifier: identifier,
        version: version
    });
    program.save();
    res.end(identifier);
}

//POST /save : save this bad boy
export let save = (req: Request, res: Response, next: NextFunction) => {
    const name : string = req.body.name;
    const content : string = req.body.program;
    let user : string;
    let isPrivate : boolean;
    let version : number;
    if (typeof req.user !== undefined && req.user !== undefined) {
        user = req.user.email;
        isPrivate = req.body.private;
        Program.findOne().where({user: user, name: name}).sort('-version').exec((err, program : ProgramModel) => {
            if (err) {
                return next(err);
            }
            if (program) {
                version = program.version + 1;
                performSave(res, name, content, user, isPrivate, version);
            }
            else {
                version = 1;
                performSave(res, name, content, user, isPrivate, version);
            }
        });
    }
    else {
        user = 'public';
        isPrivate = false;
        version = 0;
        performSave(res, name, content, user, isPrivate, version);
    }
};

export let update = (req: Request, res: Response, next: NextFunction) => {
    Program.findOne({identifier: req.body.identifier}, (err, program : ProgramModel) => {
        if (err) {
            return next(err);
        }

        if (program) {
            program.content = req.body.program;
            program.save();
        }

        res.end();
    });
};
