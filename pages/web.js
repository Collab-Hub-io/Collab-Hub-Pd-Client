console.log("Web script loaded...");

// 
var state = false;
var pdEnvs = [];
var envNodes = [];


// functions
getAddNodes = () => {
  envNodes[0] = document.getElementById("add-environment-1");
  envNodes[1] = document.getElementById("add-environment-2");
  envNodes[2] = document.getElementById("add-environment-3");
};

loadPdEnvironment = () => {
  let which = pdEnvs.length + 1;
  var node = document.getElementById(`add-environment-${which}`);
  var template = document.getElementById("pd-template");

  console.log("loaded env to spot " + which);
  // Clone the new row and insert it into the table
  var clone = template.content.cloneNode(true);
  clone.getElementById("remove-environment").value = which;
  var part1window = clone.getElementById("part-1-window");
  console.log(`part1wdinow? : ${part1window}`);
  var settings = clone
    .getElementById("part-1-window")
    .querySelector("#settings-icon");

  settings.classList.add("disabled");
  //   console.log(`settings? : ${settings.classList}`);
  part1window.addEventListener("mouseenter", () => {
    // console.log("mouse enter");
    settings.classList.remove("disabled");
  });

  part1window.addEventListener("mouseleave", () => {
    // console.log("mouse exit");
    setTimeout(() => {
      settings.classList.add("disabled");
    }, 250);
  });

  let part2window = clone.getElementById("part-2-window");
  // console.log('part1?' + part1window);
  part2window.addEventListener("contextmenu", (e) => {
    console.log("right click enter");
    e.preventDefault();
  });

  // update with new values
  clone.getElementById("template-title").textContent = "PD";
  let title1 = clone.getElementById("part-1-title");
  title1.textContent = "Receive Port";
  let part1details = clone.getElementById("part-1-input");
  part1details.value = "3004";

  let title2 = clone.getElementById("part-2-title");
  title2.textContent = "Send Port";
  let part2details = clone.getElementById("part-2-input");
  part2details.value = "3002";

  node.appendChild(clone);
  pdEnvs.push(clone);
  // pdEnvs++;
  console.log("pdenvs length: " + pdEnvs.length);
};

addEnvironmentOptions = () => {
  if (pdEnvs.length > 2) {
    return;
  }

  let which = pdEnvs.length + 1;

  if (
    document.getElementById(`add-environment-${which}`).querySelector(".tray")
  ) {
    return;
  }

  console.log("adding env to: " + which);
  //   console.log("pdenvs length: " + pdEnvs.length);
  var node = document.getElementById(`add-environment-${which}`);
  var template = document.getElementById("environment-selector-template");
  console.log(node);
  var clone = template.content.cloneNode(true);

  node.appendChild(clone);
};

addPdEnvironment = (input) => {
  console.log("adding pd Environment");
  if (pdEnvs.length < 3) {
    console.log("--- " + input.parentElement);
    input.parentElement.parentElement.remove();
    loadPdEnvironment();
    addEnvironmentOptions();
  }
};

receiveportChange = (input) => {
  console.log("Receive Port: " + input.value);
  input.style.fontStyle = "normal";
  input.blur();
};

sendportChange = (input) => {
  console.log("Send Port: " + input.value);
  input.style.fontStyle = "normal";
  input.blur();
};

inputfocus = (input) => {
  input.style.fontStyle = "italic";
};

removeEnvironment = (input, which) => {
  console.log("remove which?: " + which);
  input.parentElement.remove();
  if (which - 1 <= 0) {
    console.log("which - 1?" + (which - 1));
    which = 1;
    console.log("setting which to 1");
  }
  if (pdEnvs.length == 1) {
    pdEnvs = [];
    console.log("--------- Removed");
    console.log("after remove, pdEnvs.length " + pdEnvs.length);
    shiftEnvironments(which);
    return;
  }

  pdEnvs.splice(which - 1, 1);
  console.log("--------- Removed");
  console.log("after remove, pdEnvs.length " + pdEnvs.length);
  shiftEnvironments(which);
};

