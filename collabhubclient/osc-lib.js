// --------------------------------------------------------------------------
// This is the javascript library required for interactive data retrieval from
// the OSC-based Collab-Hub (client).
// Authors: Nick Hwang, Tony T Marasco, Eric Sheffield
// Contact: nickthwang@gmail.com
//
// Reference `PD Example.PD` for example patch to run in PD
// --------------------------------------------------------------------------
import { Server, Client, Message } from 'node-osc';
import { MESSAGETYPE } from "../collabhubclient/index.js";
// const oscClient = require('node-osc');

// OSC (environment) library for Collab-Hub client for Server version 0.3.x
export class OSCClient {
  constructor(options) {
    
    this.recPort = options.recPort || 3002;
    this.sendPort = options.sendPort || 3001;

    this.name = options.name || "";
    this.socket = options.socket;

    this.toClient = options.toClientMethod;

    // this.clientOut = dgram.createSocket("udp4");
    // this.clientOut.connect(this.sendPort, "localhost");

    const receiver = new Server(this.recPort, "127.0.0.1");
    this.clientOut = new Client("127.0.0.1", this.sendPort);

    // setup listening port from OSC app
    receiver.on("listening", () => {
      // const address = receiver.address();
      console.log(
        `CH-Client (OSC) listening at ${this.recPort}`
      );
    });

    // setup Event routing -- from environment to client
    receiver.on("message", (msg, rinfo) => {
      console.log(
        `CH-Client (OSC) received MESSAGE: ${msg} from ${rinfo.address}:${rinfo.port}`
      );
      console.dir(msg);

      // convert OSC to Array to JSON
      msg = Array.from(msg);

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

    console.log(`Loaded client for ${this.name}`);
  }

  toEnv = (type, options) => {
    let msg;
    switch (type) {
      case MESSAGETYPE.EVENT:
        msg  = new Message("/"+options.header);
        this.clientOut.send(msg);
        break;
      case MESSAGETYPE.CONTROL:
        msg = new Message("/"+options.header);
        options.values.forEach((value, index) => {
          msg.append(value);
        });
        this.clientOut.send(msg);
        break;
      case MESSAGETYPE.CHAT:
        // let chatMsg = "Chat: " + options.id + ": " + options.chat;
        // this.clientOut.send(chatMsg);
        break;
    }
  };
}

// module.exports = {
//   OSCClient,
// };

