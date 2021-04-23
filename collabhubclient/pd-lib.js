// --------------------------------------------------------------------------
// This is the javascript library required for interactive data retrieval from
// the PD-based Collab-Hub (client).
// Authors: Nick Hwang, Tony T Marasco, Eric Sheffield
// Contact: nickthwang@gmail.com
//
// Reference `PD Example.PD` for example patch to run in PD
// --------------------------------------------------------------------------

// PD (environment) library for Collab-Hub client for Server version 0.3.x
PDClient = class PDClient {
    constructor(options) {
      const dgram = require("dgram");
      const receiver = dgram.createSocket("udp4");
  
      this.recPort = options.recPort || 3002;
      this.sendPort = options.sendPort || 3001;
  
      this.name = options.name || "";
      this.socket = options.socket;
  
      this.toClient = options.toClientMethod;
  
      this.clientOut = dgram.createSocket("udp4");
      this.clientOut.connect(this.sendPort, "localhost");
  
      receiver.bind({
        address: "localhost",
        port: this.recPort,
        exclusive: true,
      });
  
      // setup listening port from PD
      receiver.on("listening", () => {
        const address = receiver.address();
        console.log(`CH-Cient listening at ${address.address}:${address.port}`);
      });
  
      // setup Event routing
      receiver.on("message", (msg, rinfo) => {
        console.log(
          `CH-Client received MESSAGE: ${msg} from ${rinfo.address}:${rinfo.port}`
        );
        console.log(typeof msg);
        msg = msg
          .toString("utf8")
          .substring(0, msg.length - 2)
          .split(" ");
        console.log("msg: " + msg);
  
        if (Array.isArray(msg)) {
          let outgoing = {};
  
          if (msg[0] === "push") {
            outgoing.mode = "push";
            if (msg.length > 3) {
              outgoing.target = msg[1];
              outgoing.header = msg[2];
              outgoing.values = msg.slice(3);
              this.toClient("control", outgoing);
              return;
            } else {
              outgoing.target = msg[1];
              outgoing.header = msg[2];
              this.toClient("event", outgoing);
              return;
            }
          }
  
          if (msg[0] === "chat") {
            msg.splice(0, 1);
            console.log("chat?");
            let newMsg = msg.join(" ");
            console.dir(newMsg);
            outgoing.chat = newMsg;
            outgoing.target = "all";
            this.toClient("chat", outgoing);
            return;
          }
  
          if (msg[0] === "addUsername") {
            outgoing.username = msg[1];
            this.toClient("addUsername", outgoing);
            return;
          }
  
          if (msg[0] === "observeAllControl") {
            outgoing.observe = msg[1];
            this.toClient("observeAllControl", outgoing);
            return;
          }
  
          if (msg[0] === "observeAllEvents") {
            outgoing.observe = msg[1];
            this.toClient("observeAllEvents", outgoing);
            return;
          }
        }
      });
  
      const message = String(
        `Connected to Collab-Hub Client! You are using ${this.environment}. Send messages to Port ${this.recPort}`
      );
  
      console.log(`Loaded client for ${this.name}`);
    }

    toEnv = (type, options) => {
      switch (type) {
        case MESSAGETYPE.EVENT:
          this.clientOut.send(options.header);
          break;
        case MESSAGETYPE.CONTROL:
          let msg = options.header + " " + options.values;
          this.clientOut.send(msg);
          break;
        case MESSAGETYPE.CHAT:
          let chatMsg = "Chat: " + options.id + ": "+ options.chat;
          this.clientOut.send(chatMsg);
          break;
      }
    };
  }
  
  module.exports = {
    PDClient
  };