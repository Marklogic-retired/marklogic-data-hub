export function removeCommas(input) {
    return input != null ? fn.string(input).replace(",", "") : null;
}
