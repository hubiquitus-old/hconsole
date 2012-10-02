/*
 * Copyright (c) Novedia Group 2012.
 *
 *     This file is part of Hubiquitus.
 *
 *     Hubiquitus is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     Hubiquitus is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with Hubiquitus.  If not, see <http://www.gnu.org/licenses/>.
 */
 
#!/usr/bin/env /usr/local/bin/node

var fork = require('child_process').fork;

//For logging
var log = require('winston');

/**
 * actor monitoring process. If bot stop abnormally, it restart it.
 */
function main(){
    var configFile = process.argv[2] || "../config.js";
    var logFile = process.argv[3];
    var opts = require(configFile).config;

    if(logFile)
        opts.logFile = logFile;

    startActor(opts);
}

/**
 * Start the actor worker. It's monitored. If it crashes, it auto restart.
 * @param opts
 */
function startActor(opts) {
    //Fork
    var child = fork(__dirname + '/ActorWorker.js');
    child.send({opts: opts});

    //Set listener for exiting event and properly kill children
    var exitEvents = ['exit', 'SIGINT'];
    for(var i = 0; i < exitEvents.length; i++)
        (function(exitEvent) {
            process.on(exitEvent, function () {
                log.info("Stopping Actor with exit event : " + exitEvent);
                child.kill();
                process.exit();
            });
        })(exitEvents[i]);

    var self = this;

    //Add auto restart system
    child.once('exit', function(code, signal) {
        if(code == null && signal == null) {
            log.error('Actor worker did stop abnormally. Restarting.');
            startActor(opts);
            return;
        }

        log.info('Actor worker stopping with code : ' + code + ' and signal : ' + signal);
    });
}

main();
