import transporter from "../config/emailConfig.js";
import dotenv from 'dotenv';

dotenv.config();

export const sendEmail = async (req, res) => {
    const { to, subject } = req.body;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            template: 'emailTemplate',  // Debe coincidir con el nombre del archivo
            context: { mensaje: 'Bienvenido a la plataforma' }
        });
        return res.json({ message: 'Correo enviado' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Función para enviar el correo de restablecimiento de contraseña
export const sendEmailPass = async (req, res) => {
    const { userId, userName, resetToken } = req.body;

    try {
        // Definir el contenido del correo
        const subject = "Recuperación de contraseña";
        const message = `Para restablecer tu contraseña, utiliza el siguiente token: ${resetToken}`;

        // Enviar el correo
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userName,  // Usar el correo del usuario
            subject,
            template: 'EmailPassTemplate',
            text: message  // Mensaje con el token
        });

        return res.json({ message: 'Correo de recuperación enviado' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
