import * as express from 'express';
import http from 'http';
import { init,server } from '../../server';
export default class IntegrationHelpers {
    private _appInstance: http.Server;
    private _appServer: express.Express;
    public initApp() {
        this._appInstance = init();
        this._appServer = server;
    }

    get appInstance() { return this._appInstance }
    get appServer() {return this._appServer}
}