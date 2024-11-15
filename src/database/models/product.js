"use strict";
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      imageUrl:{
        type: DataTypes.STRING,
        allowNull: false,
      }

    },
    {}
  );

  // Product.associate = (models) => {
  //   Product.belongsTo(models.User, {
  //     foreignKey: "userId",
  //   });
  // };

  return Product;
};
