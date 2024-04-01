import { readFile } from "fs/promises";

async function loadJsonFile() {
  try {
    const returned = await readFile("examples/test.json", "utf8");
    return JSON.parse(returned);
  } catch (err) {
    console.error(err);
    return null;
  }
}

// get search results, invoke api or load from json file
const searchResults = await loadJsonFile();

async function selectFirstTrack(searchResults) {
  // JsonData: a list of tracks
  const firstTrack = searchResults.tracks.items[0];

  return {
    id: firstTrack.id,
    name: firstTrack.name,
    artist: firstTrack.artists[0].name,
  };
}

console.log(await selectFirstTrack(searchResults));
