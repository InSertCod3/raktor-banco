'use client';

import { SignOutButton } from '@clerk/nextjs';

export default function LogoutButton() {
  return (
    <SignOutButton>
      <button className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700">
        Log out
      </button>
    </SignOutButton>
  );
}
