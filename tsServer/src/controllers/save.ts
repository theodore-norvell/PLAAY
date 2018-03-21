import {Request, Response, NextFunction} from "express";
import {default as Program, ProgramModel} from "../models/Program";

//POST /save : save this bad boy
export let save = (req: Request, res: Response, next: NextFunction) => {
    const name = req.body.programname;
    const content = req.body.program;
    const program = new Program({
        name: name,
        content: content,
        identifier: "test"
    });

    program.save();
    res.end("yes");
};
