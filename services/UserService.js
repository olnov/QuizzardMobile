const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const getUser = async (id, token)=> {
    const response = await fetch(`${BACKEND_URL}/users/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
    });

    if (response.status === 200) {
    const data = await response.json();
    return data;
    }else{
        throw new Error(`Error: ${response.status}`);
    }
}

export const login = async (email, password)=> {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-type':'application/json'
        },
        body: JSON.stringify({email, password}),
    };

    const response = await fetch(`${BACKEND_URL}/login`, requestOptions);
    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        throw new Error(`Authentication failed: ${response.status}`);
    }
}

export const signUp = async (fullName, email, password) => {
    const requestOptions = {
        method: 'POST',
        headers:{
            'Content-type':'application/json'
        },
        body: JSON.stringify({fullName, email, password}),
    };

    const response = await fetch(`${BACKEND_URL}/users`, requestOptions);
    if (response.status === 201) {
        return "User successfully registered";
    } else {
        throw new Error(`Error registering new user: ${response.status}`);
    }
}