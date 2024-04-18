const fs = import("fs");
import { error } from "console";
import fetch from "node-fetch";
import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";
await import("dotenv/config");

const NE_API = process.env.NE_API;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const SP_SEARCH_API = process.env.SP_SEARCH_API;
const USER_ID = process.env.USER_ID;
const COUNTRY_NAME = "Finland";
const COUNTRY_CODE = "FI";
let pl_count = 0;

async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`${endpoint}`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    method,
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function getUriForTracks(tracks) {
  let found_tracks = [];
  let not_found_tracks = [];
  for (let i = 0; i < tracks.length; i += 1) {
    const s = tracks[i];
    const search_result = await searchSong(s.name, s.artist);
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
  return [found_tracks, not_found_tracks];
}

async function searchSong(name, artist) {
  let song_name = name.replace(/ /g, "%2520");
  let song_artist = artist.replace(/ /g, "%2520");

  let returned_whole = await fetchWebApi(
    `${SP_SEARCH_API}track%3A${song_name}%2520artist%3A${song_artist}&type=track&market=${COUNTRY_CODE}&limit=20`,
    "GET"
  );

  // let returned_track_object = returned_whole.tracks;
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

  // Test only the first playlist form lists json

  const p = final_playlists[0]; // p: {ne_id, name, trackCount, songs[]}

  const total = p.songs.length;
  let [found_uris, not_found_uris] = await getUriForTracks(p.songs);
  console.log(`Found [${found_uris.length}/${total}]:\n `, found_uris);
  console.log(
    `Not found [${not_found_uris.length}/${total}]: \n`,
    not_found_uris
  );
}

main();
