'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { socket } from '../lib/socket';

export default function NodeTable({ darkMode }) {
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
    <div className={`overflow-x-auto rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <table className="w-full">
        <thead>
          <tr className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Node
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Status
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {Object.values(nodes).map(n => (
            <tr key={n.id} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
              <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {n.name}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap`}>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  n.status === 'online'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {n.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}