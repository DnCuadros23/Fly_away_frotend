import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
  const ax = error as AxiosError<{ detail?: string }>;
  const data = ax?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  return 'Ocurrió un error inesperado';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
