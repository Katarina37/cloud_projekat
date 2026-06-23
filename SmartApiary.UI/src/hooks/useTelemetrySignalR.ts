// Zajednicka SignalR veza za stranice koje prikazuju telemetriju.

import { HubConnectionBuilder, HubConnectionState, type HubConnection } from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';
import type { TelemetryUpdateDto } from '../api/apiClient';
import { getAuthToken } from '../auth/authStorage';
import { CONFIG } from '../config/config';

const telemetryUpdateEvent = 'ReceiveTelemetryUpdate';
const reconnectDelayMilliseconds = 5000;

type TelemetryUpdateHandler = (update: TelemetryUpdateDto) => void;

export default function useTelemetrySignalR(
  apiaryId: string,
  onTelemetryUpdate: TelemetryUpdateHandler,
) {
  const updateHandler = useRef(onTelemetryUpdate);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    updateHandler.current = onTelemetryUpdate;
  }, [onTelemetryUpdate]);

  useEffect(() => {
    const nextConnection = new HubConnectionBuilder()
      .withUrl(CONFIG.HUB_URL, {
        accessTokenFactory: () => getAuthToken() ?? '',
      })
      .withAutomaticReconnect()
      .build();
    let isActive = true;
    let reconnectTimeoutId: number | undefined;

    nextConnection.on(telemetryUpdateEvent, (update: TelemetryUpdateDto) => {
      updateHandler.current(update);
    });

    nextConnection.onreconnecting(() => {
      if (isActive) {
        setConnected(false);
      }
    });

    nextConnection.onreconnected(() => {
      if (isActive) {
        setConnected(true);
      }
    });

    nextConnection.onclose(() => {
      if (isActive) {
        setConnected(false);
      }
    });

    async function startConnection() {
      if (!isActive || nextConnection.state !== HubConnectionState.Disconnected) {
        return;
      }

      try {
        await nextConnection.start();

        if (isActive) {
          setConnection(nextConnection);
          setConnected(true);
        }
      } catch (connectionError) {
        console.error('SignalR connection failed.', connectionError);

        if (isActive) {
          reconnectTimeoutId = window.setTimeout(
            startConnection,
            reconnectDelayMilliseconds,
          );
        }
      }
    }

    startConnection();

    return () => {
      isActive = false;

      if (reconnectTimeoutId !== undefined) {
        window.clearTimeout(reconnectTimeoutId);
      }

      nextConnection.off(telemetryUpdateEvent);
      nextConnection.stop();
    };
  }, []);

  useEffect(() => {
    if (!connection || !connected || !apiaryId) {
      return;
    }

    // Svaki korisnik slusa samo pcelinjak koji trenutno gleda.
    connection
      .invoke('JoinApiaryGroup', apiaryId)
      .catch((connectionError) => {
        console.error('Failed to join apiary SignalR group.', connectionError);
      });

    return () => {
      if (connection.state === HubConnectionState.Connected) {
        connection
          .invoke('LeaveApiaryGroup', apiaryId)
          .catch((connectionError) => {
            console.error('Failed to leave apiary SignalR group.', connectionError);
          });
      }
    };
  }, [connection, connected, apiaryId]);
}
