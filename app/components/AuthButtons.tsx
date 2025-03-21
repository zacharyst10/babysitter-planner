"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function AuthButtons() {
  const { user, isLoading, signIn, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" disabled>
          Loading...
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" onClick={() => signIn()}>
          Log in
        </Button>
        <Button variant="default" size="sm" onClick={() => signIn()}>
          Sign up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-700">{user.name}</span>
      <Button variant="ghost" size="sm" onClick={() => signOut()}>
        Log out
      </Button>
    </div>
  );
}
