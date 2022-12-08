const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('patches', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    release_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'patches',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "patches_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
