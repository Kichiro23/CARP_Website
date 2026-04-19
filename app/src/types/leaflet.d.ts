declare module 'leaflet' {
  const L: any;
  export = L;
}

declare module 'react-leaflet' {
  export const MapContainer: any;
  export const TileLayer: any;
  export const Marker: any;
  export const Popup: any;
  export const useMap: any;
}
