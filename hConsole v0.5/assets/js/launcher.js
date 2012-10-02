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
 
var hubotLauncherJid = "hubotlauncher@localhost";
var launcherChannelJid = "#hubotlauncher@localhost";
var hnodeJid = "hnode@localhost";
var loginCb = undefined;

var archives = [];
var channels = [];
var bots = [];

var autoIncrementValue = 0;

var channelToModify  = {};


var nextIncrementValue = function() {
    return ++autoIncrementValue;
}

var archiveToId = function(archive) {
    return nameToId(archive);
}

var nameToId = function(name) {
    toRemove = /[.#@ ]/ig;
    var id = name.replace(toRemove,"");
    return id;
}

var onStatus = function(hStatus) {
    console.log("hStatus", hStatus);

    if(loginCb)
        loginCb(hStatus);

    if(hStatus.status == 2) {
        $('#hubStatus').attr('src', 'assets/img/hub_connected.png');
        hClient.subscribe(launcherChannelJid);

        $('#bots .alert').remove();
        $('#bots tbody').html('');
        getBots();
    } else if(hStatus.status == 6)
        $('#hubStatus').attr('src', 'assets/img/hub_disconnected.png');
    else
        $('#hubStatus').attr('src', 'assets/img/hub_connecting.png');
}

var onMessage = function(hMessage) {
    var publisherBareJid = hClient.splitJID(hMessage.publisher)[0] + '@' + hClient.splitJID(hMessage.publisher)[1];
    console.log("onMessage ", hMessage);

    if(publisherBareJid === hubotLauncherJid) {
        if(hMessage.type === 'archive') {
            if(hMessage.payload.status === "added") {
                addArchive(hMessage.payload.archiveName);
            } else if(hMessage.payload.status === "removed") {
                removeArchive(hMessage.payload.archiveName);
            }
        } else if(hMessage.type === 'bot') {
            if(hMessage.payload.status === "deployed") {
                addBot(hMessage.payload.botInfos);
            } else if(hMessage.payload.status === "undeployed") {
                removeBot(hMessage.payload.botInfos);
            }  else if(hMessage.payload.status === "started") {
                updateBot(hMessage.payload.botInfos);
            } else if(hMessage.payload.status === "stopped") {
                updateBot(hMessage.payload.botInfos);
            }
        }
    }
}

$(window).load(function() {
    hClient.onStatus = onStatus;
    hClient.onMessage = onMessage;
});

var login = function(login, password, endpoint) {
    var hOptions = {endpoints: [endpoint]};
    hClient.connect(login, password, hOptions);
}

var deploy = function(archiveName, botName) {
    var deployCallback = function(hMessage) {
        var hResult = hMessage.payload;
        var deployMsg = '';
        if(hResult.status == 0) deployMsg = botName + ' deployed succesfully with archive ' + archiveName + ' with uuid ' + hResult.result;
        else deployMsg = "Couldn't deploy " + botName + " with archive " + archiveName + " with status " + hResult.status + ' errorMsg : ' + hResult.result;

        var alertId = nextIncrementValue();
        var alertType = (hResult.status == 0) ? 'alert-success' : 'alert-error';
        var alertSpan = '<div class="alert ' + alertType + '" id="alert' + alertId + '"><button type="button" class="close" onclick="$(\'#archives #alert' + alertId + '\').hide();">×</button><span>' + deployMsg + '</span></div>';
        $('#archives').prepend(alertSpan);

        $('#archives #' + archiveToId(archiveName) + ' .deployBtn').button('reset');
    }

    var cmdOptions = {timeout: 10000};
    var cmd = hClient.buildCommand(hubotLauncherJid, "deploy", {archiveName:archiveName, botName:botName}, cmdOptions);
    hClient.send(cmd, deployCallback);

    //setTimeout(function() {deployCallback({status: 0, result:"uuid1"})}, 3000);
}

var undeploy = function(uuid) {
    var undeployCallback = function(hMessage) {
        var hResult = hMessage.payload;
        var undeployMsg = '';
        if(hResult.status == 0) undeployMsg = 'bot with uuid ' + uuid + ' succesfully undeployed ';
        else undeployMsg = "Couldn't deploy bot with uuid" + uuid + " with status " + hResult.status + ' errorMsg : ' + hResult.result;

        var alertId = nextIncrementValue();
        var alertType = (hResult.status == 0) ? 'alert-success' : 'alert-error';
        var alertSpan = '<div class="alert ' + alertType + '" id="alert' + alertId + '"><button type="button" class="close" onclick="$(\'#bots #alert' + alertId + '\').hide();">×</button><span>' + undeployMsg + '</span></div>';
        $('#bots').prepend(alertSpan);

        $('#bots #' + nameToId(uuid) + ' .undeployBtn').button('reset');
        $('#bots #' + nameToId(uuid) + ' .startStopBtn').button('reset');
    }

    var cmdOptions = {timeout: 10000};
    var cmd = hClient.buildCommand(hubotLauncherJid, "undeploy", {uuid:uuid}, cmdOptions);
    hClient.send(cmd, undeployCallback);

    //setTimeout(function() {deployCallback({status: 0, result:"uuid1"})}, 3000);
}

var startBot = function(uuid) {
    var startBotCallback = function(hMessage) {
        var hResult = hMessage.payload;
        var startMsg = '';
        if(hResult.status == 0) startMsg = 'bot with uuid ' + uuid + ' succesfully started ';
        else startMsg = "Couldn't start bot with uuid" + uuid + " with status " + hResult.status + ' errorMsg : ' + hResult.result;

        var alertId = nextIncrementValue();
        var alertType = (hResult.status == 0) ? 'alert-success' : 'alert-error';
        var alertSpan = '<div class="alert ' + alertType + '" id="alert' + alertId + '"><button type="button" class="close" onclick="$(\'#bots #alert' + alertId + '\').hide();">×</button><span>' + startMsg + '</span></div>';
        $('#bots').prepend(alertSpan);

        $('#bots #' + nameToId(uuid) + ' .undeployBtn').button('reset');
        $('#bots #' + nameToId(uuid) + ' .startStopBtn').button('reset');
        $('#bots #' + nameToId(uuid) + ' .startStopBtn').text('Stop');

    }

    var cmdOptions = {timeout: 10000};
    var cmd = hClient.buildCommand(hubotLauncherJid, "start", {uuid:uuid}, cmdOptions);
    hClient.send(cmd, startBotCallback);

    //setTimeout(function() {deployCallback({status: 0, result:"uuid1"})}, 3000);
}

var stopBot = function(uuid) {
    var stopBotCallback = function(hMessage) {
        var hResult = hMessage.payload;
        var stopMsg = '';
        if(hResult.status == 0) stopMsg = 'bot with uuid ' + uuid + ' succesfully stopped ';
        else stopMsg = "Couldn't stop bot with uuid" + uuid + " with status " + hResult.status + ' errorMsg : ' + hResult.result;

        var alertId = nextIncrementValue();
        var alertType = (hResult.status == 0) ? 'alert-success' : 'alert-error';
        var alertSpan = '<div class="alert ' + alertType + '" id="alert' + alertId + '"><button type="button" class="close" onclick="$(\'#bots #alert' + alertId + '\').hide();">×</button><span>' + stopMsg + '</span></div>';
        $('#bots').prepend(alertSpan);

        $('#bots #' + nameToId(uuid) + ' .undeployBtn').button('reset');
        $('#bots #' + nameToId(uuid) + ' .startStopBtn').button('reset');
        $('#bots #' + nameToId(uuid) + ' .startStopBtn').text('Start');
    }

    var cmdOptions = {timeout: 10000};
    var cmd = hClient.buildCommand(hubotLauncherJid, "stop", {uuid:uuid}, cmdOptions);
    hClient.send(cmd, stopBotCallback);

    //setTimeout(function() {deployCallback({status: 0, result:"uuid1"})}, 3000);
}

var addArchive = function(archiveName) {
    var archiveId = archiveToId(archiveName);
    var row = '<tr id="' + archiveId + '"><td>' + archiveName + '</td><td><button class="btn btn-primary deployBtn" type="button" data-loading-text="deploying...">Deploy</button></td></tr>'

    $('#archives tbody').append(row);

    $('#archives #' + archiveId + ' .deployBtn').click(function(ev) {
        $('#archives #' + archiveId + ' .deployBtn').button('loading');
        $('#botNameView #inputArchiveName').val(archiveName);
        $('#botNameView').modal({show: true, backdrop: 'static', keyboard:false});
    });
}

var addBot = function(botInfos) {

    var botId = nameToId(botInfos.uuid);
    var row = '<tr id="' + botId + '"><td class="botName">' + botInfos.name + '</td><td class="botUuid">' + botInfos.uuid + '</td><td class="botType">' + botInfos.type + '</td><td class="botStatus">' + botInfos.status + '</td><td><button class="btn btn-primary infosBtn" type="button">Infos</button></td><td><button class="btn btn-primary startStopBtn" type="button" data-loading-text="Updating...">Start</button></td><td><button class="btn btn-primary undeployBtn" type="button" data-loading-text="Updating...">Undeploy</button></td></tr>'

    $('#bots tbody').append(row);

    $('#bots #' + botId + ' .infosBtn').click(function(ev) {
        //$('#botNameView #inputArchiveName').val(archiveName);
        //$('#botNameView').modal({show: true, backdrop: 'static', keyboard:false});
    });

    $('#bots #' + botId + ' .startStopBtn').click(function(ev) {
        $('#bots #' + botId + ' .undeployBtn').button('loading');
        $('#bots #' + botId + ' .startStopBtn').button('loading');

        if($('#bots #' + botId + ' .botStatus').text() == 'stopped')
            startBot(botInfos.uuid);
        else if($('#bots #' + botId + ' .botStatus').text() == 'started')
            stopBot(botInfos.uuid);
    });

    $('#bots #' + botId + ' .undeployBtn').click(function(ev) {
        $('#bots #' + botId + ' .undeployBtn').button('loading');
        $('#bots #' + botId + ' .startStopBtn').button('loading');
        undeploy(botInfos.uuid);
    });
}

var updateBot = function(botInfos) {

    var botId = nameToId(botInfos.uuid);
    //var row = '<td>' + botInfos.name + '</td><td>' + botInfos.uuid + '</td><td>' + botInfos.type + '</td><td class="botStatus">' + botInfos.status + '</td><td><button class="btn btn-primary infosBtn" type="button">Infos</button></td><td><button class="btn btn-primary startStopBtn" type="button" data-loading-text="Updating...">Start</button></td><td><button class="btn btn-primary undeployBtn" type="button" data-loading-text="Updating...">Undeploy</button></td>'

    //$('#bots #' + botId).html(row);

    $('#bots #' + botId + ' .botName').text(botInfos.name);
    $('#bots #' + botId + ' .botUuid').text(botInfos.uuid);
    $('#bots #' + botId + ' .botType').text(botInfos.type);
    $('#bots #' + botId + ' .botStatus').text(botInfos.status);

    var btnTxt = "";
    if(botInfos.status == 'started')
        btnTxt = "Stop";
    else if(botInfos.status == 'stopped')
        btnTxt = "Start";

    //$('#bots #' + botId + ' .startStopBtn').text(btnTxt);
}

var removeBot = function(botInfos) {
    var botId = nameToId(botInfos.uuid);
    $('#bots #' + botId).remove();
}

var removeArchive = function(archiveName) {
    var archiveId = archiveToId(archiveName);
    console.log("archive id to remove : " + archiveId, $('#archives #' + archiveId));
    $('#archives #' + archiveId).remove();
}

var getArchives = function() {
    var cmdOptions = {timeout: 3000};
    var cmd = hClient.buildCommand(hubotLauncherJid, "getArchives", null, cmdOptions);
    hClient.send(cmd, function(hMessage) {
        if(hMessage.payload.status != 0) {
            var alertId = nextIncrementValue();
            var alertType = 'alert-error';
            var alertSpan = '<div class="alert ' + alertType + '" id="alert' + alertId + '"><button type="button" class="close" onclick="$(\'#archives #alert' + alertId + '\').hide();">×</button><span>' + "Error retrieving archives : " + hMessage.payload.result + '</span></div>';
            $('#archives').prepend(alertSpan);
        } else {
            for(var i =0; i < hMessage.payload.result.length; i++) {
                addArchive(hMessage.payload.result[i]);
            }
        }
    });
}

var getChannels = function() {
    var cmdOptions = {timeout: 3000};
    var cmd = hClient.buildCommand(hnodeJid, "hgetchannels", null, cmdOptions);
    clearChannelsList();
    hClient.send(cmd, function(hMessage) {
        if(hMessage.payload.status != 0) {
            $('#channels .alert span').text("Error retrieving archives : " + hMessage.payload.result);
            $('#channels .alert').show();
        } else {
            channels = hMessage.payload.result;
            for(var i = 0; i < channels.length; i++) {
                var channel = channels[i];
                addChannelToList(channel);
            }
        }
    });
}

var getBots = function() {
    var cmdOptions = {timeout: 3000};
    var cmd = hClient.buildCommand(hubotLauncherJid, "getBots", null, cmdOptions);
    hClient.send(cmd, function(hMessage) {
        if(hMessage.payload.status != 0) {
            var alertId = nextIncrementValue();
            var alertType = 'alert-error';
            var alertSpan = '<div class="alert ' + alertType + '" id="alert' + alertId + '"><button type="button" class="close" onclick="$(\'#bots #alert' + alertId + '\').hide();">×</button><span>' + "Error retrieving bots : " + hMessage.payload.result + '</span></div>';
            $('#bots').prepend(alertSpan);
        } else {
            for(var i =0; i < hMessage.payload.result.length; i++) {
                addBot(hMessage.payload.result[i]);
            }

            bots = hMessage.payload.result;
        }
    });
}

var removeChannel = function() {
    var cmdOptions = {timeout: 3000};
    var cmd = hClient.buildCommand(hnodeJid, "hgetchannels", null, cmdOptions);
    clearChannelsList();
    hClient.send(cmd, function(hMessage) {
        if(hMessage.payload.status != 0) {
            $('#channels .alert span').text("Error retrieving archives : " + hMessage.payload.result);
            $('#channels .alert').show();
        } else {
            channels = hMessage.payload.result;
            for(var i = 0; i < channels.length; i++) {
                var channel = channels[i];
                addChannelToList(channel);
            }
        }
    });
}

var addChannelToList = function(channel) {
    var channelId = nameToId(channel.actor);

    var row = '<tr id="' + channelId + '"><td>' + channel.actor + '</td><td>' + channel.owner + '</td><td><button class="btn btn-inverse modifyBtn" type="button" disabled>Modify</button></td></tr>';
    if(channel.owner === hClient.publisher)
        row = '<tr id="' + channelId + '"><td>' + channel.actor + '</td><td>' + channel.owner + '</td><td><button class="btn btn-primary modifyBtn" type="button">Modify</button></td></tr>';

    $('#channels tbody').append(row);

    if(channel.owner === hClient.publisher)
        $('#channels #' + channelId + ' .modifyBtn').click(function(ev) {
            showUpdateChannelView(channel.actor);
        });
}

var clearChannelsList = function() {
    $('#channels tbody tr').remove();
}

var resetChannelToModify = function() {
    channelToModify = {};
    channelToModify.owner = hClient.publisher;
    channelToModify.active = true;
    channelToModify.type = "channel";
};

var showUpdateChannelView = function(channelActor) {

    if(channelActor) {
        for(var i = 0; i < channels.length; i++) {
            if(channelActor === channels[i].actor)
                channelToModify = eval('(' + JSON.stringify(channels[i]) + ')');
        }
    }

    if(channelToModify.actor && channelToModify.actor.length > 0)
        $('#updateChannelView #inputActor').val(channelToModify.actor);

    if(channelToModify.owner && channelToModify.owner.length > 0)
        $('#updateChannelView #inputOwner').val(channelToModify.owner);

    if(channelToModify.subscribers && channelToModify.subscribers.length > 0)
        $('#updateChannelView #inputSubscribers').val(channelToModify.subscribers.join());

    if(channelToModify.filter && channelToModify.filter.length > 0)
        $('#updateChannelView #inputFilter').val(JSON.stringify(channelToModify.filter));

    if(channelToModify.active)
        $('#updateChannelView #enabledRadio').attr('checked', 'checked');
    else
        $('#updateChannelView #disabledRadio').attr('checked', 'checked');

    $('#updateChannelView').modal({show: true, backdrop: 'static', keyboard:false});
}

var saveChannel = function() {
    $('#updateChannelView #inputActor').attr('disabled','disabled');
    $('#updateChannelView #inputSubscribers').attr('disabled','disabled');
    $('#updateChannelView #inputFilter').attr('disabled','disabled');
    $('#updateChannelView #enabledRadio').attr('disabled','disabled');
    $('#updateChannelView #disabledRadio').attr('disabled','disabled');
    $('#updateChannelView .btn-inverse').attr('disabled', 'disabled');
    $('#updateChannelView .modifyBtn').button('loading');

    if($('#updateChannelView #inputActor').val().length > 0)
        channelToModify.actor = $('#updateChannelView #inputActor').val();
    else
        delete channelToModify.actor;

    if($('#updateChannelView #inputSubscribers').val().length > 0)
        channelToModify.subscribers = $('#updateChannelView #inputSubscribers').val().replace(" ", "").split(',');
    else
        delete channelToModify.subscribers;

    if($('#updateChannelView #inputFilter').val().length > 0)
        channelToModify.filter = $('#updateChannelView #inputFilter').val();
    else
        delete channelToModify.filter;

    if($('#updateChannelView #enabledRadio').attr("checked"))
        channelToModify.active = true;
    else
        channelToModify.active = false;

    var cmdOptions = {timeout: 3000};
    var cmd = hClient.buildCommand(hnodeJid, "hcreateupdatechannel", channelToModify, cmdOptions);
    hClient.send(cmd, function(hMessage) {
        if(hMessage.payload.status != 0) {
            $('#updateChannelView .alert span').text("Error saving channel : " + hMessage.payload.result);
            $('#updateChannelView .alert').show();
        } else {
            getChannels();
            $('#updateChannelView').modal('hide');
        }

        $('#updateChannelView #inputActor').removeAttr('disabled');
        $('#updateChannelView #inputSubscribers').removeAttr('disabled');
        $('#updateChannelView #inputFilter').removeAttr('disabled');
        $('#updateChannelView #enabledRadio').removeAttr('disabled');
        $('#updateChannelView #disabledRadio').removeAttr('disabled');
        $('#updateChannelView .btn-inverse').removeAttr('disabled');
        $('#updateChannelView .modifyBtn').button('reset');
    });
}
