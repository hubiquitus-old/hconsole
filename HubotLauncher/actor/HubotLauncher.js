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
var fs = require('fs');
var utilUuid = require('node-uuid');
var events = require('events').EventEmitter;
var spawn = require('child_process').spawn;
var util = require('util');
var hClient = require('hubiquitusjs').hClient;
var hResultStatus = require('hubiquitusjs').hResultStatus;

var HubotLauncher = function() {
    events.call(this);
    this.bots = {};
    this.archives = [];
}

util.inherits(HubotLauncher, events);

HubotLauncher.prototype.init = function() {
    log.info("HubotLauncher init");

    //first read conf
    this.conf = this.readConf(this.opts.confPath);
    log.debug("Read conf : ", this.conf);

    this.watchArchiveFolder();

    //Test deploy bot
    /*this.deployBot("bot1", "archive/Bot1.zip", function(successful, botInfos, err) {
        if(successful)
            log.info("Succesfully deployed bot with infos : ", botInfos);
        else
            log.info("Error trying to deploy bot : ", err);
    }); */

    //Test undeploy bot
    /*var bot = this.bots["607a3b44-7bce-4419-98c7-72478a466166"];
    this.undeployBot(bot.botInfos, function(successful, err) {
        if(successful)
            log.info("Succesfully undeployed bot with infos : ", bot.botInfos);
        else
            log.info("Error trying to undeploy bot : ", err);
    });*/

    //test start bot
    /*var bot = this.bots["a4e856c5-7582-4bf3-977b-7cb46a60a105"];
    this.startBot(bot, function(successful, err) {
        if(successful)
            log.info("Succesfully started bot");
        else
            log.info("Error trying to start bot : ", err);
    });*/

    //test stop bot
    /*var self = this;
    setTimeout(function() {
        self.stopBot(bot, function(successful, err) {
            if(successful)
                log.info("Succesfully stopped bot");
            else
                log.info("Error trying to stop bot : ", err);
        })
    }, 3000); */

    this.initialized();
}

HubotLauncher.prototype.stop = function() {
    log.info("HubotLauncher stop");
}

