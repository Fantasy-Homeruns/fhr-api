# Process

## Queues
### Add Player (sqs-add-player)
1. Full document for player to save
2. Tasks > addPlayer.js > triggered lambda to save player in database

### Update All Games (sqs-update-all-games)
1. Full document for player to update all games
2. Tasks > updateAllGames.js > triggered lambda to save player in every game with stats
3. Will cycle through all active season games and save player / recalc stats

### Update Game (sqs-update-game)
1. Full document for player to update one game (player object + game)
2. Tasks > updateGame.js > triggered lambda to save player in game

## Scripts
### Updates when HRs are hit
1. Get all new homeruns hit from ESPN
2. Find and update each player's homerun document record
  a.  Should save by day: update stats by month & season total for the season
3. For every league game for that season, update the document for that player's info
  a.  Each league has picks and players and in there same doc / so simple replace
  b.  Re-calculate totals for team by month and season
  c.  Update game standings stats by month and season

### Update all players in a game
1. Cycle through all picks
2. Each pick / send queue to update game (sqs-update-game)


## Query by

Players:
  id
  espnPlayerId
  firstName
  lastName
  season
  team

Leagues:
  id
  leagueName

Games:
  id
  leagueId

Users:
  id
  email
  firstName
  lastName
