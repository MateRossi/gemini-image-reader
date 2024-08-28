import express from 'express';
const router = express.Router();
import { measureController } from './controller/MeasureController';
import { measureValidationRules } from './validation/MeasureRules';
import { customerController } from './controller/CustomerController';
import { customerValidationRules } from './validation/CustomerRules';

router.post('/upload', measureValidationRules, measureController.upload);
router.post('/customers', customerValidationRules, customerController.createCustomer);

export default router;
