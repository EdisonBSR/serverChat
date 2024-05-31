import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
let userOnLine = [];
let userOffLine = [];
let userWriting = [];
let serveMsg = [];
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

server.listen(3001, () => {
  console.log("server running on port 3001");
});

io.on("connection", (socket) => {
  // console.log(socket.id);

  if (serveMsg.length > 0) {
    serveMsg.forEach((chat) => {
      io.to(socket.id).emit("chat message", chat.msg, chat.user);
    });
  }
  socket.on("chat message", async (msg, user) => {
    if (userWriting.includes(user)) {
      let position = userWriting.indexOf(user);
      userWriting.splice(position, 1);
      console.log(userWriting);
      io.emit("writing", userWriting);
    }
    serveMsg.push({ msg, user });
    io.emit("chat message", msg, user);
  });

  socket.on("writing", async (user) => {
    console.log(`se recibe escribiendo del usuario ${user}`);
    userWriting.push(user);
    console.log(`${userWriting}`);
    socket.broadcast.emit("writing", userWriting);
    socket.emit("users", userOnLine);
  });

  socket.on("users", async (user) => {
    if (!userOnLine.includes(user)) {
      userOnLine.push(user);
      console.log(`Usuarios en linea: ${userOnLine}`);
    }
    socket.emit("users", userOnLine);
  });
  socket.on("userOffLine", async (user) => {
    if (userOnLine.includes(user)) {
      let position = userOnLine.indexOf(user);
      let userDisconnect = userOnLine.splice(position, 1);
      userOffLine.push(userDisconnect);
    }
    console.log(`Usuarios desconectados ${userOffLine}`);
    socket.emit("userOffLine", userOffLine);
  });
  socket.on("removeUserWriting", async (user) => {
    if (userWriting.includes(user)) {
      let position = userWriting.indexOf(user);
      userWriting.splice(position, 1);
      console.log(userWriting);
      socket.broadcast.emit("writing", userWriting);
    }
  });
  //JUEGO :D
});
