export const stringConverter = (str:string) => {
    return str.replace(/\s+/g, '-').toLowerCase();
}