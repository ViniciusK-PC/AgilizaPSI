import { Button } from "flowbite-react";
import { Loader, Loader2 } from "lucide-react";

type SubmitButtonProps = {
  title: string;
  buttonType?: "submit" | "reset" | "button" | undefined
  isLoading: boolean;
  loadingTitle: string;
}
export default function SubmitButton({ title, buttonType = "submit", isLoading = false,
  loadingTitle }: SubmitButtonProps) {

  return (
    <>
      {isLoading ? (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingTitle}
        </Button>
      ) : (

        <Button type={buttonType} className="w-full">
          {title}
        </Button>

        // <button
        //   type={buttonType}
        //   className="flex w-full justify-center rounded-md
        //          bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold
        //           text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2
        //            focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        // >
        //   {title}
        // </button>
      )}
    </>
  );
}
