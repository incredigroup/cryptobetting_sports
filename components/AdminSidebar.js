import React from 'react';
import Link from 'next/link';

export default function AdminSidebar({ children }) {
  return (
    <>
      <div className="p-8 h-screen bg-gradient-to-b bg-indigo-900 focus:from-pink-500 focus:to-yellow-500">
        <div className="flex justify-center">
          <a className="">
            <img className="w-12" src="/esportsref-logo-v3.png" alt="esportsref.com" />
          </a>
        </div>
        <h1 className="pl-4 mt-6 text-2xl mb-4 yellow-title">Dashboard</h1>
        <div>
          <ul className="ml-4">
            <li className="mb-3">
              <Link href="/admin/registrations">
                <a><h1 className="font-bold text-lg">Registration</h1></a>
              </Link>
            </li>
            <li className="mb-3">
              <Link href="/admin/statistics">
                <a><h1 className="font-bold text-lg">Statistics</h1></a>
              </Link>
            </li>
            <li className="mb-3">
              <Link href="/admin/mails">
                <a><h1 className="font-bold text-lg">Mail</h1></a>
              </Link>
            </li>
            <li className="mb-3">
              <Link href="/admin/disputes">
                <a><h1 className="font-bold text-lg">Dispute</h1></a>
              </Link>
            </li>
            <li className="sidemenu-item my-8">
              <Link href="/">
                <a><h1 className="font-bold text-lg">Go to Site</h1></a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
