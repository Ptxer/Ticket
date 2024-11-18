import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const IdleTimer = () => {
/*   useEffect(() => {
    let timeoutId;

    const handleActivity = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut({ redirect: true, callbackUrl: '/' }); // Redirect to home page after sign out
      }, IDLE_TIMEOUT);
    };

    // Set up event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Initial timeout setup
    timeoutId = setTimeout(() => {
      signOut({ redirect: true, callbackUrl: '/' });
    }, IDLE_TIMEOUT);

    // Clean up event listeners and timeout on component unmount
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  return null; */
};

export default IdleTimer;
