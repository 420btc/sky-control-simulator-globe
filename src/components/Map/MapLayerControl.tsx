
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapLayerControlProps {
  position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  mapType: 'standard' | 'satellite';
  onChangeMapType: (type: 'standard' | 'satellite') => void;
}

export const MapLayerControl = ({ position, mapType, onChangeMapType }: MapLayerControlProps) => {
  const map = useMap();
  
  useEffect(() => {
    // Create custom control element
    const controlContainer = document.createElement('div');
    controlContainer.className = `leaflet-bar leaflet-control`;
    
    // Create control button
    const button = document.createElement('a');
    button.href = '#';
    button.title = mapType === 'standard' ? 'Cambiar a vista satélite' : 'Cambiar a vista estándar';
    button.role = 'button';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '30px';
    button.style.height = '30px';
    button.style.backgroundColor = '#fff';
    button.style.color = '#000';
    button.innerHTML = mapType === 'standard' 
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 10l5 5-5 5"></path><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>' 
      : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16v-2"></path><path d="M3.3 7l8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>';
    
    // Add event listener
    button.addEventListener('click', (e) => {
      e.preventDefault();
      onChangeMapType(mapType === 'standard' ? 'satellite' : 'standard');
    });
    
    // Append button to control container
    controlContainer.appendChild(button);
    
    // Add custom control to map
    const customControl = L.Control.extend({
      options: {
        position: position
      },
      onAdd: function() {
        return controlContainer;
      }
    });
    
    map.addControl(new customControl());
    
    return () => {
      // Clean up event listener
      button.removeEventListener('click', () => {});
    };
  }, [map, mapType, onChangeMapType, position]);
  
  return null;
};
