// check client version (4.0.1)
const io = require("socket.io-client");
//   EventEmitter = require("events");
// Events = new EventEmitter();

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
};

CH = {
  V1: "http://remote-collab.herokuapp.com",
  V2: "http://collab-hub-v2.herokuapp.com/hub",
  V3: "https://CH-testing.herokuapp.com/hub",
  LOCAL: "http://localhost:3000",
};

//https://www.markhansen.co.nz/javascript-optional-parameters/

Collabclient = class Collabclient {
  constructor(options) {
    // if no options use, use defaults
    var options = options || {};

    this.namespace = options.namespace || "";
    // this.url = options.url || "http://localhost:3000";
    // this.url = options.url || `http://remote-collab.herokuapp.com`;
    this.url = options.url || "https://CH-testing.herokuapp.com/hub";
    this.name = options.name || "";
    this.username = options.username || "";
    this.environment = options.environment || ENVIRONMENT.MAX;

    console.log(this.url + this.namespace);
    // this.socket = io.connect(this.url + this.namespace);
    this.socket = io.connect(`https://CH-testing.herokuapp.com/hub`);

    // env specific
    if (this.environment == ENVIRONMENT.PD) {
      //#region PD
      this.client = new PDClient({
        name: "PD",
        socket: this.socket,
        toClientMethod: this.toClient,
      });
    }

    console.log("name: " + this.name);
    console.log("attempting to connected to CH server at " + this.url);
    this.socket.on("serverMessage", () => {
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
    });

    this.socket.on("allRooms", (data) => {
      let allRoomsView = {
        AllRooms: data,
      };
      let allRoomsUmenu = {
        items: data,
      };
    });

    this.socket.on("allRoomDetails", (data) => {});

    this.socket.on("users", (data) => {
      let usersView = {
        Users: data,
      };
      let usersUmenu = {
        items: data,
      };
    });

    this.socket.on("event", (data) => {
      console.log(`Event occured! ${data.header}`);
      // parse for PD
      this.client.toEnv(MESSAGETYPE.EVENT, data);
      // this.clientOut.send(header.header, 0, header.header.length);
      // this.clientOut.send(header, 0, header.length);
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
    this.socket.on("control", (data) => {
      this.client.toEnv(MESSAGETYPE.CONTROL, data);
    });

    this.socket.on("chat", (data) => {
      //   max.outlet("chat", incoming);
    });

    // --------------------
  }

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

// code specifically for PD
class PDClient {
  constructor(options) {
    const dgram = require("dgram");
    const receiver = dgram.createSocket("udp4");
    const sender = dgram.createSocket("udp4");

    this.recPort = options.recPort || 3002;
    this.sendPort = options.sendPort || 3001;

    this.name = options.name || "";
    this.socket = options.socket;

    this.toClient = options.toClientMethod;
    console.log("what is toclient: " + this.toClient);

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
        console.log("msg len:" + msg.length);
        let outgoing = {};

        if (msg[0] === "push") {
          outgoing.mode = "push";
          if (msg.length > 3) {
            outgoing.target = msg[1];
            outgoing.header = msg[2];
            outgoing.values = msg.slice(3);
            this.toClient("control", outgoing);
          } else {
            outgoing.target = msg[1];
            outgoing.header = msg[2];
            this.toClient("event", outgoing);
            // this.socket.emit("control", outgoing);
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
        }

        if (msg[0] === "addUsername") {
          outgoing.username = msg[1];
          this.toClient("addUsername", outgoing);
        }

        if (msg[0] === "observeAllControl") {
          outgoing.observe = msg[1];
          this.toClient("observeAllControl", outgoing);
        }

        if (msg[0] === "observeAllEvents") {
          outgoing.observe = msg[1];
          this.toClient("observeAllEvents", outgoing);
        }
      }
    });

    const message = String(
      `Connected to Collab-Hub Client! You are using ${this.environment}. Send messages to Port ${this.recPort}`
    );
    // this.clientOut = dgram.createSocket("udp4");
    // this.clientOut.connect(this.sendPort, "localhost", (err) => {
    //   console.log("sending message...");
    //   this.clientOut.send(message, (err) => {
    //     // this.clientOut.close();
    //   });
    //   // this.clientOut.send(message, 0, message.length);
    // });

    console.log(`loaded client for ${this.name}`);
  }

  toEnv = (type, options) => {
    console.log("to env message: " + options);
    console.dir(options);

    switch (type) {
      case MESSAGETYPE.EVENT:
        this.clientOut.send(options.header);
        break;
      case MESSAGETYPE.CONTROL:
        let msg = options.header + " " + options.values;
        this.clientOut.send(msg);
        break;
    }
  };

  toServer = (options) => {};

  settings = (options) => {};
}

///
module.exports = {
  Collabclient,
  ENVIRONMENT,
  CH,
};