HubotLauncher.prototype.onMessage = function(hMessage) {
    log.debug("HubotLauncher onMessage : ", hMessage);
    var self = this;
    var publisherBareJid = hClient.splitJID(hMessage.publisher)[0] + '@' + hClient.splitJID(hMessage.publisher)[1];
    if((this.opts.hubotLauncherAllowedJid)[publisherBareJid]) { //check if user is allowed
        if(hMessage.type == 'hCommand') {
            if(hMessage.payload.cmd == 'deploy') {
                this.deployBot(hMessage.payload.params.botName, hMessage.payload.params.archiveName, function(successful, botInfos, err) {
                    if(successful) {
                        log.info("Succesfully deployed bot with infos : ", botInfos);
                        var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.OK, botInfos.uuid);
                        hClient.send(result);

                        self.notifyDeployed(botInfos);
                    } else {
                        log.info("Error trying to deploy bot : ", err);
                        var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.TECH_ERROR, err);
                        hClient.send(result);
                    }
                });
            } else if(hMessage.payload.cmd == 'getArchives') {
                var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.OK, this.archives);
                hClient.send(result);
            } else if(hMessage.payload.cmd == 'getBots') {
                var infosToSend = [];
                for(var key in this.bots) {
                    if(this.bots.hasOwnProperty(key)) {
                        var botInfosToSend = this.botInfosToSendInfos(this.bots[key].botInfos);
                        infosToSend.push(botInfosToSend);
                    }
                }

                var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.OK, infosToSend);
                hClient.send(result);
            } else if(hMessage.payload.cmd == 'undeploy') {
                var bot = this.bots[hMessage.payload.params.uuid];

                if(typeof bot === 'object') {
                    this.undeployBot(bot.botInfos, function(successful, err) {
                        if(successful) {
                            log.info("Succesfully undeployed bot with infos : ", bot.botInfos);
                            var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.OK);
                            hClient.send(result);

                            self.notifyUndeployed(bot.botInfos);
                        } else {
                            log.info("Error trying to undeploy bot : ", err);
                            var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.TECH_ERROR, err);
                            hClient.send(result);
                        }
                    });
                } else {
                    log.info("Error trying to undeploy bot : invalid uuid");
                    var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.TECH_ERROR, err);
                    hClient.send(result);
                }
            } else if(hMessage.payload.cmd == 'start') {
                var bot = this.bots[hMessage.payload.params.uuid];

                if(typeof bot === 'object') {
                    this.startBot(bot, function(successful, err) {
                        if(successful) {
                            log.info("Succesfully started bot : ", bot);
                            var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.OK);
                            hClient.send(result);

                            //self.notifyStarted(bot.botInfos);
                        } else {
                            log.info("Error trying to start bot : ", err);
                            var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.TECH_ERROR, err);
                            hClient.send(result);
                        }
                    });
                } else {
                    log.info("Error trying to start bot : invalid uuid");
                    var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.TECH_ERROR, err);
                    hClient.send(result);
                }
            } else if(hMessage.payload.cmd == 'stop') {
                var bot = this.bots[hMessage.payload.params.uuid];

                if(typeof bot === 'object') {
                    this.stopBot(bot, function(successful, err) {
                        if(successful) {
                            log.info("Succesfully stopped bot : ", bot);
                            var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.OK);
                            hClient.send(result);

                            //self.notifyStopped(bot.botInfos);
                        } else {
                            log.info("Error trying to stop bot : ", err);
                            var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.TECH_ERROR, err);
                            hClient.send(result);
                        }
                    });
                } else {
                    log.info("Error trying to stop bot : invalid uuid");
                    var result = hClient.buildResult(hMessage.publisher, hMessage.msgid, hResultStatus.TECH_ERROR, err);
                    hClient.send(result);
                }
            }
        }
    }
    //this.hClient.send({actor: hMessage.publisher, type: "test2"});
}

HubotLauncher.prototype.notifyBotStatus = function(status, bot, msg) {
    bot.botInfos.status = status;

    var infosToSend = this.botInfosToSendInfos(bot.botInfos);
    var botStatus = hClient.buildMessage(this.opts.hubotLauncherChannelJid, 'bot', {status: status, botInfos:infosToSend});
    hClient.send(botStatus);

    console.log("status : ", status, " msg : ", msg);
}

HubotLauncher.prototype.notifyNewArchive = function(archiveName) {
    var archiveStatus = hClient.buildMessage(this.opts.hubotLauncherChannelJid, 'archive', {status: 'added', archiveName:archiveName});
    hClient.send(archiveStatus);
    log.debug("Notifying new archive : " + archiveName);
}

HubotLauncher.prototype.notifyRemovedArchive = function(archiveName) {
    var archiveStatus = hClient.buildMessage(this.opts.hubotLauncherChannelJid, 'archive', {status: 'removed', archiveName:archiveName});
    hClient.send(archiveStatus);
    log.debug("Notifying archive removal : " + archiveName);
}

HubotLauncher.prototype.notifyDeployed = function(botInfos) {
    var infosToSend = this.botInfosToSendInfos(botInfos);
    var botStatus = hClient.buildMessage(this.opts.hubotLauncherChannelJid, 'bot', {status: 'deployed', botInfos:infosToSend});
    hClient.send(botStatus);
    log.debug("Notifying deployed status : " + botStatus);
}

HubotLauncher.prototype.notifyUndeployed = function(botInfos) {
    var infosToSend = this.botInfosToSendInfos(botInfos);
    var botStatus = hClient.buildMessage(this.opts.hubotLauncherChannelJid, 'bot', {status: 'undeployed', botInfos:infosToSend});
    hClient.send(botStatus);
    log.debug("Notifying undeployed status : " + botStatus);
}

