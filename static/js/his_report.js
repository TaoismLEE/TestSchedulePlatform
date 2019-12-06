$(document).ready(function(){
    $("tbody td.result").each(function() {
        let value = $(this).text();
        if (value == "Pass") {
            $(this).addClass('bg-color-green');
        }
        else if (value == "Fail") {
            $(this).addClass('bg-color-red');
        }
        else {
            $(this).addClass('bg-color-orange');
        }
    });

});