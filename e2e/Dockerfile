FROM cypress/base:10

COPY package.json package.json
RUN npm i

COPY ./cypress ./cypress
COPY ./qa-project ./qa-project
COPY ./cypress.json ./cypress.json
COPY ./tsconfig.json ./tsconfig.json

CMD ["npm", "run", "cypress:run"]