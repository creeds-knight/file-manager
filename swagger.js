/* eslint-disable import/no-extraneous-dependencies */
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'File Manager API',
      version: '1.0.0',
      description: 'API documentation for the File Manager application',
    },
    servers: [
      { url: 'http://localhost:3000', descriptio: 'Development server' },
    ],
  },
  apis: ['./routes/*.js'],
};

// Generate swagger documentation
const swaggerDocs = swaggerJsDoc(swaggerOptions);

/**
 * setup Swagger middleware for the Express app
 * @param {Object} app - The Express application instance
 */
const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

export default setupSwagger;
