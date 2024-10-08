/**
 * Contains all API endpoints
 */
import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController"
import AuthController from "../controllers/AuthController";
import FilesController from "../controllers/FilesController";

const routing = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.get('/users/me', UsersController.getMe);
  app.get('/files', FilesController.postUpload);

}

export default routing;