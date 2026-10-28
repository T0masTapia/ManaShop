export const formatearPrecio = (valor: number | string): string => {
  const num = Number(valor) || 0;

  const precioNormalizado = num < 1000 && num > 0 ? num * 1000 : num;

  return Math.round(precioNormalizado).toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};