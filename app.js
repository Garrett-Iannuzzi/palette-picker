const express = require('express');
const app = express();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.locals.title = 'Palette Picker';
app.use(express.json());

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
    const newPalettes = palettes.map(palette => {
      const paletteKeys = Object.keys(palette);
      return paletteKeys.reduce((acc, key) => {
        if (key.includes('color')) {
          acc.colors.push(palette[key]);
        } else {
          acc[key] = palette[key];
        }
        return acc;
      }, { colors: [] })
    });
    return response.status(200).json(newPalettes);
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
    const newPalette = palette.map(palette => {
      const paletteKeys = Object.keys(palette);
      return paletteKeys.reduce((acc, key) => {
        if (key.includes('color')) {
          acc.colors.push(palette[key]);
        } else {
          acc[key] = palette[key];
        }
        return acc;
      }, { colors: [] })
    });
    return response.status(200).json(newPalette);
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.get('/api/v1/palettes', async (request, response) => {
  const hexArray = request.query.hexcode.split('');
  if (hexArray.length < 5 || hexArray.length > 6) {
    return response.status(404).json({ error: `Please provide 5-6 digit hexcode` });
  }
  if (hexArray.length === 5 || hexArray.length === 6) {
    try {
      const palettes = await database('palettes').select();
      if(!palettes.length) {
        return response.status(404).json({ error: `There are currently no saved pallets` });
      }
      const newPalettes = palettes.map(palette => {
        const paletteKeys = Object.keys(palette);
        return paletteKeys.reduce((acc, key) => {
          if (key.includes('color')) {
            acc.colors.push(palette[key]);
          } else {
            acc[key] = palette[key];
          }
          return acc;
        }, { colors: [] })
      });
      const filteredPalettes = newPalettes.filter(palette => {
        const checkColors = palette.colors.map(color => {
          if (color.includes(request.query.hexcode)) {
            return true;
          } else {
            return palette
          }
        });
        return checkColors.includes(true)
      });
      if(!filteredPalettes.length) {
        return response.status(404).json({ error: `No palettes with the hexcode of ${request.query.hexcode} exist` });
      }
      return response.status(200).json(filteredPalettes);
    } catch(error) {
      return response.status(500).json({ error });
    }
  }
});

app.post('/api/v1/projects', async (request, response) => {
  const project = request.body;

  for (let requiredParam of [ 'name' ]) {
    if (!project[requiredParam]) {
      return response.status(422).send({ error: `Expected format: { name: <String> }, Your missing a ${[requiredParam]} property`});
    }
  }

  try {
    const id = await database('projects').insert(project, 'id');
    return response.status(201).json({ id: id[0] });
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.post('/api/v1/palettes', async (request, response) => {
  const palette = request.body;

  for (let requiredParam of [ 'name', 'project_id', 'color_one', 'color_two', 'color_three', 'color_four', 'color_five' ]) {
    if (!palette[requiredParam]) {
      return response.status(422).send({ error: `Expected format: { name: <String>, project_id: <Number>, color_one:<String>, color_two:<String>, color_three:<String>, color_four:<String>, color_five:<String>} Your missing a ${[requiredParam]} property`});
    }
  }

  try {
    const id = await database('palettes').insert(palette, 'id');
    return response.status(201).json({ id: id[0] });
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.patch('/api/v1/palettes/:id', async (request, response) => {
  const { id } = request.params;
  const patch = request.body;
  const patchKeys = Object.keys(patch);

  if(!parseInt(id)) {
    return response.status(422).json({ error: `Incorrect ID: ${id}, Required data type: <Number>`});
  }

  for (let requiredParam of [ 'color_one', 'color_two', 'color_three', 'color_four', 'color_five' ]) {
    if (!patch[requiredParam]) {
      return response.status(422).send({ error: `Expected format: { color_one:<String>, color_two:<String>, color_three:<String>, color_four:<String>, color_five:<String>} Your missing a ${[requiredParam]} property`});
    }
  }

  for (let i = 0; i < patchKeys.length; i++) {
    if(patchKeys[i] !== 'color_one' && patchKeys[i] !== 'color_two' && patchKeys[i] !== 'color_three' && patchKeys[i] !== 'color_four' && patchKeys[i] !== 'color_five') {
      return response.status(422).send({ error: `Expected format: { color_one:<String>, color_two:<String>, color_three:<String>, color_four:<String>, color_five:<String>}, ${patchKeys[i]} is invalid property`});
    }
  }

  try {
    const paletteToPatch = await database('palettes').where('id', id).select();
    if(!paletteToPatch.length) {
      return response.status(404).json({ error: `Could not locate palette: ${id}` })
    }
    const updatedPalette = await database('palettes').where('id', id).update(patch, '*');
    const newPalette = updatedPalette.map(palette => {
      const paletteKeys = Object.keys(palette);
      return paletteKeys.reduce((acc, key) => {
        if (key.includes('color')) {
          acc.colors.push(palette[key]);
        } else {
          acc[key] = palette[key];
        }
        return acc;
      }, { colors: [] })
    });
    return response.status(200).json(newPalette[0]);
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.patch('/api/v1/projects/:id', async (request, response) => {
  const { id } = request.params;
  const patch = request.body;
  const patchKeys = Object.keys(patch);

  if(!parseInt(id)) {
    return response.status(422).json({ error: `Incorrect ID: ${id}, Required data type: <Number>`});
  }

  for (let requiredParam of [ 'name' ]) {
    if (!patch[requiredParam]) {
      return response.status(422).send({ error: `Expected format: { name:<String> }, Your missing a ${[requiredParam]} property`});
    }
  }

  for (let i = 0; i < patchKeys.length; i++) {
    if(patchKeys[i] !== 'name') {
      return response.status(422).send({ error: `Expected format: { name:<String> }, ${patchKeys[i]} is invalid property`});
    }
  }

  try {
    const projectToPatch = await database('projects').where('id', id).select();
    if(!projectToPatch.length) {
      return response.status(404).json({ error: `Could not locate project: ${id}` })
    }
    const updatedProject = await database('projects').where('id', id).update(patch, '*');
    return response.status(200).json(updatedProject[0]);
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.delete('/api/v1/projects/:id', async (request, response) => {
  const { id } = request.params;

  if(!parseInt(id)) {
    return response.status(422).json({ error: `Incorrect ID: ${id}, Required data type: <Number>`});
  }

  try {
    const projectToDelete = await database('projects').where('id', id).select();
    if(!projectToDelete.length) {
      return response.status(404).json({ error: `Could not locate project: ${id}` });
    }
    const item = await database('projects').where('id', id).del();
    return response.status(200).json({ message: 'Success: Project has been removed'});
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.delete('/api/v1/palettes/:id', async (request, response) => {
  const { id } = request.params;

  if(!parseInt(id)) {
    return response.status(422).json({ error: `Incorrect ID: ${id}, Required data type: <Number>`});
  }

  try {
    const paletteToDelete = await database('palettes').where('id', id).select();
    if(!paletteToDelete.length) {
      return response.status(404).json({ error: `Could not locate palette: ${id}` });
    }
    const item = await database('palettes').where('id', id).del();
    return response.status(200).json({ message: 'Success: Palette has been removed'});
  } catch (error) {
    return response.status(500).json({ error });
  }
});

module.exports = app;
