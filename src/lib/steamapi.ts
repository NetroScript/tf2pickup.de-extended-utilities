import { STEAM_API_KEY } from '$env/static/private';
import SteamAPI from "steamapi";
export const steamAPI = new SteamAPI(STEAM_API_KEY);
