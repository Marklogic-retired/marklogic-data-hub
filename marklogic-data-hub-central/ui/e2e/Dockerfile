FROM cypress/base:10
RUN mkdir -p e2e
COPY package.json e2e/package.json
COPY ./cypress e2e/cypress
COPY ./qa-project e2e/qa-project
COPY ./cypress.json e2e/cypress.json
COPY ./tsconfig.json e2e/tsconfig.json
COPY ../src/services/user-preferences ./src/services/user-preferences

CMD  cd e2e;npm run cypress:run ; chmod -R 777 cypress results ; rm -rf node_modules;
