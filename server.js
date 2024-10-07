/**
 * This file contains the express server
 */
import express from "express";
import routing from "./routes/index";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())
routing(app);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`)
})

export default app;