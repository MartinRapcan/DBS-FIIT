const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('abilities', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'abilities',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "abilities_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ],
  });
};
