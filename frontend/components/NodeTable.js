'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { socket } from '../lib/socket';

export default function NodeTable() {
  const [nodes, setNodes] = useState({});

  useEffect(() => {
    load();

    socket.on('node:heartbeat', (d) => {
      setNodes(prev => ({
        ...prev,
        [d.node_id]: {
          ...prev[d.node_id],
          status: 'online'
        }
      }));
    });

    return () => socket.off();
  }, []);

  const load = async () => {
    const res = await api.get('/monitoring/summary');
    const obj = {};
    res.data.forEach(n => obj[n.id] = n);
    setNodes(obj);
  };

  return (
    <table border="1">
      <thead>
        <tr>
          <th>Node</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {Object.values(nodes).map(n => (
          <tr key={n.id}>
            <td>{n.name}</td>
            <td>{n.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}