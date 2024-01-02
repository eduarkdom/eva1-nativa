var express = require('express');
var controller = require('./controller');
var upload = require('./multer_config');
var router = express.Router();

router.get('/', (req, res) => {
    return res.send('Test route');
});

router.post('/paciente', controller.checkRequestBody, controller.savePatient);
router.get('/pacientes', controller.getAllPatients);
router.get('/pacientes/:last', controller.getAllPatients);

router.get('/paciente/id/:id?', controller.getPatientById);
router.get('/paciente/busqueda', controller.searchPatients);

router.put('/paciente/:id', controller.updatePatient);
router.delete('/paciente/:id', controller.deletePatient);

router.post('/paciente/upload/:id?', controller.uploadPhoto);
router.get('/paciente/archivo/:filename', controller.getPhoto);

module.exports = router;