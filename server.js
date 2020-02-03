const express = require('express');
const app = express();

app.use(express.json());


app.set('port', process.env.PORT || 3000);

app.get('/', (request, response) => {
  response.send('Oh hey Pet Box');
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});
