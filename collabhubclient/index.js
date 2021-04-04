// check client version (2.1.1)
const io = require("socket.io-client"),
EventEmitter = require('events');
Events = new EventEmitter();

ENVIRONMENT = {
  ARDUINO: "arduino",
  PD: "pd",
  MAX: "max",
  PROCESSING: "processing",
};

CH = {
  V1: "http://remote-collab.herokuapp.com",
  V2: "http://collab-hub-v2.herokuapp.com/hub",
  LOCAL: "http://localhost:3000"
};

//https://www.markhansen.co.nz/javascript-optional-parameters/

Collabclient = class Collabclient {
  constructor(options) {
    // if no options use, use defaults
    var options = options || {};

    this.namespace = options.namespace || "";
    // this.url = options.url || "http://localhost:3000";
    // this.url = options.url || `http://remote-collab.herokuapp.com`;
    this.url = options.url || "http://collab-hub-v2.herokuapp.com/hub";
    this.name = options.name || "";
    this.username = options.username || "";
    this.environment = options.environment || ENVIRONMENT.MAX;

    // env specific
    if (this.environment == ENVIRONMENT.PD) {
      const dgram = require("dgram");
      this.recPort = options.recPort || 3002;
      this.sendPort = options.sendPort || 3001;
      const receiver = dgram.createSocket("udp4");
      const sender = dgram.createSocket("udp4");

      // receiver.bind({port: this.recPort, address: 'localhost'});

      receiver.bind({
        address: "localhost",
        port: 3002,
        exclusive: true,
      });

      // setup listening port from PD
      receiver.on("listening", () => {
        const address = receiver.address();
        console.log(`client listening ${address.address}:${address.port}`);
      });

      // setup Event routing
      receiver.on("message", (msg, rinfo) => {
        console.log(
          `server received MESSAGE: ${msg} from ${rinfo.address}:${rinfo.port}`
        );
        console.log(typeof msg);
        msg = msg.toString("utf8").substring(0, msg.length - 2).split(" ");
        console.log(msg);
        if (Array.isArray(msg)) {
          if (msg[0] == "event") {
            console.log(`EVENT: ${msg[1]}`);
            this.socket.emit("event", msg[1]);
          }

          if (msg[0] == "control") {
            console.log(`CONTROL: ${msg[1]} - ${msg[2]}`);
            let newControl = {
              header: msg[1],
              values: msg[2],
            };
            this.socket.emit("control", newControl);
          }

          // if(msg[0] == )
        }
      });

      const message = String(
        `Connected! to Collab-Hub Client. Send messages to Port ${this.sendPort}`
      );
      this.clientOut = dgram.createSocket("udp4");
      this.clientOut.connect(this.sendPort, "localhost", (err) => {
        console.log("sending message...");
        this.clientOut.send(message, (err) => {
          // this.clientOut.close();
        });
        // this.clientOut.send(message, 0, message.length);
      });
    }

    console.log(this.url + this.namespace);
    this.socket = io(this.url + this.namespace);

    console.log("name: " + this.name);

    this.socket.on("connect", () => {
      console.log(`connected - ${this.url}: ` + this.socket.id); // "G5p5..."
      this.socketid = this.socket.id;
    });

    this.socket.on("users", (e) => {
      console.table(e);
    });

    // --------------------
    // Incoming from server

    // Used to confirm username (not implemented yet)
    this.socket.on("username", (...incoming) => {
      //   max.outlet("username", incoming);
    });

    // Generic messages from server
    this.socket.on("serverMessage", (...incoming) => {
      //   max.outlet("serverMessage", ...incoming);
    });

    // Other info from server

    this.socket.on("myRooms", (data) => {
      let myRoomsView = {
        MyRooms: data,
      };
      let myRoomsUmenu = {
        items: data,
      };
      //   max.outlet("myRoomsView", myRoomsView);
      //   max.outlet("myRoomsUmenu", myRoomsUmenu);
    });

    this.socket.on("allRooms", (data) => {
      let allRoomsView = {
        AllRooms: data,
      };
      let allRoomsUmenu = {
        items: data,
      };
      //   max.outlet("allRoomsView", allRoomsView);
      //   max.outlet("allRoomsUmenu", allRoomsUmenu);
    });

    this.socket.on("allRoomDetails", (data) => {
      //   max.outlet("allRoomDetailsView", data);
      //   max.outlet("allRoomDetailsUmenu", data);
    });

    this.socket.on("users", (data) => {
      let usersView = {
        Users: data,
      };
      let usersUmenu = {
        items: data,
      };
      //   max.outlet("usersView", usersView);
      //   max.outlet("usersUmenu", usersUmenu);
    });

    this.socket.on("event", (header) => {
      console.log(`Event occured! ${header}`);
      this.clientOut.send(header, 0, header.length);
    });

    this.socket.on("events", (data) => {
      console.log("Events manifest");
      console.log(data);
    });

    this.socket.on("controlDump", (data) => {
      //   max.outlet("controlsView", data);
      //   max.outlet("controlsUmenu", data);
    });

    // Data from server
    this.socket.on("control", (...incoming) => {
      //   max.outlet("control", incoming);
    });

    this.socket.on("event", (incoming) => {
      //   max.outlet("event", incoming);
    });

    this.socket.on("chat", (incoming) => {
      //   max.outlet("chat", incoming);
    });

    // --------------------
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
