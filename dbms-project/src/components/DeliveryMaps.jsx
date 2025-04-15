// src/components/DeliveryMap.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L from "leaflet";

// Custom Marker Theme
const customIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/ios-filled/50/000000/marker.png', // Custom marker icon URL (change as needed)
    iconSize: [30, 30], // Size of the marker
    iconAnchor: [15, 30], // Position where the marker will be anchored (bottom-center)
    popupAnchor: [0, -30], // Position of the popup
});

const LocationMarker = ({ setLocation }) => {
    const [position, setPosition] = useState(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setLocation(e.latlng); // Send back to parent
        }
    });

    return position === null ? null : (
        <Marker position={position} icon={customIcon}></Marker>
    );
};

const DeliveryMap = ({ onLocationSelect }) => {
    return (
        <div className="w-full h-[400px]">
            <MapContainer
                center={[28.6139, 77.2090]} // Default center (Delhi)
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker setLocation={onLocationSelect} />
            </MapContainer>
        </div>
    );
};

export default DeliveryMap;
