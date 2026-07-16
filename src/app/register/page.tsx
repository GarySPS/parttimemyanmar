// app/register/page.tsx
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { signup } from '../auth/actions';

export default async function RegisterPage(props: { searchParams: Promise<{ error?: string }> }) {
  const params = await props.searchParams;

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-sm w-full bg-white p-8 rounded-md border border-gray-200 shadow-sm">
          <h1 className="text-2xl font-bold text-teal-900 mb-6 text-center">Create Account</h1>
          
          {params.error && <p className="text-red-500 text-sm mb-4 text-center">{params.error}</p>}

          <form action={signup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" required minLength={6} className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" name="phone" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
              <select name="role" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                <option value="seeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-teal-700 text-white p-2 rounded-md hover:bg-teal-800 transition-colors">
              Register
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-700 hover:underline font-medium">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}