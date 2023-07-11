import { Disclosure, Transition } from "@headlessui/react";
import { clx } from "@lib/helpers";
import { FunctionComponent, ReactNode } from "react";

type AccordionProps = {
  className?: string;
  width?: string;
  icon?: ReactNode;
  title: string;
  children: ReactNode;
};

const Accordion: FunctionComponent<AccordionProps> = ({
  className,
  width = "w-full",
  icon,
  title,
  children,
}) => {
  return (
    <Disclosure>
      {({ open }) => (
        <div>
          <Disclosure.Button as="div">
            <div
              className={clx(
                open ? "rounded-none" : "shadow-button rounded-b-xl",
                "btn-default cursor-pointer rounded-t-xl p-4",
                width,
                className
              )}
            >
              <div className="flex">
                {icon}
                <p className="pl-8">{title}</p>
              </div>
            </div>
          </Disclosure.Button>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel>
              <div
                className={clx(
                  "text-dim border-outline dark:border-washed-dark shadow-button rounded-b-xl border border-t-0 p-4 font-normal",
                  width
                )}
              >
                {children}
              </div>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
};

export default Accordion;
