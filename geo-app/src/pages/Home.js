import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [geo, setGeo] = useState(null);
  const [ip, setIp] = useState("");
  const [history, setHistory] = useState([]);

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
    fetchGeo(); // load current user's geo
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const removeHistory = (index) => {
    setHistory(history.filter((_, i) => i !== index));
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
      <ul className="list-disc ml-5">
        {history.map((h, i) => (
          <li key={i} className="cursor-pointer text-blue-600 flex justify-between items-center">
            <span onClick={() => fetchGeo(h.ip)}>{h.ip} - {h.city}, {h.country}</span>
            <button onClick={() => removeHistory(i)} className="bg-red-500 text-white px-2 py-1 rounded ml-2">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
