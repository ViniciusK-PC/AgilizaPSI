

export default function SectionHeading({ title}:{ title:string }) {
  return (
     <h2 className="mb-3 text-3x1 font-bold leading-[1.2] text-green-900 dark:text-white sm:text-4x1 md:text-[40px]">
        {title}
     </h2>
  )
}
