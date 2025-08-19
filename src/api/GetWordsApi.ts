import axios from "axios"

export const getWords = async ({ numberOfWords }: { numberOfWords: number }): Promise<string[]> => {
    const response = await axios.get(`https://random-word-api.herokuapp.com/word?number=${numberOfWords}`)
    return response.data;
}