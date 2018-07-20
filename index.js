class Main {
    constructor(Port) {
        this.PORT = Port ? Port : 80;
        this.SERVER_READY = "Listening on port {PORT}.";
        this._APP = require("express")();
        this._COLORS = require("colors");
    }
    
    RouteExists(Route, RootDir) {
        const { existsSync } = require("fs");
        if(existsSync(RootDir + Route)) return true;
        return false;
    }

    VersionIncludes(Version, Route) {
        const { readFileSync } = require("fs"),
            version = JSON.parse(readFileSync(`./api/${Version}/index.json`).toString());
            if(version.routes[Route]) return true;
            return false;
    }

    RouteIncludes(Version, Route, Get) {
        const { readFileSync } = require("fs"),
            version = JSON.parse(readFileSync(`./api/${Version}/index.json`).toString());
            if(version.routes[Route])
                if(version.routes[Route].includes(Get))
                    return true
            return false;
    }

    RandomImage(Version, Get, RootDir) {
        const { readdirSync } = require("fs"),
            files = readdirSync(`${RootDir}/api/${Version}/random/${Get}/`);
        return `/api/${Version}/random/${Get}/${files[Math.floor(Math.random()*files.length)]}`;
    }

    Format(Input) {
        if(typeof Input !== "string") return Input;
        const StartFormat = Input.indexOf("{") + 1,
            EndFormat = Input.indexOf("}"),
            FinalFormat = Input.replace(`{${Input.substring(StartFormat, EndFormat)}}`, this[Input.substring(StartFormat, EndFormat)]);
        if(StartFormat === 0 || EndFormat === -1) return Input;
        return this.Format(FinalFormat)
    }

    Logger(Message, NoFormat) {
        this._LOGGER_MESSAGE = `[Debug ${(new Date()).toTimeString()}] `.cyan + (NoFormat == true ? Message : this.Format(Message)); // Logging _LOGGER_MESSAGE will cause an infinite loop, so avoid that.
        console.log(this._LOGGER_MESSAGE);
    }
    
    AppListen(cb) {
        this._APP.listen(this.PORT, cb)
    }

    HandleRequest(Type, Route, Handler) {
        this._APP[Type](Route, Handler);
    }
}

const App = new Main();
App.AppListen(App.Logger(App.SERVER_READY));
// Rearranged for priority.

// Priority 1
App.HandleRequest("get", "/api/:version/:route/:get", (req, res) => {
    App.Logger(`Connection Recieved {${req.originalUrl}}`, true);
    if(App.RouteExists(`/api/${req.params.version}`, __dirname) && App.VersionIncludes(req.params.version, req.params.route))
        if(req.params.route == "random" && App.RouteIncludes(req.params.version, "random", req.params.get))
            return res.redirect(App.RandomImage(req.params.version, req.params.get, __dirname), {root:__dirname+"/api"}, 200)
    return res.sendFile("404.json", {root:__dirname+"/api"});
})

// Priority 2
App.HandleRequest("get", "/api/:version/:route/:get/:item", (req, res) => {
    return res.sendFile(req.originalUrl.substr(5), {root:__dirname+"/api"})
})

// Priority 3
App.HandleRequest("get", "/api/:version/", (req, res) => {
    App.Logger(`Connection Recieved {${req.originalUrl}}`, true);
    if(App.RouteExists(req.originalUrl, __dirname))
        return res.sendFile(`${req.params.version}/index.json`, {root:__dirname+"/api"});
    return res.sendFile("404.json", {root:__dirname+"/api"});
});
// Priority 4
App.HandleRequest("all", "*", (req, res) => {
    App.Logger(`Connection Recieved {${req.originalUrl}}`, true);
    return res.sendFile("404.json", {root:__dirname+"/api"});
})