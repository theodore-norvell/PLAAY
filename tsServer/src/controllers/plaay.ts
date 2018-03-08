import {Request, Response} from "express";

//GET /plaay : start a new instance of plaay
export let newProgram = (req: Request, res: Response) => {
    res.render("plaay", {
        title: "PLAAY"
    });
};
