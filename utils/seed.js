exports.createManyUsers = async (id_school, email, first_name, last_name, type_user_school, identity, phone, type_doc) => {
    let image_url_doc = 'uploads\\types_docs\\type_doc-anf2dikjxq5veympass.jpg';
    let password = '$2a$12$RuD21WlQ8e3NKwNCtsWJ4OcjW/RjwYJEGL2sHZxztuhe9IaWmleKq';
    let maxYear = 1990;
    let minYear = 2000;
    let numberOfRows = 6;
     for (var i = 1; i < numberOfRows; i++) {
         let birthday = (Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear) + '' + '-01-01';
         const user_School = new UserSchool({
             id_school: id_school,
             email: email + '_' + i + '@gmail.com',
             first_name: first_name + '_' + i,
             last_name: last_name + '_' + i,
             birthday: birthday.trim(),
             identity: identity + i,
             type_doc: type_doc,
             image_url_doc: image_url_doc,
             image_url_avatar: 'images\\avatar.png',
             type_user_school: type_user_school,
             password: password,
             is_confirmed: true,
             phone: phone + i,
             confirmation: [{
                 token: 'VzAE1Q1u-j4FZA1Uqkjme2XleFm8wG3gr11w'
             }]
         })
         await user_School.save()
         console.log(user_School)
         console.log('user_School is created... ')
     }
}