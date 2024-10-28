const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const getScores = async (token) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await fetch(`${BACKEND_URL}/topscores`, requestOptions);
    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        throw new Error("Error:", response.status);
    }
}

export const saveScores = async (token, scoreData) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(scoreData),
    }

    const response = await fetch(`${BACKEND_URL}/topscores/new`, requestOptions);
    if (response.status === 200) {
        return "Scores successfully stored";
    }else{
        throw new Error("Error:", response.status);
    }
}