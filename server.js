/**
 * This file contains the express server
 */
import express from 'express';
import routing from './routes/index';
import setupSwagger from './swagger';

const app = express(); // Entry point into the app
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

setupSwagger(app); // Settinh up swagger documentation
routing(app);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

export default app;
