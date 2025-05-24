import React, { useContext, useState } from "react";
import { Row, Col, Dropdown, Form, Button } from "react-bootstrap";
import ShiftsForm from "../components/ShiftsForm";
import ShiftsCalendar from "../components/ShiftsCalendar";
import { ShiftContext } from "../components/ShiftContext";
import { createShift, updateShift } from "../utils";
import Swal from "sweetalert2";

const ManageShifts = () => {
  const { vet, setVet, categorie, setCategorie } = useContext(ShiftContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShift, setSelectedShift] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const handleVetChange = (eventKey) => {
    setVet(eventKey);
    setSelectedShift(null); // Resetear turno seleccionado al cambiar vet
  };

  const handleCategorieChange = (eventKey) => {
    setCategorie(eventKey);
    setSelectedShift(null); // Resetear turno seleccionado al cambiar categoría
  };

  const handleShiftSelect = (shift) => {
    setSelectedShift(shift);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setSelectedShift(null);
    setShowForm(true);
  };

  const uploadData = async (obj) => {
    try {
      const shift = await createShift(obj);
      Swal.fire({
        title: "¡Turno creado!",
        text: "El turno se ha registrado correctamente",
        icon: "success"
      });
      return shift;
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "No se pudo crear el turno",
        icon: "error"
      });
      throw error;
    }
  };

  const handleUpdateComplete = () => {
    setSelectedShift(null);
  };

  return (
    <>
      <Row>
        <Col md={4} className="p-3 border-end">
          <h3 className="mb-4">Gestión de Turnos</h3>

          {/* Barra de búsqueda */}
          <Form.Group className="mb-4">
            <Form.Control
              type="search"
              placeholder="Buscar por mascota o dueño..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          {/* Filtros */}
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Veterinario</Form.Label>
              <Dropdown onSelect={handleVetChange}>
                <Dropdown.Toggle variant="outline-secondary" className="w-100">
                  {vet || "Seleccione veterinario"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="Vet 1">Vet 1</Dropdown.Item>
                  <Dropdown.Item eventKey="Vet 2">Vet 2</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipo de Consulta</Form.Label>
              <Dropdown onSelect={handleCategorieChange}>
                <Dropdown.Toggle variant="outline-secondary" className="w-100">
                  {categorie || "Seleccione tipo"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="clinica">Clínica</Dropdown.Item>
                  <Dropdown.Item eventKey="rayosX">Rayos X</Dropdown.Item>
                  <Dropdown.Item eventKey="peluqueria">Peluquería</Dropdown.Item>
                  <Dropdown.Item eventKey="odontologia">Odontología</Dropdown.Item>
                  <Dropdown.Item eventKey="entrenamiento">Entrenamiento</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
          </div>

          {/* Botón para nuevo turno (solo muestra cuando no hay formulario visible) */}
          {!showForm && (
            <Button 
              variant="primary" 
              className="mb-4 w-100"
              onClick={handleCreateNew}
            >
              Nuevo Turno
            </Button>
          )}

          {/* Formulario (condicional) */}
          {showForm && (
            <div className="border-top pt-3">
              <ShiftsForm
                vet={vet}
                categoria={categorie}
                uploadData={uploadData}
                editData={selectedShift}
                onEditComplete={handleUpdateComplete}
                onCancel={() => setSelectedShift(null)}
              />
            </div>
          )}
        </Col>

        {/* Calendario */}
        <Col md={8} className="p-3">
          <ShiftsCalendar
            vet={vet}
            categorie={categorie}
            searchTerm={searchTerm}
            onShiftSelect={handleShiftSelect}
            refreshTrigger={selectedShift} // Forzar actualización al editar
          />
        </Col>
      </Row>
    </>
  );
};

export default ManageShifts;