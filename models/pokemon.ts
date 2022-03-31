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

    async fetchPokemonDetails(pokemon_name: string): Promise<PokemonResponseSuccess | FetchError> {
        try {
            let pokemonUrlBuilder = new UrlBuilder(process.env.POKEMON_SERVER_URL);
            const pokemonData: PokemonResponse | FetchError = await RequestProcessor.processRequest<PokemonResponse>(
                pokemonUrlBuilder.getApiUrl('FETCH_POKEMON') + `/${pokemon_name}`, {
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

            this._pokemon = {
                id: (pokemonData as PokemonResponse).id,
                name: (pokemonData as PokemonResponse).name,
                description: null,
                sprite: ((pokemonData as PokemonResponse).sprites?.front_default) || null
            }
            return {
                status: (pokemonData as PokemonResponse).status,
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

    isPokemonResponseInvalid(feedData: FetchError) {
        return ((feedData).error && (feedData).error !== null)
    }
}