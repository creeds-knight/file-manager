# Using the Official Node.js runtime as a parent image
FROM node:18

#install supervisor
#RUN apt-get update && apt-get install -y supervisor

# Setting the working directory
WORKDIR /file_manager

# Copying `package.json` and `package.json to install dependencies`
COPY package*.json ./

#Install dependencies
RUN npm install

#install tmux for terminal multiplexing
#RUN apt-get update && apt-get install -y tmux && apt-get clean

# Copying the rest of the application code
COPY . .

# make the start-tmux.sh script executable
#RUN chmod +x ./start-tmux.sh

#Create a supervisor config file
#COPY supervisor.conf /etc/supervisor/conf.d/supervisord.conf


# Expose the port
EXPOSE 3000

# Set the environment for production or development
ENV MODE_ENV=development

# start supervisor
#CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]

# start the Node.js application
CMD ["npm", "run", "start-server"]
