import express from "express";
import { UrlBuilder } from './services/UrlBuilder';
import dotenv from 'dotenv';
import { logger, LoggerStream } from "./config/winston";
import morgan from "morgan";
import path from 'path';
import { FetchError } from "./services/RequestProcessor";
import messages from "./config/messages";
import { PokemonFetcher, PokemonResponseFailure, PokemonResponseSuccess } from "./models/pokemon";

// Load up env variables
dotenv.config({ path: path.join(__dirname, "..", '.env') });

const app: any = express();
app.use(morgan("combined", { stream: new LoggerStream() }));

// Setup auth token and server port.
const SERVER_PORT = process.env.SERVER_PORT;

app.get('/pokemon/:pokemon_name', async (req: express.Request, res: express.Response) => {
    const pokemonName = req.params.pokemon_name;
    let failureMessage: PokemonResponseFailure;
    res.setHeader("Access-Control-Allow-Origin", "*")
    if (pokemonName.length === 0) {
        failureMessage = {
            error: "pokemon_name_invalid",
            description: messages.pokemon_name_invalid
        }
        res.status(400);
        return res.send(failureMessage);
    }

    const pFetcher = new PokemonFetcher();
    const result: PokemonResponseSuccess | FetchError = await pFetcher.fetchPokemonDetails(pokemonName);
    res.status(result.status);
    res.send(result)

})

export const init = function appInit() {
    return app.listen(SERVER_PORT, () => {
        console.log(`Server successfully started on ${SERVER_PORT}`);
    });
}

export const server = app;
if (!(process.env.NODE_ENV === "test")) {
    init()
}