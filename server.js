/**
 * This file contains the express server
 */
import express from 'express';
import routing from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

routing(app);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

export default app;
