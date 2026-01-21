# Nutze ein leichtgewichtiges Node-Image
FROM node:18-alpine

# Arbeitsverzeichnis im Container
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY package*.json ./
RUN npm install

# Restlichen Code kopieren
COPY . .

# Port freigeben (Backend-Port)
EXPOSE 5000

# Start-Befehl
CMD ["npm", "start"]