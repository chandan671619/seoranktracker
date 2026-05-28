import express from "express";
import auth from "../middleware/auth.js";
import { addKeyword, getkeywords , getkeyword, refreshkeyword, toggleTracking, deletekeyword } from "../controller/rankController.js";

const rankRouter = express.Router();

rankRouter.post('/add',auth,addKeyword)
rankRouter.get('/list',auth,getkeywords)
rankRouter.get('/:id',auth,getkeyword)
rankRouter.post('/:id/refresh',auth,refreshkeyword);
rankRouter.put('/:id/toggle',auth,toggleTracking);
rankRouter.delete('/:id',auth,deletekeyword);

export default rankRouter;


