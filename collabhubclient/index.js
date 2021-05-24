// --------------------------------------------------------------------------
// This is the javascript library required for interactive data retrieval from
// the PD-based Collab-Hub (client).
// Authors: Nick Hwang, Tony T Marasco, Eric Sheffield
// Contact: nickthwang@gmail.com
// --------------------------------------------------------------------------

const io = require("socket.io-client");
// future versions will require other environment libraries (like OSC, P5.js, etc)
const pd = require("./pd-lib.js");

MESSAGETYPE = {
  EVENT: "event",
  CONTROL: "control",
  CHAT: "chat",
};

ENVIRONMENT = {
  ARDUINO: "arduino",
  PD: "pd",
  MAX: "max",
  PROCESSING: "processing",
  UNITY: "unity"
};

// most current server is V3
CH = {
  V1: "http://remote-collab.herokuapp.com",
  V2: "http://collab-hub-v2.herokuapp.com",
  V3: "https://ch-server.herokuapp.com",
  Testing: "https://CH-testing.herokuapp.com",
  LOCAL: "http://localhost:3000",
};

Collabclient = class Collabclient {
  constructor(options) {
    // if no options use, use defaults
    var options = options || {};

    this.namespace = options.namespace || "";
    this.url = options.url;
    this.name = options.name || "";
    this.username = options.username || "";
    this.environment = options.environment || ENVIRONMENT.MAX;
    this.recPort = options.recPort;
    this.sendPort = options.sendPort;

    console.log(this.url + this.namespace);
    this.socket = io.connect(this.url + this.namespace);

    // env specific
    if (this.environment == ENVIRONMENT.PD) {
      //#region PD
      this.client = new PDClient({
        name: "PD",
        socket: this.socket,
        toClientMethod: this.toClient,
        recPort: this.recPort,
        sendPort: this.sendPort
      });
    }

    console.log("Attempting to connected to CH server at " + this.url + this.namespace);
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
};

///
module.exports = {
  Collabclient,
  ENVIRONMENT,
  CH,
};
