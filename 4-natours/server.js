const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: `${path.join(__dirname, 'config.env')}` });

const app = require('./app');
const port = process.env.PORT;

// console.log(app.get('env')); // set by express
// console.log(process.env); //set by node.js
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
