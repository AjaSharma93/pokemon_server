import { agent as request } from "supertest";
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import IntegrationHelpers from './helpers/Integration-helpers';
import { pokemonDetails as pokemonDetailsSuccess } from "./data/charizard_success";
import { pokemonSpeciesDetails as pokemonSpeciesSuccess } from "./data/charizard_species_success";
import { shakespeareTranslate as shakespeareSuccess } from "./data/shakespeare_translate_success";
import { shakespeareTranslate as shakespeareFailure } from "./data/shakespeare_translate_failure";
import * as express from 'express';
import http from 'http';
import { UrlBuilder } from "../services/UrlBuilder";
import fs from "fs";
import path from "path";

/* API testing using jest and mock API's */
const POKEMON_NAME = 'charizard';

describe('Testing API endpoint /pokemon/:pokemon', () => {
    let app: http.Server;
    let server: express.Express;

    beforeAll(async () => {
        const helper = new IntegrationHelpers();
        helper.initApp();
        app = helper.appInstance;
        server = helper.appServer;
        enableFetchMocks();
    });

    it('fetches pokemon data successfully with valid data', async () => {
        fetchMock.resetMocks();
        setupMockAPI(pokemonDetailsSuccess, pokemonSpeciesSuccess, shakespeareSuccess);
        const res = await request(server)
            .get(`/pokemon/${POKEMON_NAME}`)
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("status");
        expect(res.body).toHaveProperty("description");
        expect(res.body).toHaveProperty("sprite");
        expect(res.body).toHaveProperty("name");
        expect(res.body.name).toBe('charizard');
        expect(res.body.description).toBe('Spits fire yond\\nis hot enow to\\nmelt boulders.\\fknown to cause\\nforest fires\\nunintentionally.');
        expect(res.body.sprite).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png');
    });

    it('fails to fetch pokemon data because of translate api rate limit', async () => {
        fetchMock.resetMocks();
        setupMockAPI(pokemonDetailsSuccess, pokemonSpeciesSuccess, shakespeareFailure);
        const res = await request(server)
            .get(`/pokemon/${POKEMON_NAME}`)
            .send();
        expect(res.statusCode).toEqual(429);
        expect(res.body).toHaveProperty("status");
        expect(res.body.status).toBe(429);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toBe("Too Many Requests: Rate limit of 5 requests per hour exceeded. Please wait for 9 minutes and 53 seconds.");
    });

    it('fails to fetch pokemon data because pokemon not found', async () => {
        fetchMock.resetMocks();
        setupMockAPI(pokemonDetailsSuccess, pokemonSpeciesSuccess, shakespeareFailure);
        const res = await request(server)
            .get(`/pokemon/abcd`)
            .send();
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty("status");
        expect(res.body.status).toBe(404);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toBe("Not Found");
    });

    afterAll(async () => {
        await app.close();
    })

});

function setupMockAPI(pokemonData: any, pokemonSpeciesData: any, translateData: any) {
    fetchMock.mockResponse(async (req: Request) => {
        const pokemonUrlBuilder = new UrlBuilder(process.env.POKEMON_SERVER_URL);
        if (req.url === `${pokemonUrlBuilder.getApiUrl("FETCH_POKEMON")}/${POKEMON_NAME}`) {
            console.log('here');
            return {
                body: JSON.stringify(pokemonData),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        } else if (req.url === pokemonData?.species?.url) {
            return {
                body: JSON.stringify(pokemonSpeciesData),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        } else if(req.url.match(new RegExp("^" + process.env.SHAKESPEARES_URL + ".*$"))){
            return {
                status:translateData?.error?.code ?? 200,
                body: JSON.stringify(translateData),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        }else {
            return {
                status: 404,
                body: 'Not Found'
            }
        }
    });
}