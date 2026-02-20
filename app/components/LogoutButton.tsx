'use client';

import { SignOutButton } from '@clerk/nextjs';

export default function LogoutButton() {
  return (
    <SignOutButton>
      <button className="w-full cursor-pointer rounded-lg px-4 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700">
        Log out
      </button>
    </SignOutButton>
  );
}
