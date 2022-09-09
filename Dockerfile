FROM node:18

COPY package.json package.json
COPY client/package.json client/package.json
RUN npm install
RUN cd client/ && npm install
RUN cd ..
COPY . .

USER root 
RUN chmod 755 ./scripts/start.sh

CMD ./scripts/start.sh
