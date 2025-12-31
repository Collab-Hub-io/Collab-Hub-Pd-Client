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

// most current server is V3.2
export const CH = {
  DEFAULT: "https://server.collab-hub.io",
  LOCAL: "http://localhost:3000",
};

export class Collabclient {
  constructor(options) {
    // if no options use, use defaults
    var options = options || {};

    // CH server details
    this.namespace = options.namespace || "/hub";
    this.url = options.url || CH.DEFAULT;

    // Client and Environment details
    this.name = options.name || "CH-Client";
    this.username = options.username || "";
    this.environment = options.environment || ENVIRONMENT.MAX;
    this.recPort = options.recPort;
    this.sendPort = options.sendPort;
    this.ipAddress = options.ipAddress;

    console.log(this.url + this.namespace);
    this.socket = io.connect(this.url + this.namespace);

    // client options components
    let clientoptions = {
      toClientMethod: this.toClient,
      name: this.name,
      username: this.username,
      environment: this.environment,
      recPort: this.recPort || "",
      sendPort: this.sendPort || "",
      ipAddress: this.ipAddress || "",
      socket: this.socket,
    };

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
      this.toClient("addUsername", { username: this.username });
    }

    console.log(
      "[PD Client] Attempting to connected to CH server at " +
        this.url +
        this.namespace
    );
    this.socket.on("serverMessage", (data) => {
      console.log("[PD Client] Server message: " + data.message);
    });

    // --------------------
    // Incoming from server
    // current implementation received events, controls, and chat

    this.socket.on("connection", () => {
      this.client.toEnv(MESSAGETYPE.EVENT, {
        header: "connection",
      });
      console.log(
        `[PD Client] Connected to a Collab-Hub Server: - ${this.url}: ` +
          this.socket.id
      );
      this.socketid = this.socket.id;
    });

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
    console.log(`[PD Client] received data: ${routing}, ${data}`);
    console.dir(data);
    this.socket.emit(routing, data);
  }

  GetSocketID() {
    console.log("[PD Client] my socketid : " + this.socketid);
    return this.socketid;
  }

  Disconnect() {
    console.log(`[PD Client]Disconnecting...`);
    this.socket.disconnect();
  }
}

//
// module.exports = {
//   ENVIRONMENT
// };
