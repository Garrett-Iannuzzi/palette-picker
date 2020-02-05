
exports.up = function(knex) {
  return knex.schema.table('palettes', table => {
    table.integer('project_id').unsigned()
    table.foreign('project_id')
      .references('projects.id')
      .onDelete('CASCADE')
  })
};

exports.down = function(knex) {
  return knex.schema.table('palettes', table => {
    table.dropColumn('project_id');
  });
};
