import { useState, useRef, useEffect, useCallback } from 'react';
import { apiFetch, clearAuth, getStoredAuth, storeAuth } from '../api';

const WARN_MS = 28 * 60 * 1000;
const IDLE_MS = 30 * 60 * 1000;
const HEARTBEAT_MS = 10 * 60 * 1000;
const CHANNEL = 'fudcy-auth';

export default function SessionGuard({
  currentUser,
  onSessionRenewed,
  onLogout,
  onExpired,
}) {
  const [warning, setWarning] = useState(false);

  const lastActivityRef = useRef(0);
  const lastHeartbeatRef = useRef(0);
  const refreshingRef = useRef(false);
  const expiredRef = useRef(false);
  const callbacksRef = useRef({ onSessionRenewed, onLogout, onExpired });

  useEffect(() => {
    callbacksRef.current = {
      onSessionRenewed,
      onLogout,
      onExpired,
    };
  }, [onSessionRenewed, onLogout, onExpired]);

  const refreshSession = useCallback(async (notifyChannel = true) => {
    if (refreshingRef.current || expiredRef.current) return false;
    refreshingRef.current = true;

    try {
      const response = await apiFetch('/api/auth/refresh', {
        method: 'POST',
      });

      if (!response.ok) {
        return false;
      }

      const payload = await response.json();
      const token = payload.token;
      const user = payload.user || payload.customer;

      if (!token || !user) {
        return false;
      }

      const freshAuth = {
        token,
        expiresAt: payload.expiresAt,
        user,
      };

      storeAuth(freshAuth);
      callbacksRef.current.onSessionRenewed?.(user);

      if (notifyChannel && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(CHANNEL);
        channel.postMessage({ type: 'renewed', auth: freshAuth });
        channel.close();
      }

      return true;
    } catch {
      return false;
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  const continueSession = useCallback(async () => {
    const success = await refreshSession(true);
    if (expiredRef.current) return;

    if (success) {
      lastActivityRef.current = Date.now();
      setWarning(false);
    }
  }, [refreshSession]);

  useEffect(() => {
    if (!currentUser) {
      setWarning(false);
      expiredRef.current = false;
      refreshingRef.current = false;
      return undefined;
    }

    let mounted = true;
    const channel = 'BroadcastChannel' in window
      ? new BroadcastChannel(CHANNEL)
      : null;

    lastActivityRef.current = Date.now();
    lastHeartbeatRef.current = Date.now();
    expiredRef.current = false;

    function broadcastActivity(timestamp) {
      try {
        channel?.postMessage({ type: 'activity', at: timestamp });
      } catch {
        // Channel may be closed
      }
    }

    function handleActivity() {
      if (!mounted || expiredRef.current) return;

      const now = Date.now();
      lastActivityRef.current = now;
      setWarning(false);

      if (now - lastHeartbeatRef.current > HEARTBEAT_MS) {
        lastHeartbeatRef.current = now;
        broadcastActivity(now);
        void refreshSession(false);
      }
    }

    function expireSession(message) {
      if (expiredRef.current) return;
      expiredRef.current = true;

      clearAuth();
      setWarning(false);

      try {
        channel?.postMessage({ type: 'expired' });
      } catch {
        // Channel may be closed
      }

      callbacksRef.current.onExpired?.(message);
    }

    function handleUnauthorized() {
      if (!mounted || expiredRef.current) return;
      const stored = getStoredAuth();
      if (!stored?.token) return;

      expireSession(
        'Your session is no longer valid. Please sign in again.'
      );
    }

    function tick() {
      if (!mounted || expiredRef.current) return;

      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor >= IDLE_MS) {
        expireSession(
          'Your session expired due to inactivity. Please sign in again.'
        );
        return;
      }

      setWarning(idleFor >= WARN_MS);
    }

    function handleChannelMessage(event) {
      const data = event.data;

      if (data?.type === 'activity') {
        const remoteAt = Number(data.at);
        if (Number.isFinite(remoteAt)) {
          lastActivityRef.current = Math.max(
            lastActivityRef.current,
            remoteAt
          );
        } else {
          lastActivityRef.current = Date.now();
        }
        setWarning(false);
        return;
      }

      if (data?.type === 'renewed' && data.auth) {
        storeAuth(data.auth);
        callbacksRef.current.onSessionRenewed?.(data.auth.user);
        return;
      }

      if (data?.type === 'logout' || data?.type === 'expired') {
        if (!expiredRef.current) {
          expiredRef.current = true;
          clearAuth();
          setWarning(false);
          callbacksRef.current.onLogout?.();
        }
      }
    }

    const activityEvents = [
      'click',
      'keydown',
      'scroll',
      'mousemove',
      'touchstart',
    ];

    function handleSessionRenewed(e) {
      if (!mounted || expiredRef.current) return;
      if (e.detail) {
        callbacksRef.current.onSessionRenewed?.(e.detail);
      }
    }

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    window.addEventListener('fudcy:unauthorized', handleUnauthorized);
    window.addEventListener('fudcy:session-renewed', handleSessionRenewed);
    channel?.addEventListener('message', handleChannelMessage);

    const intervalId = window.setInterval(tick, 1000);

    return () => {
      mounted = false;
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.removeEventListener('fudcy:unauthorized', handleUnauthorized);
      window.removeEventListener('fudcy:session-renewed', handleSessionRenewed);
      channel?.removeEventListener('message', handleChannelMessage);
      window.clearInterval(intervalId);
      channel?.close();
    };
  }, [currentUser, refreshSession]);

  if (!currentUser || !warning) return null;

  return (
    <div
      className="session-warning-overlay"
      role="alertdialog"
      aria-label="Session expiring"
    >
      <div className="session-warning-card">
        <h3 className="font-serif">Still there?</h3>
        <p>
          Your session will expire in about 2 minutes due to inactivity.
          Continue to stay signed in.
        </p>
        <div className="session-warning-actions">
          <button
            type="button"
            className="session-continue-btn"
            onClick={continueSession}
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
}
