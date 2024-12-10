import transporter from "../config.js/transporter.config.js"

const sendEmail = async (options) => {
    try{
        let response = await transporter.sendMail(options)
    }
    catch(error){
        //Para poder trackear el error mejor y arreglarlo
        console.error('Error al enviar mail', error)
        //Para que la funcion que invoque a esta funcion tambien le salte el error
        throw error

    }
}
sendEmail({
    html: 'Hola desde node.js',
    subject: 'probar',
    to:'ggubler04@gmail.com'})

export {sendEmail}
