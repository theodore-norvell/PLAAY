import {Request, Response, NextFunction} from "express";
import {default as Program, ProgramModel} from "../models/Program";

//GET /plaay : start a new instance of plaay
export let newProgram = (req: Request, res: Response) => {
    res.render("plaay", {
        title: "PLAAY",
        user: req.user
    });
};

//GET /p/:programId
export let loadProgram = (req: Request, res: Response, next: NextFunction) => {
    function renderPage(program: ProgramModel) {
        res.render("plaay", {
            title: "PLAAY",
            user: req.user,
            programId: program.identifier
        })
    }

    Program.findOne({identifier: req.params.programId}, (err, program : ProgramModel) => {
        if (err) {
            return next(err);
        }
        if (program) {
            if (program.private) {
                if (typeof req.user !== undefined && req.user !== undefined){
                    if (typeof req.user.email !== undefined && program.user === req.user.email) {
                        renderPage(program);
                    }
                    else {
                        res.status(404).send("Not found");
                    }
                }
                else {
                    res.status(404).send("Not found");
                }
            }
            else {
                renderPage(program);
            }
        }
        else {
            res.status(404).send("Not found");
        }
    });
};
