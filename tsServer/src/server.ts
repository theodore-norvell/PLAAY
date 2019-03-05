import errorHandler from "errorhandler";

import app from "./app";

//provides full stack -- remove for prod
app.use(errorHandler);

//start express server
const server = app.listen(app.get("port"), () => {
    console.log(
        "App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("Use 'kill -9 %d' to stop.\n", process.pid);
});

export default server;
