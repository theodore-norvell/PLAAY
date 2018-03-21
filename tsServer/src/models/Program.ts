import mongoose from "mongoose";

export type ProgramModel = mongoose.Document & {
    name: string,
    content: string,
    user: string,
    version: string,
    private: boolean,
    identifier: string
}

const programSchema = new mongoose.Schema({
    name: String,
    content: String,
    user: String,
    version: String,
    private: Boolean,
    identifier: {type: String, unique: true}
}, {timestamps: true});

const Program = mongoose.model("Program", programSchema);
export default Program;