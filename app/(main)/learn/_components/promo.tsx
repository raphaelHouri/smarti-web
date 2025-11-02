
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const PromoSection = () => {
    return (
        <div className="border-2 rounded-xl p-4 space-y-4">
            <div className="space-y-2">
                <div className="flex items-center gap-x-2">
                    <Image
                        src="/unlimited.svg"
                        alt="Unlimited"
                        height={26}
                        width={26}
                    />
                    <h3 className="font-bold text-lg">שדרוג לפרימיום</h3>
                </div>
                <p className="text-muted-foreground">
                    קבלת גישה לכל התרגולים והמבחנים
                </p>
            </div>
            <Button
                variant="super"
                size="default"
                className="w-full cursor-pointer"
                asChild
            >
                <Link href="/shop" className="cursor-pointer">
                    רכישה
                </Link>
            </Button>
        </div>
    );
}

export default PromoSection;