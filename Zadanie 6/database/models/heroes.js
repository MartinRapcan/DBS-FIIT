const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const heroes = sequelize.define('heroes', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    localized_name: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'heroes',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "heroes_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return heroes;
};
