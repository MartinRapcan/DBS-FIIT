const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('players', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nick: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'players',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "players_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
