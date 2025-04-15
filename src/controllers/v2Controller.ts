import getAllCountries from "./v2/countries/getAllCountries";
import getCitiesBetweenLatitudeAndLongitude from "./v2/cities/getCitiesBetweenLatitudeAndLongitude";
import getCitiesByCountryAndState from "./v2/cities/getCitiesByCountryAndState";
import getCitiesByDistanceFromCity from "./v2/cities/getCitiesByDistanceFromCity";
import getCityByCountryStateAndCity from "./v2/cities/getCityByCountryStateAndCity";
import getCountriesBetweenLatitudeAndLongitude from "./v2/countries/getCountriesBetweenLatitudeAndLongitude";
import getCountriesByDistanceFromCountry from "./v2/countries/getCountriesByDistanceFromCountry";
import getCountryByIdOrName from "./v2/countries/getCountryByIdOrName";
import getStateByIdOrName from "./v2/states/getStateByIdOrName";
import getStatesByCountry from "./v2/states/getStatesByCountry";

export const v2Controller = {
    /**
     * GET /api/v2/countries
     * @tag v2
     * @summary Returns all countries.
     * @description Returns all countries sorted by name ascendingly.
     * @response 200 - An APIRequest object with the data key's value set to an array of countries.
     * @responseContent {CountryArray} 200.application/json
     */
    getAllCountries,

    /**
     * GET /api/v2/countries/cities/between/{lat1}/{lon1}/{lat2}/{lon2}
     * @tag v2
     * @summary Returns all cities between the specified latitudes and longitudes.
     * @description Returns all cities between the specified latitudes and longitudes sorted by name ascendingly.
     * @pathParam {number} lat1 - Latitude of coordinate one.
     * @pathParam {number} lon1 - Longitude of cordinate one.
     * @pathParam {number} lat2 - Latitude of coordinate two.
     * @pathParam {number} lon2 - Longitude of coordinate two.
     * @response 200 - An APIRequest object with the data key's value set to an array of cities between the specified latitude and longitude.
     * @responseContent {CityArray} 200.application/json
     */
    getCitiesBetweenLatitudeAndLongitude,

    /**
     * GET /api/v2/countries/{countryIdOrName}/state/{stateIdOrName}/cities
     * @tag v2
     * @summary Gets all cities in the specified country and state.
     * @description Gets all cities in the specified country and state sorted by city name ascendingly.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @pathParam {string} stateIdOrName - The ID or name of the state.
     * @response 200 - An APIRequest object with the data key's value set to an array of cities in the specified country and state.
     * @responseContent {CityArray} 200.application/json
     */
    getCitiesByCountryAndState,

    /**
     * GET /api/v2/countries/{countryIdOrName}/state/{stateIdOrName}/city/{cityIdOrName}/within/{distanceAmount}/{distanceUnit}
     * @tag v2
     * @summary Gets all cities within the specified distance from the specified city.
     * @description Gets all cities within the specified distance from the specified city sorted by name ascendingly.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @pathParam {string} stateIdOrName - The ID or name of the state.
     * @pathParam {string} cityIdOrName - The ID or name of the city.
     * @pathParam {number} distanceAmount - The distance to search within
     * @pathParam {DistanceUnit} distanceUnit - The unit of measurement for distance, either 'mi' or 'km'.
     * @response 200 - An APIResponse object with the data key's value set to an array of cities within the specified distance of the specified city.
     * @responseContent {CityArray} 200.application/json
     * @response 400 - An APIRequest object with the error value set to true and the msg value indicating the distance unit did not match an allowed value.
     * @responseContent {Error} 400.application/json
     * @response 404 - An APIRequest object with the error value set to true and the msg value indicating the origin city was not found.
     * @responseContent {Error} 404.application/json
     */
    getCitiesByDistanceFromCity,

    /**
     * GET /api/v2/countries/{countryIdOrName}/state/{stateIdOrName}/city/{cityIdOrName}
     * @tag v2
     * @summary Gets the City specified as well as the associated State and Country.
     * @description Gets the City specified as well as the associated State and Country.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @pathParam {string} stateIdOrName - The ID or name of the state.
     * @pathParam {string} cityIdOrName - The ID or name of the city.
     * @response 200 - An APIResponse object with the data key's value set to the specified city along with the nested state and state.country objects.
     * @responseContent {City} 200.application/json
     */
    getCityByCountryStateAndCity,

    /**
     * GET /api/v2/countries/between/{lat1}/{lon1}/{lat2}/{lon2}
     * @tag v2
     * @summary Gets all countries within the specified latitudes and longitudes.
     * @description Gets all countries within the specified latitudes and longitudes sorted by name ascendingly.
     * @pathParam {number} lat1 - Latitude of coordinate one.
     * @pathParam {number} lon1 - Longitude of coordinate one.
     * @pathParam {number} lat2 - Latitude of coordinate two.
     * @pathParam {number} lon2 - Longitude of coordinate two.
     * @response 200 - An APIResponse object with the data key's value set to an array of countries within the specified latitudes and longitudes
     * @responseContent {CountryArray} 200.application/json
     */
    getCountriesBetweenLatitudeAndLongitude,

    /**
     * GET /api/v2/countries/{countryIdOrName}/within/{distanceAmount}/{distanceUnit}
     * @tag v2
     * @summary Gets all countries within the specified distance of the specified country.
     * @description Gets all countries within the specified distance of the specified country sorted by name ascendingly.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @pathParam {number} distanceAmount - The distance from the specified country.
     * @pathParam {DistanceUnite} distanceUnit - The unit of distance, can be either 'km' or 'mi'.
     * @response 200 - An APIResponse object with the data key's value set to an array of countries within the specified distance from the specified country.
     * @responseContent {CountryArray} 200.application/json
     * @response 400 - An APIResponse object with the error value set to true and the msg value containing the reason for the error.
     * @responseContent {Error} 400.application/json
     * @response 404 - An APIResponse object with the error value set to true and the msg value containing the reason for the error.
     * @responseContent {Error} 404.application/json
     */
    getCountriesByDistanceFromCountry,

    /**
     * GET /api/v2/countries/{countryIdOrName}
     * @tag v2
     * @summary Gets the specified country.
     * @description Gets the specified country.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @response 200 - An APIResponse object with the data key's value set to the specified country.
     * @responseContent {Country} 200.application/json
     */
    getCountryByIdOrName,

    /**
     * GET /api/v2/countries/{countryIdOrName}/state/{stateIdOrName}
     * @tag v2
     * @summary Gets the specified state.
     * @description Gets the specified state.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @pathParam {string} stateIdOrName - The ID or name of the state.
     * @response 200 - An APIResponse object with the data key's value set to the specified state and related country.
     * @responseContent {State} 200.application/json
     */
    getStateByIdOrName,

    /**
     * GET /api/v2/countries/{countryIdOrName}/states
     * @tag v2
     * @summary Gets the states in the specified country.
     * @description Gets the states in the specified country.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @response 200 - An APIResponse object with the data key's value set to an array of states within the specified country.
     * @responseContent {StateArray} 200.application/json
     */
    getStatesByCountry,
};
