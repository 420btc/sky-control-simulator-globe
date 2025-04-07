
import React from 'react';
import { CircleMarker as LeafletCircleMarker, Popup } from 'react-leaflet';

interface CircleMarkerProps {
  center: [number, number];
  radius: number;
  pathOptions: {
    fillColor: string;
    fillOpacity: number;
    color: string;
    weight: number;
  };
  children?: React.ReactNode;
}

const CircleMarker = ({ center, radius, pathOptions, children }: CircleMarkerProps) => {
  return (
    <LeafletCircleMarker
      center={center}
      radius={radius}
      pathOptions={pathOptions}
    >
      {children}
    </LeafletCircleMarker>
  );
};

export default CircleMarker;
