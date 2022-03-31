import { logger } from "../config/winston"
import { FetchError, RequestProcessor } from "../services/RequestProcessor"
import { UrlBuilder } from "../services/UrlBuilder"


type Pokemon = {
    id: number,
    name: string,
    description: string,
    sprite: string
}

/* Currently using only the attributes required from the pokemon server response */
type PokemonResponse = {
    status: number,
    id: number,
    name: string,
    sprites: {
        front_default: string
    },
    species:{
        url:string
    }
}

/* Currently using only the attributes required from the pokemon server response */
type PokemonSpeciesResponse = {
    status: number,
    flavor_text_entries: {
        flavor_text:string,
        language:{
            name:string,
            url:string
        },
        version:number
    }[]
}

type ShakespeareResponse = {
    success: {
      total: 1
    },
    contents: {
      translated: string,
      text: string,
      translation: string
    }
  }

/* Success and failure types used by the local server */
export type PokemonResponseSuccess = {
    status: number,
    name: string,
    description: string,
    sprite: string
}

export type PokemonResponseFailure = {
    status?: number,
    error: string,
    description?: string
}


/* Class definition to store the account details of a particular account */
export class PokemonFetcher {
    private _pokemon: Pokemon;
    get pokemon() { return this._pokemon }

    async fetchPokemonDetails(pokemonName: string): Promise<PokemonResponseSuccess | FetchError> {
        try {
            const pokemonUrlBuilder = new UrlBuilder(process.env.POKEMON_SERVER_URL);
            const pokemonData: PokemonResponse | FetchError = await RequestProcessor.processRequest<PokemonResponse>(
                pokemonUrlBuilder.getApiUrl('FETCH_POKEMON') + `/${pokemonName}`, {
                method: 'get',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (this.isPokemonResponseInvalid(pokemonData as FetchError)) {
                logger.error(`Error fetching pokemon details, ${JSON.stringify(pokemonData)}`);
                return (pokemonData as FetchError);
            }

            const {status, id, name,sprites,species} = (pokemonData as PokemonResponse);
            this._pokemon = {
                id,
                name,
                description: null,
                sprite: (sprites?.front_default) ?? null
            }

            const pokemonSpeciesData: PokemonSpeciesResponse | FetchError = await RequestProcessor.processRequest<PokemonSpeciesResponse>(
                species.url, {
                method: 'get',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (this.isPokemonCharcteristicsResponseInvalid(pokemonSpeciesData as FetchError)) {
                logger.error(`Error fetching pokemon charcteristics details, ${JSON.stringify(pokemonSpeciesData)}`);
                return (pokemonSpeciesData as FetchError);
            }

            const flavorTexts = (pokemonSpeciesData as PokemonSpeciesResponse).flavor_text_entries;

            // Populate the description based on the first english description in the response
            const description =  (flavorTexts?.filter((flavor)=>flavor.language.name==="en"))?.[0]?.flavor_text ?? null;
            if(description){
                // Convert description to Shakespeares english
                const shakespeareUrlBuilder = new UrlBuilder(process.env.SHAKESPEARES_URL);
                const convertedData: ShakespeareResponse | FetchError = await RequestProcessor.processRequest<ShakespeareResponse>(
                    shakespeareUrlBuilder.getApiUrl('SHAKESPEARE_JSON'), {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify({"text":description})
                });

                if (this.isConvertedResponseInvalid(convertedData as FetchError)) {
                    logger.error(`Error fetching pokemon details, ${JSON.stringify(convertedData)}`);
                    return (convertedData as FetchError);
                }

                this._pokemon.description = (convertedData as ShakespeareResponse).contents?.translated ?? null;
            }

            return {
                status,
                name: this._pokemon.name,
                description: this._pokemon.description,
                sprite: this._pokemon.sprite
            }
        } catch (err) {
            logger.error(`Error fetching pokemon details, ${err.status || 400}, ${err.message}`);
            return {
                status: 400,
                error: err.message
            };
        }
    }

    isPokemonResponseInvalid(pokemonData: FetchError) {
        return ((pokemonData).error && (pokemonData).error !== null)
    }

    isPokemonCharcteristicsResponseInvalid(pokemonSpeciesData: FetchError) {
        return ((pokemonSpeciesData).error && (pokemonSpeciesData).error !== null)
    }

    // Change later
    isConvertedResponseInvalid(convertedData:FetchError){
        return false;
    }
}