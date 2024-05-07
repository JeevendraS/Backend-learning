import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheacker.controller.js"

const router = Router();

router.route('/').get(healthcheck);

export default router