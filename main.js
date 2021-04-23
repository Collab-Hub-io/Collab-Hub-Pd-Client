// --------------------------------------------------------------------------
// This is the javascript library required for interactive data retrieval from
// the PD-based Collab-Hub (client).
// Authors: Nick Hwang, Tony T Marasco, Eric Sheffield
// Contact: nickthwang@gmail.com
// --------------------------------------------------------------------------

const { ENVIRONMENT, CH, Collabclient } = require("./collabhubclient");

// Instantiate the client with an environment (library)
// future version, will have other libraries
var client = new Collabclient({
  name: "PDClient", 
  environment: ENVIRONMENT.PD, 
  url: CH.V3, 
  namespace: "/hub", 
  recPort: 3002,
  sendPort: 3001
});

// currently not used
function disconnectClient(client){
  client.Disconnect();
  client = null;
  console.log("client disconnected");
}