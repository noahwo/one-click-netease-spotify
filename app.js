const fs = import("fs");
import { error } from "console";
import fetch from "node-fetch";
await import("dotenv/config");
import { readFile, writeFile } from "fs/promises";

const NE_API = process.env.NE_API;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const USER_ID = process.env.USER_ID;
const COUNTRY_CODE = process.env.COUNTRY_CODE;
let pl_count = 0;

const dev = true; // toggle to true if you want to customize importing or filter certain playlists, then go to modify fetchNeteasePlaylists(USER_ID) function

class RateLimiter {
  constructor(limit, interval) {
    this.limit = limit;
    this.interval = interval;
    this.queue = [];
    this.currentlyActive = 0;
    this.nextAvailableTime = Date.now();
  }

  async enqueue(action) {
    return new Promise((resolve, reject) => {
      this.queue.push({ action, resolve, reject });
      this.dequeue();
    });
  }

  dequeue() {
    if (this.queue.length === 0 || this.currentlyActive >= this.limit) {
      return;
    }

    const now = Date.now();
    if (now >= this.nextAvailableTime) {
      this.execute();
    } else {
      setTimeout(() => this.execute(), this.nextAvailableTime - now);
    }
  }

  execute() {
    this.currentlyActive++;
    const { action, resolve, reject } = this.queue.shift();
    action()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.currentlyActive--;
        if (this.currentlyActive < this.limit) {
          this.nextAvailableTime = Date.now() + this.interval;
        }
        this.dequeue();
      });
  }
}

// Create a rate limiter instance with 80 requests allowed every 30 seconds (30000 ms).
const apiLimiter = new RateLimiter(10, 1000);

/**
 * Test the validity of the Spotify access token.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
async function testTokenValidity() {
  const endpoint = "v1/me"; // This endpoint gets user profile and requires valid token
  const method = "GET";

  try {
    const response = await fetchWebApi(endpoint, method);
    if (response) {
      return true;
    }
  } catch (error) {
    console.error("[ERROR] Invalid token:", error.message);
  }
  return false;
}

/**
 * Fetch a list of playlists from Netease User
 * @param {string} USER_ID Netease user ID
 * @returns {Array.<Object>} List of playlists
 */
async function fetchNeteasePlaylists(USER_ID) {
  try {
    const response = await fetch(
      `${NE_API}/user/playlist?uid=${USER_ID}&limit=29&offset=0`
    );
    const received_obj = await response.json();
    const data = received_obj.playlist;
    console.log("[INFO] Receiving all playlists...");

    const simplifiedPlaylist = data.map(({ name, trackCount, id }) => ({
      name,
      trackCount,
      id,
    }));
    console.log(
      `[INFO] Raw data contains ${simplifiedPlaylist.length} playlists. Which are:`
    );
    simplifiedPlaylist.forEach((item) => console.log(`\t `, item.name));

    // NOTE: You can define filters to exclude certain playlists, for me i already imported liked music in Netease, and labeled previously imported list with a "-" prefix.
    let filteredPlaylist = [];
    if (dev) {
      filteredPlaylist = await simplifiedPlaylist.filter(
        (item) =>
          !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
      );
    } else {
      filteredPlaylist = await simplifiedPlaylist;
    }
    pl_count = filteredPlaylist.length;
    console.log(`[INFO] Got ${filteredPlaylist.length} final playlists.`);
    return filteredPlaylist;
  } catch (err) {
    console.error(err);
    return []; // Return an empty array in case of an error
  }
}

/**
 * Fetch all songs from a playlist
 * @param {string} playlistId Netease playlist ID
 * @param {number} trackCount Number of tracks in the playlist
 * @returns {Array.<Object>} List of songs
 * @throws {Error} if the number of tracks fetched does not match the trackCount
 */
async function fetchAllSongsFrom163Playlist(playlistId, trackCount) {
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
      `\t[INFO] Fetching songs from list ${i + 1}/${pl_count}: [${
        p.name
      }], which has ${p.trackCount} songs.`
    );
    const songs = await fetchAllSongsFrom163Playlist(p.id, p.trackCount);
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
      console.log("[INFO] Data written to file.");
    }
  );
}

/**
 * Fetch data from the Spotify Web API, adapted from official action example https://developer.spotify.com/
 * This function is rate-limited to avoid exceeding API call limits.
 * It enqueues requests and ensures that no more than 80 requests are made per 30 seconds.
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} [body] - Optional request body for POST requests
 * @returns {Promise<Object>} - A promise that resolves to the response data as a JSON object
 */
async function fetchWebApi(endpoint, method, body) {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    method,
    body: JSON.stringify(body),
  };

  const fetchCall = async () => {
    let res = await fetch(
      `https://api.spotify.com/${endpoint}`,
      requestOptions
    );
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("Retry-After")) || 1;
      console.log(
        `[INFO] Spotify API's rate limit exceeded, retrying after ${retryAfter} seconds.`
      );
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      res = await fetch(`https://api.spotify.com/${endpoint}`, requestOptions);
    }
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    return await res.json();
  };

  return apiLimiter.enqueue(fetchCall);
}

