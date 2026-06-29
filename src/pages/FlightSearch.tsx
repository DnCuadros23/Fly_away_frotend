import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, formatDate } from '../utils';
import type { Flight, FlightSearchParams, BookingDetail } from '../types';

export default function FlightSearch() {
  const { token } = useAuth();

  const [params, setParams] = useState<FlightSearchParams>({
    flightNumber: '',
    airlineName: '',
    estDepartureTimeFrom: '',
    estDepartureTimeTo: '',
  });

  const [flights, setFlights] = useState<Flight[]>([]);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [bookingStatus, setBookingStatus] = useState<Record<number, string>>({});
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setSearchError('');
    setLoadingSearch(true);
    try {
      const query: Record<string, string> = {};
      if (params.flightNumber) query.flightNumber = params.flightNumber;
      if (params.airlineName) query.airlineName = params.airlineName;
      if (params.estDepartureTimeFrom)
        query.estDepartureTimeFrom = new Date(params.estDepartureTimeFrom).toISOString();
      if (params.estDepartureTimeTo)
        query.estDepartureTimeTo = new Date(params.estDepartureTimeTo).toISOString();

      const res = await api.get<{ items: Flight[] }>('/flights/search', { params: query });
      setFlights(res.data.items);
      setSearched(true);
    } catch (err) {
      setSearchError(getErrorMessage(err));
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleBook(flightId: number) {
    setBookingStatus((prev) => ({ ...prev, [flightId]: 'loading' }));
    try {
      const res = await api.post<{ id: number }>('/flights/book', { flightId });
      const bookingId = res.data.id;

      const ids: number[] = JSON.parse(localStorage.getItem('bookingIds') ?? '[]');
      ids.push(bookingId);
      localStorage.setItem('bookingIds', JSON.stringify(ids));

      setBookingStatus((prev) => ({ ...prev, [flightId]: `ok:${bookingId}` }));
    } catch (err) {
      setBookingStatus((prev) => ({ ...prev, [flightId]: `error:${getErrorMessage(err)}` }));
    }
  }

  async function handleViewDetail(bookingId: number) {
    try {
      const res = await api.get<BookingDetail>(`/flights/book/${bookingId}`);
      setBookingDetail(res.data);
      setShowDetail(true);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  function renderBookingCell(flight: Flight) {
    if (!token) {
      return <span className="text-muted">Inicia sesión para reservar</span>;
    }

    const status = bookingStatus[flight.id];

    if (!status) {
      return (
        <button className="btn btn-sm btn-primary" onClick={() => handleBook(flight.id)}>
          Reservar
        </button>
      );
    }

    if (status === 'loading') return <span className="text-muted">Reservando...</span>;

    if (status.startsWith('ok:')) {
      const bookingId = Number(status.split(':')[1]);
      return (
        <div className="booking-ok">
          <span>✓ Reserva #{bookingId}</span>
          <button className="btn btn-sm btn-secondary" onClick={() => handleViewDetail(bookingId)}>
            Ver detalle
          </button>
        </div>
      );
    }

    if (status.startsWith('error:')) {
      const msg = status.slice(6);
      return (
        <div className="booking-error">
          <span>{msg}</span>
          <button className="btn btn-sm btn-outline" onClick={() => handleBook(flight.id)}>
            Reintentar
          </button>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="page">
      <h2 className="page-title">Buscar vuelos</h2>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-row">
          <label className="label">
            Número de vuelo
            <input
              className="input"
              type="text"
              value={params.flightNumber}
              onChange={(e) => setParams({ ...params, flightNumber: e.target.value })}
              placeholder="LA101"
            />
          </label>

          <label className="label">
            Aerolínea
            <input
              className="input"
              type="text"
              value={params.airlineName}
              onChange={(e) => setParams({ ...params, airlineName: e.target.value })}
              placeholder="LATAM Airlines"
            />
          </label>
        </div>

        <div className="search-row">
          <label className="label">
            Salida desde
            <input
              className="input"
              type="datetime-local"
              value={params.estDepartureTimeFrom}
              onChange={(e) => setParams({ ...params, estDepartureTimeFrom: e.target.value })}
            />
          </label>

          <label className="label">
            Salida hasta
            <input
              className="input"
              type="datetime-local"
              value={params.estDepartureTimeTo}
              onChange={(e) => setParams({ ...params, estDepartureTimeTo: e.target.value })}
            />
          </label>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loadingSearch}>
          {loadingSearch ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {searchError && <p className="alert alert-error">{searchError}</p>}

      {searched && flights.length === 0 && !searchError && (
        <p className="empty-state">No se encontraron vuelos con esos filtros.</p>
      )}

      {flights.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Vuelo</th>
                <th>Aerolínea</th>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Asientos</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight) => (
                <tr key={flight.id}>
                  <td>{flight.flightNumber}</td>
                  <td>{flight.airlineName}</td>
                  <td>{formatDate(flight.estDepartureTime)}</td>
                  <td>{formatDate(flight.estArrivalTime)}</td>
                  <td>{flight.availableSeats}</td>
                  <td>{renderBookingCell(flight)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetail && bookingDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Detalle de reserva #{bookingDetail.id}</h3>
            <dl className="detail-list">
              <dt>Pasajero</dt>
              <dd>{bookingDetail.customerFirstName} {bookingDetail.customerLastName}</dd>
              <dt>Vuelo</dt>
              <dd>{bookingDetail.flightNumber}</dd>
              <dt>Salida</dt>
              <dd>{formatDate(bookingDetail.estDepartureTime)}</dd>
              <dt>Llegada</dt>
              <dd>{formatDate(bookingDetail.estArrivalTime)}</dd>
              <dt>Fecha de reserva</dt>
              <dd>{formatDate(bookingDetail.bookingDate)}</dd>
            </dl>
            <button className="btn btn-secondary" onClick={() => setShowDetail(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
