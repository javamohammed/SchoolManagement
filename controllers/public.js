const isAuth = require('../middleware/is-logged-in')

exports.getHome = (req, res, next ) => {
     return res.status(200).render('index', {
          isAuth: req.session.isLoggedIn,
          type_user: req.session.type_user,
     })
}

exports.get404 = (req, res, next) => {
     return res.render('404')
}