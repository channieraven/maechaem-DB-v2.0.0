import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import type { TreeWithDetails } from '../../hooks/useTrees';
import 'leaflet/dist/leaflet.css';

interface TreeMapProps {
  trees: TreeWithDetails[];
  plotCode?: string;
}

// Default center for Mae Chaem, Chiang Mai
const MAE_CHAEM_CENTER: [number, number] = [18.17, 98.17];

const TreeMap: React.FC<TreeMapProps> = ({ trees, plotCode }) => {
  const navigate = useNavigate();

  const treesWithCoords = trees.filter(
    (t) => t.lat !== null && t.lat !== undefined && t.lng !== null && t.lng !== undefined
      && !isNaN(Number(t.lat)) && !isNaN(Number(t.lng))
  );

  const center: [number, number] =
    treesWithCoords.length > 0
      ? [
          treesWithCoords.reduce((s, t) => s + Number(t.lat), 0) / treesWithCoords.length,
          treesWithCoords.reduce((s, t) => s + Number(t.lng), 0) / treesWithCoords.length,
        ]
      : MAE_CHAEM_CENTER;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: 400 }}>
      <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {treesWithCoords.map((tree) => (
          <CircleMarker
            key={tree.id}
            center={[Number(tree.lat), Number(tree.lng)]}
            radius={6}
            pathOptions={{
              color: `#${tree.species.hex_color}`,
              fillColor: `#${tree.species.hex_color}`,
              fillOpacity: 0.8,
              weight: 1.5,
            }}
            eventHandlers={{
              click: () => navigate(`/trees/${tree.tree_code}`),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{tree.tree_code}</p>
                <p className="text-gray-600">{tree.species.name_th}</p>
                {tree.species.name_sci && (
                  <p className="text-gray-400 italic text-xs">{tree.species.name_sci}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  แถว {tree.row_main}{tree.row_sub ? `-${tree.row_sub}` : ''}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {treesWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-gray-500 pointer-events-none">
          ยังไม่มีข้อมูลพิกัด
        </div>
      )}
    </div>
  );
};

export default TreeMap;
