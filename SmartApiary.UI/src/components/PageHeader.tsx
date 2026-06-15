// Zajednicka UI komponenta: PageHeader.

import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  subtitle: string;
  action?: ReactNode;
  bannerImage?: string;
};

export default function PageHeader({ title, subtitle, action, bannerImage }: PageHeaderProps) {
  return (
    <section className={`page-header${bannerImage ? ' page-header-banner' : ''}`}>
      {bannerImage ? (
        <>
          <img
            alt=""
            aria-hidden="true"
            className="page-header-banner-image"
            decoding="async"
            fetchPriority="high"
            src={bannerImage}
          />
          <span aria-hidden="true" className="page-header-banner-shade" />
        </>
      ) : null}
      <div className="page-header-copy">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </section>
  );
}
