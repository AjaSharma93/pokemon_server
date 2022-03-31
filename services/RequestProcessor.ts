import { logger } from "../config/winston";

export type FetchError = {
    status:number,
    error:string
}

export class RequestProcessor{
    public static async processRequest<T>(url:string, args:RequestInit, urlArgs:any={}, numTries:number = 1):Promise<T|FetchError>{
        try{
            if(!url)
                return {
                    status:400,
                    error:"Invalid URL"
                }

            const response:Response = await fetch(url, args);
            const jsonData:T|string = await response.json();

            if(response.status!==200 && typeof jsonData === "string"){
                return {
                    status:response.status,
                    error:jsonData
                }
            }
            return {
                status:response.status,
                ...(jsonData as T)
            };
        }catch(err){
            logger.error(`Error occurred while sending request ${err.message}`);
            return {
                status:400,
                error:err.message
            }
        }
    }
}