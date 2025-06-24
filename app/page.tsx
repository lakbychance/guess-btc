"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Home() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        return;
      }

      router.push(`/${username}`);
    } catch (err) {
      toast.error('An unexpected error occurred.');
      console.error(err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-md items-center justify-center font-mono text-sm lg:flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Create Player</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="p-2 border rounded text-white"
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create
          </button>
        </form>
      </div>
    </main>
  );
}
