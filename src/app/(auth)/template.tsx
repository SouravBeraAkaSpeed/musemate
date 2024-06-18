import { Suspense } from "react";

interface TemplateProps {
  children: React.ReactNode;
}

const Template: React.FC<TemplateProps> = ({ children }) => {
  return (
    <Suspense>
      {" "}
      <div className="relative h-screen flex justify-center md:items-center md:top-0 top-[100px]">
        {children}
      </div>
    </Suspense>
  );
};

export default Template;
