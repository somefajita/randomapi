const Main = require("../index.js");

const App = new Main();
App.AppListen(App.Logger(App.SERVER_READY));
// Rearranged for priority.

// Priority 1
App.HandleRequest("get", "/api/:version/:route/:get", (req, res) => {
    App.Logger(`Connection Recieved {${req.originalUrl}}`, true);
    if(App.RouteExists(`/api/${req.params.version}`, __dirname+"/..") && App.VersionIncludes(req.params.version, req.params.route, __dirname+"/.."))
        if(req.params.route == "random" && App.RouteIncludes(req.params.version, "random", req.params.get, __dirname+"/.."))
            return res.redirect(App.RandomImage(req.params.version, req.params.get, __dirname+"/.."), {root:__dirname+"/../api"}, 200)
    return res.sendFile("404.json", {root:__dirname+"/../api"});
});

// Priority 2
App.HandleRequest("get", "/api/:version/:route/:get/:item", (req, res) => {
    return res.sendFile(req.originalUrl.substr(5), {root:__dirname+"/../api"})
});

// Priority 3
App.HandleRequest("get", "/api/:version/", (req, res) => {
    App.Logger(`Connection Recieved {${req.originalUrl}}`, true);
    if(App.RouteExists(req.originalUrl, __dirname+"/.."))
        return res.sendFile(`${req.params.version}/index.json`, {root:__dirname+"/../api"});
    return res.sendFile("404.json", {root:__dirname+"/../api"});
});

// Priority 4
App.HandleRequest("all", "*", (req, res) => {
    App.Logger(`Connection Recieved {${req.originalUrl}}`, true);
    return res.sendFile("404.json", {root:__dirname+"/../api"});
});