FROM node:14

WORKDIR /usr/src/app

# Copy both package.json and package-lock.json if they exist
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Command to run the producer or consumer app
CMD ["node", "consumer.js"]
