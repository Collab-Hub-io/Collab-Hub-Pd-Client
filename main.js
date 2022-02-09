// --------------------------------------------------------------------------
// This is the javascript library required for interactive data retrieval from
// the PD-based Collab-Hub (client).
// Authors: Nick Hwang, Tony T Marasco, Eric Sheffield
// Contact: nickthwang@gmail.com
// --------------------------------------------------------------------------
// const { ENVIRONMENT, CH, Collabclient } = require("./collabhubclient");
import { ENVIRONMENT, CH, Collabclient } from "./collabhubclient/index.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as nstatic from "node-static";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
var file = new nstatic.Server(__dirname);

let _environments = Object.values(ENVIRONMENT);

const argv = yargs(hideBin(process.argv))
.options({
  "Evironment": {
    alias: "e",
    description: "The environment to connect to",
    choices: _environments,
    default: "pd",
    type: "string", 
  },
  "SendPort": {
    alias: "s",
    description: "The port to send data to",
    type: "string"
  },
  "ReceivePort": {
    alias: "r",
    description: "The port to receive data from",
    type: "string",
  },
  "Username": {
    alias: "u",
    description: "The username to connect with",
    type: "string"
  },
  "IPAddress": {
    alias: "i",
    description: "The IP address to connect to",
    type: "string"
  }, 
  "Url": {
    alias: "u",
    description: "The URL to connect to",
    type: "string"
  },
  "Namespace": {
    alias: "n",
    description: "The namespace to connect to",
    type: "string"
  }
})
.alias("h", "help")
  .help()
  .argv
  ;

if (argv._.includes("help")) {
  console.log(yargs.help());
  process.exit(0);
}

let options = {
  environment: argv.Evironment || "pd",
  url: argv.url || CH.V3,
  namespace: argv.Namespace || "/hub",
  recPort: argv.ReceivePort|| 3002,
  sendPort: argv.SendPort || 3001,
  username: argv.Username || "",
  ipAddress: argv.IPAddress || "",
};

const client = new Collabclient(options);

// currently not used
function disconnectClient(client) {
  client.Disconnect();
  client = null;
  console.log("client disconnected");
}
