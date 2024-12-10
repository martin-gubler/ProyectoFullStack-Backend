import ENVIROMENT from "../config.js/enviroment.config.js"
import ResponseBuilder from "../utils/response.Builder.js"
import jwt from 'jsonwebtoken'

//roles_permitidos es un parametro que en caso de estar deberia ser un array de roles o en caso de no estar debe ser un array vacio []

//Se invoca el verifyTokenMiddleware y recibe los roles_permitidos, y luego esa funcion retorna el middleware
export const verifyTokenMiddleware = (roles_permitidos = []) => {
    return (req, res, next) => {
        console.log('verifyTokenMiddleware reached');
        try{
            const auth_header = req.headers['authorization']
            console.log('Authorization Header:', auth_header);
            if(!auth_header){
                const response = new ResponseBuilder()
                .setOk(false)
                .setMessage('Falta token de autorizacion')
                .setStatus(401)
                .setPayload({
                    detail: "Se esperaba un token de autorizacion"
                })
                .build()
                return res.status(401).json(response)
            }

            const access_token = auth_header.split(' ')[1]
            if(!access_token){
                const response = new ResponseBuilder()
                .setOk(false)
                .setMessage('El token de autorizacion esta mal formado')
                .setStatus(401)
                .setPayload({
                    detail: "Se esperaba un token de autorizacion"
                })
                .build()
                return  res.status(401).json(response)
            }
            const decoded = jwt.verify(access_token, ENVIROMENT.JWT_SECRET)
            //Guardamos en la request la informacion del usuario
            req.user = decoded 
            console.log('Token verified:', decoded);
            

            if(roles_permitidos.length && !roles_permitidos.includes(req.user.role)){
                const response = new ResponseBuilder()
                .setOk(false)
                .setMessage('Acceso restringido')
                .setStatus(403)
                .setPayload({
                    detail: 'No tiene los permisos necesarios para realizar esta operacion'
                })
                .build()

            return res.status(403).json(response)
            }
            return next() //pasamos al siguiente controlador
        }
        catch(error){
            const response = new ResponseBuilder()  
            .setOk(false)
            .setMessage('Fallo al autentificar')
            .setStatus(401)
            .setPayload({
                detail: error.message
            })
            .build()
            return res.status(401).json({ response })
        }
    }
}



export const verifyApiKeyMiddleware = (req, res, next) => {
    try {
        const apiKeyHeader = req.headers['x-api-key'];
        if(!apiKeyHeader){
            const response = new ResponseBuilder()  
            .setOk(false)
            .setMessage('Unauthorized')
            .setStatus(401)
            .setPayload({
                detail: 'Se esperaba un api-key'
            })
            .build()
            return res.status(401).json(response)
        }
        if(apiKeyHeader !== ENVIROMENT.API_KEY_INTERN){
            const response = new ResponseBuilder()  
            .setOk(false)
            .setMessage('Unauthorized')
            .setStatus(401)
            .setPayload({
                detail: 'Se esperaba un api-key valida'
            })
            .build()
            return res.status(401).json(response)
        }
        next()
    }
    catch(error){
        const response = new ResponseBuilder()  
        .setOk(false)
        .setMessage('Internal server error')
        .setStatus(500)
        .setPayload({
            detail: 'No se pudo validar la api-key'
        })
        .build()
        return res.status(401).json(response)
    }
}

