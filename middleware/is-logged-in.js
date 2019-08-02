exports.isLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return false;
    }
    return true;
}