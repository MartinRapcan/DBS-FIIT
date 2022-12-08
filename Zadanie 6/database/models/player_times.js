const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const player_times = sequelize.define('player_times', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    match_player_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lh: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xp: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'player_times',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "player_times_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  player_times.associate = function(models) {
    player_times.belongsTo(models.matches_players_details, {
      foreignKey: 'match_player_detail_id',
      as: 'match_player_detail',
      targetKey: "id",
    }
    );
  }

  return player_times;
};
