import express from 'express'
import { createMessage, deleteMessage, getConversation} from '../controllers/message.controller.js';
import { verifyTokenMiddleware } from '../middlewares/auth.middleware.js';


const messagesRouter = express.Router();

messagesRouter.post('/send/:receiver_id', verifyTokenMiddleware(), createMessage)
messagesRouter.get('/conversation/:receiver_id', verifyTokenMiddleware(), getConversation)
messagesRouter.delete('/delete/:message_id', verifyTokenMiddleware(), deleteMessage);

export default messagesRouter