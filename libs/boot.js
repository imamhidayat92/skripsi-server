var express = require('express'),
    fs      = require('fs'),
    config  = require('../config');

module.exports = function(parent, options){
    var verbose = options.verbose;
    var path;

    fs.readdirSync(config.app.base_path + '/controllers').forEach(function(name){
        name = name.substr(0, name.lastIndexOf('.js'));
        var obj = require(config.app.base_path + '/controllers/' + name);
        var app = express();

        if (typeof obj.path != "undefined") path = obj.path;
        else path = "/" + name;
        
        app.use(path, obj);

        if (typeof obj.api != "undefined") {
            path = "/api/" + name;
            app.use(path, obj.api);
        }

        parent.use(app);

    });
};