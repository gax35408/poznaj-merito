import Link from 'next/link';

export type menuItemType = {
  id: string;
  href: string;
  title: string;
  name: string;
  start: boolean;
  disabled: boolean;
};

type menuLinksProps = {
  items: menuItemType[];
}

export const MenuLinks = ({items}: menuLinksProps) => (
  <div className="font-[family-name:var(--font-press-start-2p)] d-flex flex-column justify-content-center m-auto gap-for-phone-3">
    {items.map((item: menuItemType) => (
        <Link
          key={item.id}
          href={item.href}
          className={`btn-menu pixel-corners ${ item.start ? "start":""} ${item.disabled && "disabled"}`}
          title={item.title&&item.title}
        >  
          {item.name}
        </Link>
    ))}
  </div>
);

export const Buttons = ({children}:any) => {
    return(
        <div className="font-[family-name:var(--font-press-start-2p)] d-flex flex-column justify-content-center m-auto gap-for-phone-3">
            {children}
        </div>
    );
}