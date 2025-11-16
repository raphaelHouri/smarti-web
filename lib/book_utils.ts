

export function getFileName(id: string, productType: string): string {
    if (productType) {
        return `smarti_${productType}_${id}_${new Date().getFullYear()}.pdf`;
    }
    return `smarti${id}_${new Date().getDate()}.pdf`;
}



