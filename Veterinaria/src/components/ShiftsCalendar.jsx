import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import esES from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { readShifts } from '../utils';

const locales = {
  'es': esES,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const ShiftsCalendar = ({ vet, categorie, searchTerm, onShiftSelect, refreshTrigger }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        let shifts = await readShifts();
        
        // Aplicar filtros
        shifts = shifts.filter(shift => {
          const matchesVet = !vet || shift.vet === vet;
          const matchesCategorie = !categorie || shift.categorie === categorie;
          const matchesSearch = !searchTerm || 
            shift.pet.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (shift.owner && shift.owner.toLowerCase().includes(searchTerm.toLowerCase()));
          
          return matchesVet && matchesCategorie && matchesSearch;
        });

        // Formatear eventos para el calendario
        const formattedEvents = shifts.map(shift => ({
          id: shift.id,
          title: `${shift.pet} - ${shift.detail}`,
          start: new Date(`${shift.date}T${shift.time}:00`),
          end: addHours(new Date(`${shift.date}T${shift.time}:00`), 1), // +1 hora
          allDay: false,
          resource: shift,
          vet: shift.vet,
          categorie: shift.categorie,
          pet: shift.pet,
          owner: shift.owner
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error cargando turnos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [vet, categorie, searchTerm, refreshTrigger]);

  const handleSelectEvent = (event) => {
    if (onShiftSelect) {
      onShiftSelect(event.resource);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '';
    
    // Asignar colores según categoría
    switch(event.categorie) {
      case 'clinica':
        backgroundColor = '#4a6fa5'; // Azul
        break;
      case 'rayosX':
        backgroundColor = '#6a4a8c'; // Violeta
        break;
      case 'peluqueria':
        backgroundColor = '#c47ac0'; // Rosa
        break;
      case 'odontologia':
        backgroundColor = '#5cb85c'; // Verde
        break;
      case 'entrenamiento':
        backgroundColor = '#f0ad4e'; // Naranja
        break;
      default:
        backgroundColor = '#5bc0de'; // Celeste
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        cursor: 'pointer'
      }
    };
  };

  return (
    <div style={{ height: '75vh', padding: '16px' }}>
      {loading ? (
        <div className="text-center mt-5">Cargando turnos...</div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="es"
          messages={{
            today: 'Hoy',
            previous: 'Anterior',
            next: 'Siguiente',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Turno'
          }}
          defaultView="week"
          views={['day', 'week', 'month', 'agenda']}
          min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
          max={new Date(0, 0, 0, 20, 0, 0)} // 8:00 PM
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          selectable
          step={30} // Intervalos de 30 minutos
          timeslots={2} // 2 divisiones por intervalo
          defaultDate={new Date()}
          toolbar={true}
        />
      )}
    </div>
  );
};

export default ShiftsCalendar;






// import React, { useContext, useEffect, useState } from 'react';
// import { Button, Table } from 'react-bootstrap';
// import { readShifts, deleteShift } from '../utils';

// const ShiftsCalendar = ({ vet, categorie }) => {
//   const [shifts, setShifts] = useState([]);

//   const loadShifts = async () => {
//     const data = await readShifts();
//     setShifts(data);
//   };

//   useEffect(() => {
//     loadShifts();
//   }, [vet, categorie]);

//   const handleDelete = async (id) => {
//     await deleteShift(id);
//     loadShifts();
//   };

//   return (
//     <Table striped bordered>
//       <thead>
//         <tr>
//           <th>Mascota</th>
//           <th>Fecha</th>
//           <th>Hora</th>
//           <th>Acciones</th>
//         </tr>
//       </thead>
//       <tbody>
//         {shifts.map((shift) => (
//           <tr key={shift.id}>
//             <td>{shift.pet}</td>
//             <td>{shift.date}</td>
//             <td>{shift.time}</td>
//             <td>
//               <Button variant="danger" onClick={() => handleDelete(shift.id)}>
//                 Eliminar
//               </Button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </Table>
//   );
// };

// export default ShiftsCalendar;