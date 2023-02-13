const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const convertplayerDetails = (playersDetails) => {
  return {
    playerId: playersDetails.player_id,
    playerName: playersDetails.player_name,
    jerseyNumber: playersDetails.jersey_number,
    role: playersDetails.role,
  };
};

//ListOfPlayers
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT *
    FROM cricket_team;`;
  const playersDetails = await db.all(getPlayersQuery);

  response.send(playersDetails.map((each) => convertplayerDetails(each)));
});

//AddPlayer
app.post("/players/", async (request, response) => {
  const newPlayer = request.body;
  const { playerName, jerseyNumber, role } = newPlayer;
  console.log(playerName, jerseyNumber, role);
  const addPlayerQuery = `INSERT INTO cricket_team(player_name, jersey_number, role )
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  const addPlayerResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//getplayer
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  console.log(playerId);
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id=${playerId}`;
  const responseObj = await db.get(getPlayerQuery);
  response.send(convertplayerDetails(responseObj));
});

//updateplayer
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `UPDATE cricket_team 
    SET 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    WHERE
    player_id=${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Delete
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
