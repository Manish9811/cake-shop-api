import { DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

const Users = sequelize.define("Users", {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
  },
  uniqueToken:{
    type: DataTypes.STRING,
  },
   validation:{
    type: DataTypes.STRING,
  },
   otp:{
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {  
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Users;