export function createFileName(id: string): string {
    return `smarti${id}_${new Date().getDate()}`;
}

export function getFileName(id: string,productType: string): string {
    return `smarti${id}_${new Date().getDate()}${productType? "_" + productType: ""}.pdf`;
}


