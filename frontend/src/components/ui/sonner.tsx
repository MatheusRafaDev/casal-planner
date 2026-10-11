import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-border group-[.toaster]:rounded-xl group-[.toaster]:shadow-[4px_4px_0_var(--border)] group-[.toaster]:font-sans group-[.toaster]:font-semibold cursor-pointer",
          description: "group-[.toast]:text-muted-foreground font-normal",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:border-2 group-[.toast]:border-border group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:border-2 group-[.toast]:border-border group-[.toast]:rounded-lg",
        },
        // @ts-expect-error - sonner onClick expects a different type or strict mode issue
        onClick: () => toast.dismiss(),
      }}
      {...props}
    />
  );
};

export { Toaster };
