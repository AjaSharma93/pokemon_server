# pokemon_server
The backend server uses **Node.js 17.7** and **Typescript 4.6.2**.
API requests can be made to the URL:
```
GET http://{SERVER_URL}/pokemon/{POKEMON NAME}
```

Sample request:
```
curl --location --request GET 'http://localhost:49160/pokemon/pikachu/'
```

Sample response body:
```
{"status":200,"name":"pikachu","description":"At which hour several of these pokémon gather,  their electricity couldst buildeth and cause lightning storms.","sprite":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"}
```

To run tests:
Install NodeJS from the link [NodeJS 17.7](https://nodejs.org/download/release/v17.7.2/)
Install typescript using the following command:
```
npm install -g typescript
```

Finally, run tests using:
```
npm run test
```

For deployment to docker, use the following command:
`docker-compose -f .\dockercompose.prod.yml up -d --build`

The service will be deployed on the external port **8085**.
