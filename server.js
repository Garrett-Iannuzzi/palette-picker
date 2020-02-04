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
  const { id } = request.params;

  if(!parseInt(id)) {
    return response.status(422).json({ error: `Incorrect ID: ${id}, Required data type: <Number>`});
  }

  try {
    const project = await database('projects').where('id', id).select();
    if(!project.length) {
      return response.status(404).json({ error: `Could not locate project: ${id}` });
    }
    return response.status(200).json(project);
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.get('/api/v1/projects/:id/palettes', async (request, response) => {
  const { id } = request.params;

  if(!parseInt(id)) {
    return response.status(422).json({ error: `Incorrect ID: ${id}, Required data type: <Number>`});
  }

  try {
    const palettes = await database('palettes').where('project_id', id).select();
    if(!palettes.length) {
      return response.status(404).json({ error: `Project with ID of ${id} does not have any palettes` });
    }
    return response.status(200).json(palettes);
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.get('/api/v1/palettes/:id', async (request, response) => {
  const { id } = request.params;

  if(!parseInt(id)) {
    return response.status(422).json({ error: `Incorrect ID: ${id}, Required data type: <Number>`})
  }

  try { 
    const palette = await database('palettes').where('id', id).select();
    if(!palette.length) {
      return response.status(404).json({ error: `Could not locate palette: ${id}` });
    }
    return response.status(200).json(palette);
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.post('/api/v1/projects', async (request, response) => {
  const project = request.body;

  for (let requiredParam of [ 'name' ]) {
    if (!project[requiredParam]) {
      return response.status(422).send({ error: `Expected format: { name: <String> } Your missing a ${[requiredParam]} property`})
    }
  }
  try {
    const id = await database('projects').insert(project, 'id');
    return response.status(201).json({ id: id[0] });
  } catch (error) {
    return response.status(500).json({ error });
  }
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});