/**
 * Search for a song on Spotify, return top 1 or null if not found
 * @param {string} name Song name
 * @param {string} artist Artist name
 * @returns {Object} Object containing the track id, name, and artist
 */
async function searchSong(name, artist) {
  let song_name = name.replace(/ /g, "%2520");
  let song_artist = artist.replace(/ /g, "%2520");
  console.log(`[INFO] Searching for ${song_name} - ${song_artist}...`);

  let returned_whole = await fetchWebApi(
    `v1/search?q=remaster%2520track%3A${encodeURIComponent(
      song_name
    )}%2520artist%3A${encodeURIComponent(
      song_artist
    )}&type=track&market=${COUNTRY_CODE}&limit=10`,
    "GET"
  );

  // let returned_track_object = returned_whole.tracks;
  // console.log(returned_track_object);
  // console.log(returned_whole);

  let returned_item_list = returned_whole.tracks.items;

  if (returned_item_list.length === 0) {
    return null;
  } else {
    let firstTrack = returned_item_list[0];

    return {
      id: firstTrack.id,
      name: firstTrack.name,
      artist: firstTrack.artists[0].name,
    };
  }
}

async function createPlaylist(name, tracksUri, info) {
  const { id: user_id } = await fetchWebApi("v1/me", "GET");
  console.log(`[INFO] Your user id:${user_id}`);

  const playlist = await fetchWebApi(`v1/users/${user_id}/playlists`, "POST", {
    name: name,
    description: info,
    public: true,
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
    let s = tracks[i];
    let search_result = await searchSong(s.name, s.artist);
    // console.log(search_result);

    if (search_result === null) {
      not_found_tracks.push(s);
    } else {
      found_tracks.push({
        name: search_result.name,
        artist: search_result.artist,
        uri: `spotify:track:${search_result.id}`,
      });
    }
  }
  // // for dev purpose, write to file instead of returning
  // (await fs).writeFile(
  //   "examples/test_track_uris.json",
  //   JSON.stringify(
  //     { found_tracks: found_tracks, not_found_tracks: not_found_tracks },
  //     null,
  //     2
  //   ),
  //   (err) => {
  //     if (err) throw err;
  //     console.log("Data written to file.");
  //   }
  // );
  return [found_tracks, not_found_tracks];
}

async function main() {
  // Test your spotify access token validity in advance
  const isValid = await testTokenValidity();
  if (!isValid) {
    console.error(
      "[ERROR] Invalid Spotify development access token, update your token and retry."
    );
    process.exit(1); // Exits with a failure code
  } else {
    console.log("[INFO] Your Spotify development access token is valid.");
  }

  // await collectPlaylists();

  const final_playlists = JSON.parse(
    await readFile("fetched_list.json", "utf8")
  );

  // Iterate over each playlist
  for (const p of final_playlists) {
    // Now looping through all playlists
    console.log(`[INFO] Processing playlist: ${p.name}`);
    const total = p.songs.length;

    let [found_uris, not_found_uris] = await getUriForTracks(p.songs);

    console.log(
      `[INFO] Found [${found_uris.length}/${total}], Not found [${not_found_uris.length}/${total}].`
    );

    // Check if any songs unprocessed, degarding success or failure
    if (total === found_uris.length + not_found_uris.length) {
      console.log(`[INFO] Processed all in the list ${p.name}`);
    } else {
      console.log(
        `[INFO] Partially processed ${
          found_uris.length + not_found_uris.length
        }/${total} in the list ${p.name}`
      );
    }

    // Synthesize playlist description info
    let playlist_info = "";
    if (not_found_uris.length !== 0) {
      let failed_songs = not_found_uris
        .map((element) => `[${element.name} - ${element.artist}]`)
        .join(", ");
      playlist_info = `From playlist '${p.name}', failed songs: ${failed_songs}`;
      if (playlist_info.length > 300) {
        console.log(`[INFO] FULL LOG: ${playlist_info}`);
        playlist_info = `${playlist_info.substring(
          0,
          262
        )}... Check terminal log for full list.`;
      }
    } else {
      playlist_info = `From 163 ${p.name}, all succeeded.`;
    }
    console.log(`[INFO] Playlist description: `, playlist_info);

    // Synthesize tracksUri list
    const tracksUri = found_uris.map((track) => track.uri);

    const createdPlaylist = await createPlaylist(
      p.name,
      tracksUri,
      playlist_info
    );
    console.log(
      `[INFO] Created playlist name: ${createdPlaylist.name}, id: ${createdPlaylist.id}`
    );
  }
}

main();