/*HubotLauncher.prototype.notifyStopped = function(botInfos) {
    var infosToSend = this.botInfosToSendInfos(botInfos);
    var botStatus = hClient.buildMessage(this.opts.hubotLauncherChannelJid, 'bot', {status: 'stopped', botInfos:infosToSend});
    hClient.send(botStatus);
    log.debug("Notifying stopped status : " + botStatus);
}

HubotLauncher.prototype.notifyStarted = function(botInfos) {
    var infosToSend = this.botInfosToSendInfos(botInfos);
    var botStatus = hClient.buildMessage(this.opts.hubotLauncherChannelJid, 'bot', {status: 'started', botInfos:infosToSend});
    hClient.send(botStatus);
    log.debug("Notifying started status : " + botStatus);
}*/

HubotLauncher.prototype.readConf = function(path) {
    if(!fs.existsSync(path))
        return {};

    var data = fs.readFileSync(path);
    var content = data.toString();
    var conf = eval('(' + content + ')') || {};

    for(var uuid in conf.deployed) {
        if(conf.deployed.hasOwnProperty(uuid)) {
            conf.deployed[uuid].status = "stopped";
            this.createBot(conf.deployed[uuid]);
        }
    }

    return conf;
}

HubotLauncher.prototype.saveConf = function(conf, path) {
    var content = JSON.stringify(conf);
    fs.writeFile(path, content, function (err) {
        if (err) log.error("Error trying to save configuration");
        log.info('Configuration saved');
    });
}

HubotLauncher.prototype.deployBot = function(botName, archiveFile, cb) {
    var archivePath = undefined;
    for(var i = 0; i < this.archives.length;  i++) {
        if(this.archives[i] === archiveFile) {
            archivePath = this.opts.archivesPath + '/' + this.archives[i];
        }
    }

    if(!archivePath)
        cb(false, null, "No archive named : " + archiveFile);
    var botInfos = this.createBotInfos(botName);

    var patternJava = /^(java)(.*)/i;
    var patternJs = /^(js)(.*)/i;

    if(archiveFile.match(patternJava))
        this.deployJavaBot(botInfos, archivePath, cb);
    else if(archiveFile.match(patternJs))
        this.deployJsBot(botInfos, archivePath, cb);
}

HubotLauncher.prototype.deployJsBot = function(botInfos, archiveFile, cb) {
    botInfos.type = 'js';
    var self = this;

    this.unzip(botInfos, archiveFile, function(succesful, err) {
        if(!succesful) {
            cb(succesful, null, err);
            return;
        }

        fs.mkdir(botInfos.path + "/logs", function(err){
            if(err) {
                cb(false, null, err);
                return;
            }

            //add to conf and save it
            if(!self.conf.deployed)
                self.conf.deployed = {};

            self.conf.deployed[botInfos.uuid] = botInfos;
            self.saveConf(self.conf, self.opts.confPath);

            if(succesful) {
                self.createBot(self.conf.deployed[botInfos.uuid]);
            }

            cb(succesful, botInfos, err);
        });
    });
}

HubotLauncher.prototype.deployJavaBot = function(botInfos, archiveFile, cb) {
    botInfos.type = 'java';
    var self = this;

    this.unzip(botInfos, archiveFile, function(succesful, err) {
        if(!succesful) {
            cb(succesful, null, err);
            return;
        }

        fs.mkdir(botInfos.path + "/logs", function(err){
            if(err) {
                cb(false, null, err);
                return;
            }

            //add to conf and save it
            if(!self.conf.deployed)
                self.conf.deployed = {};

            self.conf.deployed[botInfos.uuid] = botInfos;
            self.saveConf(self.conf, self.opts.confPath);

            if(succesful) {
                self.createBot(self.conf.deployed[botInfos.uuid]);
            }

            cb(succesful, botInfos, err);
        });
    });
}

