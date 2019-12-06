function warning_msg(content){
    var dialog = bootbox.dialog({message: '<div class="alert alert-warning" role="alert">' + content + '</div>',
                                            closeButton: false});
    dialog.init(function(){
        setTimeout(function () {
            dialog.modal('hide');
        }, 2000);
    });
}

function success_msg(content){
    var dialog = bootbox.dialog({message: '<div class="alert alert-success" role="alert">' + content + '</div>',
                                            closeButton: false});
    dialog.init(function(){
        setTimeout(function () {
            dialog.modal('hide');
        }, 2000);
    });
}

function error_msg(content){
    var dialog = bootbox.dialog({message: '<div class="alert alert-danger" role="alert">' + content + '</div>',
                                            closeButton: false});
    dialog.init(function(){
        setTimeout(function () {
            dialog.modal('hide');
        }, 2000);
    });
}