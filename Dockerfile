FROM node:6

RUN mkdir -p src/

COPY ./ src/

WORKDIR src/

RUN npm install

CMD ["node", "index"]

EXPOSE 8000
