import app from "./app";
import { AppDataSource } from "./data-source";
import http from "http";
import { Server } from "socket.io";

AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected!");
    const port = process.env.PORT ?? 3000;

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    io.on("connect", (socket) => {
      console.log("User Connected", socket.id);

      socket.on("joinRoom", (data) => {
        socket.join(data);
      });

      socket.on("sendMessage", (room) => {
        socket.to(room).emit("receiveMessage", room);
      });

      socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
      });
    });

    server.listen(port, () => {
      console.log(`App running on http://localhost:${port}`);
    });
  })
  .catch((err) => console.error(err));
