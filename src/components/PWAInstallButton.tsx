import { useEffect, useState } from 'react';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    const handleAppInstalled = () => {
      setShow(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
        background: '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '2rem',
        padding: '1rem 2rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseOver={e => (e.currentTarget.style.background = '#16a34a')}
      onMouseOut={e => (e.currentTarget.style.background = '#22c55e')}
    >
      📲 Install App
    </button>
  );
} 