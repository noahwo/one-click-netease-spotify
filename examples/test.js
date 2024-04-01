// get top 5 tracks

// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const token =
  "BQCk418jQwT2A-B3FPiVO52bgnvG_TBLQbWVQ13L82RFhFpCU1n2SerFUEvkXbixZapWsrHkiTk_ylhVfM14Rbp1E6nyruZDIvTnap6ABRVvduiWgbb0QYqEcTPhmCovjWQQy607Kht963WWCYD0Sq3LjixszT1cJgkpuyYei_ex1hVna8Vc4Eq-4Rfcp4mx7xA8S5EK9x9qJaA6bat5b_YhMvMndkU7w0A1rWX2rWBK4ukwU9GyIIxxZFla0ogdFdUXoV5i0SCof4JtRZ5Ul-wQwpdS";
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function getTopTracks() {
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (
    await fetchWebApi("v1/me/top/tracks?time_range=long_term&limit=5", "GET")
  ).items;
}

const topTracks = await getTopTracks();
console.log(
  topTracks?.map(
    ({ name, artists }) =>
      `${name} by ${artists.map((artist) => artist.name).join(", ")}`
  )
);

// Recommend 5 songs based on your top 5 tracks

// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization

async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body: JSON.stringify(body),
  });
  return await res.json();
}

// const topTracksIds = [
//   "1hUi0hdMU0C3syYTyRdPub",
//   "33fnRtrnBzDV3yZsPtjwbk",
//   "3DFhB4Sdjin9tPxPYf11Fh",
//   "1HzDhHApjdjXPLHF6GGYhu",
//   "1WNQG7lClq2z1yMYWeLz4L",
// ];

async function getRecommendations() {
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-recommendations
  return (
    await fetchWebApi(
      `v1/recommendations?limit=5&seed_tracks=${topTracksIds.join(",")}`,
      "GET"
    )
  ).tracks;
}

const recommendedTracks = await getRecommendations();
console.log(
  recommendedTracks.map(
    ({ name, artists }) =>
      `${name} by ${artists.map((artist) => artist.name).join(", ")}`
  )
);

// Save 10 songs to playlist

// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization

const tracksUri = [
  "spotify:track:1hUi0hdMU0C3syYTyRdPub",
  "spotify:track:2zQJpJiSiz3JLtF53bvbXS",
  "spotify:track:33fnRtrnBzDV3yZsPtjwbk",
  "spotify:track:3ellWHZqavRVM5PR35NM5D",
  "spotify:track:3DFhB4Sdjin9tPxPYf11Fh",
  "spotify:track:4SmbNIcwrcG0uT9wClVxTR",
  "spotify:track:1HzDhHApjdjXPLHF6GGYhu",
  "spotify:track:7KsZHCfOitA5V9oQYVdltG",
  "spotify:track:1WNQG7lClq2z1yMYWeLz4L",
  "spotify:track:4ZSDreApKOo6eQYFx9qXfD",
];

async function createPlaylist(tracksUri) {
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

const createdPlaylist = await createPlaylist(tracksUri);
console.log(createdPlaylist.name, createdPlaylist.id);
