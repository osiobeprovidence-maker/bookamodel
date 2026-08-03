/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useUser } from '../contexts/UserContext';
import { Navigate } from 'react-router-dom';
import Messages from '../pages/business/Messages';

export const MessagesPage = () => {
  const { firebaseUser, convexUser, isLoading } = useUser();

  if (isLoading) return null;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (convexUser && !convexUser.role) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-white pt-16">
      <Messages />
    </div>
  );
};
