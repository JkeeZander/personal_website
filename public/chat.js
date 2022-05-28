/*global io*/
const socket = io();
const button = document.querySelector(".button");
const section = document.getElementsByTagName("section");
const message = document.querySelector("input");
button.addEventListener("click", function () {
  socket.emit("message", message.value);
  message.value = "";
  console.log("message sent!");
  return false;
});

socket.on("sending", (data) => {
  console.log("Message came!");
  const div = document.createElement("div");
  div.innerHTML = data;
  section[0].appendChild(div);
});
