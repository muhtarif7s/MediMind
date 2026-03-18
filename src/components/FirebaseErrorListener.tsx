
'use client';

import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { requestNotificationToken } from '@/firebase/messaging';
import { useFirebase } from '@/firebase/provider';

export function FirebaseErrorListener() {
  const [notificationError, setNotificationError] = useState(false);
  const { messaging } = useFirebase();

  useEffect(() => {
    const handlePermissionError = (error: { type: string }) => {
      if (error.type === 'notification') {
        setNotificationError(true);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  const handleEnableNotifications = () => {
    if (!messaging) return;
    requestNotificationToken(messaging).then(() => {
      setNotificationError(false);
    });
  };

  if (notificationError) {
    return (
      <Alert className="m-4">
        <AlertTitle>تم تعطيل الإشعارات</AlertTitle>
        <AlertDescription>
          للحصول على أفضل تجربة، يرجى تمكين الإشعارات.
        </AlertDescription>
        <Button onClick={handleEnableNotifications} className="mt-4">
          تمكين الإشعارات
        </Button>
      </Alert>
    );
  }

  return null;
}
