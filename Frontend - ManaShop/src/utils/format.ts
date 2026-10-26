export const formatearPrecio = (valor: number): string => {
  return valor.toLocaleString('es-CL', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};