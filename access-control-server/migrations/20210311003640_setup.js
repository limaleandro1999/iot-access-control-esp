exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('users', table => {
      table.increments().primary();
      table.string('username').unique();
      table.string('password');
    }),
    knex.schema.createTable('users_access_devices', table => {
      table.increments().primary();
      table.integer('user_id').references('users.id');
      table.integer('access_device_id').references('access_devices.id');
    }),
    knex.schema.createTable('access_devices', table => {
      table.increments().primary();
      table.string('name');
      table.string('uuid');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('users_access_devices'),
    knex.schema.dropTable('access_devices'),
  ]);
};
