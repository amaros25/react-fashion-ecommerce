
import React from 'react';

/**
 * Returns a default SVG avatar based on the user's role.
 * @param {string} role - The role of the user ('user', 'buyer', 'seller', etc.)
 * @returns {string} - Data URI of the SVG avatar.
 */
export const getDefaultAvatar = (role) => {
    const isSeller = role?.toLowerCase() === 'seller';

    // Buyer Icon: Simple person with a small shopping bag outline
    const buyerSvg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f4f4f4"/>
      <circle cx="100" cy="80" r="40" fill="#666"/>
      <path d="M40 160C40 126.863 66.8629 100 100 100C133.137 100 160 126.863 160 160V180H40V160Z" fill="#666"/>
      <path d="M130 140L145 140L150 170L125 170L130 140Z" fill="#1a1a1a" stroke="#fff" stroke-width="2"/>
      <path d="M135 140C135 135 140 135 140 140" fill="none" stroke="#fff" stroke-width="2"/>
    </svg>
  `;

    // Seller Icon: Simple person with a small shop/stall outline
    const sellerSvg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#e8f0fe"/>
      <circle cx="100" cy="80" r="40" fill="#1a73e8"/>
      <path d="M40 160C40 126.863 66.8629 100 100 100C133.137 100 160 126.863 160 160V180H40V160Z" fill="#1a73e8"/>
      <rect x="120" y="130" width="40" height="40" fill="#1a1a1a" />
      <path d="M115 130L165 130L170 140L110 140L115 130Z" fill="#fbbc05" />
    </svg>
  `;

    const svg = isSeller ? sellerSvg : buyerSvg;
    return `data:image/svg+xml;base64,${btoa(svg.trim())}`;
};
