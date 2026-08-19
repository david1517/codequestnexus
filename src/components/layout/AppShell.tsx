import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050816',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <Sidebar />
      <main
        style={{
          marginLeft: '250px',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
