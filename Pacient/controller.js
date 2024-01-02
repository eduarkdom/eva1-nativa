var validator = require('validator');
var Patient = require('./model').default;
var multer = require('multer');
var upload = require('./multer_config');
var fs = require('fs');
var path = require('path');

var controller = {
    checkRequestBody: (req, res, next) => {
        if (req.method === 'POST' && Object.keys(req.body).length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Se requiere un body para el método POST en esta ruta'
          });
        }
        next();
      },

    savePatient: async (req, res) => {
        var params = req.body;
    
        const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/;
    
        if (
            !params.rut ||
            !validator.matches(params.rut, rutRegex) ||
            validator.isEmpty(params.rut) ||
            !params.nombre ||
            !validator.isLength(params.nombre, { min: 1 }) ||
            validator.isEmpty(params.nombre) ||
            params.edad === undefined ||
            isNaN(params.edad) ||
            !validator.isInt('' + params.edad) ||
            params.edad <= 0 ||
            !params.sexo ||
            !validator.isLength(params.sexo, { min: 1 }) ||
            validator.isEmpty(params.sexo) ||
            !params.enfermedad ||
            !validator.isLength(params.enfermedad, { min: 1 }) ||
            validator.isEmpty(params.enfermedad)
        ) {
            return res.status(400).send({
                status: 'error',
                message: 'Datos inválidos. Asegúrate de proporcionar y validar todos los campos (rut, nombre, edad, sexo, enfermedad).'            
            });
        }
    
        var patient = new Patient({
            rut: params.rut,
            nombre: params.nombre,
            edad: params.edad,
            sexo: params.sexo,
            enfermedad: params.enfermedad,
            fotoPersonal: params.fotoPersonal || null
        });
    
        try {
            const savedPatient = await patient.save();
            return res.status(200).send({
                status: 'success',
                patient: savedPatient
            });
        } catch (error) {
            return res.status(500).send({
                status: 'error',
                message: 'Imposible guardar los datos del paciente en la base de datos'
            });
        }
    },
    
    updatePatient: async (req, res) => {
        try {
            const id = req.params.id;
            const params = req.body;
    
            const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/;
    
            if (
                !params.rut ||
                !validator.matches(params.rut, rutRegex) ||
                validator.isEmpty(params.rut) ||
                !params.nombre ||
                !validator.isLength(params.nombre, { min: 1 }) ||
                validator.isEmpty(params.nombre) ||
                params.edad === undefined ||
                isNaN(params.edad) ||
                !validator.isInt('' + params.edad) ||
                params.edad < 0 ||
                !params.sexo ||
                !validator.isLength(params.sexo, { min: 1 }) ||
                validator.isEmpty(params.sexo) ||
                !params.enfermedad ||
                !validator.isLength(params.enfermedad, { min: 1 }) ||
                validator.isEmpty(params.enfermedad)
            ) {
                return res.status(400).send({
                    status: 'error',
                    message: 'Datos inválidos. Asegúrate de proporcionar y validar todos los campos (rut, nombre, edad, sexo, enfermedad).'
                });
            }
    
            const updatedPatient = await Patient.findByIdAndUpdate(id, params, { new: true });
    
            if (!updatedPatient) {
                return res.status(404).send({
                    status: 'error',
                    message: `El paciente con id: ${id} no existe`
                });
            }
    
            return res.status(200).send({
                status: 'success',
                patient: updatedPatient
            });
        } catch (error) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al actualizar el paciente'
            });
        }
    },    

    deletePatient: async (req, res) => {
        try {
            const id = req.params.id;
            const patient = await Patient.findByIdAndDelete(id);
    
            if (!patient) {
                return res.status(404).send({
                    status: 'error',
                    message: `El paciente con id: ${id} no existe`
                });
            }
    
            return res.status(200).send({
                status: 'success Paciente Eliminado',
                patient
            });
        } catch (error) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al eliminar el paciente'
            });
        }
    },    

    getPatientById: async (req, res) => {
        var id = req.params.id;
    
        try {
            if (!id || id == null) {
                return res.status(400).send({
                    status: 'error',
                    message: 'No se ha proporcionado ID'
                });
            }
    
            const patient = await Patient.findById(id);
    
            if (!patient) {
                return res.status(404).send({
                    status: 'error',
                    message: `El paciente con id: ${id} no existe`
                });
            }
    
            return res.status(200).send({
                status: 'success',
                patient
            });
        } catch (error) {
            return res.status(500).send({
                status: 'error',
                message: 'Error interno del Servidor'
            });
        }
    },
    
    getAllPatients: (req, res) => {
        var { last } = req.params;
        
        if (last && !isNaN(parseInt(last))) {
            var query = Patient.find({}).sort('-_id').limit(parseInt(last));
    
            query.then(patients => {
                if (!patients || patients.length === 0) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se han encontrado pacientes'
                    });
                }
    
                return res.status(200).send({
                    status: 'success',
                    patients
                });
            }).catch(err => {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error interno del Servidor'
                });
            });
        } else {
            Patient.find({}).sort('-_id')
                .then(patients => {
                    if (!patients || patients.length === 0) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'No se han encontrado pacientes'
                        });
                    }
    
                    return res.status(200).send({
                        status: 'success',
                        patients
                    });
                }).catch(err => {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error interno del Servidor'
                    });
                });
        }
    },    

    searchPatients: async (req, res) => {
        try {
            const searchParams = req.query;
            const query = {};
    
            const validSearchParams = [
                'sexo',
                'fechaIngreso',
                'enfermedad',
                //descomentar si se quieren usar otros parámetros para búsqueda
                //'rut',
                //'nombre',
                //'edad',
                //'fotoPersonal',
                //'revisado',
            ];
            const invalidParams = [];
    
            for (const key in searchParams) {
                if (!validSearchParams.includes(key)) {
                    invalidParams.push(key);
                } else {
                    if (key === 'fechaIngreso') {
                        query.fechaIngreso = new Date(searchParams[key]);
                    } else {
                        query[key] = searchParams[key];
                    }
                }
            }
    
            if (invalidParams.length > 0) {
                return res.status(400).send({
                    status: 'error',
                    message: `Los siguientes parámetros no son válidos para la búsqueda de pacientes: ${invalidParams.join(', ')}`
                });
            }
    
            const patients = await Patient.find(query).sort({ createdAt: 'descending' });
    
            if (!patients || patients.length <= 0) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontraron pacientes con los criterios proporcionados'
                });
            }
    
            return res.status(200).send({
                status: 'success',
                patients
            });
        } catch (error) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al buscar documentos'
            });
        }
    },
    
    uploadPhoto: async (req, res) => {
        try {
            upload(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Error al cargar el archivo',
                        error: err.message
                    });
                } else if (err) {
                    return res.status(500).json({
                        status: 'error',
                        message: 'Error interno del servidor al cargar el archivo',
                        error: err.message
                    });
                }
    
                const file = req.file;
                const id = req.params.id;
    
                if (!file) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'El archivo no puede estar vacío o la extensión del archivo no está permitida'
                    });
                }
    
                const tempFilename = file.filename;
    
                if (id) {
                    const updatedPatient = await Patient.findByIdAndUpdate(
                        { _id: id },
                        { fotoPersonal: tempFilename },
                        { new: true }
                    );
    
                    if (!updatedPatient) {
                        return res.status(400).json({
                            status: 'error',
                            message: `La imagen no se pudo guardar en el documento con _id: ${id}`
                        });
                    }
    
                    return res.status(200).json({
                        status: 'success',
                        message: '¡Carga de archivo y actualización de foto de paciente exitoso!',
                        filename: file.filename,
                        patient: updatedPatient
                    });
                } else {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Se requiere un ID para actualizar la foto del paciente'
                    });
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor al cargar el archivo',
                error: error.message
            });
        }
    },
    
    

    getPhoto: (req, res) => {
        var file = req.params.filename
        var pathFile = 'uploads/' + file

        if(exists = fs.existsSync(pathFile)){
            return res.sendFile(path.resolve(pathFile))
        }else{
            return res.status(404).send({
                status: 'error',
                message: `No se encontró la imagen con el nombre: ${file}`
            })
        }
    }
}

module.exports = controller;