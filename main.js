// --------------------------------------------------------------------------
// This is the javascript library required for
// the PD-based Collab-Hub (client).
// Authors: Nick Hwang, Tony T Marasco, Eric Sheffield
// Contact: nickthwang@gmail.com
// --------------------------------------------------------------------------

import { ENVIRONMENT, CH, Collabclient } from "./collabhubclient/CH-Hub.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as nstatic from "node-static";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// var file = new nstatic.Server(__dirname);

let _environments = Object.values(ENVIRONMENT);

// Keep backward compatibility with historical single-dash usage like: -url http://...
const normalizedArgv = hideBin(process.argv).map((arg) =>
  arg === "-url" ? "--url" : arg,
);

const argv = yargs(normalizedArgv)
  .options({
    environment: {
      alias: "e",
      description: "The environment to connect to",
      choices: _environments,
      default: "pd",
      type: "string",
    },
    sendPort: {
      alias: "s",
      description: "The port to send data to",
      type: "string",
    },
    receivePort: {
      alias: "r",
      description: "The port to receive data from",
      type: "string",
    },
    username: {
      alias: "u",
      description: "The username to connect with",
      type: "string",
    },
    password: {
      alias: "p",
      description: "The password to connect with",
      type: "string",
    },
    ipAddress: {
      alias: "i",
      description: "The IP address to connect to",
      type: "string",
    },
    url: {
      alias: "l",
      description: "The URL to connect to",
      type: "string",
    },
    namespace: {
      alias: "n",
      description: "The namespace to connect to",
      type: "string",
    },
  })
  .alias("h", "help")
  .help().argv;
if (argv._.includes("help")) {
  console.log(yargs.help());
  process.exit(0);
}

const options = {
  environment: argv.environment || "pd",
  url: argv.url || CH.DEFAULT,
  namespace: argv.namespace || "/hub",
  recPort: argv.receivePort || 3002,
  sendPort: argv.sendPort || 3001,
  username: argv.username || "",
  password: argv.password || "",
  ipAddress: argv.ipAddress || "",
};

const _ = new Collabclient(options);
