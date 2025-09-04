import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [geo, setGeo] = useState(null);
  const [ip, setIp] = useState("");
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState([]);

  const ipinfoUrl = process.env.REACT_APP_IPINFO_URL;

  const fetchGeo = async (targetIp = "") => {
    try {
      const url = targetIp ? `${ipinfoUrl}/${targetIp}/geo` : `${ipinfoUrl}/geo`;
      const res = await axios.get(url);
      setGeo(res.data);
      if (targetIp) setHistory((prev) => [...prev, res.data]);
    } catch {
      alert("Invalid IP address");
    }
  };

  useEffect(() => {
    fetchGeo(); 
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleCheckboxChange = (e, ip) => {
    if (e.target.checked) {
      setSelected([...selected, ip]);
    } else {
      setSelected(selected.filter(item => item !== ip));
    }
  };

  const deleteSelected = () => {
    setHistory(history.filter(item => !selected.includes(item.ip)));
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

      <h3 className="mt-6 font-semibold">History</h3>
      <div className="flex justify-end">
        <button onClick={deleteSelected} className="bg-red-500 text-white px-3 py-1 rounded mt-2">
          Delete Selected
        </button>
      </div>
      <ul className="ml-5">
        {history.map((h, i) => (
          <li key={i}>
            <input type="checkbox" onChange={(e) => handleCheckboxChange(e, h.ip)} />
            <span onClick={() => fetchGeo(h.ip)} className="ml-2 cursor-pointer text-blue-600">{h.ip} - {h.city}, {h.country}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
