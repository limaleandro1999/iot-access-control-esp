const knex = require('knex');  
const environment = 'development'; 
const config = require('./knexfile');

exports.db = knex(config[environment]);

exports.TABLES = {  
  USERS: 'users',
  ACCESS_DEVICES: 'access_devices',
  USERS_ACCESS_DEVICES: 'users_access_devices',
};