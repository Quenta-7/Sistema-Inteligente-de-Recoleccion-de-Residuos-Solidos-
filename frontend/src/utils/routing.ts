export interface LatLngNode {
  lat: number;
  lng: number;
  nombre?: string;
}

/**
 * Realiza el ruteo por calles usando la API pública OSRM (Open Source Routing Machine).
 * Transforma un conjunto de paradas/puntos de acopio en una ruta suave que sigue las calles reales.
 */
export const fetchStreetRoute = async (waypoints: LatLngNode[]): Promise<[number, number][]> => {
  if (!waypoints || waypoints.length === 0) return [];
  if (waypoints.length === 1) return [[waypoints[0].lat, waypoints[0].lng]];

  try {
    // OSRM requiere formato: lng,lat;lng,lat;...
    const coordsString = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0 && data.routes[0].geometry?.coordinates) {
        // GeoJSON devuelve [lng, lat], Leaflet utiliza [lat, lng]
        return data.routes[0].geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
      }
    }
  } catch (error) {
    console.warn('No se pudo obtener ruta OSRM por calles, usando paradas directas:', error);
  }

  // Fallback: unir directamente los puntos de las paradas
  return waypoints.map(w => [w.lat, w.lng] as [number, number]);
};
