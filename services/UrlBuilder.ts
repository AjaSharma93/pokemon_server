/* Class definition to build API urls*/

export class UrlBuilder {
    private pathList = new Map<string, string>();
    private _serverUrl: string;

    constructor(serverUrl:string){
        this._serverUrl = serverUrl;
        this.pathList.set('FETCH_POKEMON', '/api/v2/pokemon');
        this.pathList.set('SHAKESPEARE_JSON', '/translate/shakespeare.json');
    }

    getApiUrl(pathName: string, params: any={}) {
        let completeUrl: string = `${this._serverUrl}${this.pathList.get(pathName)}`;
        // Replace any params in the tempate string
        completeUrl = completeUrl.replace(/{([^{}]+)}/g, (keyExpr, key) => {
            return encodeURIComponent(params[key]) || "";
        });
        return completeUrl;
    }
}