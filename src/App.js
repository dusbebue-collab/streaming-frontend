import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import WebTorrent from 'webtorrent';

const API_URL = 'https://SEU_NOME_RENDER.onrender.com'; // TROQUE PELO SEU ENDEREÇO DO RENDER

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const clientRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/search/${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openPlayer = (item) => setSelected(item);
  const closePlayer = () => {
    if (clientRef.current) clientRef.current.destroy();
    setSelected(null);
  };

  useEffect(() => {
    if (selected && videoRef.current) {
      clientRef.current = new WebTorrent();
      clientRef.current.add(selected.magnetLink, (torrent) => {
        const videoFile = torrent.files.find(f => f.name.match(/\.(mkv|mp4|avi|webm)$/i));
        if (videoFile) {
          videoFile.createStream().pipe(videoRef.current);
        }
      });
      return () => {
        if (clientRef.current) clientRef.current.destroy();
      };
    }
  }, [selected]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: 'white', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>🎬 Streaming Universal</h1>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque um filme ou série..."
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white' }}
        />
        <button type="submit" style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {results.map((item, index) => (
          <div key={index} onClick={() => openPlayer(item)} style={{ backgroundColor: '#1f1f1f', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <img src={item.poster} alt={item.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
            <div style={{ padding: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h3>
              <p style={{ margin: '5px 0 0', color: '#aaa', fontSize: '0.8rem' }}>{item.year} • {item.quality}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ margin: 0 }}>{selected.title} ({selected.year})</h2>
              <button onClick={closePlayer} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>&times;</button>
            </div>
            <video ref={videoRef} controls style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'black', borderRadius: '8px' }} />
            <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '10px' }}>Baixando via WebTorrent... (Pode levar alguns segundos)</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;