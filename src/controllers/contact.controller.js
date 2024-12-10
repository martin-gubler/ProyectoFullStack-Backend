import UserRepository from "../repositories/user.repository.js"

const addContact = async (req, res) => {
    console.log('addContact controller reached');
    try{
        const user_id = req.user.id
        const {name} = req.body
        console.log('Request body:', req.body); // Verifica que el body llega correctamente
        console.log('User ID:', user_id); // Verifica que el ID del usuario autenticado está disponible

        const user_found = await UserRepository.findUserByUsername(name)
        console.log('User found:', user_found); // Confirma si se encontró al usuario

        const autoAdd = user_found._id == user_id; 
        if (autoAdd) {
            return res.status(400).json({
            ok: false,
            status: 400,
            message: 'No te puedes autoañadir'
            });
        }

        if(!user_found){
            console.log('Paso 3: Usuario no encontrado');
            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'User not found'
            })
        }

        //Validamos que el usuario no este ya en la lista de contactos
        console.log('Paso 4: Validando duplicado en contactos');
        const user = await UserRepository.findUserById(user_id)
        if(user.contacts.includes(user_found._id)){
            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'User already in contacts'
            })
        }

        console.log('Paso 5: Agregando contacto');
        await UserRepository.addContact(user_id, user_found._id)

        console.log('Paso 6: Enviando respuesta exitosa');
        return res.status(200).json({
            ok: true,
            status: 200,
            message: 'Contact added successfully'
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

const getContacts = async (req, res) => {
    try{
        const user_id = req.user.id
        
        const user = await UserRepository.findContacts(user_id)
        if(!user){
            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'User not found'
            })
        }

        return res.status(200).json({
            ok: true,
            status: 200,
            message: 'Contacts found',
            data: {
                contacts: user.contacts
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


const getInfoContacto = async (req, res) => {
    try{
        const { user_id }= req.params
        
        const user = await UserRepository.findUserById(user_id)
        if(!user){
            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'User not found'
            })
        }

        return res.status(200).json({
            ok: true,
            status: 200,
            message: 'Contact found',
            data: {
                name: user.name,
                profilePicture: user.profilePicture
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
export {addContact, getContacts, getInfoContacto}