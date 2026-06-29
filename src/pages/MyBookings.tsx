import { useState, useEffect } from 'react';
import api from '../api';
import { getErrorMessage, formatDate } from '../utils';
import type { BookingDetail, Flight } from '../types';

interface BookingRow extends BookingDetail {
  airlineName: string;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBookings() {
      const ids: number[] = JSON.parse(localStorage.getItem('bookingIds') ?? '[]');
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const details = await Promise.all(
          ids.map((id) => api.get<BookingDetail>(`/flights/book/${id}`).then((r) => r.data))
        );

        const rows = await Promise.all(
          details.map(async (b) => {
            const flightRes = await api.get<Flight>(`/flights/${b.flightId}`);
            return { ...b, airlineName: flightRes.data.airlineName };
          })
        );

        setBookings(rows);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  if (loading) return <div className="page"><p className="text-muted">Cargando reservas...</p></div>;

  return (
    <div className="page">
      <h2 className="page-title">Mis reservas</h2>

      {error && <p className="alert alert-error">{error}</p>}

      {!error && bookings.length === 0 && (
        <p className="empty-state">No tienes reservas aún.</p>
      )}

      {bookings.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vuelo</th>
                <th>Aerolínea</th>
                <th>Salida</th>
                <th>Fecha reserva</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.flightNumber}</td>
                  <td>{b.airlineName}</td>
                  <td>{formatDate(b.estDepartureTime)}</td>
                  <td>{formatDate(b.bookingDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
