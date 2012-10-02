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
 
var log = require('winston');
var hubiquitusjs = require('hubiquitusjs')
var hClient = hubiquitusjs.hClient;
var connStatuses = hubiquitusjs.statuses;
var resultStatuses = hubiquitusjs.hResultStatus;


var Launcher = function(msg) {
    var actorWorker = new ActorWorker(msg);
}

/**
 * - setup logger
 * - start hubiquitus uplink
 * - init actor
 * - setup callbacks
 * @param msg - config options read in config.js
 * @constructor
 */
var ActorWorker = function(msg) {
    this.opts = undefined;
    this.actor = undefined;
    this.actorState = "stopped";
    this.Actor = undefined;

    if(msg && msg.opts){
        this.opts = msg.opts;

        this.setupLogger();

        var Actor = require("../actor/" + msg.opts.name).actor;
        this.Actor = Actor;
        if(typeof Actor === 'function'){
            this.actor = new Actor();
            this.actor.hClient = hClient;
            log.info("Starting actor : " + msg.opts.name);
            this.start();
        } else {
            log.error("Couldn't start actor. Missing actor function");
        }
    } else {
        log.error("Couldn't start Actor. Missing options.");
    }
};

ActorWorker.prototype.start = function() {
    this.actorState = "starting";
    log.info("Actor state : starting");

    var self = this;
    hClient.onMessage = function(hMessage) {};
    hClient.onStatus = function(hStatus) { self.onStatus.call(self, hStatus) };
    var hOptions = {endpoints: this.opts.hubiquitus.endpoints, transport: "socketio"};
    hClient.connect(this.opts.hubiquitus.actor, this.opts.hubiquitus.password, hOptions);
}

ActorWorker.prototype.onMessage = function(hMessage) {
    log.debug("Message received : ", hMessage);

    if(typeof this.actor.onMessage === 'function')
        try {
            this.actor.onMessage.call(this.actor, hMessage);
        } catch (err) {
            log.error("Error onMessage : ", err.stack);
        }
}

ActorWorker.prototype.onStatus = function(hStatus) {
    log.debug("Status received : ", hStatus);

    if(hStatus.status == connStatuses.CONNECTED) {
        if(hStatus.errorCode === 0) {
            this.actorState = 'initializing';
            log.info("Actor state : initializing");

            //set actor options
            this.Actor.prototype.opts = this.opts.actorOpts;

            //init actor
            if(typeof this.actor.init == 'function') {
                var self = this;

                //add initialized callback
                this.Actor.prototype.initialized = function() {
                    self.init.call(self);
                };

                try {
                    this.actor.init();
                } catch (err) {
                    log.error("Error while trying to initialize actor : ", err.stack);
                }

            } else {
                this.init();
            }

        } else {
            log.error("Error while trying to connect : ", hStatus);
        }
    } else if(hStatus.status == connStatuses.DISCONNECTED) {
        hClient.onMessage = function(hMessage) {};
        this.actorState = "stopping";
        log.info("Actor state : stopping");

        if(hStatus.errorCode != 0)
            log.error("Disconnected with hStatus ", hStatus);

        if(typeof this.actor.stop == 'function')
            this.actor.stop();

        hClient.actorState = "stopped";
        log.info("Actor state : Stopped");
    }

}

ActorWorker.prototype.init = function() {
    this.Actor.prototype.initialized = undefined;


    this.actorState = 'initialized';
    log.info('Actor state : initialized');

    var self = this;

    hClient.onMessage = function(hMessage) { self.onMessage.call(self, hMessage) };
    this.actorState = 'started';
    log.info('Actor state : started');
}


/**
 * Setup logger.
 * Default level is debug if not defined in config.logLevel
 * Console and file logger. Log file = config.logFile
 */
ActorWorker.prototype.setupLogger = function() {
    if(!this.opts.logLevel)
        this.opts.logLevel = 'debug';

    //reorder levels so debug print everything
    log.setLevels(log.config.syslog.levels);

    log.exitOnError = false;
    if(this.opts.logFile && this.opts.logFile.length > 0)
        log.add(log.transports.File, { filename: this.opts.logFile, handleExceptions: false, level: this.opts.logLevel});

    log.remove(log.transports.Console);
    log.add(log.transports.Console, {handleExceptions: false, level: this.opts.logLevel});

}

//once opts are received
process.once('message', Launcher);