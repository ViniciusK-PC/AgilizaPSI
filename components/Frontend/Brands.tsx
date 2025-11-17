import Image from "next/image";

const brandsData = [
  {
    imageSrc:
      "https://cdn.tailgrids.com/assets/images/marketing/brands/graygrids.svg",
    lightImageSrc:
      "https://cdn.tailgrids.com/assets/images/marketing/brands/graygrids-white.svg",
    altText: "graygrids",
    link: "#",
  },
  {
    imageSrc:
      "https://cdn.tailgrids.com/assets/images/marketing/brands/lineicons.svg",
    lightImageSrc:
      "https://cdn.tailgrids.com/assets/images/marketing/brands/lineIcons-white.svg",
    altText: "lineicons",
    link: "#",
  },
  {
    imageSrc: "https://cdn.tailgrids.com/assets/images/marketing/brands/uideck.svg",
    lightImageSrc:
      "https://cdn.tailgrids.com/assets/images/marketing/brands/uideck-white.svg",
    altText: "uideck",
    link: "#",
  },
  {
    imageSrc: "https://cdn.tailgrids.com/assets/images/marketing/brands/ayroui.svg",
    lightImageSrc:
      "https://cdn.tailgrids.com/assets/images/marketing/brands/ayroui-white.svg",
    altText: "ayroui",
    link: "#",
  },
];

type Brand = {
  imageSrc: string;
  lightImageSrc: string;
  altText: string;
  link: string;
};

export type SingleImageProps = {
  brand: Brand;
};

export default function Brands() {
  return (
    <section className="bg-slate-100 py-10 lg:py-[60px] dark:bg-dark">
        <h2 className="text-center pb-6">Confiado Por</h2>
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="flex flex-wrap items-center justify-center">
              {brandsData.map((brand, i) => (
                <SingleImage key={i} brand={brand} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const SingleImage = ({ brand }: SingleImageProps) => {
  const { link, imageSrc, lightImageSrc, altText } = brand;
  return (
    <a
      href={link}
      className="mx-4 flex w-[150px] items-center justify-center py-5 2xl:w-[180px]"
    >
      <Image width={150} height={40} src={imageSrc} alt={altText} className="h-10 w-full dark:hidden" />
      <Image
        src={lightImageSrc}
        alt={altText}
        width={150} height={40} className="hidden h-10 w-full dark:block"
      />
    </a>
  );
};
