FROM library/node:12
WORKDIR /app
COPY . /app


RUN npm install -g gulp
RUN npm i
RUN npm i ./demo

CMD ["gulp"]