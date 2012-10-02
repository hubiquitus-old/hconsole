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

var config = {
    name: 'HubotLauncher',
    logFile: 'HubotLauncher.log',
    logLevel: 'debug',
    hubiquitus: {
        actor: 'hubotlauncher@localhost',
        password: 'hubotlauncher',
        endpoints: ['http://localhost:8080']
    },
    actorOpts: {
        confPath: 'deploy/HubotConf.cfg',
        deployementPath: '/Users/nadim/Documents/projets/en_cours/HubotLauncher/HubotLauncher/lib/deploy/',
        archivesPath: '/Users/nadim/Documents/projets/en_cours/HubotLauncher/HubotLauncher/lib/archive/',
        javaPath: '/usr/lib/jvm/java-7-openjdk-amd64/bin/java',
        mongoURI: 'mongodb://localhost/hnode',
        hubotLauncherChannelJid: '#hubotlauncher@localhost',
        hubotLauncherAllowedJid: {'admin@localhost': true}
    }
}

exports.config = config;