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
 

var mongo = require('mongodb'),
    log = require('winston');

//Events
var util = require('util'),
    events = require('events').EventEmitter;

var mongoCodes = require('./codes.js').mongoCodes;

var Db = function(){
    this.db = null;
    this.server = null;
    this.status = mongoCodes.DISCONNECTED;
    this.collections = [];

    events.call(this);
};
util.inherits(Db, events);

/**
 * Connects to a server and then gives access to the database. Once
 * connected emits the event 'connect'. If already connected to a database
 * it will just emit the event.
 * @param uri - address of the database in the form: mongodb://<host>[:port]/<db>
 * @param opts - [Optional] options object as defined in http://mongodb.github.com/node-mongodb-native/api-generated/server.html
 */
Db.prototype.connect = function(uri, opts){
    var self = this;

    //Already connected
    if(this.status == mongoCodes.CONNECTED ){
        this.emit('connect');
        return;
    }

    //Create regex to parse/test URI
    var matches = /^mongodb:\/\/(\w+)(:(\d+)|)\/(\w+)$/.exec(uri);

    //Test URI
    if(matches != null){
        //Parse URI
        var host = matches[1],
            port = parseInt(matches[3]) || 27017,
            dbName = matches[4];

        //Create the Server and the DB to access mongo
        this.server = new mongo.Server(host, port, opts);
        this.db = new mongo.Db(dbName, this.server);

        //Connect to Mongo
        this.db.open(function(err, db){

            if(!err)
                self.emit('connect');
            else //Error opening database
                self.emit('error', {
                    code: mongoCodes.TECH_ERROR,
                    msg: 'Could not open mongo database' + err
                });
        });
    } else {//Invalid URI
        this.emit('error', {
            code: mongoCodes.INVALID_URI,
            msg: 'the URI ' + uri + ' is invalid'
        });
    }
};

/**
 * Disconnects from the database. When finishes emits the event 'disconnect'
 * If there is no connection it will automatically emit the event disconnect
 */
Db.prototype.disconnect = function(){

    if( this.status == codes.mongoCodes.CONNECTED ){
        var self = this;
        this.db.close(true, function(){
            self.status = mongoCodes.DISCONNECTED;
            self.emit('disconnect');
        });
    } else { //Not Connected
        this.emit('disconnect');
    }
};

/**
 * This method returns the collection
 * @param collection - The collection name to recover.
 * @return the collection object.
 */
Db.prototype.get = function(collection){
    var col = this.db.collection(collection);
    this.collections[collection] = col;

    return this.collections[collection];
};

exports.db = new Db();