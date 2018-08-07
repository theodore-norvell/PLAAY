const shell = require("shelljs");

shell.cp("-R", "../typescriptSrc/plaay-style.css", "dist/public/");
shell.cp("-R", "../typescriptSrc/plaay.js", "dist/public/");
