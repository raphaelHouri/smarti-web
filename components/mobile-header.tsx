import { MobileSideBar } from "./mobileSidebar"

interface MobileHeaderProps {
    hasManaged?: boolean;
}

export const MobileHeader = ({ hasManaged = false }: MobileHeaderProps) => {
    return (
        <nav
            className="
        lg:hidden px-2 top-0  w-full bg-green-500
        h-[50px] flex fixed items-center border-b z-50
        ">
            <MobileSideBar hasManaged={hasManaged} />
        </nav>
    )
}