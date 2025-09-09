import { Roboto_Slab, Roboto } from 'next/font/google'
 

export const roboto = Roboto({
    weight: ['100', '300', '400', '500', '700', '900'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap',
  });
  
export const roboto_slab = Roboto_Slab({
  subsets: ['latin'],
  display: 'swap',
});