HubotLauncher.prototype.undeployBot = function(botInfos, cb) {
    var self = this;

    var remove = function(botInfos, cb) {
        //remove bot folder
        fs.exists(botInfos.path, function(exists) {
            if(!exists) {
                delete self.bots[botInfos.uuid];
                delete self.conf.deployed[botInfos.uuid];
                self.saveConf(self.conf, self.opts.confPath);

                cb(true);
                return;
            }

            fs.removeRecursive(botInfos.path, function(err) {
                if(err) {
                    cb(false, err);
                    return;
                }

                delete self.bots[botInfos.uuid];
                delete self.conf.deployed[botInfos.uuid];
                self.saveConf(self.conf, self.opts.confPath);

                self.saveConf(self.conf, self.opts.confPath);
                cb(true);
            });
        });
    }

    //stop bot first
    if(botInfos.status == "stopped") {
        remove(botInfos, cb);
        return;
    }


    var bot = this.bots[botInfos.uuid];
    this.stopBot(bot, function(succes, err) {
        remove(botInfos, cb);
        return;
    });

}

HubotLauncher.prototype.startBot = function(bot, cb) {
    if(!(bot.botInfos.status == "stopped")) {
        cb(false, "Bot not stopped. Current status : " + bot.botInfos.status);
        return;
    }

    if(bot.botInfos.type == "js")
        this.startJsBot(bot, cb);
    else if(bot.botInfos.type == "java")
        this.startJavaBot(bot, cb);
}

HubotLauncher.prototype.startJsBot = function(bot, cb) {
    var args = [bot.botInfos.confPath + "/config.js", bot.botInfos.logFile];
    bot.child = spawn(bot.botInfos.binPath + "/lib/ActorLauncher.js", args, {cwd: bot.botInfos.binPath});

    var self = this;

    self.notifyBotStatus.call(self, "started", bot);
    cb(true);

    bot.child.on('exit', function (code, signal) {
        self.notifyBotStatus.call(self, "stopped", bot, "Stopped with code " + code + " and signal " + signal);
    });
}

HubotLauncher.prototype.startJavaBot = function(bot, cb) {
    //-cp ${BOT_CONF}:${BOT_DIR}/* ${BOT_CLASS}
    var args = ["-cp", bot.botInfos.confPath + ":" + bot.botInfos.binPath + "/*", bot.botInfos.name, "-Xms128m", "-Xmx256m"];
    bot.child = spawn(this.opts.javaPath, args, {cwd: bot.botInfos.binPath});

    var self = this;

    self.notifyBotStatus.call(self, "started", bot);
    cb(true);

    bot.child.on('exit', function (code, signal) {
        self.notifyBotStatus.call(self, "stopped", bot, "Stopped with code " + code + " and signal " + signal);
    });
}

HubotLauncher.prototype.stopBot = function(bot, cb) {
    if(!(bot.botInfos.status == "started")) {
        cb(false, "Bot not started. Current status : " + bot.botInfos.status);
        return;
    }

    var pkill = spawn('pkill', ['-TERM', '-P', bot.child.pid]);

    var self = this;
    pkill.on('exit', function (code) {
        if(code != 0) {
            cb(false, "Couldn't stop process with pid " + bot.child.pid);
            return;
        }

        delete bot.child;

        self.notifyBotStatus.call(self, "stopped", bot);
        cb(true);
    });
}

HubotLauncher.prototype.unzip = function(botInfos, archiveFile, cb) {
    var zip = spawn('unzip', [archiveFile, '-d', botInfos.path]);

    //set a callback on execution
    zip.on('exit', function (code) {
        if (code !== 0) {
            cb(false, "Couldn't unzip files");
            return;
        }

        //if successful check if we have conf and bin folder
        fs.exists(botInfos.binPath, function(exists) {
            if(!exists) {
                cb(false, "Missing bin folder");
                return;
            }

            fs.exists(botInfos.confPath, function(exists) {
                if(!exists) {
                    fs.rmdir(botInfos.path);
                    cb(false, "Missing conf folder");
                    return;
                }

                botInfos.status = "stopped";
                cb(true, null);
            });
        });
    });
}

