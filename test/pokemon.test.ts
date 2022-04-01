// import { agent as request } from "supertest";
// import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
// import IntegrationHelpers from './helpers/Integration-helpers';
// import { pokemonDetails as pokemonSuccess, pokemonSpeciesDetails as pokemonSpeciesSuccess, shakespeareTranslateDetails as shakespeareTranslateSuccess } from "./data/details_success";
// import * as express from 'express';
// import http from 'http';
// import { UrlBuilder } from "../services/UrlBuilder";
// import fs from "fs";
// import path from "path";

// /* API testing using jest and mock API's */

// describe('Testing API endpoint', () => {
//     let app: http.Server;
//     let server: express.Express;

//     beforeAll(async () => {
//         const helper = new IntegrationHelpers();
//         helper.initApp();
//         app = helper.appInstance;
//         server = helper.appServer;
//         enableFetchMocks();
//     });

//     it('starts a round-up with correct details', async () => {
//         fetchMock.resetMocks();
//         setupMockAPI(pokemonSuccess, pokemonSpeciesSuccess, shakespeareTranslateSuccess);
//         const res = await request(server)
//             .post('/api/roundoff')
//             .send();
//         expect(res.statusCode).toEqual(200);
//         expect(res.body).toHaveProperty("savings_goal_uid");
//         expect(res.body).toHaveProperty("transfer_id");
//         expect(res.body).toHaveProperty("savings_goal_amount");
//         expect(res.body).toHaveProperty("message");
//         expect(res.body.message).toBe('Savings goal successfully created and money transferred');
//     });

//     it('starts a round-up and fails because of errors in savings goal data', async () => {
//         fetchMock.resetMocks();
//         setupMockAPI(account1, feed1, {
//             'errors': [{ 'message': 'Testing' }]
//         }, transfer1)
//         const res = await request(server)
//             .post('/api/roundoff')
//             .send();
//         expect(res.statusCode).toEqual(400);
//         expect(res.body).toHaveProperty("error");
//         expect(res.body.error).toBe('Testing');
//     });

//     it('starts a round-up and fails because of errors in savings goal data', async () => {
//         fetchMock.resetMocks();
//         setupMockAPI(account1, feed1, {
//             'errors': [{ 'message': 'Testing' }]
//         }, transfer1)
//         const res = await request(server)
//             .post('/api/roundoff')
//             .send();
//         expect(res.statusCode).toEqual(400);
//         expect(res.body).toHaveProperty("error");
//         expect(res.body.error).toBe('Testing');
//     });

//     it('starts a round-up and fails because of invalid json response for accounts', async () => {
//         fetchMock.resetMocks();
//         setupMockAPI("ABC", feed1, goal1, transfer1)
//         const res = await request(server)
//             .post('/api/roundoff')
//             .send();
//         expect(res.statusCode).toEqual(400);
//         expect(res.body).toHaveProperty("error");
//         expect(res.body.error).toBe("Cannot read properties of undefined (reading 'map')");
//     });

//     it('starts a round-up and fails because of error in savings goal data', async () => {
//         fetchMock.resetMocks();
//         setupMockAPI(account1, feed1, {
//             'error': 'Savings failed'
//         }, transfer1)
//         const res = await request(server)
//             .post('/api/roundoff')
//             .send();
//         expect(res.statusCode).toEqual(400);
//         expect(res.body).toHaveProperty("error");
//         expect(res.body.error).toBe('Savings failed');
//     });

//     it('starts a round-up and fails because of invalid json reponse for feed data', async () => {
//         fetchMock.resetMocks();
//         setupMockAPI(account1, "ABC", goal1, transfer1)
//         const res = await request(server)
//             .post('/api/roundoff')
//             .send();
//         expect(res.statusCode).toEqual(400);
//         expect(res.body).toHaveProperty("error");
//         expect(res.body.error).toBe("No Feed Items Found");
//     });

