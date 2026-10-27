FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Expose port (Cloud Run sets PORT via env)
EXPOSE 8080

# Start command
CMD [ "node", "server.js" ]
