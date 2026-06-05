import React from 'react';
import { motion } from 'framer-motion';
import { useWhatsAppConfig } from '../hooks/use-broki';

export function WhatsAppButton() {
  const { data: config } = useWhatsAppConfig();
  if (!config?.number) return null;

  const number = config.number.replace(/\D/g, '');
  const message = config.message ? encodeURIComponent(config.message) : '';
  const href = `https://wa.me/${number}${message ? `?text=${message}` : ''}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={config.buttonText || 'WhatsApp'}
      className="fixed bottom-20 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-shadow duration-300"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -4, scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.441-1.273.606-1.446c.163-.171.353-.214.471-.214.118 0 .236.004.341.011.111.008.261-.044.408.314.148.358.503 1.226.548 1.314.045.087.075.189.017.332-.058.143-.088.232-.175.334-.088.102-.185.222-.262.306-.088.096-.18.201-.078.359.102.158.455.736 1.012 1.238.718.647 1.285.845 1.445.923.16.079.255.067.35-.043.095-.11.408-.475.518-.638.11-.163.22-.136.365-.081.144.054.912.43 1.069.508.158.079.263.119.302.184.039.066.039.382-.105.787z"/>
      </svg>
    </motion.a>
  );
}