//     it('starts a round-up and fails because no account details in response', async () => {
//         fetchMock.resetMocks();
//         setupMockAPI({accounts:[]}, feed1, goal1, transfer1)
//         const res = await request(server)
//             .post('/api/roundoff')
//             .send();
//         expect(res.statusCode).toEqual(400);
//         expect(res.body).toHaveProperty("error");
//         expect(res.body.error).toBe("Account not setup");
//     });

//     it('starts a round-up and fails because of insufficient funds', async () => {
//         fetchMock.resetMocks();
//         setupMockAPI(account1, feed1, goal1, ["Insufficient funds"])
//         const res = await request(server)
//             .post('/api/roundoff')
//             .send();
//         expect(res.body).toHaveProperty("error");
//         expect(res.body.error[0]).toBe('Insufficient funds');
//     });

//     afterAll(async () => {
//         await app.close();
//     })

// });

// function setupMockAPI(account: any, feed: any, goal: any, transfer: any, tokenTest: string = null, tokenTestOn = "", refreshData:any={}) {
//     fetchMock.mockIf(new RegExp("^" + process.env.HOSTNAME + ".*$"), async (req: Request) => {
//         if (req.url === UrlBuilder.getApiUrl("FETCH_ACCOUNTS")) {
//             if (tokenTest && tokenTestOn === "accounts" && req.headers.get("Authorization") === `Bearer ${tokenTest}`) {
//                 return {
//                     status: 400,
//                     body: JSON.stringify({
//                         "error": "invalid_token",
//                         "error_description": "Could not validate provided access token"
//                     }),
//                     headers: {
//                         "Content-Type": "application/json"
//                     }
//                 }
//             }
//             return {
//                 body: JSON.stringify(account),
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         } else if (req.url.split("?")[0] === UrlBuilder.getApiUrl("FETCH_FEED", {
//             accountUid: account.accounts[0].accountUid,
//             defaultCategory: account.accounts[0].defaultCategory,
//             changesSince: ""
//         }).split("?")[0]) {
//             if (tokenTest && tokenTestOn === "feed" && req.headers.get("Authorization") === `Bearer ${tokenTest}`) {
//                 return {
//                     status: 400,
//                     body: JSON.stringify({
//                         "error": "invalid_token",
//                         "error_description": "Could not validate provided access token"
//                     }),
//                     headers: {
//                         "Content-Type": "application/json"
//                     }
//                 }
//             }
//             return {
//                 body: JSON.stringify(feed),
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         } else if (req.url === UrlBuilder.getApiUrl("CREATE_GOAL", {
//             accountUid: account1.accounts[0].accountUid
//         })) {
//             if (tokenTest && tokenTestOn === "savings" && req.headers.get("Authorization") === `Bearer ${tokenTest}`) {
//                 return {
//                     status: 400,
//                     body: JSON.stringify({
//                         "error": "invalid_token",
//                         "error_description": "Could not validate provided access token"
//                     }),
//                     headers: {
//                         "Content-Type": "application/json"
//                     }
//                 }
//             }
//             return {
//                 body: JSON.stringify(goal),
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         } else if (req.url.includes("add-money")) {
//             if (tokenTest && tokenTestOn === "transfer" && req.headers.get("Authorization") === `Bearer ${tokenTest}`) {
//                 return {
//                     status: 400,
//                     body: JSON.stringify({
//                         "error": "invalid_token",
//                         "error_description": "Could not validate provided access token"
//                     }),
//                     headers: {
//                         "Content-Type": "application/json"
//                     }
//                 }
//             }
//             return {
//                 body: JSON.stringify(transfer),
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         } else if (req.url.includes("oauth/access-token")) {
//             return {
//                 status: 400,
//                 body: JSON.stringify(refreshData),
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         } else {
//             return {
//                 status: 404,
//                 body: 'Not Found'
//             }
//         }
//     });
// }