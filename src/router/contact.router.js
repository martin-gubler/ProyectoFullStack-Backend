import express from 'express'
import { addContact, getContacts, getInfoContacto } from '../controllers/contact.controller.js';
import { verifyTokenMiddleware } from '../middlewares/auth.middleware.js';


const contactRouter = express.Router();

contactRouter.post('/add', verifyTokenMiddleware(), addContact)
contactRouter.get('/', verifyTokenMiddleware(), getContacts)
contactRouter.get('/InfoContacto/:receiver_id', verifyTokenMiddleware(), getInfoContacto)

export default contactRouter