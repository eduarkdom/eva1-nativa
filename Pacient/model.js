import { Schema as _Schema, model } from 'mongoose';
var Schema = _Schema;

var patientSchema = new Schema({
    rut: { type: String, required: true },
    nombre: { type: String, required: true },
    edad: { type: Number, required: true },
    sexo: { type: String, required: true },
    fotoPersonal: String,
    fechaIngreso: { type: Date, default: Date.now },
    enfermedad: { type: String, required: true },
    revisado: { type: Boolean, default: false }
});

export default model('Paciente', patientSchema);