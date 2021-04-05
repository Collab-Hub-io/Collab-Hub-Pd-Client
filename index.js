const { ENVIRONMENT, CH, Collabclient } = require("./collabhubclient");
// require("./collabhubclient");

// var maxClient = new Collabclient({
//   name: "MaxClient", 
//   environment: ENVIRONMENT.PD, 
//   url: CH.V1
// });

var pdClient = new Collabclient({
  name: "PDClient", 
  environment: ENVIRONMENT.PD, 
  url: CH.V3, 
  namespace: "/hub"
});

function getID(client){
  console.log(`${client.name} + ID: + ${client.GetSocketID()}`);
}

// setTimeout(killClient, 3000, pdClient);

function killClient(client){
  client.Disconnect();
  client = null;
  console.log("killed client");
}

// setTimeout(getID, 1000, pdClient);

console.log("Environment: " + pdClient.environment);

