const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const game_objectives = sequelize.define('game_objectives', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    match_player_detail_id_1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    match_player_detail_id_2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    key: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subtype: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    team: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    slot: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'game_objectives',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "game_objectives_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  game_objectives.associate = function(models) {
    game_objectives.belongsTo(models.matches_players_details, {
      foreignKey: 'match_player_detail_id_1',
      as: 'match_player_detail_1',
      targetKey: "id",
    }
    );
    game_objectives.belongsTo(models.matches_players_details, {
      foreignKey: 'match_player_detail_id_2',
      as: 'match_player_detail_2',
      targetKey: "id",
    }
    );
  }
  return game_objectives;
};
