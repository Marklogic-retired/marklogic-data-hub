FROM cypress/base:10

COPY package.json package.json
COPY ./cypress ./cypress
COPY ./qa-project ./qa-project
COPY ./cypress.json ./cypress.json
COPY ./tsconfig.json ./tsconfig.json

CMD npm i && npm run cypress:run ; chmod -R 777 cypress results ; rm -rf node_modules || true