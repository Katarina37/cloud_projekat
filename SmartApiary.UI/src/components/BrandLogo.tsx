// Zajednicka UI komponenta: BrandLogo.

import logoUrl from '../assets/logo.svg';

export default function BrandLogo() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <img className="brand-logo" src={logoUrl} alt="" />
    </span>
  );
}
