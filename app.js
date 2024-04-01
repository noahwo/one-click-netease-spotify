const fs = import("fs");
import { error } from "console";
import fetch from "node-fetch";
import { writeFile } from "fs/promises";
await import("dotenv/config");
import { readFile } from "fs/promises";

const NE_API = process.env.NE_API;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const SP_SEARCH_API = process.env.SP_SEARCH_API;
const USER_ID = process.env.USER_ID;
const COUNTRY_NAME = "Finland";
const COUNTRY_CODE = "FI";
let pl_count = 0;

async function fetchNeteasePlaylists(USER_ID) {
  try {
    const response = await fetch(`${NE_API}/user/playlist?uid=${USER_ID}`);
    const received_obj = await response.json();
    const data = received_obj.playlist;
    console.log("Receiving all playlists...");

    const simplifiedPlaylist = data.map(({ name, trackCount, id }) => ({
      name,
      trackCount,
      id,
    }));
    console.log(
      `Raw data contains ${simplifiedPlaylist.length} playlists. Which are:`
    );
    simplifiedPlaylist.forEach((item) => console.log(item.name));

    const filteredPlaylist = simplifiedPlaylist.filter(
      (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
    );
    pl_count = filteredPlaylist.length;
    console.log(`Got ${filteredPlaylist.length} final playlists.`);
    return filteredPlaylist;
  } catch (err) {
    console.error(err);
    return []; // Return an empty array in case of an error
  }
}

async function fetchAllSongsFromPlaylist(playlistId, trackCount) {
  try {
    let songs = [];
    const limit = 100; // Maximum items per page

    for (let offset = 0; offset < trackCount; offset += limit) {
      const response = await fetch(
        `${NE_API}/playlist/track/all?id=${playlistId}&limit=${limit}&offset=${offset}`
      );
      const data = await response.json();
      songs = songs.concat(data.songs);
    }

    return songs.map((song) => ({
      name: song.name,
      artist: song.ar[0]?.name, // Assuming the first artist in the array is the primary artist
    }));
  } catch (err) {
    console.error(err);
    return []; // Return an empty array in case of an error
  }
}

async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    method,
    body: JSON.stringify(body),
  });
  return await res.json();
}

// Needed when searching for a song
async function getCountryCode(countryName) {
  const url = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const countryCode = data[0].cca2; // ISO 3166-1 alpha-2 country code
    console.log(countryCode);
    return countryCode;
  } catch (error) {
    console.error("Error fetching country code:", error);
  }
}

/**
 * Search for a song on Spotify
 * @param {string} name Song name
 * @param {string} artist Artist name
 * @returns {Array.<Object>} List of search results
 */
async function searchSong(name, artist) {
  let song_name = name.replace(/ /g, "%2520");
  let song_artist = artist.replace(/ /g, "%2520");

  return (
    // await fetchWebApi("v1/me/top/tracks?time_range=long_term&limit=5", "GET")
    (
      await fetchWebApi(
        `${SP_SEARCH_API}track%3A${song_name}%2520artist%3A${song_artist}&type=track&market=${COUNTRY_CODE}&limit=20)`,
        "GET"
      )
    ).items
  );
}

/**
 * collect playlists from Netease and write to json file
 * @throws {Error} if playlist count does not match
 * */
async function collectPlaylists() {
  const playlists = await fetchNeteasePlaylists(USER_ID);

  let p_lists = []; // detailed playlists: pl: {ne_id, name, trackCount, songs[]}, songs: {name, artist}
  for (let i = 0; i < playlists.length; i += 1) {
    const p = playlists[i];
    console.log(
      `Fetching songs from list ${i + 1}/${pl_count}: ${p.name}, which has ${
        p.trackCount
      } songs.`
    );
    const songs = await fetchAllSongsFromPlaylist(p.id, p.trackCount);
    p_lists.push({
      ne_id: p.id,
      name: p.name,
      trackCount: p.trackCount,
      songs: songs,
    });
  }
  try {
    pl_count === p_lists.length;
  } catch (err) {
    console.error(err, "playlists count do not match");
  }

  (await fs).writeFile(
    "fetched_list.json",
    JSON.stringify(p_lists, null, 2),
    (err) => {
      if (err) throw err;
      console.log("Data written to file.");
    }
  );
}

/**
 * Select the first track from the search results
 * @param {Array.<Object>}  searchResults Search results from Spotify API
 * @returns {Object} Object containing the track id, name, and artist
 */
async function selectFirstTrack(searchResults) {
  // JsonData: a list of tracks
  const firstTrack = searchResults.tracks.items[0];

  return {
    id: firstTrack.id,
    name: firstTrack.name,
    artist: firstTrack.artists[0].name,
  };
}

async function createPlaylist(name, tracksUri, info) {
  const { id: user_id } = await fetchWebApi("v1/me", "GET");

  const playlist = await fetchWebApi(`v1/users/${user_id}/playlists`, "POST", {
    name: "My recommendation playlist",
    description: "Playlist created by the tutorial on developer.spotify.com",
    public: false,
  });

  await fetchWebApi(
    `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(",")}`,
    "POST"
  );

  return playlist;
}

/**
 * Get corresponding uri for each track in the playlist
 * @param {Array.<object>} tracks list of object of songs
 * @returns {Array.<Array.<Object[]>>} list of two lists: [found_tracks, not_found_tracks]
 *    found_tracks: list of objects {name, artist, uri}
 *    not_found_tracks: list of objects {name, artist}
 */
async function getUriForTracks(tracks) {
  let found_tracks = [];
  let not_found_tracks = [];
  for (let i = 0; i < tracks.length; i += 1) {
    const s = tracks[i];
    const search_result = await searchSong(s.name, s.artist);
    if (search_result.length === 0) {
      not_found_tracks.push(s);
      continue;
    }
    const firstTrack = await selectFirstTrack(search_result);
    found_tracks.push({ ...firstTrack, uri: `spotify:track:${firstTrack.id}` });
  }
  return [found_tracks, not_found_tracks];
}

async function main() {
  const final_playlists = JSON.parse(
    await readFile("fetched_list.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      // console.log(data);
    })
  );

  // Traverse all playlists from netease
  // For every playlist record
  for (let i = 0; i < final_playlists.length; i += 1) {
    const p = final_playlists[i]; // p: {ne_id, name, trackCount, songs[]}
    const uris = await getUriForTracks(p.songs);
    for (let j = 0; j < p.songs.length; j += 1) {
      const s = p.songs[j];
      const search_result = await searchSong(s.name, s.artist);
      if (search_result.length === 0) {
        console.log(`No search result for ${s.name} by ${s.artist}`);
        continue;
      }
      const firstTrack = await selectFirstTrack(search_result);
      console.log(
        `========\nSong ${j + 1}/${p.songs.length} in playlist ${
          i + 1
        }/${pl_count}: ${s.name} by ${s.artist}`
      );
      console.log("1st rs:", firstTrack);
    }
  }
}

main();
