import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = {
  'Shop': [
    { label: 'Silk Sarees', to: '/category/silk-sarees' },
    { label: 'Cotton Sarees', to: '/category/cotton-sarees' },
    { label: 'Bridal Sarees', to: '/category/bridal-sarees' },
    { label: 'Designer Sarees', to: '/category/designer-sarees' },
    { label: 'Trending Now', to: '/products?isTrending=true' },
  ],
  'Customer': [
    { label: 'My Orders', to: '/orders' },
    { label: 'My Wishlist', to: '/wishlist' },
    { label: 'Returns & Refunds', to: '/returns' },
    { label: 'Track Order', to: '/orders' },
    { label: 'FAQs', to: '/faqs' },
  ],
  'Sell With Us': [
    { label: 'Become a Vendor', to: '/register?role=vendor' },
    { label: 'Vendor Dashboard', to: '/vendor/dashboard' },
    { label: 'Seller Guidelines', to: '/seller-guidelines' },
    { label: 'Commission Rates', to: '/commissions' },
  ],
  'Company': [
    { label: 'About Us', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press', to: '/press' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Newsletter */}
      <div className="bg-primary-600">
        <div className="page-container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-white">Stay Updated</h3>
              <p className="text-primary-100 mt-1">Get exclusive saree collections and offers delivered to your inbox.</p>
            </div>
            <form className="flex gap-3 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" className="input-field flex-1 md:w-72 bg-white" />
              <button type="submit" className="bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 py-3 rounded-lg whitespace-nowrap transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="page-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🪡</span>
              <div>
                <span className="font-serif text-xl font-bold text-white">Saree</span>
                <span className="font-serif text-xl font-bold text-gold-400">Bazaar</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              India's premier destination for authentic sarees from verified weavers and artisans across the country.
            </p>
            <div className="flex gap-3 mt-5">
              {['facebook', 'instagram', 'twitter', 'youtube'].map((s) => (
                <a key={s} href={`https://${s}.com`} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                  <span className="text-xs uppercase font-bold text-gray-300">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="page-container py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SareeBazaar. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>🔒 Secure Payments</span>
            <span>🚚 Pan India Delivery</span>
            <span>↩️ Easy Returns</span>
          </div>
          <div className="flex items-center gap-2">
            {['visa', 'mastercard', 'upi', 'razorpay'].map((p) => (
              <span key={p} className="bg-gray-800 text-xs text-gray-400 px-2 py-1 rounded font-medium uppercase">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
