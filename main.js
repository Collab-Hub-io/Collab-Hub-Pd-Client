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

console.log(nstatic.Server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
var file = new nstatic.Server(__dirname);

const argv = yargs(hideBin(process.argv)).argv;
console.log(argv);

if (argv._.includes("help")) {
  console.log(yargs.help());
  process.exit(0);
}

// const client = new Collabclient({
//   name: "PDClient",
//   environment: ENVIRONMENT.PD,
//   // url: CH.Testing,
//   url: CH.V3,
//   namespace: "/hub",
//   recPort: 3002,
//   sendPort: 3001
// });

// const client = new Collabclient({
//   name: "OSCClient",
//   environment: ENVIRONMENT.OSC,
//   // url: CH.Testing,
//   url: CH.V3,
//   namespace: "/hub",
//   recPort: 3002,
//   sendPort: 3001
// });

if (argv._.length < 1) {
  console.log("--------- Starting default client: pd");

  // Instantiate the client with an environment (library)
  // future version, will have other libraries
  const client = new Collabclient({
    name: "PDClient",
    environment: ENVIRONMENT.PD,
    // url: CH.Testing,
    url: CH.V3,
    namespace: "/hub",
    recPort: 3002,
    sendPort: 3001,
  });
}

if (argv._.includes("osc")) {
  const client = new Collabclient({
    name: "PDClient",
    environment: ENVIRONMENT.OSC,
    // url: CH.Testing,
    url: CH.V3,
    namespace: "/hub",
    recPort: 3002,
    sendPort: 3001,
  });
}

// currently not used
function disconnectClient(client) {
  client.Disconnect();
  client = null;
  console.log("client disconnected");
}

http
  .createServer(function (req, res) {
    file.serve(req, res);
  })
  .listen(3000);
