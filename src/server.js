import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/config.js";
import authRouter from "./router/auth.router.js";
import { verifyApiKeyMiddleware } from "./middlewares/auth.middleware.js";
import messagesRouter from "./router/message.router.js";
import contactRouter from "./router/contact.router.js";





dotenv.config();
connectDB();


const app = express();
app.use(cors());
app.use(express.json());
app.use(verifyApiKeyMiddleware)


/* app.get("/", (req, res) => {
    res.send("Backend funcionando");
}); */

app.use('/api/auth', authRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/contacts', contactRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

/* app.get("/api/test", (req, res) => {
    res.json({ message: "Conexión exitosa" });
}); */