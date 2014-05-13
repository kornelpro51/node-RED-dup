/**
 * Copyright 2014 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// If you use this as a template, replace IBM Corp. with your own name.

// Sample Node-RED node file

// Require main module
var RED = require(process.env.NODE_RED_HOME+"/red/red");
var Pusher = require('pusher');
var inspect = require("sys").inspect;

function PusherListenerNode(n) {
    // Create a RED node
    RED.nodes.createNode(this,n);

    var node = this;

    // Store local copies of the node configuration (as defined in the .html)
    node.appId = n.appId;
    node.key = n.key;
    node.secret = n.secret;
    
    node.pusher = new Pusher({
        appId: node.appId,
        key: node.key,
        secret: node.secret
    });
    
    node.on("close", function() {
        
    });
}
RED.nodes.registerType("pusher-listener", PusherListenerNode);

function PusherInNode(n) {
    RED.nodes.createNode(this,n);
    this.pusher = n.app;
    this.url = n.url
    var node = this;
    this.pusherConfig = RED.nodes.getNode(this.pusher);
    if (!this.pusherConfig) {
        this.error("Missing pusher configuration");
    }
    this.response = this.pusherConfig.get( { path: this.url, params: {} } );

    this.on("close", function() {
        if( node.response.statusCode === 200 ) {
            var result = JSON.parse( node.response );
            node.send(msg);
        }
    });
}

RED.nodes.registerType("pusher in",PusherInNode);

// The main node definition - most things happen in here
function PusherOutNode(n) {
    // Create a RED node
    RED.nodes.createNode(this,n);
    var node = this;

    // Store local copies of the node configuration (as defined in the .html)
    this.pusher = n.app;
    this.channel = n.channel;
    this.event = n.event;

    this.pusherConfig = RED.nodes.getNode(this.pusher);
    if (!this.pusherConfig) {
        this.error("Missing pusher configuration");
    }

    this.on("input", function(msg) {
        node.pusherConfig.trigger(node.channel, node.event, msg);
    });
}

// Register the node by name. This must be called before overriding any of the
// Node functions.
RED.nodes.registerType("pusher out",PusherOutNode);
