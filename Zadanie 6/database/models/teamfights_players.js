const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const teamfights_players = sequelize.define('teamfights_players', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    teamfight_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    match_player_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    buyback: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    damage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deaths: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_delta: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xp_start: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xp_end: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'teamfights_players',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "teamfights_players_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  teamfights_players.associate = function(models) {
    teamfights_players.belongsTo(models.teamfights, {
      foreignKey: 'teamfight_id',
      targetKey: "id",
      as: 'teamfight'
    }
    );
    teamfights_players.belongsTo(models.matches_players_details, {
      foreignKey: 'match_player_detail_id',
      as: 'match_player_detail',
      targetKey: "id",
    }
    );
  }
  

  return teamfights_players;
};
