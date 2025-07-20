const app = require('./src/app');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();
app.use(cookieParser());

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});