const shell = require("shelljs");

shell.cp("-R", "../typescriptSrc/plaay-style.css", "dist/public/");
shell.cp("-R", "../typescriptSrc/plaay.js", "dist/public/");
shell.cp("-R", "../docs/drawings/logo-small.png", "dist/public/");
shell.cp("-R", "../docs/drawings/faviconit/favicon.ico", "dist/public/");
shell.cp("-R", "../docs/drawings/faviconit/favicon-192.png", "dist/public/");
shell.cp("-R", "../docs/drawings/faviconit/favicon-160.png", "dist/public/");
shell.cp("-R", "../docs/drawings/faviconit/favicon-96.png", "dist/public/");
shell.cp("-R", "../docs/drawings/faviconit/favicon-64.png", "dist/public/");
shell.cp("-R", "../docs/drawings/faviconit/favicon-32.png", "dist/public/");
shell.cp("-R", "../docs/drawings/faviconit/favicon-16.png", "dist/public/");
