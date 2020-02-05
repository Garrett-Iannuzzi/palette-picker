const request = require('supertest');
const app = require('./app');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

describe('Server', () => {
  beforeEach(async () => {
    await database.seed.run();
  });

  describe('init', () => {
    it('should return a 200 status', async () => {
      const res = await request(app).get('/')
      expect(res.status).toBe(200)
    });
  });

  describe('GET /api/v1/projects', () => {
    it('Should return a 200 and all of the projects', async () => {
      const expectedProjects = await database('projects').select();

      const response = await request(app).get('/api/v1/projects');
      const projects = response.body;
      expect(response.status).toBe(200);
      expect(projects[0].name).toEqual(expectedProjects[0].name);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('Should return a 200 and a project based on ID', async () => {
      const expectedProject = await database('projects').first();
      const { id } = expectedProject;

      const response = await request(app).get(`/api/v1/projects/${id}`);
      const result = response.body[0];

      expect(response.status).toBe(200);
      expect(result.name).toEqual(expectedProject.name);
    });

    it('Should return a 422 and an error object that confirms data type', async () => {
      const invalidId = 'f';
      const response = await request(app).get(`/api/v1/projects/${invalidId}`);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Incorrect ID: f, Required data type: <Number>`);
    });

    it('Should return a 404 and an error object saying id can not be found', async () => {
      const invalidId = 700;
      const response = await request(app).get(`/api/v1/projects/${invalidId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual(`Could not locate project: 700`);
    });
  });

  describe('GET /api/v1/projects/:id/palettes', () => {
    it('Should return a 200 and all palettes based on project ID', async () => {
      const expectedProject = await database('projects').first();
      const { id } = expectedProject;
      const expectedPalettes = await database('palettes').where("project_id", id).select();
      const expectedPalette = expectedPalettes[0];

      const response = await request(app).get(`/api/v1/projects/${id}/palettes`);
      const result = response.body[0];

      expect(response.status).toBe(200);
      expect(result.name).toEqual(expectedPalette.name);

    });

    it('Should return a 422 and an error object that confirms data type', async () => {
      const invalidId = 'u';
      const response = await request(app).get(`/api/v1/projects/${invalidId}/palettes`);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Incorrect ID: u, Required data type: <Number>`);
    });

    it('Should return a 404 and an error object saying id can not be found', async () => {
      const invalidId = 777;
      const response = await request(app).get(`/api/v1/projects/${invalidId}/palettes`);

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual(`Project with ID of 777 does not have any palettes`);
    });
  });

  describe('GET /api/v1/palettes/:id', () => {
    it('Should return a 200 status and a single palette based on ID', async () => {
      const expectedPalette = await database('palettes').first();
      const { id } = expectedPalette;

      const response = await request(app).get(`/api/v1/palettes/${id}`);
      const palette = response.body[0];

      expect(response.status).toBe(200);
      expect(palette.name).toEqual(expectedPalette.name)
    });

    it('Should return a 422 and an error object that confirms data type', async () => {
      const invalidId = 'g';
      const response = await request(app).get(`/api/v1/palettes/${invalidId}`);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Incorrect ID: g, Required data type: <Number>`);
    });

    it('Should return a 404 and an error object saying id can not be found', async () => {
      const invalidId = 13;
      const response = await request(app).get(`/api/v1/palettes/${invalidId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual(`Could not locate palette: 13`);
    });
  });

  describe('POST /api/v1/projects', () => {
    it('Should return a 201 and POST a new project to the db', async () => {
      const newProject = { name: "Best Project" };

      const response = await request(app).post('/api/v1/projects').send(newProject);
      const projects = await database('projects').where('id', response.body.id).select();
      const project = projects[0];
      expect(response.status).toBe(201);
      expect(project.name).toEqual(newProject.name);
    });

    it('Should return a 422 when the request body format is incorrect', async () => {
      const invalidProject = { type: "Best Project" };

      const response = await request(app).post('/api/v1/projects').send(invalidProject);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Expected format: { name: <String> }, Your missing a name property`)
    });
  });

  describe('POST /api/v1/palettes', () => {
    it('Should return a 201 and POST a new palette to the db', async () => {
      const project = await database('projects').first();
      const newPalette = {
        name: 'Pretty Palette',
        project_id: `${project.id}`,
        color_one: "#84756",
        color_two: "#84712",
        color_three: "#84712",
        color_four: "#81231",
        color_five: "#84734",
      }
      const response = await request(app).post('/api/v1/palettes').send(newPalette);
      const palette = await database('palettes').where('id', response.body.id).select();
      expect(response.status).toBe(201);
      expect(palette[0].name).toEqual(newPalette.name);
    });

    it('Should return a 422 when the request body format is incorrect', async () => {
      const invalidPalette = {
        name: 'Pretty Palette',
        color_one: "#84756",
        color_two: "#84712",
        color_three: "#84712",
        color_four: "#81231",
        color_five: "#84734",
      }

      const response = await request(app).post('/api/v1/palettes').send(invalidPalette);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Expected format: { name: <String>, project_id: <Number>, color_one:<String>, color_two:<String>, color_three:<String>, color_four:<String>, color_five:<String>} Your missing a project_id property`)
    });
  });

  describe('PATCH /api/v1/palettes/:id', () => {
    it('Should return a 200 with the newly patched palette', async () => {
      const palette = await database('palettes').first();
      const { id } = palette;
      const patch = {
        color_one: "#84756",
        color_two: "#84712",
        color_three: "#84712",
        color_four: "#81231",
        color_five: "#84734"
      }

      const response = await request(app).patch(`/api/v1/palettes/${id}`).send(patch);
      const updatedPalettes = await database('palettes').where('id', id).select();
      const updatedPalette = updatedPalettes[0];
      expect(response.status).toBe(200);
      expect(response.body.colors[0]).toEqual(updatedPalette.color_one);
    });

    it('Should return a 422 and an error object that confirms data type', async () => {
      const invalidId = 'u';
      const response = await request(app).patch(`/api/v1/palettes/${invalidId}`);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Incorrect ID: u, Required data type: <Number>`);
    });

    it('Should return a 422 when the request body format is incorrect', async () => {
      const palette = await database('palettes').first();
      const { id } = palette;
      const invalidPatch = {
        color_two: "#84712",
        color_three: "#84712",
        color_four: "#81231",
        color_five: "#84734"
      }

      const response = await request(app).patch(`/api/v1/palettes/${id}`).send(invalidPatch);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Expected format: { color_one:<String>, color_two:<String>, color_three:<String>, color_four:<String>, color_five:<String>} Your missing a color_one property`)
    });

    it('Should return a 422 when the request body format is incorrect', async () => {
      const palette = await database('palettes').first();
      const { id } = palette;
      const invalidPatch = {
        name: 'Palette time',
        color_one: "#84756",
        color_two: "#84712",
        color_three: "#84712",
        color_four: "#81231",
        color_five: "#84734"
      }

      const response = await request(app).patch(`/api/v1/palettes/${id}`).send(invalidPatch);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Expected format: { color_one:<String>, color_two:<String>, color_three:<String>, color_four:<String>, color_five:<String>}, name is invalid property`);
    });

    it('Should return a 404 and an error object saying id can not be found', async () => {
      const invalidId = 99999;
      const patch = {
        color_one: "#84756",
        color_two: "#84712",
        color_three: "#84712",
        color_four: "#81231",
        color_five: "#84734"
      }
      const response = await request(app).patch(`/api/v1/palettes/${invalidId}`).send(patch);

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual(`Could not locate palette: ${invalidId}`);
    });
  });

  describe('PATCH /api/v1/projects/:id', () => {
    it('Should return a 200 with the newly patched palette', async () => {
      const project = await database('projects').first();
      const { id } = project;
      const patch = {
        name: 'Project Project'
      }

      const response = await request(app).patch(`/api/v1/projects/${id}`).send(patch);
      const updatedProjects = await database('projects').where('id', id).select();
      const updatedProject = updatedProjects[0];

      expect(response.status).toBe(200);
      expect(response.body.name).toEqual(updatedProject.name);
    });

    it('Should return a 422 and an error object that confirms data type', async () => {
      const invalidId = 'u';
      const response = await request(app).patch(`/api/v1/projects/${invalidId}`);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Incorrect ID: u, Required data type: <Number>`);
    });

    it('Should return a 422 when the request body format is incorrect', async () => {
      const project = await database('projects').first();
      const { id } = project;
      const patch = {
        type: 'Project Project'
      }

      const response = await request(app).patch(`/api/v1/projects/${id}`).send(patch);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Expected format: { name:<String> }, Your missing a name property`)
    });

    it('Should return a 422 when the request body format is incorrect', async () => {
      const project = await database('projects').first();
      const { id } = project;
      const invalidPatch = {
        name: 'Project Project',
        id: 23
      }

      const response = await request(app).patch(`/api/v1/projects/${id}`).send(invalidPatch);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Expected format: { name:<String> }, id is invalid property`);
    });

    it('Should return a 404 and an error object saying id can not be found', async () => {
      const invalidId = 99999;
      const patch = {
        name: 'Project Project'
      }

      const response = await request(app).patch(`/api/v1/projects/${invalidId}`).send(patch);

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual(`Could not locate project: ${invalidId}`);
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    it('Should return a 200 with a success message', async () => {
      const project = await database('projects').first();
      const { id } = project;

      const expectedResponse = { message: 'Success: Project has been removed'}
      const response = await request(app).delete(`/api/v1/projects/${id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });

    it('Should return a 422 and an error object that confirms data type', async () => {
      const invalidId = 'u';
      const response = await request(app).delete(`/api/v1/projects/${invalidId}`);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Incorrect ID: u, Required data type: <Number>`);
    });

    it('Should return a 404 and an error object saying id can not be found', async () => {
      const invalidId = 99999;

      const response = await request(app).delete(`/api/v1/projects/${invalidId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual(`Could not locate project: ${invalidId}`);
    });
  });

  describe('DELETE /api/v1/palettes/:id', () => {
    it('Should return a 200 with a success message', async () => {
      const palette = await database('palettes').first();
      const { id } = palette;

      const expectedResponse = { message: 'Success: Palette has been removed'}
      const response = await request(app).delete(`/api/v1/palettes/${id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });

    it('Should return a 422 and an error object that confirms data type', async () => {
      const invalidId = 'u';
      const response = await request(app).delete(`/api/v1/palettes/${invalidId}`);

      expect(response.status).toBe(422);
      expect(response.body.error).toEqual(`Incorrect ID: u, Required data type: <Number>`);
    });

    it('Should return a 404 and an error object saying id can not be found', async () => {
      const invalidId = 99999;

      const response = await request(app).delete(`/api/v1/palettes/${invalidId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual(`Could not locate palette: ${invalidId}`);
    });
  });

});
