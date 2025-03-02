const { DataTypes } = require('sequelize');
const { sequelize } = require('../shared/db');

const Problem = sequelize.define('Problem', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
    allowNull: false,
  },
  constraints: {
    type: DataTypes.TEXT,
  },
  examples: {
    type: DataTypes.TEXT,
  },
  testCases: {
    type: DataTypes.TEXT, // JSON string of test cases
    allowNull: false,
  },
  solutionTemplate: {
    type: DataTypes.TEXT,
  },
});

module.exports = Problem; 