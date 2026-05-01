'use client';

import { useState } from 'react';
import { Home, Users, Settings, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar({ darkMode, setDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Students', href: '/students' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } shadow-lg`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        } shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard Sekolah
          </h1>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-6 py-3 transition-colors ${
                darkMode
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
              darkMode
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {darkMode ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <Link
            href="/login"
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors mt-2 ${
              darkMode
                ? 'text-red-400 hover:bg-gray-800'
                : 'text-red-600 hover:bg-gray-100'
            }`}
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}
    </>
  );
}
