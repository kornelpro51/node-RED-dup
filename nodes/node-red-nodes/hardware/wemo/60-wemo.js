/**
 * Copyright 2013 IBM Corp.
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

var RED = require(process.env.NODE_RED_HOME+"/red/red");
var WeMo = new require('wemo');

function WeMoOut(n) {
    RED.nodes.createNode(this,n);
    this.ipaddr = n.ipaddr;
    this.wemoSwitch = new WeMo(n.ipaddr);
    var node = this;

    this.on("input", function(msg) {
        if (msg != null) {
            var state = 0;
            if ( msg.payload == 1 || msg.payload == true || msg.payload == "on" ) { var state = 1; }
            node.wemoSwitch.setBinaryState(state, function(err, result) {
                if (err) node.warn(err);
                //else { node.log(result); }
            });
        }
    });
}
RED.nodes.registerType("wemo out",WeMoOut);

function WeMoIn(n) {
    RED.nodes.createNode(this,n);
    this.ipaddr = n.ipaddr;
    this.wemoSwitch = new WeMo(n.ipaddr);
    this.wemoSwitch.state = 0;
    var node = this;

    var tick = setInterval(function() {
        wemoSwitch.getBinaryState(function(err, result) {
            if (err) node.warn(err);
            if (parseInt(result) != wemoSwitch.state) {
                wemoSwitch.state = parseInt(result);
                node.send({payload:wemoSwitch.state,topic:"wemo/"+node.ipaddr});
            }
        });
    }, 2000);

    this.on("close", function() {
        clearInterval(tick);
    });
}
RED.nodes.registerType("wemo in",WeMoOut);
