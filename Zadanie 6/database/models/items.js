const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items', {
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
    tableName: 'items',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "items_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
