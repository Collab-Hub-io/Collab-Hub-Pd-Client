// --------------------------------------------------------------------------
// This is the javascript library required for interactive data retrieval from
// the OSC-based Collab-Hub (client).
// Authors: Nick Hwang, Tony T Marasco, Eric Sheffield
// Contact: nickthwang@gmail.com
//
// Reference `PD Example.PD` for example patch to run in PD
// --------------------------------------------------------------------------
import { Server, Client, Message } from "node-osc";
import { MESSAGETYPE } from "./index.js";
import WebSocket from "ws";

const ws = new WebSocket('ws://localhost:5555/', ['bus.sp.nanomsg.org']);

// OSC (environment) library for Collab-Hub client for Server version 0.3.x
export class NORNSClient {
  constructor(options) {
    this.recPort = options.recPort || 3002;
    this.sendPort = options.sendPort || 10111;
    this.outIPAddress = options.ipAddress || "127.0.0.1";

    this.name = options.name || "";
    this.socket = options.socket;

    this.toClient = options.toClientMethod;

    const receiver = new Server(this.recPort, "127.0.0.1");
    this.clientOut = new Client(this.outIPAddress, this.sendPort);
    this.matron = new Client(55555, "127.0.0.1");

    // setup listening port from OSC app
    receiver.on("listening", () => {
      // const address = receiver.address();
      console.log(`CH-Client (Norns-OSC) listening at ${this.recPort}`);
      console.log(
        `CH-Client (Norns-OSC) sending to ${this.outIPAddress}:${this.sendPort}`
      );
    });

    // setup Event routing -- from environment to client
    receiver.on("message", (msg, rinfo) => {
      console.log(
        `CH-Client (Norns-OSC) received MESSAGE: ${msg} from ${rinfo.address}:${rinfo.port}`
      );
      console.dir(msg);

      // convert OSC to Array to JSON
      msg = Array.from(msg);

      if (Array.isArray(msg)) {
        let outgoing = {};

        // handle key words first
        if (msg[0] === "/chat") {
          msg.splice(0, 1);
          console.log("chat?");
          let newMsg = msg.join(" ");
          console.dir(newMsg);
          outgoing.chat = newMsg;
          outgoing.target = "all";
          this.toClient("chat", outgoing);
          return;
        }

        if (msg[0] === "/addUsername") {
          outgoing.username = msg[1];
          this.toClient("addUsername", outgoing);
          return;
        }

        if (msg[0] === "/observeAllControl") {
          outgoing.observe = msg[1];
          this.toClient("observeAllControl", outgoing);
          return;
        }

        if (msg[0] === "/observeAllEvents") {
          outgoing.observe = msg[1];
          this.toClient("observeAllEvents", outgoing);
          return;
        }

        // PUSH / PUBLISH routing modes currently not implemented

        if (msg.length > 1) {
          outgoing.mode = "push";
          outgoing.target = "all";
          outgoing.header = msg[0];
          outgoing.values = msg.slice(1);
          this.toClient("control", outgoing);
          return;
        } else {
          outgoing.mode = "push";
          outgoing.target = "all";
          outgoing.header = msg[0];
          this.toClient("event", outgoing);
          return;
        }
      }
    });

    console.log(`Loaded Norns client for ${this.name}`);
  }

  // messages to send to NORNS
  toEnv = (type, options) => {
    let msg;
    if (options.header.substr(0, 1) === "/") {
      options.header = options.header.substr(1);
    }
    switch (type) {
      case MESSAGETYPE.EVENT:
        msg = new Message("/" + options.header);
        this.clientOut.send(msg);
        break;
      case MESSAGETYPE.CONTROL:
        if (options.header === "norns" || options.header === "NORNS") {
          console.log(
            `Received a NORNS-APP related message: ${options.header} - ${options.values}`
          );
          if (options.values[0] === "load") {
            console.log(`Loading a script ${options.values[1]}`);
            ws.send(`norns.script.load("code/${options.values[1]}/${options.values[1]}.lua")\n`);
            // shelljs.echo("hello tony marasco");
            // shelljs.exec(`norns.script.load("/home/we/dust/code/${options.values[1]}/${options.values[1]}.lua")`);
            // shelljs.exec(`cd $HOME/foo/bar`);
          }
          return;
        }

        //
        if (options.header.substr(0, 1) !== "/") {
          msg = new Message("/" + options.header); // add leading slash
        } else {
          msg = new Message(options.header);
        }

        //
        if (options.values.length > 0) {
          options.values.forEach((value, index) => {
            msg.append(value);
          });
        } else {
          msg.append(options.values);
        }
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

////
