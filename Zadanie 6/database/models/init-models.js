var DataTypes = require("sequelize").DataTypes;
var _cluster_regions = require("./cluster_regions");
var _abilities = require("./abilities");
var _ability_upgrades = require("./ability_upgrades");
var _game_objectives = require("./game_objectives");
var _heroes = require("./heroes");
var _items = require("./items");
var _matches_players_details = require("./matches_players_details");
var _matches = require("./matches");
var _patches = require("./patches");
var _players = require("./players");
var _player_actions = require("./player_actions");
var _player_ratings = require("./player_ratings");
var _player_times = require("./player_times");
var _purchase_logs = require("./purchase_logs");
var _teamfights_players = require("./teamfights_players");
var _teamfights = require("./teamfights");

function initModels(sequelize) {
  var cluster_regions = _cluster_regions(sequelize, DataTypes);
  var abilities = _abilities(sequelize, DataTypes);
  var ability_upgrades = _ability_upgrades(sequelize, DataTypes);
  var game_objectives = _game_objectives(sequelize, DataTypes);
  var heroes = _heroes(sequelize, DataTypes);
  var items = _items(sequelize, DataTypes);
  var matches_players_details = _matches_players_details(sequelize, DataTypes);
  var matches = _matches(sequelize, DataTypes);
  var patches = _patches(sequelize, DataTypes);
  var players = _players(sequelize, DataTypes);
  var player_actions = _player_actions(sequelize, DataTypes);
  var player_ratings = _player_ratings(sequelize, DataTypes);
  var player_times = _player_times(sequelize, DataTypes);
  var purchase_logs = _purchase_logs(sequelize, DataTypes);
  var teamfights_players = _teamfights_players(sequelize, DataTypes);
  var teamfights = _teamfights(sequelize, DataTypes);


  // Associations
  matches_players_details.belongsTo(heroes, {
    foreignKey: 'hero_id',
    as: 'hero',
    targetKey: "id",
  }
  );

  return {
    cluster_regions,
    abilities,
    ability_upgrades,
    game_objectives,
    heroes,
    items,
    matches_players_details,
    matches,
    patches,
    players,
    player_actions,
    player_ratings,
    player_times,
    purchase_logs,
    teamfights_players,
    teamfights
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
