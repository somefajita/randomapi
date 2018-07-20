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

    VersionIncludes(Version, Route, RootDir) {
        const { readFileSync } = require("fs"),
            version = JSON.parse(readFileSync(`${RootDir}/api/${Version}/index.json`).toString());
        if(version.routes[Route]) return true;
        return false;
    }

    RouteIncludes(Version, Route, Get, RootDir) {
        const { readFileSync } = require("fs"),
            version = JSON.parse(readFileSync(`${RootDir}/api/${Version}/index.json`).toString());
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
        return console.log(this._LOGGER_MESSAGE);
    }
    
    AppListen(cb) {
        return this._APP.listen(this.PORT, cb)
    }

    HandleRequest(Type, Route, Handler) {
        return this._APP[Type](Route, Handler);
    }
}

module.exports = Main;