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

    it('Should return a 404 and an error object syaing id can not be found', async () => {
      const invalidId = 700;
      const response = await request(app).get(`/api/v1/projects/${invalidId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual(`Could not locate project: 700`);
    });
  });


  describe('POST /api/v1/projects', () => {
    it('Should POST a new project to the db', async () => {
      const newProject = { name: "Best Project" };

      const response = await request(app).post('/api/v1/projects').send(newProject);
      const projects = await database('projects').where('id', response.body.id).select();
      const project = projects[0];
      expect(response.status).toBe(201);
      expect(project.name).toEqual(newProject.name);
    });
  })

});
