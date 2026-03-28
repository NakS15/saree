import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      'nav.home': 'Home', 'nav.products': 'Products', 'nav.cart': 'Cart', 'nav.orders': 'Orders',
      'nav.wishlist': 'Wishlist', 'nav.login': 'Login', 'nav.register': 'Register',
      'product.addToCart': 'Add to Cart', 'product.buyNow': 'Buy Now', 'product.outOfStock': 'Out of Stock',
      'product.fabric': 'Fabric', 'product.occasion': 'Occasion', 'product.inStock': '{{count}} in stock',
      'cart.empty': 'Your cart is empty', 'cart.total': 'Total',
      'order.placed': 'Order Placed', 'order.confirmed': 'Confirmed', 'order.shipped': 'Shipped',
      'common.loading': 'Loading...', 'common.error': 'Something went wrong', 'common.save': 'Save',
    },
  },
  hi: {
    translation: {
      'nav.home': 'होम', 'nav.products': 'उत्पाद', 'nav.cart': 'कार्ट', 'nav.orders': 'ऑर्डर',
      'nav.wishlist': 'विशलिस्ट', 'nav.login': 'लॉगिन', 'nav.register': 'रजिस्टर',
      'product.addToCart': 'कार्ट में डालें', 'product.buyNow': 'अभी खरीदें', 'product.outOfStock': 'स्टॉक में नहीं',
      'product.fabric': 'कपड़ा', 'product.occasion': 'अवसर', 'product.inStock': '{{count}} स्टॉक में',
      'cart.empty': 'आपकी कार्ट खाली है', 'cart.total': 'कुल',
      'order.placed': 'ऑर्डर दिया गया', 'order.confirmed': 'पुष्टि की गई', 'order.shipped': 'भेजा गया',
      'common.loading': 'लोड हो रहा है...', 'common.error': 'कुछ गलत हुआ', 'common.save': 'सहेजें',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

export default i18n;
