import { useForm } from "react-hook-form";
import { Button, Form, FormControl, FormGroup, FormLabel, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { updateShift } from "../utils";
import PropTypes from 'prop-types';

const ShiftsForm = ({ 
  uploadData, 
  editData, 
  onEditComplete, 
  vet, 
  categoria,
  onCancel,
  showOwnerField = true 
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm();

  // Efecto para manejar la edición
  useEffect(() => {
    if (editData) {
      setEditMode(true);
      setEditId(editData.id);
      
      // Formatear fecha y hora para el input datetime-local
      const datetime = editData.date && editData.time 
        ? `${editData.date}T${editData.time.padEnd(5, '0')}`
        : '';
      
      // Establecer valores del formulario
      setValue('pet', editData.pet || '');
      setValue('owner', editData.owner || '');
      setValue('datetime', datetime);
      setValue('detail', editData.detail || '');
      setValue('vet', editData.vet || vet || '');
      setValue('categoria', editData.categoria || categoria || '');
    } else {
      setEditMode(false);
      setEditId(null);
      resetForm();
    }
  }, [editData, setValue, vet, categoria]);

  const resetForm = () => {
    reset({
      pet: '',
      owner: '',
      datetime: '',
      detail: '',
      vet: vet || '',
      categoria: categoria || ''
    });
  };

  const prepareShiftData = (formData) => {
    const [date, time] = formData.datetime.split('T');
    return {
      pet: formData.pet,
      owner: formData.owner,
      date,
      time: time.slice(0, 5),
      detail: formData.detail,
      vet: formData.vet,
      categoria: formData.categoria,
      status: 'pending' // Estado por defecto
    };
  };

  const handleCreate = async (formData) => {
    try {
      const shiftData = prepareShiftData(formData);
      const response = await uploadData(shiftData);

      if (response) {
        Swal.fire({
          title: "¡Turno creado!",
          text: "El turno se ha registrado correctamente",
          icon: "success"
        });
        resetForm();
        return true;
      }
      throw new Error("No se recibió respuesta del servidor");
    } catch (error) {
      console.error("Error al crear turno:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo crear el turno",
        icon: "error"
      });
      return false;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const shiftData = prepareShiftData(formData);
      await updateShift(editId, shiftData);

      Swal.fire({
        title: "¡Turno actualizado!",
        text: "Los cambios se guardaron correctamente",
        icon: "success"
      });
      
      if (onEditComplete) onEditComplete();
      return true;
    } catch (error) {
      console.error("Error al actualizar turno:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el turno",
        icon: "error"
      });
      return false;
    }
  };

  const onSubmit = async (data) => {
    const success = editMode 
      ? await handleUpdate(data)
      : await handleCreate(data);

    if (success && !editMode) {
      resetForm();
    }
  };

  // Campos observados para validación en tiempo real
  const watchedFields = watch(['pet', 'owner', 'datetime', 'detail']);

  const isFormValid = () => {
    return (
      watchedFields[0]?.length >= 2 && // pet
      (showOwnerField ? watchedFields[1]?.length >= 2 : true) && // owner
      watchedFields[2] && // datetime
      watchedFields[3]?.length >= 5 // detail
    );
  };

  return (
    <div className="p-3 border rounded bg-light">
      <h4 className="mb-4">
        {editMode ? 'Editar Turno' : 'Nuevo Turno'}
        {vet && <small className="text-muted d-block">Veterinario: {vet}</small>}
      </h4>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={6}>
            <FormGroup className="mb-3">
              <FormLabel>Nombre de la Mascota*</FormLabel>
              <FormControl
                type="text"
                {...register('pet', {
                  required: 'Campo obligatorio',
                  minLength: {
                    value: 2,
                    message: 'Mínimo 2 caracteres'
                  }
                })}
                placeholder="Ej: Firulais"
                isInvalid={!!errors.pet}
              />
              <Form.Control.Feedback type="invalid">
                {errors.pet?.message}
              </Form.Control.Feedback>
            </FormGroup>
          </Col>

          {showOwnerField && (
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>Dueño*</FormLabel>
                <FormControl
                  type="text"
                  {...register('owner', {
                    required: showOwnerField ? 'Campo obligatorio' : false,
                    minLength: {
                      value: 2,
                      message: 'Mínimo 2 caracteres'
                    }
                  })}
                  placeholder="Nombre del dueño"
                  isInvalid={!!errors.owner}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.owner?.message}
                </Form.Control.Feedback>
              </FormGroup>
            </Col>
          )}
        </Row>

        <Row>
          <Col md={6}>
            <FormGroup className="mb-3">
              <FormLabel>Fecha y Hora*</FormLabel>
              <FormControl
                type="datetime-local"
                {...register('datetime', {
                  required: 'Campo obligatorio',
                  validate: {
                    futureDate: value => {
                      const selectedDate = new Date(value);
                      const now = new Date();
                      return selectedDate > now || 'Debe ser una fecha futura';
                    },
                    businessHours: value => {
                      const hours = new Date(value).getHours();
                      return (hours >= 8 && hours < 20) || 'Horario: 8:00 - 20:00';
                    }
                  }
                })}
                min={new Date().toISOString().slice(0, 16)}
                isInvalid={!!errors.datetime}
              />
              <Form.Control.Feedback type="invalid">
                {errors.datetime?.message}
              </Form.Control.Feedback>
            </FormGroup>
          </Col>

          <Col md={6}>
            <FormGroup className="mb-3">
              <FormLabel>Tipo de Consulta*</FormLabel>
              <Form.Select
                {...register('categoria', { required: 'Seleccione una opción' })}
                isInvalid={!!errors.categoria}
              >
                <option value="">Seleccione...</option>
                <option value="clinica">Consulta Clínica</option>
                <option value="rayosX">Rayos X</option>
                <option value="peluqueria">Peluquería</option>
                <option value="odontologia">Odontología</option>
                <option value="entrenamiento">Entrenamiento</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.categoria?.message}
              </Form.Control.Feedback>
            </FormGroup>
          </Col>
        </Row>

        <FormGroup className="mb-4">
          <FormLabel>Detalles de la Consulta*</FormLabel>
          <FormControl
            as="textarea"
            rows={3}
            {...register('detail', {
              required: 'Campo obligatorio',
              minLength: {
                value: 5,
                message: 'Mínimo 5 caracteres'
              },
              maxLength: {
                value: 500,
                message: 'Máximo 500 caracteres'
              }
            })}
            placeholder="Describa el motivo de la consulta..."
            isInvalid={!!errors.detail}
          />
          <Form.Control.Feedback type="invalid">
            {errors.detail?.message}
          </Form.Control.Feedback>
        </FormGroup>

        <div className="d-flex justify-content-between">
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              resetForm();
              if (onCancel) onCancel();
            }}
          >
            Cancelar
          </Button>

          <Button 
            variant={editMode ? "warning" : "primary"}
            type="submit"
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? 'Procesando...' : editMode ? 'Actualizar Turno' : 'Crear Turno'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

ShiftsForm.propTypes = {
  uploadData: PropTypes.func.isRequired,
  editData: PropTypes.object,
  onEditComplete: PropTypes.func,
  onCancel: PropTypes.func,
  vet: PropTypes.string,
  categoria: PropTypes.string,
  showOwnerField: PropTypes.bool
};

export default ShiftsForm;
