export function createFileName(id: string): string {
    return `smarti${id}_${new Date().getDate()}`;
}

export function getFileName(id: string): string {
    return `smarti${id}_${new Date().getDate()}.pdf`;
}


