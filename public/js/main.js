var toggleButton = document.querySelector(".menu--button");
var mobileNav = document.querySelector(".menu--list--mobile");
var modalNoButton = document.querySelector(".modal__action--negative");
var backdrop = document.querySelector(".backdrop");
var modal = document.querySelector(".modal");

var is_open = 0;
var idTeacherSelected ;
toggleButton.addEventListener("click", function () {
    if(is_open == 0 ){
        mobileNav.classList.add("open");
        is_open = 1;
    }else{
         mobileNav.classList.remove("open");
        is_open = 0;
    }
});

var edit_my_settings = document.querySelector('#edit_my_settings');

if (edit_my_settings != null) {
edit_my_settings.addEventListener('click',function(event){
    console.log( this.checked)
    var listClass = document.querySelectorAll('.inputText')
      var index = 0, length = listClass.length;
     for (; index < length; index++) {
          if (this.checked) {
              listClass[index].classList.remove('hide--class');
              document.querySelector(".userControl").classList.remove('hide--class');
            } else {
                listClass[index].classList.add('hide--class');
                document.querySelector(".userControl").classList.add('hide--class');
          }
     }
})
}
if (modalNoButton) {
    modalNoButton.addEventListener("click", closeModal);
}
function closeModal() {
    if (modal) {
        modal.classList.remove("open");
    }
    backdrop.classList.remove("open");
}

/*
$('#getPrepop').click(function () {

    console.log('kkkkkkkkkkkkkk')
    /*
    $.ajax({
        url: '/affected/subjects/to/teachers/',
        type: 'POST',
        cache: false,
        data: {
            field1: 1,
            field2: 2
        },
        success: function (data) {
            alert('Success!')
        },
        error: function (jqXHR, textStatus, err) {
            alert('text status ' + textStatus + ', err ' + err)
        }
    })
});*/
 function getPrepop(idTeacher) {

    idTeacherSelected = idTeacher;
    modal.classList.add("open");
    backdrop.classList.add("open");
}
function saveChangeSubject() {
    const subject_selected = document.getElementById("subject").value;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
              let response = JSON.parse(xhttp.response);
            if (response.success == 'its ok' && response.errors == '') {
                document.getElementById(idTeacherSelected).innerHTML = response.label
            }else{
                console.log(response)
            }

          }
      };
      xhttp.open("GET", "/affected/subjects/to/teachers/" + idTeacherSelected + '/' + subject_selected, true);
      xhttp.send();
}

function getSubject(idTeacher) {
    if(document.getElementById(idTeacher + '-idTeach').innerHTML == 'show'){
            var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        let response = JSON.parse(xhttp.response);
                        if (response.success == 'its ok' && response.errors == '') {
                            document.getElementById(idTeacher + '-idTeach').innerHTML = response.label
                        } else {
                            console.log(response)
                        }

                    }
                };
                xhttp.open("GET", "/get/subject/" + idTeacher, true);
                xhttp.send();
    }else{
         document.getElementById(idTeacher + '-idTeach').innerHTML = 'show'
    }
}