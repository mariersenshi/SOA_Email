#usar la imagen base de Node
FROM node:18 

#espablecer el directorio
WORKDIR /app 

#copia y descargarga dependencias
COPY package.json ./ 

#instala 
RUN npm install 

#copia el codigo fuente al contenedor
COPY . . 

#Exponer el puerto
EXPOSE 3000 

#comando para iniciar
CMD ["node","index.js"] 