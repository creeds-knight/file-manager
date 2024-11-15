/**
 * Contains all API endpoints
 */
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const routing = (app) => {
  /**
   * @swagger
   * /status:
   *   get:
   *     summary: Check the server status
   *     tags:
   *       - App
   *     responses:
   *       200:
   *         description: Server is running
   */
  app.get('/status', AppController.getStatus);

  /**
   * @swagger
   * /stats:
   *   get:
   *     summary: Get application statistics
   *     tags:
   *       - App
   *     responses:
   *       200:
   *         description: Returns the statistics for the application
   */
  app.get('/stats', AppController.getStats);

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created successfully
   *       400:
   *         description: Bad Request
   */
  app.post('/users', UsersController.postNew);

  /**
   * @swagger
   * /connect:
   *   get:
   *     summary: Log in a user
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         description: User connected successfully
   *       401:
   *         description: Unauthorized
   */
  app.get('/connect', AuthController.getConnect);

  /**
   * @swagger
   * /disconnect:
   *   get:
   *     summary: Log out a user
   *     tags:
   *       - Auth
   *     responses:
   *       204:
   *         description: User disconnected successfully
   */
  app.get('/disconnect', AuthController.getDisconnect);

  /**
   * @swagger
   * /users/me:
   *   get:
   *     summary: Get user details
   *     tags:
   *       - Users
   *     responses:
   *       200:
   *         description: User details retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  app.get('/users/me', UsersController.getMe);

  /**
   * @swagger
   * /files:
   *   post:
   *     summary: Upload a file
   *     tags:
   *       - Files
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               type:
   *                 type: string
   *               isPublic:
   *                 type: boolean
   *               data:
   *                 type: string
   *                 format: base64
   *     responses:
   *       201:
   *         description: File uploaded successfully
   *       400:
   *         description: Bad Request
   */
  app.post('/files', FilesController.postUpload);

  /**
   * @swagger
   * /files/{id}:
   *   get:
   *     summary: Get file details by ID
   *     tags:
   *       - Files
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File details retrieved successfully
   *       404:
   *         description: Not Found
   */
  app.get('/files/:id', FilesController.getShow);

  /**
   * @swagger
   * /files:
   *   get:
   *     summary: List all files
   *     tags:
   *       - Files
   *     parameters:
   *       - in: query
   *         name: parentId
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Files retrieved successfully
   */
  app.get('/files', FilesController.getIndex);

  /**
   * @swagger
   * /files/{id}:
   *   put:
   *     summary: Publish a file
   *     tags:
   *       - Files
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File published successfully
   *       404:
   *         description: Not Found
   */
  app.get('/files/:id', FilesController.putPublish);

  /**
   * @swagger
   * /files/{id}:
   *   put:
   *     summary: Unpublish a file
   *     tags:
   *       - Files
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File unpublished successfully
   *       404:
   *         description: Not Found
   */
  app.get('/files/:id', FilesController.putUnpublish);

  /**
   * @swagger
   * /files/{id}/data:
   *   get:
   *     summary: Download file content
   *     tags:
   *       - Files
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: size
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File downloaded successfully
   *       404:
   *         description: Not Found
   */
  app.get('/files/:id/data', FilesController.getFile);

  /**
   * @swagger
   * /delete:
   *   get:
   *     summary: Delete a user
   *     tags:
   *       - Users
   *     responses:
   *       200:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   */
  app.get('/delete', UsersController.deleteUser);
};

export default routing;