HubotLauncher.prototype.watchArchiveFolder = function() {
    //first start reading folder content, then watch it
    var readArchives = fs.readdirSync(this.opts.archivesPath);

    //check if they end with .zip
    var pattern = /^(js|java)(.*)(\.zip)$/i;
    for(var i = 0; i < readArchives.length; i++) {
        if(readArchives[i].match(pattern))
            this.archives.push(readArchives[i]);
    }

    log.debug("Found archives are : ", this.archives);

    var self = this;
    fs.watch(this.opts.archivesPath, function(event, filename) {
        //on update, check files and compare

        fs.readdir(self.opts.archivesPath, function(err, contentToClean) {
            var content = [];
            for(var i = 0; i < contentToClean.length; i++) {
                if(contentToClean[i].match(pattern))
                    content.push(contentToClean[i]);
            }

            for(var i = 0; i < self.archives.length; i++) {
                if(content.indexOf(self.archives[i]) == -1)
                    if(self.archives[i].match(pattern))
                        self.notifyRemovedArchive(self.archives[i]);
            }

            for(var i = 0; i < content.length; i++) {
                if(self.archives.indexOf(content[i]) == -1)
                    if(content[i].match(pattern))
                        self.notifyNewArchive(content[i]);
            }

            self.archives = content;
        });

    })
}

HubotLauncher.prototype.createBotInfos = function(botName) {
    var botInfos = {}; //will hold bot informations

    botInfos.name = botName;
    botInfos.uuid = utilUuid.v4();
    botInfos.path = this.opts.deployementPath + botName + "-" + botInfos.uuid;
    botInfos.status = "stopped";
    botInfos.binPath = botInfos.path + "/bin/";
    botInfos.confPath = botInfos.path + "/conf/";
    botInfos.logFile = botInfos.path + "/logs/" + botInfos.name + ".log";

    return botInfos;
}

HubotLauncher.prototype.botInfosToSendInfos = function(botInfos) {
    var infosToSend = {}; //will hold infos to send

    infosToSend["name"] = botInfos["name"];
    infosToSend.uuid = botInfos.uuid;
    infosToSend.status = botInfos.status;
    infosToSend.type = botInfos["type"];
    infosToSend.logFile = botInfos.logFile;

    return infosToSend;
}

HubotLauncher.prototype.createBot = function(botInfos) {
    var bot = {};

    bot.botInfos = botInfos;
    this.bots[botInfos.uuid] = bot;
}

fs.removeRecursive = function(path,cb){
    var self = this;

    fs.stat(path, function(err, stats) {
        if(err){
            cb(err,stats);
            return;
        }
        if(stats.isFile()){
            fs.unlink(path, function(err) {
                if(err) {
                    cb(err,null);
                }else{
                    cb(null,true);
                }
                return;
            });
        }else if(stats.isDirectory()){
            // A folder may contain files
            // We need to delete the files first
            // When all are deleted we could delete the
            // dir itself
            fs.readdir(path, function(err, files) {
                if(err){
                    cb(err,null);
                    return;
                }
                var f_length = files.length;
                var f_delete_index = 0;

                // Check and keep track of deleted files
                // Delete the folder itself when the files are deleted

                var checkStatus = function(){
                    // We check the status
                    // and count till we r done
                    if(f_length===f_delete_index){
                        fs.rmdir(path, function(err) {
                            if(err){
                                cb(err,null);
                            }else{
                                cb(null,true);
                            }
                        });
                        return true;
                    }
                    return false;
                };
                if(!checkStatus()){
                    for(var i=0;i<f_length;i++){
                        // Create a local scope for filePath
                        // Not really needed, but just good practice
                        // (as strings arn't passed by reference)
                        (function(){
                            var filePath = path + '/' + files[i];
                            // Add a named function as callback
                            // just to enlighten debugging
                            fs.removeRecursive(filePath,function removeRecursiveCB(err,status){
                                if(!err){
                                    f_delete_index ++;
                                    checkStatus();
                                }else{
                                    cb(err,null);
                                    return;
                                }
                            });

                        })()
                    }
                }
            });
        }
    });
};

exports.actor = HubotLauncher;