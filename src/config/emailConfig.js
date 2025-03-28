import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Configurar Handlebars como motor de plantillas
const handlebarOptions = {
    viewEngine: {
        extName: ".hbs",
        partialsDir: path.resolve("./src/templates"),
        defaultLayout: false,
    },
    viewPath: path.resolve("./src/templates"),
    extName: ".hbs",
};

transporter.use('compile', hbs(handlebarOptions));

export default transporter;
