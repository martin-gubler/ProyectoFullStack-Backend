import User from "../models/user.model.js"


//Manejamos la logica de comunicacion con la DB, relacionado a los usuarios
class UserRepository{

    static async createUser(user_data) {
        return User.create(user_data)
    }

    static async addContact(user_id, contact_id){
        //El contact_id debe pertenecer a un usuario real
        return User.findByIdAndUpdate(user_id, {
            $push:{
                contacts: contact_id
            }
        })
    }
    static async findUserById (user_id){
        return User.findById(user_id)
    }


    static async findUserByUsername (name){
        return User.findOne({name: name})
    }

    static async findContacts(user_id){
        return User.findById(user_id).populate('contacts', 'name profilePicture ultimaConexion')
    }

    static async obtenerPorId(id){
        const user = await User.findOne({_id: id})
        return user
    }

    static async obtenerPorEmail(email){
        const user = await User.findOne({email})
        return user
    }
    static async guardarUsuario (user){
        return await user.save()
    }

    static async setEmailVerified(value, user_id){
        const user = await UserRepository.obtenerPorId(user_id)
        user.emailVerified = value
        return await UserRepository.this.guardarUsuario()
    }
}


export default UserRepository