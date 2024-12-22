export const getRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toLowerCase();
}