# api-gateway/Dockerfile

FROM node:22

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the API gateway port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
