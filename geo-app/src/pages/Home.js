import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function Home() {
  const [geo, setGeo] = useState(null);
  const [ip, setIp] = useState("");
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showDelete, setShowDelete] = useState(false);

  const ipinfoUrl = process.env.REACT_APP_IPINFO_URL;

  const fetchGeo = async (targetIp = "") => {
    try {
      const url = targetIp ? `${ipinfoUrl}/${targetIp}/geo` : `${ipinfoUrl}/geo`;
      const res = await axios.get(url);
      setGeo(res.data);
      if (targetIp) {
        const newData = { id: Date.now(), ...res.data };
        setHistory((prev) => [...prev, newData]);
        console.log(newData);
      }
    } catch {
      alert("Invalid IP address");
    }
  };

  useEffect(() => {
    fetchGeo(); 
  }, []);
  
  useEffect(() => {
    setShowDelete(selected.length > 0);
  }, [selected]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleCheckboxChange = (e, id) => {
    if (e.target.checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter(item => item !== id));
    }
  };

  const deleteSelected = () => {
    setHistory(history.filter(item => !selected.includes(item.id)));
    setSelected([]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Home</h2>
        <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">
          Logout
        </button>
      </div>

      {geo && (
        <div className="mt-4 border p-4 rounded bg-gray-50">
          <p><b>IP:</b> {geo.ip}</p>
          <p><b>City:</b> {geo.city}</p>
          <p><b>Region:</b> {geo.region}</p>
          <p><b>Country:</b> {geo.country}</p>
          <p><b>Location:</b> {geo.loc}</p>
          { console.log(typeof geo.loc) }
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="border p-2 flex-1"
          placeholder="Enter IP address"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />
        <button onClick={() => fetchGeo(ip)} className="bg-blue-500 text-white px-3 py-1 rounded">
          Search
        </button>
        <button onClick={() => { setIp(""); fetchGeo(); }} className="bg-gray-500 text-white px-3 py-1 rounded">
          Clear
        </button>
      </div>

      {geo && geo.loc && (
        <div className="mt-4">
          <MapContainer center={geo.loc.split(',').map(Number)} zoom={13} style={{ height: '400px', width: '100%' }}>
            <ChangeView center={geo.loc.split(',').map(Number)} zoom={13} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={geo.loc.split(',').map(Number)}>
              <Popup>
                {geo.ip}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      <h3 className="mt-6 font-semibold">History</h3>
      { (showDelete) && (
        <div className="flex justify-end">
          <button onClick={deleteSelected} className="bg-red-500 text-white px-3 py-1 rounded mt-2">
            Delete Selected
          </button>
        </div>
      )}
      <ul className="ml-5">
        {history.map((h, i) => (
          <li key={i}>
            <input type="checkbox" checked={selected.includes(h.id)} onChange={(e) => handleCheckboxChange(e, h.id)} />
            <span onClick={() => fetchGeo(h.ip)} className="ml-2 cursor-pointer text-blue-600">{h.ip} - {h.city}, {h.country}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
