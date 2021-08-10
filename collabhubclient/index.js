// --------------------------------------------------------------------------
// This is the javascript library required for interactive data retrieval from
// the PD-based Collab-Hub (client).
// Authors: Nick Hwang, Tony T Marasco, Eric Sheffield
// Contact: nickthwang@gmail.com
// --------------------------------------------------------------------------

import { io } from "socket.io-client";
// future versions will require other environment libraries (like OSC, P5.js, etc)
import { PDClient } from "./pd-lib.cjs";
import { OSCClient } from "./osc-lib.js";
import { NORNSClient } from "./norns-lib.js";

export const MESSAGETYPE = {
  EVENT: "event",
  CONTROL: "control",
  CHAT: "chat",
};

export const ENVIRONMENT = {
  ARDUINO: "arduino",
  PD: "pd",
  MAX: "max",
  PROCESSING: "processing",
  UNITY: "unity",
  OSC: "osc",
  NORNS: "norns",
};

// most current server is V3
export const CH = {
  V1: "http://remote-collab.herokuapp.com",
  V2: "http://collab-hub-v2.herokuapp.com",
  V3: "https://ch-server.herokuapp.com",
  Testing: "https://ch-testing.herokuapp.com",
  LOCAL: "http://localhost:3000",
};

export class Collabclient {
  constructor(options) {
    // if no options use, use defaults
    var options = options || {};

    // CH server details
    this.namespace = options.namespace || "/hub";
    this.url = options.url || CH.V3;
    
    // Client and Environment details
    this.name = options.name || "CH-Client";
    this.username = options.username || "";
    this.environment = options.environment || ENVIRONMENT.MAX;
    this.recPort = options.recPort;
    this.sendPort = options.sendPort;
    this.ipAddress = options.ipAddress;

    console.log(this.url + this.namespace);
    this.socket = io.connect(this.url + this.namespace);

    // mandatory options components
    let clientoptions = {
      toClientMethod: this.toClient, 
      name: this.name,
      username: this.username,
      environment: this.environment,
      recPort: this.recPort || "",
      sendPort: this.sendPort || "",
      ipAddress: this.ipAddress || "",
    }

    // env specific -- PD
    if (this.environment == ENVIRONMENT.PD) {
      this.client = new PDClient(clientoptions);
    }

    // env specific -- OSC
    if (this.environment == ENVIRONMENT.OSC) {
      this.client = new OSCClient(clientoptions);
    }

    if (this.environment == ENVIRONMENT.NORNS) {
      this.client = new NORNSClient(clientoptions);
    }

    // automatically register username
    if (this.username !== "") {
      console.log('setting usernae ' + this.username);
      this.toClient("addUsername", { username: this.username });
    }

    console.log(
      "Attempting to connected to CH server at " + this.url + this.namespace
    );
    this.socket.on("serverMessage", () => {
      console.log(`connected - ${this.url}: ` + this.socket.id);
      this.socketid = this.socket.id;
    });

    // --------------------
    // Incoming from server
    // current implementation received events, controls, and chat

    this.socket.on("event", (data) => {
      this.client.toEnv(MESSAGETYPE.EVENT, data);
    });

    this.socket.on("control", (data) => {
      this.client.toEnv(MESSAGETYPE.CONTROL, data);
    });

    this.socket.on("chat", (data) => {
      this.client.toEnv(MESSAGETYPE.CHAT, data);
    });
  }

  // utility methods
  toClient(routing, data) {
    console.log(`client received data: ${routing}, ${data}`);
    console.dir(data);
    this.socket.emit(routing, data);
  }

  GetSocketID() {
    console.log("my socketid : " + this.socketid);
    return this.socketid;
  }

  Disconnect() {
    console.log(`Disconnecting...`);
    this.socket.disconnect();
  }
}

//
// module.exports = {
//   ENVIRONMENT
// };
