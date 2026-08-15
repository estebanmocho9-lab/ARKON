
// ============================================
// IMPULSO IA — HELPERS GENERALES
// ============================================

export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatearPorcentaje(valor: number): string {
  return `${(valor * 100).toFixed(1)}%`;
}

export function formatearNivel(valor: number): string {
  if (valor >= 75) return 'MUY ALTO';
  if (valor >= 50) return 'ALTO';
  if (valor >= 25) return 'MODERADO';
  return 'BAJO';
}

export function eliminarDuplicados<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function agruparPor<T>(
  array: T[],
  clave: keyof T
): Record<string, T[]> {
  return array.reduce((grupos, item) => {
    const valor = String(item[clave]);
    if (!grupos[valor]) grupos[valor] = [];
    grupos[valor].push(item);
    return grupos;
  }, {} as Record<string, T[]>);
}

export function ordenarPor<T>(
  array: T[],
  clave: keyof T,
  direccion: 'asc' | 'desc' = 'desc'
): T[] {
  return [...array].sort((a, b) => {
    if (a[clave] < b[clave]) return direccion === 'asc' ? -1 : 1;
    if (a[clave] > b[clave]) return direccion === 'asc' ? 1 : -1;
    return 0;
  });
}

