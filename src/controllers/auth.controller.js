import bcrypt from 'bcrypt'
import User from '../models/user.model.js'
import ResponseBuilder from '../utils/response.Builder.js'
import { sendEmail } from '../utils/mail.util.js'
import jwt from 'jsonwebtoken'
import ENVIROMENT from '../config.js/enviroment.config.js'
import UserRepository from '../repositories/user.repository.js'



export const registerUserController = async (req, res) => {   
    const {name, email, password} = req.body
    try{

        if(!name){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Bad request')
            .setPayload(
                {
                    detail: 'El nombre no es valido, o no fue introducido'
                }
            )
            .build()
            return res.status(400).json(response)
        }

        if(!email){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Bad request')
            .setPayload(
                {
                    detail: 'El email no es valido, o no fue introducido'
                }
            )
            .build()
            return res.status(400).json(response)
        }

        if(!password){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Bad request')
            .setPayload(
                {
                    detail: 'La contraseña no es valida, o no fue introducida'
                }
            )
            .build()
            return res.status(400).json(response)
        }
        const existentUser = await User.findOne({email: email})
        console.log({existentUser})
        if(existentUser){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Bad request')
            .setPayload(
                {
                    detail: 'El usuario ya esta registrado'
                }
            )
            .build()
            return res.status(400).json(response)
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationToken = jwt.sign({email: email}, ENVIROMENT.JWT_SECRET, {
            expiresIn: '1d'
        })

        
        await sendEmail({
            to: email,
            subject: 'verificacion de mail con token',
            html: `
            <h1>Token de verificacion</h1>
            <p>Copia el token de verificacion y verifica el mail antes de iniciar sesion</p>
            <p style="font-weight: bold;">${verificationToken}</p>
            `
        })

        const newUser = new User ({
            name,
            email,
            password: hashedPassword,
            verificationToken: verificationToken,
            emailVerified: false
        })

        //Metodo save nos permite guardar el objeto en la DB
        await newUser.save()
    
        const respose = new ResponseBuilder()
        .setOk(true) 
        .setStatus(200)
        .setMessage('created')
        .setPayload({ user: {
            name,
            email,
        }})
        .build()
        return res.status(201).json(respose)
    }
    catch(error){
        console.error('Error al registrar usuario', error)
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('internal server error')
        .setPayload(
            {
                detail: error.message
            }
        )
        .build()
        return res.status(500).json(response)
    }
}


export const verifyMailValidationTokenController = async (req, res) => {
    const { verification_token } = req.body; 
    try {
        
        if (!verification_token) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setPayload({
                    detail: 'Falta enviar token',
                })
                .build();
            return res.status(400).json(response);
        }

        const decoded = jwt.verify(verification_token, ENVIROMENT.JWT_SECRET); 
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setPayload({
                    detail: 'Usuario no encontrado',
                })
                .build();
            return res.status(404).json(response);
        }

        if (user.emailVerified) {
            const response = new ResponseBuilder()
                .setOk(true)
                .setStatus(200)
                .setMessage('El correo ya ha sido verificado previamente.')
                .build();
            return res.status(200).json(response);
        }

        user.emailVerified = true;
        await user.save();

        const response = new ResponseBuilder()
            .setOk(true)
            .setMessage('Email verificado con éxito')
            .setStatus(200)
            .setPayload({
                message: 'Usuario validado',
            })
            .build();
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Error interno del servidor')
            .setPayload({
                detail: error.message,
            })
            .build();
        return res.status(500).json(response);
    }
};


export const loginController = async (req, res) => {
    try{
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user) {
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setMessage('Usuario no encontrado')
            .setPayload({
                detail:'El email no esta registrado'
            })
            .build()
            return res.status(404).json(response);
        }
        if(!user.emailVerified){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(403)
            .setMessage('El email no verificado')
            .setPayload({
                detail:'Porfavor, verifica tu correo electronico antes de iniciar sesion'
            })
            .build()
            return res.status(403).json(response);
        }
        const isValidPassword = await bcrypt.compare(password, user.password)
        if(!isValidPassword){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(401)
            .setMessage('Credenciales incorrectas')
            .setPayload({
                detail:'Contrasena incorrecta'
            })
            .build()
            return res.status(401).json(response)
        }
        const token = jwt.sign({
            email: user.email, 
            id: user._id, 
            role: user.role
        }, ENVIROMENT.JWT_SECRET, {expiresIn: '5d'})
        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('logueado')
        .setPayload({
            token,
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
        .build()
        return res.status(200).json(response);
    }
    catch(error){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('Internal server error')
        .setPayload({
            detail: error.message
        })
        .build()
        return res.status(500).json(response);
    } 
}

export const forgotPasswordController = async (req, res) => {
    try {
        const {email} = req.body
        //Validamos que llegue el email
        console.log("hola")
        console.log(email)
        console.log({email})
        const user = await UserRepository.obtenerPorEmail(email)
        if(!user){
            console.log(`User with email ${email} not found.`);
        }
        const resetToken = jwt.sign({email: user.email}, ENVIROMENT.JWT_SECRET, {
            expiresIn: '1h'
        })
        const resetUrl = `${ENVIROMENT.URL_FRONT}/reset-password/${resetToken}`
        sendEmail({
            to: user.email,
            subject: 'Restablecer contrasena',
            html: `
                <div>
                    <h1>Has solicitado restablecer tu contrasena</h1>
                    <p>Has click en el enlace de abajo para restablecer tu contrasena</p>
                    <a href='${resetUrl}'>Restablecer</a>
                </div>
            `
        })
        const response = new ResponseBuilder()
        response.setOk(true)
        response.setStatus(200)
        response.setMessage('Se envio el correo')
        response.setPayload({
            detail:'Se envio un correo electronico con las instrucciones para restablecer la contrasena'
        }
    )
        .build()
        return res.json(response)
    } 
    catch(error){
        console.log(error)
    }
}

export const resetTokenController = async (req, res) => {
    try{
    const {password} = req.body
    const {reset_token} = req.params
    if(!password){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(400)
        .setPayload({
            detail: 'Se necesita una nueva contrasena'
        })
        .build()
        return res.status(400).json(response);
    }
    if(!reset_token){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setPayload({
                detail: 'Falta enviar token'
            })
            .build()
            return res.status(400).json(response);
        }
    
    const decoded = jwt.verify(reset_token, ENVIROMENT.JWT_SECRET)
    console.log('Token decodificado de ejemplo:', decoded)
    
    if(!decoded){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(400)
        .setPayload({
            detail: 'Falta token de verificacion'
        })
        .build()
        return res.status(400).json(response);
    }

    const { email } = decoded

    const user = await UserRepository.obtenerPorEmail(email)
        
    if(!user){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setPayload({
                detail: 'Usuario no encontrado'
            })
            .build();
            return res.status(404).json(response);
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword; 
        await user.save()

            const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Contrasena cambiada con exito')
            .setPayload({
                detail: 'Contraseña actualizada exitosamente'
            })
            .build();
            return res.status(200).json(response);
    }
    catch(error){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setPayload({
            detail: 'Error interno del servidor',
            error: error.message
        })
        .build();
        return res.status(500).json(response);
    }
}