loadEnvTab = () => {
  document.getElementById("Environments").style.display = "block";
  document.getElementById("env-tab-ind").style.display = "block";
  document.getElementById("Setup").style.display = "none";
  document.getElementById("setup-tab-ind").style.display = "none";
  // document.getElementById("Messages").style.display = "none";
  document.getElementById("message-tab-ind").style.display = "none";
  console.log("Env clicked");

  addEnvironmentOptions();
};

loadSetupTab = () => {
  document.getElementById("Environments").style.display = "none";
  document.getElementById("env-tab-ind").style.display = "none";
  document.getElementById("Setup").style.display = "block";
  document.getElementById("setup-tab-ind").style.display = "block";
  // document.getElementById("Messages").style.display = "none";
  document.getElementById("message-tab-ind").style.display = "none";
  console.log("Setup clicked");
  //   loadSetup();
};

loadMessagesTab = () => {
  document.getElementById("Environments").style.display = "none";
  document.getElementById("Setup").style.display = "none";
  // document.getElementById("Messages").style.display = "block";
  console.log("Messages clicked");
  document.getElementById("message-tab-ind").style.display = "none";
};

shiftEnvironments = (which) => {
  if (which < 3) {
    console.log("shifting...");

    console.log(
      "pdtray? (which) " +
        which +
        document
          .getElementById(`add-environment-${which + 1}`)
          .querySelector("#pdtray")
    );

    console.log(
      "tray? (which) " +
        which +
        document
          .getElementById(`add-environment-${which + 1}`)
          .querySelector(".tray")
    );
    //
    let moving;
    if (
      document
        .getElementById(`add-environment-${which + 1}`)
        .querySelector("#pdtray") != null
    ) {
      moving = document
        .getElementById(`add-environment-${which + 1}`)
        .querySelector("#pdtray");
      moving.querySelector("#remove-environment").value = which;
    } else {
      moving = document
        .getElementById(`add-environment-${which + 1}`)
        .querySelector(".tray");
    }

    if (moving != null) {
      console.log("shifting to " + which);
      envNodes[which - 1].append(moving);
    } else {
      // addEnvironmentOptions();
      return;
    }

    shiftEnvironments(which + 1);
  } else {
    console.log("which: " + which);
    if (!document.getElementById(`add-environment-3`).querySelector(".tray")) {
      console.log("catch");
      addEnvironmentOptions();
    }
  }
};
//

addRoom = (roomname) => {
  console.log(`Would be adding roomname: ${roomname}`);
}

newRoom = (roomname) => {
  console.log(`Would create rooname: ${roomname}`);
}

newRoomButton = (input) => {
  input.style.visibility = "hidden";
  console.log(input.parentElement.querySelector("#new-room-input"));
  input.parentElement.querySelector("#new-room-input").style.visibility = "visible";
}

//

addRoomItem = (roomname) => {
  let node = document.getElementById("available-room-node").querySelector(".list-node");
  
  let newListItem = document.createElement("li");
  newListItem.setAttribute("class", "list-item");
  let roomNameDiv = document.createElement("div");
  roomNameDiv.setAttribute("class", "item-name");
  roomNameDiv.innerHTML = `<p>${roomname}</p>`;
  let addButton = document.createElement("div");
  addButton.setAttribute("class", "add-button");
  addButton.setAttribute("onclick", `addRoom('${roomname}')`);
  addButton.setAttribute("value", roomname);
  addButton.innerHTML = '+';
  
  node.appendChild(newListItem);
  newListItem.appendChild(roomNameDiv);
  newListItem.appendChild(addButton);
}

addControlItem = (control) => {

}

addEventItem = (event) => {

} 




getAddNodes();
loadEnvTab();

addRoomItem('poop');

