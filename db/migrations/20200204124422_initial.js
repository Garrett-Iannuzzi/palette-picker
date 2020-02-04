
exports.up = function(knex) {
  return knex.schema
    .createTable('projects', (table) => {
      table.increments('id').primary();
      table.string('name');

      table.timestamps(true, true);
    })
    .createTable('palettes', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('color_one');
      table.string('color_two');
      table.string('color_three');
      table.string('color_four');
      table.string('color_five');
      table.integer('project_id').unsigned()
      table.foreign('project_id')
        .references('projects.id');
        
      table.timestamps(true, true);
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('palettes')
    .dropTable('projects')
};
