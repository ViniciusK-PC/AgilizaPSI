

export default function SectionHeading({ title}:{ title:string }) {
  return (
     <h2 className="mb-3 text-3x1 font-bold leading-[1.2] text-dark
     dark:text-white sm:text-4x1 md:text-[40px]">
        Consulte seus médicos por.
        {title}
     </h2>
  )
}
