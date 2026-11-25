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
    <footer className="bg-ink text-ivory/60 mt-16">
      {/* Newsletter */}
      <div className="border-b border-ivory/10">
        <div className="page-container py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <p className="eyebrow !text-gold-300 mb-4">The Journal</p>
              <h3 className="font-serif font-light text-3xl md:text-4xl !text-ivory">First access to new collections.</h3>
              <p className="text-ivory/50 font-light mt-3">Designer releases and weaver stories, delivered occasionally.</p>
            </div>
            <form className="flex w-full md:w-auto border-b border-ivory/30 focus-within:border-gold-300 transition-colors" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className="flex-1 md:w-80 bg-transparent text-ivory placeholder-ivory/40 text-sm py-4 outline-none" />
              <button type="submit" className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-300 hover:text-ivory pl-6 whitespace-nowrap transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="page-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="block mb-5">
              <span className="font-serif text-2xl font-medium uppercase tracking-[0.3em] text-ivory">
                Saree<span className="text-gold-300">Bazaar</span>
              </span>
            </Link>
            <p className="text-sm font-light leading-relaxed max-w-xs">
              A curated home for authentic sarees from verified weavers, artisans and independent designers across India.
            </p>
            <div className="flex gap-6 mt-6">
              {['Instagram', 'Facebook', 'Pinterest', 'YouTube'].map((s) => (
                <a key={s} href={`https://${s.toLowerCase()}.com`} target="_blank" rel="noreferrer"
                  className="text-[10px] font-medium uppercase tracking-[0.2em] text-ivory/50 hover:text-gold-300 transition-colors">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-sans text-[11px] font-medium uppercase tracking-[0.26em] text-ivory mb-6">{heading}</h4>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm font-light text-ivory/55 hover:text-gold-300 transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ivory/10">
        <div className="page-container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] uppercase tracking-[0.18em] text-ivory/40">
          <p>&copy; {new Date().getFullYear()} SareeBazaar</p>
          <p>Secure payments &middot; Pan-India delivery &middot; Considered returns</p>
          <p>Visa &middot; Mastercard &middot; UPI &middot; Razorpay</p>
        </div>
      </div>
    </footer>
  );
}
