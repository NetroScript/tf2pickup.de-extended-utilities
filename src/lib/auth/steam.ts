import { SERVER_URL, STEAM_API_KEY } from "$env/static/private";
import openid from "openid";
import { steamAPI } from "../steamapi";
import type { PlayerSummary } from "steamapi";

const openID = new openid.RelyingParty(SERVER_URL+"/auth/steam/return", SERVER_URL, true, true, []);

export async function getSteamLoginURL() {
  return new Promise<string>((resolve, reject) => {
    openID.authenticate("http://steamcommunity.com/openid", false, (err, url) => {
      if (err) return reject('Authentication failed - ' + err.message);
      if (url === null) return reject(new Error("Authentication failed - No url returned from Steam"));

      resolve(url);
    });
  });
}

export async function authenticateSteamCallback(url: string) {
  return new Promise<PlayerSummary>((resolve, reject) => {
    openID.verifyAssertion(url, async (err, result) => {
      if (err) return reject(err.message);
      if (result === null || result?.claimedIdentifier === undefined) return reject(new Error("Authentication failed - No result returned from Steam"));
      if(result?.authenticated !== true) return reject(new Error("Authentication failed - Steam returned an unauthenticated result"));

      if (
        !/^https?:\/\/steamcommunity\.com\/openid\/id\/\d+$/.test(
          result.claimedIdentifier
        )
      ) {
        return reject(new Error("Authentication failed - Steam returned an invalid claimedIdentifier"));
      }

      // Now try to get user information from the Steam API
      try {
        const steamID = result.claimedIdentifier.split("/").pop();
        if (steamID === undefined) return reject(new Error("Authentication failed - Steam returned an invalid claimedIdentifier"));



        const steamUser = await steamAPI.getUserSummary(steamID);
        if (steamUser === undefined) return reject(new Error("Authentication failed - Steam returned an invalid claimedIdentifier"));

        // Now resolve with the entire steam user object
        return resolve(steamUser);

      } catch (error) {
        return reject(new Error("Authentication failed - Steam returned an invalid claimedIdentifier"));
      }
    });
  });
}
