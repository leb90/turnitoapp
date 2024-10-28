// src/components/SelectTurn.tsx
import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

const SelectTurn: React.FC = () => {
  const { user } = useAuth();
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [step, setStep] = useState(1);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  const courts = ["Fútbol 7", "Fútbol 11", "Tenis 1", "Tenis 2", "Paddle"];
  const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user?.uid) return;

      try {
        const q = query(collection(db, 'bookings'), where('uid', '==', user.uid));
        const snapshot = await getDocs(q);
        const bookings = snapshot.docs.map(doc => doc.data());
        const futureBookings = bookings.filter((booking) => {
          const bookingDate = new Date(`${booking.date}T${booking.time}`);
          return bookingDate > new Date();
        });
        setMyBookings(futureBookings);
      } catch (error) {
        console.error("Error al obtener reservas: ", error);
      }
    };

    fetchUserBookings();
  }, [user]);

  const handleCourtSelection = (court: string) => {
    setSelectedCourt(court);
    setStep(2);
  };

  const handleSchedule = () => {
    setShowModal(true);
    setStep(1);
  };

  const handleDateSelection: CalendarProps['onChange'] = async (value) => {
    if (!(value instanceof Date) || !selectedCourt) return;
    setSelectedDate(value);

    try {
      const dateStr = value.toISOString().split('T')[0];
      const q = query(collection(db, 'bookings'), where('date', '==', dateStr), where('court', '==', selectedCourt));
      const snapshot = await getDocs(q);
      const occupiedTimes = snapshot.docs.flatMap((doc) => {
        const booking = doc.data();
        const timeIndex = times.indexOf(booking.time);
        return booking.duration === 2 && timeIndex + 1 < times.length ? [booking.time, times[timeIndex + 1]] : [booking.time];
      });
      setAvailableTimes(times.filter(time => !occupiedTimes.includes(time)));
      setStep(3);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
    }
  };

  const bookTurn = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await addDoc(collection(db, 'bookings'), { uid: user?.uid, court: selectedCourt, date: dateStr, time: selectedTime, duration });
      setMyBookings(prevBookings => [...prevBookings, { uid: user?.uid, court: selectedCourt, date: dateStr, time: selectedTime, duration }]);
      setShowModal(false);
    } catch (error) {
      console.error("Error al reservar turno: ", error);
      alert("Ocurrió un error al reservar. Verifica tus permisos.");
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedCourt) alert("Por favor selecciona una cancha.");
    else if (step === 2 && !selectedDate) alert("Por favor selecciona una fecha.");
    else setStep(prev => prev + 1);
  };

  const handleBack = () => step > 1 && setStep(prev => prev - 1);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourt(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setStep(1);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Mis Reservas Futuras</h2>
            {myBookings.length > 0 ? (
              myBookings.map((booking, index) => (
                <div key={index} className="p-4 border rounded-lg mb-4 bg-gray-50">
                  <p><strong>Cancha:</strong> {booking.court}</p>
                  <p><strong>Fecha:</strong> {booking.date}</p>
                  <p><strong>Horario:</strong> {booking.time}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No tienes reservas futuras.</p>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Seleccionar Turno</h2>
            <button onClick={handleSchedule} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg w-full">Agendar</button>
          </div>
        </div>
      </div>
      {showModal && (
        <Modal step={step} handleCloseModal={handleCloseModal} handleNext={handleNext} handleBack={handleBack}>
          {step === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Selecciona una Cancha</h3>
              <select className="mt-3 form-select w-full p-2 border rounded-lg" onChange={(e) => handleCourtSelection(e.target.value)} value={selectedCourt || ""}>
                <option value="" disabled>Selecciona una opción</option>
                {courts.map((court, index) => <option key={index} value={court}>{court}</option>)}
              </select>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Selecciona una Fecha</h3>
              <Calendar onChange={handleDateSelection} value={selectedDate} />
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Selecciona un Horario y Duración</h3>
              <div className="mt-2">
                <label className="block mb-2">Duración (en horas):</label>
                <select className="form-select w-full p-2 border rounded-lg" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  <option value={1}>1 Hora</option>
                  <option value={2}>2 Horas</option>
                </select>
              </div>
              {availableTimes.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableTimes.map((time, index) => (
                    <button key={index} onClick={() => setSelectedTime(time)} className={`p-2 rounded-lg text-center ${selectedTime === time ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No hay horarios disponibles</p>
              )}
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg w-full mt-4" onClick={bookTurn}>Confirmar Reserva</button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default SelectTurn;