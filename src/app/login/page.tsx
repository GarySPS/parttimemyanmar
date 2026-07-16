// app/login/page.tsx
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { login } from '../auth/actions';

export default async function LoginPage(props: { searchParams: Promise<{ error?: string, success?: string }> }) {
  const params = await props.searchParams;

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-sm w-full bg-white p-8 rounded-md border border-gray-200 shadow-sm">
          <h1 className="text-2xl font-bold text-teal-900 mb-6 text-center">Log In</h1>
          
          {params.error && <p className="text-red-500 text-sm mb-4 text-center">{params.error}</p>}
          {params.success && <p className="text-teal-600 text-sm mb-4 text-center">{params.success}</p>}

          <form action={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <button type="submit" className="w-full bg-teal-700 text-white p-2 rounded-md hover:bg-teal-800 transition-colors">
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-teal-700 hover:underline font-medium">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}