const express = require('express');
const app = express();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);


app.use(express.json());


app.set('port', process.env.PORT || 3000);

app.get('/', (request, response) => {
  response.send('Reached Palette Picker');
});

app.get('/api/v1/projects', async (request, response) => {
  try {
    const projects = await database('projects').select();
    return response.status(200).json(projects);
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.get('/api/v1/projects/:id', async (request, response) => {
  const { id } = request.params

  if(!parseInt(id)) {
    return response.status(422).json({ error: `Incorrect ID: ${id}, Required data type: <Number>`})
  }

  try {
    const project = await database('projects').where('id', id).select();
    if (!project.length) {
      return response.status(404).json({ error: `Could not locate project: ${id}` })
    }
    return response.status(200).json(project)
  } catch (error) {
    return response.status(500).json({ error })
  }
});

app.get('/', (request, response) => {
  response.send('Reached Palette Picker');
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});
