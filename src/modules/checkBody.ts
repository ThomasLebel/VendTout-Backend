const checkBody = (body: any, requiredFields: string[]) : boolean => {
    let isValid : boolean = true;
    for (const field of requiredFields) {
        if (!body[field] || body[field] === "") {
            isValid = false;
            break;
        }
    }
    return isValid;
}

export default checkBody;
