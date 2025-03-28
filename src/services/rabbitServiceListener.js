import transporter from "../config/emailConfig.js";
import dotenv from 'dotenv';
import amqp from "amqplib";

dotenv.config();

const RABBITMQ_URL = process.env.RABBIT_HOST;

export async function userEvents() {
    try {
        const connection = await amqp.connect({
                protocol: 'amqp',
                hostname: process.env.RABBITMQ_HOST || 'rabbitmq',
                port: 5672,
                username: process.env.RABBITMQ_USER || 'user',
                password: process.env.RABBITMQ_PASS || 'password'
            });
        const channel = await connection.createChannel();

        const exchange = 'user_event';
        const queue = 'user_created_queue';
        const routingKey = 'user.created';

        await channel.assertExchange(exchange, 'topic', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log(`Esperando mensajes en ${queue}`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const user = JSON.parse(msg.content.toString());
                console.log("Usuario recibido:", user);

                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: user.userName,
                        subject: "Bienvenido a la plataforma",
                        template: 'emailTemplate',
                        context: {  email: user.userName }
                    });
                    console.log(`Correo enviado a ${user.userName}`);
                } catch (emailError) {
                    console.error("Error enviando correo:", emailError.message);
                }

                channel.ack(msg);
            }
        }, { noAck: false });

        connection.on('close', () => {
            console.error('Conexión cerrada, reintentando en 5s...');
            setTimeout(userEvents, 5000);
        });
    } catch (error) {
        console.error("Error conectando con RABBITMQ:", error.message);
        console.log('Reintentando en 5s...');
        setTimeout(userEvents, 5000);
    }
}


export async function passwordResetEvents() {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST || 'rabbitmq',
            port: 5672,
            username: process.env.RABBITMQ_USER || 'user',
            password: process.env.RABBITMQ_PASS || 'password'
        });
        const channel = await connection.createChannel();

        const exchange = 'password_reset_event';
        const queue = 'password_reset_queue';
        const routingKey = 'password.reset';

        await channel.assertExchange(exchange, 'topic', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log(`Esperando mensajes en ${queue}`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const { userId, userName, resetToken } = JSON.parse(msg.content.toString());
                console.log("Evento recibido de restablecimiento de contraseña:", { userId, userName, resetToken });

                try {
                    // Aquí puedes manejar la lógica para restablecer la contraseña (ej. actualizando la base de datos)
                    console.log(`Restableciendo la contraseña para el usuario: ${userName}`);
                    
                    // Si se requiere una actualización de la base de datos con la nueva contraseña, aquí iría esa lógica.

                    // Confirmar que el mensaje fue procesado correctamente
                    channel.ack(msg);

                } catch (error) {
                    console.error("Error al procesar el evento de restablecimiento de contraseña:", error.message);
                    channel.nack(msg, false, true); // Reprocesar el mensaje en caso de error
                }
            }
        }, { noAck: false });

        connection.on('close', () => {
            console.error('Conexión cerrada, reintentando en 5s...');
            setTimeout(passwordResetEvents, 5000);
        });
    } catch (error) {
        console.error("Error conectando con RABBITMQ:", error.message);
        console.log('Reintentando en 5s...');
        setTimeout(passwordResetEvents, 5000);
    }
}
