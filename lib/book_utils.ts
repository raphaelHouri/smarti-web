

export function getFileName(id: string, productType: string): string {
    if (productType) {
        return `smarti_${productType}_${id}.pdf`;
    }
    return `smarti${id}_${new Date().getDate()}.pdf`;
}



