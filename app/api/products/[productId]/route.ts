import db from "@/db/drizzle"
import { products } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ productId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { productId } = await params;
    const data = await db.query.products.findFirst({
        where: eq(products.id, productId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ productId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { productId } = await params;
    const body = await req.json();
    const data = await db.update(products).set({
        ...body
    }).where(
        eq(products.id, productId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ productId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { productId } = await params;
    const data = await db.delete(products).
        where(eq(products.id, productId)).returning()
    return NextResponse.json(data[0]);
}


