
exports.seed = async (knex) => {
  try {
    await knex('palettes').del()
    await knex('projects').del()

    const projectId = await knex('projects').insert({
      name: 'Project One'
    }, 'id')
    return knex('palettes').insert([
      { 
        name: 'Palette One', 
        color_one: '#47850',
        color_two: '#47851',
        color_three: '#47852',
        color_four: '#47853',
        color_five: '#47854',
        project_id: projectId[0]
      },
      { 
        name: 'Palette Two', 
        color_one: '#47850',
        color_two: '#47851',
        color_three: '#47852',
        color_four: '#47853',
        color_five: '#47854',
        project_id: projectId[0]
      }
    ])
  } catch (error) {
    console.log({ error: `${error}` })
  }
}

