import express from 'express';
const router = express.Router();
import { measureController } from './controller/MeasureController';
import { measureValidationRules } from './validation/MeasureRules';
import { customerController } from './controller/CustomerController';
import { customerValidationRules } from './validation/CustomerRules';

//measures
router.post('/upload', measureValidationRules.uploadRules, measureController.upload);
router.patch('/confirm', measureValidationRules.confirmRules, measureController.confirm);
router.get('/customers/:customer_code/list', measureValidationRules.getAllMeasuresByCustomerCodeRules, measureController.getAllMeasuresByCustomerCode);

//customers
router.post('/customers', customerValidationRules, customerController.createCustomer);

export default router;
