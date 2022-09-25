import React from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/index';
import { useRouter } from 'next/router';

export default function Navbar({ children }) {
  const router = useRouter();
  const [user, { mutate }] = useCurrentUser();
  
  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'DELETE',
    });
    mutate(null);
    // router.push('/login');
  };
  return (
    <>
      <style jsx global>
        {`
          header {
            border-bottom: 1px solid #d8d8d8;
          }
          .dropdown:hover .dropdown-menu {
            display: block;
          }
        `}
      </style>
      <header>
        <nav className="flex justify-between h-16 px-3">
          <div className="flex-shrink-0 w-52"></div>
          <div className="grid items-center w-9/12 grid-cols-7 text-center">
            {!user ? (
              <Link href="/login">
                <a><h1 className="text-lg font-bold w-">Login</h1></a>
              </Link>
            ) : (
              <Link href='/settings'>
                <a>
                  <h1 className="text-lg font-bold">Profile</h1>
                </a>
              </Link>
            )}
            <Link href="/compete">
              <a>
                <h1 className="text-lg font-bold">Compete</h1>
              </a>
            </Link>
            <Link href="/faq">
              <a>
                <h1 className="text-lg font-bold">FAQ</h1>
              </a>
            </Link>
            <Link href="/">
              <a className="m-auto">
                <img className="w-12" src="/esportsref-logo-v3.png" alt="esportsref.com" />
              </a>
            </Link>
            <Link href="/games">
              <a>
                <h1 className="text-lg font-bold">Popular Games</h1>
              </a>
            </Link>
            { user && user.user_type == 'admin' ? (
              <Link href="/admin/dashboard">
                <a>
                  <h1 className="text-lg font-bold">Admin</h1>
                </a>
              </Link>
            ) : (
              <Link href="/signup">
                <a>
                  <h1 className="font-bold">Become a Ref</h1>
                </a>
              </Link>
            ) }
            <Link href="/contact">
              <a>
                <h1 className="text-lg font-bold">Contact</h1>
              </a>
            </Link>
          </div>
          {!user ? (
            <div className="w-52"></div>
          ):(
            <div className="relative flex-shrink-0 bg-gray-900 cursor-pointer w-52 dropdown hover:bg-gray-800">
              <button className="inline-flex items-center px-4 border-none hover:text-white focus:outline-none">
                <span className="mr-2">{user.name}</span>
                <span className="text-lg fa fa-bars"></span>
              </button>
              <div className="relative inline-block w-16 h-16">
                <img className="inline w-16 h-16" src={`/images/avatars/${user.avatar}`} />
                <div 
                  className="absolute top-0 right-0 w-3 h-3 rounded-full z-2"
                  style={{ backgroundColor: user.isOnline ? '#34D399':'#888' }}
                ></div>
              </div>
              <ul className="absolute z-10 hidden w-full divide-y-2 divide-gray-900 dropdown-menu" >
                <hr />
                <li>
                  <Link href="/settings">
                    <a className="block px-4 py-2 uppercase whitespace-no-wrap bg-gray-800 hover:bg-gray-700 hover:text-white" href="">My Profile</a>
                  </Link>
                </li>
                <li>
                  <a 
                    className="block px-4 py-2 uppercase whitespace-no-wrap bg-gray-800 hover:bg-gray-700 hover:text-white"
                    onClick={handleLogout}>
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </header>
    </>
  );
};
