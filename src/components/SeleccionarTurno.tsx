import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';

const SeleccionarTurno: React.FC = () => {
  const [canchaSeleccionada, setCanchaSeleccionada] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string | null>(null);
  const [duracion, setDuracion] = useState<number>(1); // Duración seleccionada
  const [loading, setLoading] = useState(false);
  const [paso, setPaso] = useState(1);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState<string | null>(null);
  const [misReservas, setMisReservas] = useState<any[]>([]);

  const user = auth.currentUser;

  const canchas = ["Fútbol 7", "Fútbol 11", "Tenis 1", "Tenis 2", "Paddle"];

  const horarios = [
    "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00",
    "19:00", "20:00"
  ];

  useEffect(() => {
    const obtenerReservasUsuario = async () => {
      if (!user || !user.uid) {
        console.error("No hay un usuario autenticado.");
        return;
      }

      try {
        const q = query(collection(db, 'reservas'), where('uid', '==', user.uid));
        const snapshot = await getDocs(q);
        const reservas = snapshot.docs.map(doc => doc.data());

        const reservasFuturas = reservas.filter((reserva) => {
          const fechaReserva = new Date(`${reserva.fecha}T${reserva.horario}`);
          const ahora = new Date();
          return fechaReserva > ahora;
        });

        setMisReservas(reservasFuturas);
      } catch (error) {
        console.error("Error al obtener las reservas: ", error);
      }
    };

    obtenerReservasUsuario();
  }, [user]);

  const manejarSeleccion = (cancha: string) => {
    setCanchaSeleccionada(cancha);
    setPaso(2); // Avanza al siguiente paso después de seleccionar la cancha
  };

  const manejarAgendar = () => {
    setMostrarModal(true);
    setPaso(1); // Reiniciar los pasos cada vez que se abre el modal
  };

  const manejarFechaSeleccionada = async (date: Date | null) => {
    if (!date || !canchaSeleccionada) return;
    try {
      setFechaSeleccionada(date);
      setLoading(true);

      const fechaString = date.toISOString().split('T')[0];

      const q = query(
        collection(db, 'reservas'),
        where('fecha', '==', fechaString),
        where('cancha', '==', canchaSeleccionada)
      );

      const snapshot = await getDocs(q);
      let horariosOcupados: string[] = [];

      snapshot.docs.forEach((doc) => {
        const reserva = doc.data();
        horariosOcupados.push(reserva.horario);

        const indiceHorario = horarios.indexOf(reserva.horario);
        if (reserva.duracion === 2 && indiceHorario + 1 < horarios.length) {
          horariosOcupados.push(horarios[indiceHorario + 1]); // Bloquear el siguiente horario si la duración es 2 horas
        }
      });

      const horariosDisponibles = horarios.filter(horario => !horariosOcupados.includes(horario));
      setHorariosDisponibles(horariosDisponibles);
    } catch (error) {
      console.error("Error al obtener las reservas:", error);
    } finally {
      setLoading(false);
      setPaso(3); // Avanza al paso 3 después de seleccionar la fecha
    }
  };

  const reservarTurno = async () => {
    if (!fechaSeleccionada || !horarioSeleccionado) {
      alert("Por favor selecciona un horario.");
      return;
    }

    try {
      const fechaString = fechaSeleccionada.toISOString().split('T')[0];
      const finalHour = horarios[horarios.indexOf(horarioSeleccionado) + (duracion - 1)] || horarioSeleccionado;

      // Agregar reserva a Firestore
      await addDoc(collection(db, 'reservas'), {
        uid: user?.uid,
        cancha: canchaSeleccionada,
        fecha: fechaString,
        horario: horarioSeleccionado,
        duracion,
      });

      setMisReservas(prevReservas => [...prevReservas, {
        uid: user?.uid,
        cancha: canchaSeleccionada,
        fecha: fechaString,
        horario: horarioSeleccionado,
        duracion,
      }]);

      setMensajeConfirmacion(`Reserva confirmada para ${fechaString} en la cancha ${canchaSeleccionada}, de ${horarioSeleccionado} a ${finalHour}.`);
      setMostrarModal(false); // Cerrar modal después de confirmar la reserva
    } catch (error) {
      console.error("Error al reservar turno: ", error); // Capturar el error
      alert("Ocurrió un error al realizar la reserva. Verifica los permisos.");
    }
  };

  const handleSiguiente = () => {
    if (paso === 1 && !canchaSeleccionada) {
      alert("Por favor selecciona una cancha.");
      return;
    }
    if (paso === 2 && !fechaSeleccionada) {
      alert("Por favor selecciona una fecha.");
      return;
    }
    setPaso(prev => prev + 1); // Avanza al siguiente paso
  };

  const handleAtras = () => {
    if (paso > 1) {
      setPaso(prev => prev - 1); // Retrocede un paso
    }
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setCanchaSeleccionada(null);
    setFechaSeleccionada(null);
    setHorarioSeleccionado(null);
    setPaso(1); // Reiniciar el modal al cerrarlo
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mostrar reservas futuras */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Mis Reservas Futuras</h2>
            {misReservas.length > 0 ? (
              misReservas.map((reserva, index) => (
                <div key={index} className="p-4 border rounded-lg mb-4 bg-gray-50">
                  <p><strong>Cancha:</strong> {reserva.cancha}</p>
                  <p><strong>Fecha:</strong> {reserva.fecha}</p>
                  <p><strong>Horario:</strong> {reserva.horario}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No tienes reservas futuras.</p>
            )}
          </div>

          {/* Selección de turno */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Seleccionar Turno</h2>
            <button
              onClick={manejarAgendar}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg w-full"
            >
              Agendar
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <Modal
          paso={paso}
          handleCerrarModal={handleCerrarModal}
          handleSiguiente={handleSiguiente}
          handleAtras={handleAtras}
        >
          {/* Aquí puedes pasar los contenidos de cada paso */}
          {paso === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Selecciona una cancha</h3>
              <select
                className="mt-3 form-select w-full p-2 border rounded-lg"
                onChange={(e) => manejarSeleccion(e.target.value)}
                value={canchaSeleccionada || ""}
              >
                <option value="" disabled>Selecciona una opción</option>
                {canchas.map((cancha, index) => (
                  <option key={index} value={cancha}>{cancha}</option>
                ))}
              </select>
            </div>
          )}

          {paso === 2 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Selecciona una fecha</h3>
              <Calendar
                onChange={manejarFechaSeleccionada}
                value={fechaSeleccionada}
              />
            </div>
          )}

          {paso === 3 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Selecciona un horario y duración</h3>
              <div className="mt-2">
                <label className="block mb-2">Duración (en horas):</label>
                <select
                  className="form-select w-full p-2 border rounded-lg"
                  value={duracion}
                  onChange={(e) => setDuracion(Number(e.target.value))}
                >
                  <option value={1}>1 Hora</option>
                  <option value={2}>2 Horas</option>
                </select>
              </div>

              {horariosDisponibles.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {horariosDisponibles.map((horario, index) => (
                    <button
                      key={index}
                      onClick={() => setHorarioSeleccionado(horario)}
                      className={`p-2 rounded-lg text-center ${
                        horarioSeleccionado === horario ? 'bg-green-500 text-white' : 'bg-gray-300'
                      }`}
                    >
                      {horario}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No hay horarios disponibles</p>
              )}
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg w-full mt-4"
                onClick={reservarTurno}
              >
                Confirmar Reserva
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default SeleccionarTurno;