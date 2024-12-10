import MessageRepository from "../repositories/message.repository.js"
import UserRepository from "../repositories/user.repository.js";

const createMessage = async (req, res) => {
    console.log('createMessage controller reached');
    try{
        const user_id = req.user.id
        const {receiver_id} = req.params;
        const {content} = req.body
        console.log('Request params:', req.params)
        console.log('Request body:', req.body); // Verifica que el body llega correctamente
        console.log('User ID createMessage:', user_id)

        if (!content) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Content is required',
            });
        }

        const new_message = await MessageRepository.createMessage({author: user_id, receiver: receiver_id, content: content})

        //Podrian retornar toda la conversacion

        //const conversation = await MessageRepository.findMessagesBetweenUsers(user_id, receiver_id)
        return res.status(201).json({
            ok: true,
            status: 201,
            message: 'Message created',
            data: {
                message: new_message
            }
        })
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            ok: false,
            status: 500,
            message: 'Internal server error'
        })
    }
}

const getConversation = async (req, res) => {  
    try{
        const user_id = req.user.id
        const {receiver_id} = req.params
        const conversation = await MessageRepository.findMessagesBetweenUsers(user_id, receiver_id)
        const contact = await UserRepository.findUserById(receiver_id)
        return res.status(200).json({
            ok: true,
            status: 200,
            message: 'Conversation found',
            data: {
                conversation,
                contact: {
                    name: contact.name,
                    ultimaConexion: contact.ultimaConexion,
                    id: contact.id
                }
                
            }
        })
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            ok: false,
            status: 500,
            message: 'Internal server error'
        })
    }    
}


const deleteMessage = async (req, res) => {
    try {
        const { message_id } = req.params;

        const deletedMessage = await MessageRepository.deleteMessage(message_id);

        if (!deletedMessage) {
            return res.status(404).json({
                ok: false,
                status: 404,
                message: "Message not found",
            });
        }

        return res.status(200).json({
            ok: true,
            status: 200,
            message: "Message deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            status: 500,
            message: "Internal server error",
        });
    }
};

export {createMessage, getConversation, deleteMessage}